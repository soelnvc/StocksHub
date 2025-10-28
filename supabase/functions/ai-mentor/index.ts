import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Manual authentication handling (since verify_jwt is false)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error("AI Mentor: Unauthorized - No Authorization header");
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders,
    });
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
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const { message: userMessage } = await req.json();

    let aiResponse = `Hello ${user.user_metadata?.first_name || 'there'}! You asked: "${userMessage}". I'm currently under development, but I'm learning!`;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (GEMINI_API_KEY) {
      console.log("AI Mentor: GEMINI_API_KEY found. Attempting to call Gemini API.");
      try {
        // Changed v1beta to v1 in the API endpoint
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }],
          }),
        });

        console.log(`AI Mentor: Gemini API response status: ${geminiResponse.status}`);

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I couldn't generate a response from Gemini. Please try again.";
          console.log("AI Mentor: Successfully received response from Gemini.");
        } else {
          const errorBody = await geminiResponse.text();
          console.error('AI Mentor: Gemini API error response:', geminiResponse.status, errorBody);
          aiResponse = "I'm having trouble connecting to my brain right now. Please try again later!";
        }
      } catch (apiError: any) {
        console.error('AI Mentor: Error calling Gemini API:', apiError.message || apiError);
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
    console.error("AI Mentor: Error in AI mentor edge function:", error.message);
    return new Response(JSON.stringify({ error: "Failed to process AI request." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});