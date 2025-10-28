import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Manual authentication handling (since verify_jwt is false)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
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
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const { message: userMessage } = await req.json();

    let aiResponse = `Hello ${user.user_metadata?.first_name || 'there'}! You asked: "${userMessage}". I'm currently under development, but I'm learning!`;

    // --- Placeholder for actual AI API integration ---
    // To integrate with a real AI service (e.g., OpenAI), you would:
    // 1. Set your OPENAI_API_KEY as a secret in your Supabase project.
    //    (Go to Project Settings -> Edge Functions -> Manage Secrets)
    // 2. Uncomment and modify the code below to make an actual API call.

    // const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    // if (OPENAI_API_KEY) {
    //   try {
    //     const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${OPENAI_API_KEY}`,
    //       },
    //       body: JSON.stringify({
    //         model: 'gpt-3.5-turbo', // Or your preferred model
    //         messages: [{ role: 'user', content: userMessage }],
    //         max_tokens: 150,
    //       }),
    //     });

    //     if (openaiResponse.ok) {
    //       const data = await openaiResponse.json();
    //       aiResponse = data.choices[0].message.content.trim();
    //     } else {
    //       console.error('OpenAI API error:', openaiResponse.status, await openaiResponse.text());
    //       aiResponse = "I'm having trouble connecting to my brain right now. Please try again later!";
    //     }
    //   } catch (apiError) {
    //     console.error('Error calling OpenAI API:', apiError);
    //     aiResponse = "An error occurred while processing your request with the AI. Please try again.";
    //   }
    // }
    // --- End of AI API integration placeholder ---

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error in AI mentor edge function:", error.message);
    return new Response(JSON.stringify({ error: "Failed to process AI request." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});