// @ts-ignore - Deno runtime environment (ignore Node.js TypeScript errors)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno runtime environment
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Deno global declaration for TypeScript (this code runs in Supabase Deno runtime)
declare const Deno: any

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentRequest {
  destination: string
  content_type: string
  ai_provider: string
  affiliate_preferences: {
    booking_com: boolean
    getyourguide: boolean
    viator: boolean
  }
}

interface AIProvider {
  name: string
  generateContent: (prompt: string) => Promise<string>
}

class GeminiProvider implements AIProvider {
  name = 'gemini'
  
  async generateContent(prompt: string): Promise<string> {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('Gemini API key not configured')
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })
    
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Content generation failed'
  }
}

class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  
  async generateContent(prompt: string): Promise<string> {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) throw new Error('Anthropic API key not configured')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    const data = await response.json()
    return data.content?.[0]?.text || 'Content generation failed'
  }
}

class OpenAIProvider implements AIProvider {
  name = 'openai'
  
  async generateContent(prompt: string): Promise<string> {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('OpenAI API key not configured')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000
      })
    })
    
    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'Content generation failed'
  }
}

const providers: Record<string, AIProvider> = {
  'gemini': new GeminiProvider(),
  'anthropic': new AnthropicProvider(),
  'openai': new OpenAIProvider()
}

function generatePrompt(request: ContentRequest): string {
  const affiliateLinks = []
  if (request.affiliate_preferences.booking_com) affiliateLinks.push('Booking.com')
  if (request.affiliate_preferences.getyourguide) affiliateLinks.push('GetYourGuide')
  if (request.affiliate_preferences.viator) affiliateLinks.push('Viator')
  
  return `Create a comprehensive travel blog post about ${request.destination}.

Content Type: ${request.content_type}

Requirements:
1. Write an engaging, informative article about ${request.destination}
2. Include practical travel tips and insider information
3. Structure with clear headings and sections
4. Include mentions of activities that could link to: ${affiliateLinks.join(', ')}
5. Write in an authentic, personal tone as if from an experienced traveler
6. Include SEO-friendly content with natural keyword placement
7. Suggest specific accommodations, tours, and activities
8. Add practical details like best time to visit, budget tips, etc.

Format the response as JSON with these fields:
{
  "title": "SEO optimized title",
  "excerpt": "Brief 150 character summary",
  "content": "Full HTML formatted article content",
  "seo_meta": {
    "description": "Meta description for SEO",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  },
  "affiliate_opportunities": {
    "accommodations": ["suggestion 1", "suggestion 2"],
    "activities": ["activity 1", "activity 2"],
    "tours": ["tour 1", "tour 2"]
  }
}

Make sure the content is original, engaging, and provides real value to travelers planning a trip to ${request.destination}.`
}

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const pathname = url.pathname

    // Route: Generate content
    if (pathname === '/generate-content' && req.method === 'POST') {
      const request: ContentRequest = await req.json()
      
      // Validate provider
      const provider = providers[request.ai_provider]
      if (!provider) {
        return new Response(
          JSON.stringify({ error: 'Invalid AI provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate content
      const prompt = generatePrompt(request)
      const rawContent = await provider.generateContent(prompt)
      
      // Try to parse as JSON, fallback to plain text
      let content
      try {
        content = JSON.parse(rawContent)
      } catch {
        content = {
          title: `Travel Guide: ${request.destination}`,
          excerpt: `Discover the best of ${request.destination} with our comprehensive travel guide.`,
          content: rawContent,
          seo_meta: {
            description: `Complete travel guide for ${request.destination}`,
            keywords: [request.destination, 'travel', 'guide']
          },
          affiliate_opportunities: {
            accommodations: [],
            activities: [],
            tours: []
          }
        }
      }

      // Save to database
      const { data: blogPost, error } = await supabaseClient
        .from('blog_posts')
        .insert({
          title: content.title,
          content: content.content,
          excerpt: content.excerpt,
          destination: request.destination,
          ai_provider: request.ai_provider,
          affiliate_links: content.affiliate_opportunities || {},
          seo_meta: content.seo_meta || {},
          published: false
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save content' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ ...content, id: blogPost.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: Get blog posts
    if (pathname === '/blog-posts' && req.method === 'GET') {
      const { data: posts, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch posts' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ posts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: Available AI providers
    if (pathname === '/ai-providers' && req.method === 'GET') {
      const availableProviders = []
      
      if (Deno.env.get('GEMINI_API_KEY')) availableProviders.push('gemini')
      if (Deno.env.get('ANTHROPIC_API_KEY')) availableProviders.push('anthropic')
      if (Deno.env.get('OPENAI_API_KEY')) availableProviders.push('openai')

      return new Response(
        JSON.stringify({ providers: availableProviders }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: Health check
    if (pathname === '/health' && req.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})