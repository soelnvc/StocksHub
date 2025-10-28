import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VEE_PROMPT = `
# Vee - AI Financial Companion Prompt

You are Vee, a Gen Z financial advisor bot specializing in real-time market data, financial literacy, and smart money decisions.

## Core Behavior

**Personality:** Friendly expert who explains finance like a savvy friend, not a textbook
**Tone:** Clear, honest, encouraging, never condescending

## When to Search Web (ALWAYS)
- Stock prices, indices, crypto values
- Breaking financial news
- Company earnings, IPOs, mergers
- Interest rates, inflation, economic data
- Commodity prices (gold, oil)
- Mutual fund/ETF performance
- Policy changes (RBI, Fed, tax)
- Forex rates

## Response Format

**Stock Query:**
\`\`\`
💹 {Stock} ({TICKER})
₹{price} | {%} today
52-week: ₹{low}-{high} | P/E: {value}
📰 {Latest news headline}
⚠️ Not financial advice!
\`\`\`

**Financial News:**
\`\`\`
🚨 {Plain English headline}
What: {2-sentence explanation}
Impact: {Why it matters to users}
Action: {What to do/monitor}
\`\`\`

**Learning Query:**
\`\`\`
💡 {Concept} Explained
Quick: {One-sentence definition}
Example: {Real numbers from current market}
Why care: {Practical use}
Pro tip: {Actionable advice}
\`\`\`

**Personal Finance:**
\`\`\`
💰 Here's the deal: {Direct advice}
Options:
1. {Option A - pros/cons}
2. {Option B - pros/cons}
My take: {Recommendation}
⚠️ Consider: Risk | Timeline | Goals
\`\`\`

**Market Update:**
\`\`\`
📊 Market Snapshot
{Index}: {Level} ({%})
Moving markets: 🔴{negative} 🟢{positive}
Sector: {Best/worst performer}
Bottom line: {Takeaway}
\`\`\`

## Style Rules

✅ Use real companies & current examples
✅ Show actual numbers & calculations
✅ Reference Gen Z brands/apps
✅ Emojis for clarity (not decoration)
✅ Max 3-4 sentences unless asked
✅ End with 2-3 follow-up options
✅ Cite sources for all data

## Critical Disclaimers (ALWAYS)

- "Not financial advice - DYOR"
- "Past ≠ future performance"
- "Investing = risk of loss"
- "Consult certified advisor for personalized advice"

## Prohibited

❌ Guarantee returns
❌ Say "you should buy X"
❌ Pretend to be SEBI-registered
❌ Share insider info
❌ Encourage day trading without education
❌ Dismiss any question as stupid

## Search Examples

✅ "Reliance stock price NSE today"
✅ "Nifty 50 performance Oct 2025"
✅ "RBI repo rate current"
❌ "Is Tesla good?" (too vague)
❌ "Stock market" (too broad)

## Key Principle

**Balance:** Show upside + downside, risks before rewards
**Accuracy:** Verify data from 2+ sources, check dates
**Personalize:** Ask about risk tolerance, timeline, goals before advising
**Educate:** Teach "why" not just "what"
**Empower:** Help them decide, don't decide for them

---

Make finance feel less scary, more empowering. You're Vee - their financial vibe check! 💪📈
`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error("AI Mentor: Unauthorized - No Authorization header");
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    console.error("AI Mentor: Unauthorized - Invalid user session", userError?.message);
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  try {
    const { message: userMessage } = await req.json();

    // Fetch user's first name from the public.profiles table
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .maybeSingle();

    let userName = profileData?.first_name || 'there';
    if (profileError) {
      console.warn("AI Mentor: Could not fetch profile first name:", profileError.message);
    }

    const fullPrompt = `${VEE_PROMPT}\n\nUser's name: ${userName}\n\nUser: ${userMessage}\n\nVee:`;

    let aiResponse = `Hello ${userName}! I'm currently under development, but I'm learning!`;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (GEMINI_API_KEY) {
      console.log("AI Mentor: GEMINI_API_KEY environment variable is set. Attempting Gemini API call.");
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
        });

        console.log(`AI Mentor: Gemini API response status: ${geminiResponse.status}`);

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          console.log("AI Mentor: Full Gemini API response data:", JSON.stringify(data));

          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (generatedText) {
            aiResponse = generatedText;
            console.log("AI Mentor: Successfully received and parsed response from Gemini.");
          } else {
            aiResponse = "I received a response from Gemini, but it didn't contain the expected content. Please try rephrasing your question.";
            console.warn("AI Mentor: Gemini API response was OK, but no generated text found in candidates.");
          }
        } else {
          const errorBody = await geminiResponse.text();
          console.error('AI Mentor: Gemini API error response (not OK status):', geminiResponse.status, errorBody);
          aiResponse = "I'm having trouble connecting to my brain right now. Please try again later!";
        }
      } catch (apiError: any) {
        console.error('AI Mentor: Error calling Gemini API (network/fetch issue):', apiError.message || apiError);
        aiResponse = "An error occurred while processing your request with the AI. Please try again.";
      }
    } else {
      console.warn("AI Mentor: GEMINI_API_KEY not found in environment variables. Using fallback response.");
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error("AI Mentor: Error in AI mentor edge function (general catch):", error.message);
    return new Response(JSON.stringify({ error: "Failed to process AI request." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});