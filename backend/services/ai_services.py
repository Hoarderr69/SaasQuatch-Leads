"""
AI Services for Lead Scoring, Engagement Prediction, and Content Generation
"""

import os
import re
import validators
import dns.resolver
from typing import Dict, List, Optional
from datetime import datetime
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Try to import AI libraries (optional)
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI not available")

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("Google Generative AI not available")


class AILeadScoring:
    """AI Lead Scoring Engine"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        
        if OPENAI_AVAILABLE and self.openai_api_key:
            openai.api_key = self.openai_api_key
            
        if GEMINI_AVAILABLE and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
    
    def verify_email_format(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def verify_domain(self, domain: str) -> bool:
        """Verify if domain has valid DNS records"""
        try:
            dns.resolver.resolve(domain, 'MX')
            return True
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout):
            return False
        except Exception as e:
            logger.error(f"Error verifying domain {domain}: {e}")
            return False
    
    def check_linkedin_validity(self, linkedin_url: str) -> bool:
        """Check if LinkedIn URL is valid"""
        if not linkedin_url:
            return False
        
        linkedin_pattern = r'https?://(www\.)?linkedin\.com/in/[\w-]+/?'
        return bool(re.match(linkedin_pattern, linkedin_url))
    
    def calculate_confidence_score(
        self,
        email: str,
        domain: str,
        linkedin_url: Optional[str] = None,
        title: Optional[str] = None,
        company: Optional[str] = None
    ) -> Dict:
        """
        Calculate confidence score for a lead
        
        Returns:
            {
                "confidence_score": 0-100,
                "confidence_reason": str,
                "status": "Valid" | "Warning" | "Invalid",
                "breakdown": {...}
            }
        """
        score = 0
        reasons = []
        breakdown = {}
        
        # Email validation (30 points)
        if self.verify_email_format(email):
            score += 20
            reasons.append("Valid email format")
            breakdown['email_format'] = 20
        else:
            reasons.append("Invalid email format")
            breakdown['email_format'] = 0
        
        # Domain verification (25 points)
        if domain:
            if self.verify_domain(domain):
                score += 25
                reasons.append("Valid domain with MX records")
                breakdown['domain_valid'] = 25
            else:
                reasons.append("Domain verification failed")
                breakdown['domain_valid'] = 0
        
        # LinkedIn profile (20 points)
        if linkedin_url:
            if self.check_linkedin_validity(linkedin_url):
                score += 20
                reasons.append("Valid LinkedIn profile")
                breakdown['linkedin_valid'] = 20
            else:
                reasons.append("Invalid LinkedIn URL")
                breakdown['linkedin_valid'] = 0
        else:
            breakdown['linkedin_valid'] = 0
        
        # Title relevance (15 points)
        if title:
            important_titles = ['cto', 'ceo', 'cfo', 'vp', 'director', 'head', 'founder', 'manager', 'lead']
            if any(keyword in title.lower() for keyword in important_titles):
                score += 15
                reasons.append("Decision-maker title")
                breakdown['title_relevance'] = 15
            else:
                score += 5
                reasons.append("Standard title")
                breakdown['title_relevance'] = 5
        
        # Company name presence (10 points)
        if company:
            score += 10
            reasons.append("Company info available")
            breakdown['company_info'] = 10
        
        # Determine status
        if score >= 80:
            status = "Valid"
        elif score >= 50:
            status = "Warning"
        else:
            status = "Invalid"
        
        return {
            "confidence_score": min(score, 100),
            "confidence_reason": ", ".join(reasons),
            "status": status,
            "breakdown": breakdown
        }


class EngagementPredictor:
    """Engagement Index Predictor"""
    
    def __init__(self):
        pass
    
    def calculate_engagement_index(
        self,
        linkedin_activity: int = 0,  # Posts/comments per month
        company_growth: str = "stable",  # stable, growing, declining
        role_seniority: str = "mid",  # junior, mid, senior, executive
        industry_relevance: int = 0,  # 0-10
        previous_reply_rate: float = 0.0,  # 0.0-1.0
        website_status: bool = True
    ) -> Dict:
        """
        Calculate engagement index (reply probability)
        
        Returns:
            {
                "engagement_index": 0-100,
                "potential_label": "High" | "Medium" | "Low",
                "reason": str,
                "factors": {...}
            }
        """
        score = 0
        factors = {}
        
        # LinkedIn activity (30 points)
        if linkedin_activity >= 20:
            activity_score = 30
            activity_desc = "Very active on LinkedIn"
        elif linkedin_activity >= 10:
            activity_score = 22
            activity_desc = "Active on LinkedIn"
        elif linkedin_activity >= 5:
            activity_score = 15
            activity_desc = "Moderately active"
        else:
            activity_score = 5
            activity_desc = "Low LinkedIn activity"
        
        score += activity_score
        factors['linkedin_activity'] = {
            'score': activity_score,
            'posts_per_month': linkedin_activity,
            'description': activity_desc
        }
        
        # Company growth (20 points)
        growth_map = {
            'growing': (20, "Company growing rapidly"),
            'stable': (12, "Company stable"),
            'declining': (5, "Company declining")
        }
        growth_score, growth_desc = growth_map.get(company_growth, (10, "Unknown growth"))
        score += growth_score
        factors['company_growth'] = {
            'score': growth_score,
            'status': company_growth,
            'description': growth_desc
        }
        
        # Role seniority (20 points)
        seniority_map = {
            'executive': (20, "Executive level"),
            'senior': (15, "Senior level"),
            'mid': (10, "Mid level"),
            'junior': (5, "Junior level")
        }
        seniority_score, seniority_desc = seniority_map.get(role_seniority, (8, "Unknown level"))
        score += seniority_score
        factors['role_seniority'] = {
            'score': seniority_score,
            'level': role_seniority,
            'description': seniority_desc
        }
        
        # Industry relevance (15 points)
        relevance_score = min(industry_relevance * 1.5, 15)
        score += relevance_score
        factors['industry_relevance'] = {
            'score': relevance_score,
            'rating': industry_relevance,
            'description': f"Industry relevance: {industry_relevance}/10"
        }
        
        # Previous reply rate (10 points)
        reply_score = previous_reply_rate * 10
        score += reply_score
        factors['previous_replies'] = {
            'score': reply_score,
            'rate': previous_reply_rate,
            'description': f"{previous_reply_rate*100:.0f}% previous reply rate"
        }
        
        # Website status (5 points)
        if website_status:
            score += 5
            factors['website_status'] = {
                'score': 5,
                'active': True,
                'description': "Active website"
            }
        else:
            factors['website_status'] = {
                'score': 0,
                'active': False,
                'description': "No active website"
            }
        
        # Calculate final score (0-100)
        final_score = min(score, 100)
        
        # Determine potential label
        if final_score >= 75:
            potential_label = "High"
            reason = "Strong engagement signals: active professional with relevant background"
        elif final_score >= 50:
            potential_label = "Medium"
            reason = "Moderate engagement potential with some positive indicators"
        else:
            potential_label = "Low"
            reason = "Limited engagement signals, may require warming up"
        
        return {
            "engagement_index": final_score,
            "potential_label": potential_label,
            "reason": reason,
            "factors": factors
        }


class ContentGenerator:
    """AI Content Generator for emails and messages"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.use_openai = OPENAI_AVAILABLE and self.openai_api_key
        self.use_gemini = GEMINI_AVAILABLE and self.gemini_api_key and not self.use_openai
        
        if self.use_openai:
            openai.api_key = self.openai_api_key
        elif self.use_gemini:
            genai.configure(api_key=self.gemini_api_key)
    
    def generate_email_content(
        self,
        recipient_name: str,
        company: str,
        role: str,
        industry: str,
        product_info: str,
        tone: str = "professional",
        channel: str = "email",
        step_number: int = 1
    ) -> Dict:
        """
        Generate AI-powered content for outreach
        
        Args:
            recipient_name: Name of the recipient
            company: Company name
            role: Recipient's role/title
            industry: Industry
            product_info: Your product/service description
            tone: friendly | professional | concise
            channel: email | linkedin | follow-up
            step_number: Sequence step number
        
        Returns:
            {
                "subject": str (for email),
                "content": str,
                "length": int,
                "tone": str
            }
        """
        
        # Build the prompt
        first_name = recipient_name.split()[0] if recipient_name else "there"
        
        if channel == "email" and step_number == 1:
            prompt = self._build_initial_email_prompt(
                first_name, company, role, industry, product_info, tone
            )
            max_words = 90
        elif channel == "linkedin":
            prompt = self._build_linkedin_prompt(
                first_name, company, role, industry, product_info, tone
            )
            max_words = 300  # characters actually
        elif channel == "follow-up":
            prompt = self._build_followup_prompt(
                first_name, company, product_info, tone
            )
            max_words = 70
        else:
            prompt = self._build_initial_email_prompt(
                first_name, company, role, industry, product_info, tone
            )
            max_words = 90
        
        # Generate content using available AI
        if self.use_openai:
            content = self._generate_with_openai(prompt)
        elif self.use_gemini:
            content = self._generate_with_gemini(prompt)
        else:
            # Fallback to template-based generation
            content = self._generate_template_based(
                first_name, company, role, product_info, channel, step_number
            )
        
        # Extract subject and body for email
        if channel == "email":
            if "\n\n" in content:
                subject, body = content.split("\n\n", 1)
                subject = subject.replace("Subject:", "").strip()
            else:
                subject = f"Quick question about {company}'s {industry} strategy"
                body = content
        else:
            subject = ""
            body = content
        
        return {
            "subject": subject,
            "content": body,
            "length": len(body),
            "tone": tone
        }
    
    def _build_initial_email_prompt(self, name, company, role, industry, product, tone):
        tone_desc = {
            "friendly": "warm and conversational",
            "professional": "professional and business-like",
            "concise": "brief and to the point"
        }[tone]
        
        return f"""Write a {tone_desc} cold email (max 90 words) to {name}, {role} at {company} in the {industry} industry.

Product/Service: {product}

Requirements:
- Start with a personalized opener about their company/role
- Mention one specific pain point in their industry
- Brief value proposition (1 sentence)
- Clear CTA (ask for a quick call or reply)
- Use {{name}}, {{company}} as placeholders

Format:
Subject: [compelling subject line]

[email body]"""
    
    def _build_linkedin_prompt(self, name, company, role, industry, product, tone):
        return f"""Write a LinkedIn connection request message (max 300 characters) to {name}, {role} at {company}.

Briefly mention their work in {industry}, express interest in connecting, and hint at {product} value.

Keep it {tone} and human."""
    
    def _build_followup_prompt(self, name, company, product, tone):
        return f"""Write a gentle follow-up email (max 70 words) to {name} at {company}.

- Reference the previous message
- Add new value (stat, resource, or insight)
- Soft CTA

Keep it {tone}."""
    
    def _generate_with_openai(self, prompt: str) -> str:
        """Generate content using OpenAI GPT"""
        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert sales copywriter specializing in B2B outreach."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI generation error: {e}")
            return self._generate_fallback_content(prompt)
    
    def _generate_with_gemini(self, prompt: str) -> str:
        """Generate content using Google Gemini"""
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return self._generate_fallback_content(prompt)
    
    def _generate_template_based(self, name, company, role, product, channel, step):
        """Fallback template-based generation"""
        if channel == "email" and step == 1:
            return f"""Subject: Quick question about {company}'s growth strategy

Hi {name},

I noticed {company} is making waves in your industry. As {role}, you're likely facing challenges with scaling operations efficiently.

{product} helps companies like yours achieve 3x faster growth with less overhead.

Would you be open to a 15-minute call next week to explore if this could help {company}?

Best,
[Your Name]"""
        
        elif channel == "linkedin":
            return f"Hi {name}, impressed by your work at {company}. Would love to connect and share insights about {product} that might benefit your team."
        
        elif channel == "follow-up":
            return f"""Hi {name},

Following up on my previous message. I recently helped a similar company increase efficiency by 40%.

Would a quick chat work for you this week?

Best,
[Your Name]"""
        
        return f"Hi {name},\n\nInterested in discussing how we can help {company}?\n\nBest regards"
    
    def _generate_fallback_content(self, prompt: str) -> str:
        """Basic fallback if AI services fail"""
        return """Subject: Exploring partnership opportunities

Hi {name},

I came across {company} and was impressed by your work in the industry.

I believe our solution could help streamline your operations and drive growth.

Would you be open to a brief conversation?

Best regards"""


# Singleton instances
lead_scorer = AILeadScoring()
engagement_predictor = EngagementPredictor()
content_generator = ContentGenerator()
