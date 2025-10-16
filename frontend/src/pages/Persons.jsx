import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { mockContacts, mockCompanies } from "../data/mockData";
import {
  Mail,
  Linkedin,
  Phone,
  CheckCircle,
  Search,
  TrendingUp,
  Shield,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

const Persons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState(mockContacts);

  const getCompanyName = (companyId) => {
    const company = mockCompanies.find((c) => c.id === companyId);
    return company ? company.name : "Unknown Company";
  };

  const getEngagementColor = (score) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-orange-400";
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f1117] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">Contact Persons</h1>
          <p className="text-gray-400">Manage and verify contact information</p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1a1d29] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00d4ff]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm mb-1">Total Contacts</p>
              <p className="text-3xl font-bold text-white">{contacts.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm mb-1">Verified Emails</p>
              <p className="text-3xl font-bold text-green-400">
                {contacts.filter((c) => c.emailVerified).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm mb-1">High Engagement</p>
              <p className="text-3xl font-bold text-[#00d4ff]">
                {contacts.filter((c) => c.engagementScore >= 85).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1d29] border-0">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm mb-1">LinkedIn Verified</p>
              <p className="text-3xl font-bold text-blue-400">
                {contacts.filter((c) => c.linkedinVerified).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          <TooltipProvider>
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="bg-[#1a1d29] border border-gray-800 hover:border-[#00d4ff] transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {contact.name}
                            {contact.emailVerified && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {contact.title}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {getCompanyName(contact.companyId)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {/* AI Confidence Score */}
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                className={`${
                                  contact.verificationStatus === "Valid"
                                    ? "bg-green-600"
                                    : contact.verificationStatus === "Warning"
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                                } text-white`}
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                {contact.confidenceScore}% Confidence
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 text-white border-gray-700 max-w-xs">
                              <p className="text-xs">
                                {contact.confidenceReason}
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Engagement Index */}
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                className={`${getEngagementColor(
                                  contact.engagementScore
                                )} bg-transparent border border-current`}
                              >
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {contact.engagementScore}% Engagement
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 text-white border-gray-700">
                              <p className="text-xs">
                                {contact.linkedinActivity} LinkedIn posts/month
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Potential Label */}
                          <Badge
                            className={`${
                              contact.potentialLabel === "High"
                                ? "bg-purple-600"
                                : contact.potentialLabel === "Medium"
                                ? "bg-blue-600"
                                : "bg-gray-600"
                            } text-white`}
                          >
                            <Activity className="w-3 h-3 mr-1" />
                            {contact.potentialLabel} Potential
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#00d4ff]" />
                          <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-sm text-white hover:text-[#00d4ff] transition-colors"
                            >
                              {contact.email}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-[#00d4ff]" />
                          <div>
                            <p className="text-xs text-gray-400">LinkedIn</p>
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-white hover:text-[#00d4ff] transition-colors"
                            >
                              View Profile
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#00d4ff]" />
                          <div>
                            <p className="text-xs text-gray-400">Phone</p>
                            <p className="text-sm text-white">
                              {contact.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button className="bg-[#00d4ff] hover:bg-[#00bcd4] text-white text-sm">
                          Generate Email
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
                        >
                          Add to Sequence
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
                        >
                          Verify Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default Persons;
