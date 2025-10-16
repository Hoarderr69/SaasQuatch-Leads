import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  TrendingUp,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Search,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";

const ResponseTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [trackerData, setTrackerData] = useState({
    totalSent: 0,
    opened: 0,
    replied: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    bounced: 0,
    highEngagement: 0,
  });
  const backend = process.env.REACT_APP_BACKEND_URL;
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${backend}/api/tracker/summary`);
        const data = await res.json();
        const sum = data.summary || {
          sent: 0,
          opened: 0,
          replied: 0,
          positive: 0,
        };
        setTrackerData({
          totalSent: sum.sent || 0,
          opened: sum.opened || 0,
          replied: sum.replied || 0,
          positive: sum.positive || 0,
          // still use placeholders for these until backend tracks them
          neutral: 0,
          negative: 0,
          bounced: 0,
          highEngagement: 0,
        });
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const responses = [
    {
      id: "1",
      name: "John Mitchell",
      company: "TechCorp Solutions",
      email: "john.mitchell@techcorp.com",
      status: "Positive",
      dateSent: "2025-10-10",
      dateReplied: "2025-10-12",
      engagementScore: 92,
      subject: "Quick question about TechCorp",
      replyPreview: "Thanks for reaching out! I'd love to schedule a call...",
    },
    {
      id: "2",
      name: "Sarah Chen",
      company: "TechCorp Solutions",
      email: "sarah.chen@techcorp.com",
      status: "Positive",
      dateSent: "2025-10-11",
      dateReplied: "2025-10-11",
      engagementScore: 95,
      subject: "Partnership opportunity",
      replyPreview: "This looks interesting. Let's connect next week...",
    },
    {
      id: "3",
      name: "Michael Green",
      company: "GreenCycle Industries",
      email: "michael.green@greencycle.com",
      status: "Neutral",
      dateSent: "2025-10-09",
      dateReplied: "2025-10-13",
      engagementScore: 78,
      subject: "Sustainable solutions for GreenCycle",
      replyPreview: "Not interested at the moment, but keep in touch...",
    },
    {
      id: "4",
      name: "Dr. Emily Roberts",
      company: "HealthFirst Medical",
      email: "emily.roberts@healthfirst.com",
      status: "Opened",
      dateSent: "2025-10-13",
      dateReplied: null,
      engagementScore: 88,
      subject: "Healthcare innovation discussion",
      replyPreview: null,
    },
    {
      id: "5",
      name: "Alex Martinez",
      company: "CloudSync Technologies",
      email: "alex.martinez@cloudsync.io",
      status: "Replied",
      dateSent: "2025-10-12",
      dateReplied: "2025-10-14",
      engagementScore: 87,
      subject: "Cloud infrastructure solutions",
      replyPreview: "Can you send more information about pricing?",
    },
    {
      id: "6",
      name: "David Kim",
      company: "GreenCycle Industries",
      email: "david.kim@greencycle.com",
      status: "Bounced",
      dateSent: "2025-10-10",
      dateReplied: null,
      engagementScore: 65,
      subject: "Operations efficiency",
      replyPreview: null,
    },
    {
      id: "7",
      name: "Lisa Johnson",
      company: "HealthFirst Medical",
      email: "lisa.johnson@healthfirst.com",
      status: "Sent",
      dateSent: "2025-10-14",
      dateReplied: null,
      engagementScore: 84,
      subject: "VP Operations - Healthcare tech",
      replyPreview: null,
    },
    {
      id: "8",
      name: "Priya Menon",
      company: "TechCorp Solutions",
      email: "priya.menon@techcorp.com",
      status: "Negative",
      dateSent: "2025-10-08",
      dateReplied: "2025-10-09",
      engagementScore: 82,
      subject: "Product innovation discussion",
      replyPreview: "Please remove me from your mailing list.",
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      Positive: { color: "bg-green-600", icon: ThumbsUp },
      Neutral: { color: "bg-yellow-600", icon: Minus },
      Negative: { color: "bg-red-600", icon: ThumbsDown },
      Replied: { color: "bg-blue-600", icon: Mail },
      Opened: { color: "bg-purple-600", icon: Mail },
      Sent: { color: "bg-gray-600", icon: Clock },
      Bounced: { color: "bg-red-800", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.Sent;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const calculateStats = () => {
    const replyRate = (
      (trackerData.replied / trackerData.totalSent) *
      100
    ).toFixed(1);
    const positiveRate = (
      (trackerData.positive / trackerData.totalSent) *
      100
    ).toFixed(1);
    const openRate = (
      (trackerData.opened / trackerData.totalSent) *
      100
    ).toFixed(1);
    const engagementRate = (
      (trackerData.highEngagement / trackerData.totalSent) *
      100
    ).toFixed(1);

    return { replyRate, positiveRate, openRate, engagementRate };
  };

  const stats = calculateStats();

  const filteredResponses = responses.filter((response) => {
    const matchesSearch =
      response.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || response.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0f1117] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Response Tracker
            </h1>
            <p className="text-gray-400">
              Monitor engagement and responses from your outreach campaigns
            </p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-[#1a1d29] border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white bg-blue-700 px-4 py-2 rounded-lg inline-block w-fit">
                Leads Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-white">
                {trackerData.totalSent}
              </p>
              <p className="text-sm text-gray-400 mt-2">Total outreach</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1d29] border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white bg-green-700 px-4 py-2 rounded-lg inline-block w-fit">
                Replies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-white">
                {trackerData.replied}
              </p>
              <p className="text-sm text-green-400 mt-2">
                {stats.replyRate}% reply rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1d29] border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white bg-yellow-700 px-4 py-2 rounded-lg inline-block w-fit">
                Positive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-white">
                {trackerData.positive}
              </p>
              <p className="text-sm text-yellow-400 mt-2">
                {stats.positiveRate}% positive responses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1d29] border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white bg-purple-700 px-4 py-2 rounded-lg inline-block w-fit">
                High Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-white">
                {trackerData.highEngagement}
              </p>
              <p className="text-sm text-purple-400 mt-2">
                {stats.engagementRate}% of leads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm mb-1">Opened</p>
              <p className="text-2xl font-bold text-blue-400">
                {trackerData.opened}
              </p>
              <p className="text-xs text-gray-500">
                {stats.openRate}% open rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm mb-1">Neutral</p>
              <p className="text-2xl font-bold text-yellow-400">
                {trackerData.neutral}
              </p>
              <p className="text-xs text-gray-500">
                Interested but timing issues
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm mb-1">Negative</p>
              <p className="text-2xl font-bold text-red-400">
                {trackerData.negative}
              </p>
              <p className="text-xs text-gray-500">
                Unsubscribe/Not interested
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm mb-1">Bounced</p>
              <p className="text-2xl font-bold text-red-600">
                {trackerData.bounced}
              </p>
              <p className="text-xs text-gray-500">Invalid email addresses</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-[#1a1d29] border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0f1117] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00d4ff]"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#0f1117] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="all">All Statuses</option>
                  <option value="Positive">Positive</option>
                  <option value="Replied">Replied</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                  <option value="Opened">Opened</option>
                  <option value="Sent">Sent</option>
                  <option value="Bounced">Bounced</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response List */}
        <div className="space-y-4">
          {filteredResponses.map((response) => (
            <Card
              key={response.id}
              className="bg-[#1a1d29] border border-gray-800 hover:border-[#00d4ff] transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {response.name}
                      </h3>
                      {getStatusBadge(response.status)}
                      <Badge className="bg-gray-700 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {response.engagementScore}%
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {response.company} • {response.email}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Subject: {response.subject}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      Sent: {response.dateSent}
                    </p>
                    {response.dateReplied && (
                      <p className="text-sm text-green-400">
                        Replied: {response.dateReplied}
                      </p>
                    )}
                  </div>
                </div>

                {response.replyPreview && (
                  <div className="mt-4 p-4 bg-[#0f1117] rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Reply Preview:</p>
                    <p className="text-sm text-white italic">
                      "{response.replyPreview}"
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#00d4ff] hover:bg-[#00bcd4] text-white"
                  >
                    View Full Thread
                  </Button>
                  {(response.status === "Replied" ||
                    response.status === "Positive" ||
                    response.status === "Neutral") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Reply
                    </Button>
                  )}
                  {response.status === "Opened" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Send Follow-up
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResponseTracker;
