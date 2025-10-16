// Mock data for SaaSquatch Leads platform

export const mockCompanies = [
  {
    id: "1",
    name: "TechCorp Solutions",
    industry: "Software",
    location: "San Francisco, CA",
    country: "USA",
    employeeCount: 250,
    revenue: "$25M - $50M",
    domain: "techcorp.com",
    description: "Enterprise software solutions for modern businesses",
    confidence: 95,
    verified: true,
  },
  {
    id: "2",
    name: "GreenCycle Industries",
    industry: "Waste/Recycling/Environmental",
    location: "Portland, OR",
    country: "USA",
    employeeCount: 120,
    revenue: "$10M - $25M",
    domain: "greencycle.com",
    description: "Sustainable waste management and recycling solutions",
    confidence: 88,
    verified: true,
  },
  {
    id: "3",
    name: "HealthFirst Medical",
    industry: "Healthcare Facility/Healthcare Services",
    location: "Boston, MA",
    country: "USA",
    employeeCount: 500,
    revenue: "$50M - $100M",
    domain: "healthfirst.com",
    description: "Comprehensive healthcare services and facilities",
    confidence: 92,
    verified: true,
  },
  {
    id: "4",
    name: "CloudSync Technologies",
    industry: "Software",
    location: "Austin, TX",
    country: "USA",
    employeeCount: 180,
    revenue: "$15M - $30M",
    domain: "cloudsync.io",
    description: "Cloud infrastructure and synchronization tools",
    confidence: 90,
    verified: true,
  },
];

export const mockContacts = [
  {
    id: "1",
    companyId: "1",
    name: "John Mitchell",
    title: "VP of Sales",
    email: "john.mitchell@techcorp.com",
    linkedin: "https://linkedin.com/in/johnmitchell",
    phone: "+1 415-555-0123",
    emailVerified: true,
    linkedinVerified: true,
    engagementScore: 85,
    replyLikelihood: "High",
    confidenceScore: 92,
    confidenceReason:
      "Valid email format, Valid domain with MX records, Valid LinkedIn profile, Decision-maker title, Company info available",
    verificationStatus: "Valid",
    potentialLabel: "High",
    linkedinActivity: 15,
  },
  {
    id: "2",
    companyId: "1",
    name: "Sarah Chen",
    title: "CEO",
    email: "sarah.chen@techcorp.com",
    linkedin: "https://linkedin.com/in/sarahchen",
    phone: "+1 415-555-0124",
    emailVerified: true,
    linkedinVerified: true,
    engagementScore: 92,
    replyLikelihood: "Very High",
    confidenceScore: 95,
    confidenceReason:
      "Valid email format, Valid domain with MX records, Valid LinkedIn profile, Decision-maker title, Company info available",
    verificationStatus: "Valid",
    potentialLabel: "High",
    linkedinActivity: 22,
  },
  {
    id: "3",
    companyId: "2",
    name: "Michael Green",
    title: "Operations Director",
    email: "michael.green@greencycle.com",
    linkedin: "https://linkedin.com/in/michaelgreen",
    phone: "+1 503-555-0125",
    emailVerified: true,
    linkedinVerified: true,
    engagementScore: 78,
    replyLikelihood: "Medium",
    confidenceScore: 88,
    confidenceReason:
      "Valid email format, Valid domain with MX records, Valid LinkedIn profile, Decision-maker title, Company info available",
    verificationStatus: "Valid",
    potentialLabel: "Medium",
    linkedinActivity: 8,
  },
  {
    id: "4",
    companyId: "3",
    name: "Dr. Emily Roberts",
    title: "Chief Medical Officer",
    email: "emily.roberts@healthfirst.com",
    linkedin: "https://linkedin.com/in/emilyroberts",
    phone: "+1 617-555-0126",
    emailVerified: true,
    linkedinVerified: true,
    engagementScore: 88,
    replyLikelihood: "High",
    confidenceScore: 93,
    confidenceReason:
      "Valid email format, Valid domain with MX records, Valid LinkedIn profile, Decision-maker title, Company info available",
    verificationStatus: "Valid",
    potentialLabel: "High",
    linkedinActivity: 18,
  },
  {
    id: "5",
    companyId: "4",
    name: "Alex Martinez",
    title: "CTO",
    email: "alex.martinez@cloudsync.io",
    linkedin: "https://linkedin.com/in/alexmartinez",
    phone: "+1 512-555-0127",
    emailVerified: true,
    linkedinVerified: true,
    engagementScore: 87,
    replyLikelihood: "High",
    confidenceScore: 94,
    confidenceReason:
      "Valid email format, Valid domain with MX records, Valid LinkedIn profile, Decision-maker title, Company info available",
    verificationStatus: "Valid",
    potentialLabel: "High",
    linkedinActivity: 20,
  },
  {
    id: "6",
    companyId: "1",
    name: "Priya Menon",
    title: "Head of Product",
    email: "priya.menon@techcorp.com",
    linkedin: "https://linkedin.com/in/priyamenon",
    phone: "+1 415-555-0128",
    emailVerified: true,
    linkedinVerified: true,
    engagementScore: 82,
    replyLikelihood: "High",
    confidenceScore: 90,
    confidenceReason:
      "Valid email format, Valid domain with MX records, Valid LinkedIn profile, Decision-maker title, Company info available",
    verificationStatus: "Valid",
    potentialLabel: "High",
    linkedinActivity: 14,
  },
  {
    id: "7",
    companyId: "2",
    name: "David Kim",
    title: "Senior Manager",
    email: "david.kim@greencycle.com",
    linkedin: "https://linkedin.com/in/davidkim",
    phone: "+1 503-555-0129",
    emailVerified: true,
    linkedinVerified: true,
    engagementScore: 65,
    replyLikelihood: "Medium",
    confidenceScore: 75,
    confidenceReason:
      "Valid email format, Valid domain with MX records, Valid LinkedIn profile, Standard title, Company info available",
    verificationStatus: "Warning",
    potentialLabel: "Medium",
    linkedinActivity: 5,
  },
  {
    id: "8",
    companyId: "3",
    name: "Lisa Johnson",
    title: "VP of Operations",
    email: "lisa.johnson@healthfirst.com",
    linkedin: "https://linkedin.com/in/lisajohnson",
    phone: "+1 617-555-0130",
    emailVerified: true,
    linkedinVerified: true,
    engagementScore: 84,
    replyLikelihood: "High",
    confidenceScore: 91,
    confidenceReason:
      "Valid email format, Valid domain with MX records, Valid LinkedIn profile, Decision-maker title, Company info available",
    verificationStatus: "Valid",
    potentialLabel: "High",
    linkedinActivity: 16,
  },
];

export const industryDistribution = {
  Software: 2,
  "Waste/Recycling/Environmental": 1,
  "Healthcare Facility/Healthcare Services": 1,
};

export const userStats = {
  totalLeads: 4,
  remainingCredits: 1,
  subscription: "Free Plan",
  subscriptionStatus: "Active",
};

export const industries = [
  "Software",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Financial Services",
  "Education",
  "Real Estate",
  "Technology",
  "Consulting",
  "Marketing",
  "E-commerce",
  "Telecommunications",
  "Energy",
  "Transportation",
  "Hospitality",
  "Media & Entertainment",
  "Agriculture",
  "Construction",
  "Legal Services",
  "Waste/Recycling/Environmental",
  "Healthcare Facility/Healthcare Services",
];

export const locations = [
  "San Francisco, CA",
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Austin, TX",
  "Seattle, WA",
  "Boston, MA",
  "Denver, CO",
  "Atlanta, GA",
  "Miami, FL",
];

export const emailTemplates = [
  {
    id: "1",
    name: "Cold Outreach - Executive",
    subject: "Quick question about {company_name}",
    body: `Hi {first_name},

I noticed that {company_name} is doing impressive work in the {industry} space.

We've helped similar companies like yours increase their revenue by 30% through our innovative solutions.

Would you be open to a quick 15-minute call next week to explore how we might help {company_name}?

Best regards,
{sender_name}`,
    category: "cold_outreach",
  },
  {
    id: "2",
    name: "Follow-up",
    subject: "Re: Quick question about {company_name}",
    body: `Hi {first_name},

I wanted to follow up on my previous email. I understand you're busy, so I'll keep this brief.

Would love to show you how we've helped companies in {industry} achieve measurable results.

Are you available for a quick call this week?

Best,
{sender_name}`,
    category: "follow_up",
  },
];

export const sequences = [
  {
    id: "1",
    name: "Tech Executive Outreach",
    status: "active",
    steps: [
      {
        id: "1-1",
        type: "email",
        delay: 0,
        subject: "Transforming {company_name} operations",
        template: "Cold Outreach - Executive",
      },
      {
        id: "1-2",
        type: "linkedin",
        delay: 2,
        message: "Connect and introduction",
      },
      {
        id: "1-3",
        type: "email",
        delay: 5,
        subject: "Following up",
        template: "Follow-up",
      },
    ],
    totalContacts: 12,
    replied: 3,
    opened: 8,
  },
];
