# ============================================================================
# FILE: backend/services/content_engine_anthropic.py
# ============================================================================
"""
Location: backend/services/content_engine_anthropic.py
Purpose: Content generation using Anthropic Claude
Install: pip install anthropic
"""

import anthropic
import os
import json
from typing import Dict

class ContentEngine:
    """Content generation using Anthropic Claude"""
    
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not set in environment")
        
        self.client = anthropic.Anthropic(api_key=api_key)
    
    async def generate_blog_post(self, topic: str, niche: str, target_market: str, region: str) -> Dict:
        """Generate complete blog post"""
        
        prompt = f"""
Write a luxury travel blog post about {topic}.

Target Market: {target_market}
Region: {region}
Niche: {niche}

Requirements:
1. Length: 2000-2500 words
2. SEO optimized with H2/H3 headers
3. Engaging introduction and conclusion
4. Include 5-7 naturally integrated affiliate recommendations for:
    - Hotels/accommodation (Booking.com or other accommodation platforms)
   - Tours/activities (GetYourGuide or Viator)
5. Include practical information and insider tips
6. Professional tone for luxury audience

Return as JSON with these fields:
{{
    "title": "Post title",
    "slug": "url-slug",
    "meta_description": "SEO description (max 155 chars)",
    "content": "Full post content with HTML headers",
    "keywords": ["keyword1", "keyword2", ...],
    "affiliate_suggestions": [
        {{"type": "hotel", "name": "Hotel Name", "platform": "booking.com", "link": "..."}},
        ...
    ]
}}
"""
        
        try:
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            text = response.content[0].text
            
            # Remove markdown code blocks if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            post_data = json.loads(text)
            return post_data
            
        except json.JSONDecodeError:
            raise ValueError(f"Failed to parse Anthropic response as JSON: {text}")
        except Exception as e:
            raise Exception(f"Content generation error: {str(e)}")