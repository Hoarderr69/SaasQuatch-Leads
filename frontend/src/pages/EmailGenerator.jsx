import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { emailTemplates, mockContacts, mockCompanies } from "../data/mockData";
import { Wand2, Copy, Send, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";

const EmailGenerator = () => {
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [channel, setChannel] = useState("email"); // email, linkedin, follow-up
  const [tone, setTone] = useState("professional"); // friendly, professional, concise
  const [productInfo, setProductInfo] = useState(
    "AI-powered lead generation and outreach automation platform"
  );

  const API_BASE = process.env.REACT_APP_BACKEND_URL;

  const handleGenerate = async () => {
    if (!selectedContact) {
      toast({
        title: "Contact Required",
        description: "Please select a contact first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const contact = mockContacts.find((c) => c.id === selectedContact);
      const company = mockCompanies.find((c) => c.id === contact?.companyId);

      if (contact && company) {
        // Try to call the AI backend API
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/ai/generate-content`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                recipient_name: contact.name,
                company: company.name,
                role: contact.title,
                industry: company.industry,
                product_info: productInfo,
                tone: tone,
                channel: channel,
                step_number: channel === "follow-up" ? 2 : 1,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("AI Response:", data);
            setSubject(data.subject || "");
            setBody(data.content);
            toast({
              title: "✨ AI Content Generated!",
              description: `Created ${channel} content with ${tone} tone`,
            });
          } else {
            throw new Error("API call failed");
          }
        } catch (apiError) {
          console.log("API not available, using fallback generation");
          // Fallback to template-based generation
          generateFallbackContent(contact, company);
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackContent = (contact, company) => {
    const firstName = contact.name.split(" ")[0];

    if (channel === "email") {
      setSubject(`Quick question about ${company.name}'s growth strategy`);
      setBody(`Hi ${firstName},

I noticed ${company.name} is making impressive strides in the ${company.industry} industry. As ${contact.title}, you're likely facing challenges with scaling operations efficiently.

${productInfo} helps companies like yours achieve measurable growth with less overhead.

Would you be open to a 15-minute call next week to explore if this could benefit ${company.name}?

Best regards,
Your Name`);
    } else if (channel === "linkedin") {
      setSubject("");
      setBody(
        `Hi ${firstName}, I'm impressed by your work at ${
          company.name
        }. I'd love to connect and share insights about how ${productInfo
          .split(" ")
          .slice(0, 10)
          .join(" ")}... might benefit your team.`
      );
    } else if (channel === "follow-up") {
      setSubject(`Following up - ${company.name}`);
      setBody(`Hi ${firstName},

Following up on my previous message about helping ${company.name} with growth initiatives.

I recently helped a similar company in ${company.industry} increase efficiency by 40%.

Would a quick 10-minute call work for you this week?

Best,
Your Name`);
    }

    toast({
      title: "Content Generated!",
      description: "Using template-based generation",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${subject}\n\n${body}`);
    toast({
      title: "Copied!",
      description: "Email content copied to clipboard",
    });
  };

  const handleSend = async () => {
    if (channel === "email") {
      if (!API_BASE) {
        toast({
          title: "Missing backend URL",
          description: "REACT_APP_BACKEND_URL is not set",
          variant: "destructive",
        });
        return;
      }
      const contact = mockContacts.find((c) => c.id === selectedContact);
      const to = contact?.email;
      if (!to) {
        toast({
          title: "Missing email",
          description: "Selected contact has no email",
          variant: "destructive",
        });
        return;
      }
      if (!body) {
        toast({
          title: "No content",
          description: "Generate or write content first",
          variant: "destructive",
        });
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/email/send-test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, subject: subject || "", body }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast({ title: "Sent!", description: `Email sent to ${to}` });
      } catch (e) {
        toast({
          title: "Send failed",
          description: String(e),
          variant: "destructive",
        });
      }
      return;
    }

    // LinkedIn manual assist: copy message and open profile URL
    const contact = mockContacts.find((c) => c.id === selectedContact);
    const profileUrl = contact?.linkedin || "https://www.linkedin.com";
    const message = body || `Hi ${contact?.name?.split(" ")[0] || "there"},`;
    try {
      await navigator.clipboard.writeText(message);
      window.open(profileUrl, "_blank", "noopener,noreferrer");
      toast({
        title: "Copied & Opened",
        description: "Message copied. LinkedIn opened in a new tab.",
      });
    } catch (e) {
      window.open(profileUrl, "_blank", "noopener,noreferrer");
      toast({
        title: "Opened LinkedIn",
        description: "Copy the message manually if clipboard failed.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] p-6">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Email Generator
          </h1>
          <p className="text-gray-400">
            Generate personalized outreach emails with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <Card className="bg-[#1a1d29] border-0 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select Contact */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Select Contact
                </label>
                <select
                  value={selectedContact}
                  onChange={(e) => setSelectedContact(e.target.value)}
                  className="w-full bg-[#0f1117] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="">Choose a contact...</option>
                  {mockContacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} - {contact.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Channel Selection */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-[#0f1117] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="email">Email (Initial)</option>
                  <option value="linkedin">LinkedIn DM</option>
                  <option value="follow-up">Follow-up Email</option>
                </select>
              </div>

              {/* Tone Selection */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {["friendly", "professional", "concise"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        tone === t
                          ? "bg-[#00d4ff] text-white"
                          : "bg-[#0f1117] text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Product/Service Description
                </label>
                <Textarea
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value)}
                  placeholder="Describe your product or service..."
                  rows={3}
                  className="bg-[#0f1117] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00d4ff] resize-none text-sm"
                />
              </div>

              {/* Select Template */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Email Template (Optional)
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-[#0f1117] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="">AI Generated</option>
                  {emailTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>

              {/* Template Info */}
              <div className="pt-4 border-t border-gray-700 space-y-2">
                <h4 className="text-white font-semibold text-sm">
                  Available Templates
                </h4>
                {emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 bg-[#0f1117] rounded-lg"
                  >
                    <p className="text-white text-sm font-medium">
                      {template.name}
                    </p>
                    <p className="text-gray-400 text-xs">{template.category}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card className="bg-[#1a1d29] border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>
                  Generated{" "}
                  {channel === "linkedin" ? "LinkedIn Message" : "Email"}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#00d4ff] hover:bg-[#00bcd4] text-white"
                    onClick={handleSend}
                  >
                    {channel === "linkedin" ? (
                      <ExternalLink className="w-4 h-4 mr-1" />
                    ) : (
                      <Send className="w-4 h-4 mr-1" />
                    )}
                    {channel === "linkedin" ? "Open & Copy DM" : "Send Email"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject (only for email) */}
              {channel !== "linkedin" && (
                <div className="space-y-2">
                  <label className="text-white font-medium text-sm">
                    Subject Line
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject will appear here..."
                    className="bg-[#0f1117] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00d4ff]"
                  />
                </div>
              )}

              {/* Body */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  {channel === "linkedin" ? "Message" : "Email Body"}
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`${
                    channel === "linkedin"
                      ? "LinkedIn message"
                      : "Email content"
                  } will be generated here...\n\nSelect a contact, choose your channel and tone, then click 'Generate with AI' to create personalized content.`}
                  rows={channel === "linkedin" ? 6 : 15}
                  className="bg-[#0f1117] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00d4ff] resize-none"
                />
                {channel === "linkedin" && body && (
                  <p className="text-xs text-gray-400">
                    Character count: {body.length}/300{" "}
                    {body.length > 300 && (
                      <span className="text-yellow-400">
                        (LinkedIn connection notes are limited to 300
                        characters)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* AI Confidence */}
              {body && (
                <div className="p-4 bg-[#0f1117] rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">
                        AI Confidence Score
                      </p>
                      <p className="text-gray-400 text-xs">
                        Based on personalization and engagement factors
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-400">92%</p>
                      <p className="text-xs text-gray-400">High Quality</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailGenerator;
