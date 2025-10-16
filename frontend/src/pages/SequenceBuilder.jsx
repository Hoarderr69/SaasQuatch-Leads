import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { sequences, mockContacts } from "../data/mockData";
import {
  Plus,
  Mail,
  Linkedin,
  Clock,
  Play,
  Pause,
  Trash2,
  Eye,
  Upload,
  Wand2,
  ListChecks,
  GripVertical,
  ArrowRight,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";

const SequenceBuilder = () => {
  const [sequenceList, setSequenceList] = useState(sequences);
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1); // 1: contacts, 2: steps, 3: content, 4: review
  const [newName, setNewName] = useState("New Outreach Sequence");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [csvContacts, setCsvContacts] = useState([]);
  const [useCsv, setUseCsv] = useState(false);
  const [genMethod, setGenMethod] = useState("template"); // template | ai
  const [templateId, setTemplateId] = useState("email-plus-linkedin");
  const [aiPrompt, setAiPrompt] = useState(
    "Reach out to mid-market SaaS CTOs about workflow automation"
  );
  const [tone, setTone] = useState("professional");
  const [stepsDraft, setStepsDraft] = useState([]);
  const [working, setWorking] = useState(false);
  const API_BASE = process.env.REACT_APP_BACKEND_URL;

  const apiFetch = async (path, options = {}) => {
    if (!API_BASE) throw new Error("REACT_APP_BACKEND_URL is not set");
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  };

  // Auto-generate when entering Steps (step===2) if in template mode and no steps yet
  useEffect(() => {
    if (
      isCreating &&
      step === 2 &&
      genMethod === "template" &&
      stepsDraft.length === 0 &&
      !working
    ) {
      generateSteps({ advance: false });
    }
  }, [isCreating, step, genMethod, templateId]);

  // Auto-regenerate when the template changes while in Steps tab and template mode
  useEffect(() => {
    if (isCreating && step === 2 && genMethod === "template" && !working) {
      generateSteps({ advance: false });
    }
  }, [templateId]);

  const clientFallbackSteps = (method) => {
    if (method === "template") {
      return [
        {
          step_id: crypto.randomUUID?.() || String(Date.now()),
          type: "email",
          delay_days: 0,
          subject: "Quick intro",
          content: "Hi {name}, ...",
          status: "draft",
        },
        {
          step_id: crypto.randomUUID?.() || String(Date.now() + 1),
          type: "linkedin",
          delay_days: 2,
          subject: null,
          content: "Connection note for {name} about ...",
          status: "draft",
        },
        {
          step_id: crypto.randomUUID?.() || String(Date.now() + 2),
          type: "email",
          delay_days: 5,
          subject: "Following up",
          content: "Hi {name}, just checking...",
          status: "draft",
        },
      ];
    }
    // AI-like skeleton
    return [0, 1, 2].map((i) => ({
      step_id: crypto.randomUUID?.() || String(Date.now() + i),
      type: i === 1 ? "linkedin" : "email",
      delay_days: i === 0 ? 0 : i === 1 ? 2 : 3,
      subject: i !== 1 ? `Professional outreach step ${i + 1}` : null,
      content: `Draft ${i === 1 ? "linkedin" : "email"} content for step ${
        i + 1
      } based on prompt: ${aiPrompt}`,
      status: "draft",
    }));
  };

  const clientFallbackContent = (channel, sample, stepNumber) => {
    const name = sample?.name || "there";
    const company = sample?.company || "your company";
    if (channel === "linkedin") {
      return {
        subject: "",
        content: `Hi ${name}, impressed by your work at ${company}. Would love to connect and share insights that might benefit your team.`,
        tone,
      };
    }
    const subject = `Quick question about ${company}`;
    const content = `Hi ${name},\n\nI noticed ${company} is doing interesting work. We help teams streamline workflows with AI. Would you be open to a quick chat?\n\nBest,\n[Your Name]`;
    return { subject, content, tone };
  };

  const contactsPool = useMemo(
    () => (useCsv ? csvContacts : mockContacts),
    [useCsv, csvContacts]
  );

  const toggleContact = (email) => {
    setSelectedContacts((cur) =>
      cur.includes(email) ? cur.filter((e) => e !== email) : [...cur, email]
    );
  };

  const uploadCsv = async (file) => {
    const form = new FormData();
    form.append("file", file);
    setWorking(true);
    try {
      const data = await apiFetch("/api/sequences/upload-csv", {
        method: "POST",
        body: form,
      });
      setCsvContacts(data.contacts || []);
      setUseCsv(true);
    } catch (e) {
      console.error(e);
      alert("CSV upload failed. Check backend or CSV format.");
    } finally {
      setWorking(false);
    }
  };

  const generateSteps = async (opts = { advance: true }) => {
    setWorking(true);
    try {
      try {
        const data = await apiFetch("/api/sequences/generate-steps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: genMethod,
            template_id: templateId,
            ai_prompt: aiPrompt,
            tone,
            steps_count: 3,
          }),
        });
        setStepsDraft(data.steps || []);
      } catch (err) {
        // client-side fallback
        const steps = clientFallbackSteps(genMethod);
        setStepsDraft(steps);
      }
      if (opts.advance) setStep(3);
    } catch (e) {
      console.error(e);
      const steps = clientFallbackSteps(genMethod);
      setStepsDraft(steps);
      if (opts.advance) setStep(3);
    } finally {
      setWorking(false);
    }
  };

  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const onDragStart = (e, index) => {
    setDragIndex(index);
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    } catch {}
  };
  const onDragOver = (e, index) => {
    e.preventDefault();
    setOverIndex(index);
  };
  const onDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    setStepsDraft((cur) => {
      const next = [...cur];
      const [item] = next.splice(dragIndex, 1);
      next.splice(index, 0, item);
      return next;
    });
    setDragIndex(null);
    setOverIndex(null);
  };

  const generateContentFor = async (index, channel, stepNumber) => {
    setWorking(true);
    try {
      const sample =
        contactsPool.find((c) => c.email === selectedContacts[0]) ||
        contactsPool[0] ||
        {};
      const body = {
        recipient_name: sample.name || "there",
        company: sample.company || "your company",
        role: sample.title || "Leader",
        industry: sample.industry || "Software",
        product_info: "AI workflow automation to streamline ops",
        tone,
        channel: channel === "linkedin" ? "linkedin" : "email",
        step_number: stepNumber,
      };
      try {
        const data = await apiFetch("/api/ai/generate-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        setStepsDraft((cur) =>
          cur.map((s, i) =>
            i === index
              ? {
                  ...s,
                  subject: data.subject || s.subject,
                  content: data.content || s.content,
                }
              : s
          )
        );
      } catch (err) {
        const data = clientFallbackContent(channel, sample, stepNumber);
        setStepsDraft((cur) =>
          cur.map((s, i) =>
            i === index
              ? {
                  ...s,
                  subject: data.subject || s.subject,
                  content: data.content || s.content,
                }
              : s
          )
        );
      }
    } catch (e) {
      console.error(e);
      const data = clientFallbackContent(channel, sample, stepNumber);
      setStepsDraft((cur) =>
        cur.map((s, i) =>
          i === index
            ? {
                ...s,
                subject: data.subject || s.subject,
                content: data.content || s.content,
              }
            : s
        )
      );
    } finally {
      setWorking(false);
    }
  };

  const createAndStart = async () => {
    const contacts = contactsPool.filter((c) =>
      selectedContacts.includes(c.email)
    );
    if (!contacts.length) return alert("Select at least one contact");
    if (!stepsDraft.length) return alert("Add or generate steps");
    setWorking(true);
    try {
      const seq = await apiFetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, steps: stepsDraft, contacts }),
      });
      try {
        await apiFetch(`/api/sequences/${seq.sequence_id}/start`, {
          method: "POST",
        });
      } catch {}
      // optimistic add to list
      setSequenceList((cur) => [
        {
          id: seq.sequence_id,
          name: seq.name,
          steps: seq.steps.map((s) => ({
            id: s.step_id,
            type: s.type,
            delay: s.delay_days,
            subject: s.subject,
            message: s.content,
            template: "AI",
          })),
          status: "active",
          totalContacts: contacts.length,
          opened: 0,
          replied: 0,
        },
        ...cur,
      ]);
      setIsCreating(false);
      setStep(1);
      setSelectedContacts([]);
      setStepsDraft([]);
    } catch (e) {
      console.error(e);
      alert("Failed to create/start sequence");
    } finally {
      setWorking(false);
    }
  };

  const pauseSequence = async (sequenceId) => {
    try {
      await apiFetch(`/api/sequences/${sequenceId}/pause`, { method: "POST" });
      setSequenceList((cur) =>
        cur.map((s) => (s.id === sequenceId ? { ...s, status: "paused" } : s))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to pause sequence");
    }
  };

  const resumeSequence = async (sequenceId) => {
    try {
      await apiFetch(`/api/sequences/${sequenceId}/resume`, { method: "POST" });
      setSequenceList((cur) =>
        cur.map((s) => (s.id === sequenceId ? { ...s, status: "active" } : s))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to resume sequence");
    }
  };

  const deleteSequence = async (sequenceId) => {
    if (!window.confirm("Delete this sequence? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/sequences/${sequenceId}`, { method: "DELETE" });
      setSequenceList((cur) => cur.filter((s) => s.id !== sequenceId));
    } catch (e) {
      console.error(e);
      alert("Failed to delete sequence");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Sequence Builder
            </h1>
            <p className="text-gray-400">
              Create and manage AI-powered outreach sequences
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Sequence
          </Button>
        </div>

        {/* Sequences List */}
        <div className="space-y-4">
          {sequenceList.map((sequence) => (
            <Card key={sequence.id} className="bg-[#1a1d29] border-0">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-3">
                      {sequence.name}
                      <Badge
                        className={
                          sequence.status === "active"
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }
                      >
                        {sequence.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-gray-400 text-sm mt-1">
                      {sequence.steps.length} steps • {sequence.totalContacts}{" "}
                      contacts
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {sequence.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                        onClick={() => pauseSequence(sequence.id)}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                        onClick={() => resumeSequence(sequence.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      onClick={() => deleteSequence(sequence.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Steps Timeline */}
                <div className="space-y-4">
                  <h4 className="text-white font-semibold text-sm">
                    Sequence Steps
                  </h4>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700" />

                    {/* Steps */}
                    <div className="space-y-6">
                      {sequence.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="relative flex items-start gap-4"
                        >
                          {/* Step icon */}
                          <div className="relative z-10 w-12 h-12 rounded-full bg-[#0f1117] border-2 border-[#00d4ff] flex items-center justify-center">
                            {step.type === "email" ? (
                              <Mail className="w-5 h-5 text-[#00d4ff]" />
                            ) : (
                              <Linkedin className="w-5 h-5 text-[#00d4ff]" />
                            )}
                          </div>

                          {/* Step content */}
                          <div className="flex-1 bg-[#0f1117] p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-white font-semibold">
                                Step {index + 1}:{" "}
                                {step.type === "email"
                                  ? "Email"
                                  : "LinkedIn Message"}
                              </h5>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Clock className="w-4 h-4" />
                                Wait {step.delay} days
                              </div>
                            </div>
                            {step.subject && (
                              <p className="text-gray-400 text-sm">
                                <span className="text-gray-500">Subject:</span>{" "}
                                {step.subject}
                              </p>
                            )}
                            {step.message && (
                              <p className="text-gray-400 text-sm">
                                <span className="text-gray-500">Message:</span>{" "}
                                {step.message}
                              </p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                              Template: {step.template}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                  <div>
                    <p className="text-gray-400 text-sm">Opened</p>
                    <p className="text-2xl font-bold text-white">
                      {sequence.opened}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {Math.round(
                        (sequence.opened / sequence.totalContacts) * 100
                      )}
                      % open rate
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Replied</p>
                    <p className="text-2xl font-bold text-green-400">
                      {sequence.replied}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {Math.round(
                        (sequence.replied / sequence.totalContacts) * 100
                      )}
                      % reply rate
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-[#00d4ff]">
                      {sequence.totalContacts - sequence.replied}
                    </p>
                    <p className="text-gray-500 text-xs">Active contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sequenceList.length === 0 && (
          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0f1117] border-2 border-dashed border-gray-600 flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No sequences yet
              </h3>
              <p className="text-gray-400 mb-4">
                Create your first outreach sequence to get started
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Sequence
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Creation Wizard Drawer-ish */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCreating(false)}
          />
          <div className="relative ml-auto w-full max-w-3xl h-full bg-[#1a1d29] border-l border-gray-800 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Create Sequence
              </h3>
              <div className="flex gap-2 items-center">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-[#0f1117] border-gray-700 text-white"
                />
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  onClick={() => setIsCreating(false)}
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
              <span
                className={`px-2 py-1 rounded ${
                  step === 1 ? "bg-cyan-600 text-white" : "bg-gray-800"
                }`}
              >
                1. Contacts
              </span>
              <ArrowRight className="w-4 h-4" />
              <span
                className={`px-2 py-1 rounded ${
                  step === 2 ? "bg-cyan-600 text-white" : "bg-gray-800"
                }`}
              >
                2. Steps
              </span>
              <ArrowRight className="w-4 h-4" />
              <span
                className={`px-2 py-1 rounded ${
                  step === 3 ? "bg-cyan-600 text-white" : "bg-gray-800"
                }`}
              >
                3. Content
              </span>
              <ArrowRight className="w-4 h-4" />
              <span
                className={`px-2 py-1 rounded ${
                  step === 4 ? "bg-cyan-600 text-white" : "bg-gray-800"
                }`}
              >
                4. Review
              </span>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant={useCsv ? "outline" : ""}
                    className="border-gray-600 text-gray-300"
                    onClick={() => setUseCsv(false)}
                  >
                    Use existing contacts
                  </Button>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload CSV
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && uploadCsv(e.target.files[0])
                      }
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {contactsPool.map((c) => (
                    <label
                      key={c.email}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        selectedContacts.includes(c.email)
                          ? "border-cyan-600 bg-[#0f1117]"
                          : "border-gray-700 bg-[#0f1117]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(c.email)}
                        onChange={() => toggleContact(c.email)}
                      />
                      <div className="text-sm text-gray-300">
                        <div className="font-semibold text-white">
                          {c.name || c.email}
                        </div>
                        <div className="text-gray-400">
                          {c.company} • {c.title}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    disabled={!selectedContacts.length}
                    onClick={() => setStep(2)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => setGenMethod("template")}
                    className={
                      genMethod === "template" ? "bg-cyan-600" : "bg-gray-800"
                    }
                  >
                    Templates
                  </Button>
                  <Button
                    onClick={() => setGenMethod("ai")}
                    className={
                      genMethod === "ai" ? "bg-cyan-600" : "bg-gray-800"
                    }
                  >
                    <Wand2 className="w-4 h-4 mr-1" /> AI Assist
                  </Button>
                  {genMethod === "template" ? (
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="bg-[#0f1117] border border-gray-700 text-white px-3 py-2 rounded"
                    >
                      <option value="email-plus-linkedin">
                        Email + LinkedIn (3 steps)
                      </option>
                      <option value="simple-2-step">Simple 2-step Email</option>
                    </select>
                  ) : (
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="bg-[#0f1117] border-gray-700 text-white w-full"
                      rows={3}
                    />
                  )}
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="bg-[#0f1117] border border-gray-700 text-white px-3 py-2 rounded"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="concise">Concise</option>
                  </select>
                  {genMethod === "ai" && (
                    <Button
                      onClick={() => generateSteps({ advance: false })}
                      disabled={working}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      <ListChecks className="w-4 h-4 mr-1" /> Generate AI Steps
                    </Button>
                  )}
                </div>

                {/* Steps Draft with drag-and-drop reorder and scheduling edits */}
                <div className="space-y-3">
                  {stepsDraft.map((s, i) => (
                    <div
                      key={s.step_id}
                      className={`flex items-start gap-3 p-3 bg-[#0f1117] rounded-lg border ${
                        overIndex === i ? "border-cyan-600" : "border-gray-700"
                      }`}
                      draggable
                      onDragStart={(e) => onDragStart(e, i)}
                      onDragOver={(e) => onDragOver(e, i)}
                      onDrop={() => onDrop(i)}
                    >
                      <GripVertical className="w-4 h-4 text-gray-500 mt-1 cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-white font-semibold">
                            Step {i + 1}: {s.type}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-300">
                            <label className="flex items-center gap-2">
                              <span className="text-gray-400">Delay</span>
                              <input
                                type="number"
                                min={0}
                                value={s.delay_days ?? 0}
                                onChange={(e) =>
                                  setStepsDraft((cur) =>
                                    cur.map((x, idx) =>
                                      idx === i
                                        ? {
                                            ...x,
                                            delay_days: parseInt(
                                              e.target.value || "0",
                                              10
                                            ),
                                          }
                                        : x
                                    )
                                  )
                                }
                                className="w-20 bg-[#0f1117] border border-gray-700 text-white px-2 py-1 rounded"
                              />
                              <span className="text-gray-400">days</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <span className="text-gray-400">Send time</span>
                              <input
                                type="time"
                                value={s.send_time || ""}
                                onChange={(e) =>
                                  setStepsDraft((cur) =>
                                    cur.map((x, idx) =>
                                      idx === i
                                        ? { ...x, send_time: e.target.value }
                                        : x
                                    )
                                  )
                                }
                                className="bg-[#0f1117] border border-gray-700 text-white px-2 py-1 rounded"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {s.subject || s.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    disabled={!stepsDraft.length}
                    onClick={() => setStep(3)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-gray-400">
                  Generate or refine content for each step. Uses AI endpoint
                  based on a sample contact.
                </p>
                {stepsDraft.map((s, i) => (
                  <Card
                    key={s.step_id}
                    className="bg-[#0f1117] border-gray-700"
                  >
                    <CardHeader>
                      <CardTitle className="text-white">
                        Step {i + 1}: {s.type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {s.type === "email" && (
                        <Input
                          value={s.subject || ""}
                          onChange={(e) =>
                            setStepsDraft((cur) =>
                              cur.map((x, idx) =>
                                idx === i
                                  ? { ...x, subject: e.target.value }
                                  : x
                              )
                            )
                          }
                          placeholder="Subject"
                          className="bg-[#0f1117] border-gray-700 text-white"
                        />
                      )}
                      <Textarea
                        value={s.content || ""}
                        onChange={(e) =>
                          setStepsDraft((cur) =>
                            cur.map((x, idx) =>
                              idx === i ? { ...x, content: e.target.value } : x
                            )
                          )
                        }
                        rows={5}
                        className="bg-[#0f1117] border-gray-700 text-white"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                          onClick={() => generateContentFor(i, s.type, i + 1)}
                        >
                          <Wand2 className="w-4 h-4 mr-1" /> AI Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h4 className="text-white font-semibold">Review</h4>
                <p className="text-gray-400 text-sm">
                  Contacts selected: {selectedContacts.length}
                </p>
                <div className="space-y-2">
                  {stepsDraft.map((s, i) => (
                    <div
                      key={s.step_id}
                      className="p-3 bg-[#0f1117] rounded border border-gray-700"
                    >
                      <div className="text-white font-semibold">
                        Step {i + 1}: {s.type} • Wait {s.delay_days} days
                      </div>
                      {s.subject && (
                        <div className="text-gray-400 text-sm">
                          Subject: {s.subject}
                        </div>
                      )}
                      <div className="text-gray-400 text-sm whitespace-pre-wrap">
                        {s.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={createAndStart}
                    disabled={working}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Start Sequence
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceBuilder;
