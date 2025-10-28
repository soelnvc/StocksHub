/// <reference lib="deno.ns" />
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

  // Manual authentication handling
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
    const userId = user.id;
    const defaultBalance = 100000.00; // Define default balance here

    // Start a transaction (Supabase client doesn't directly support transactions in Edge Functions,
    // so we'll execute queries sequentially and handle errors)

    // 1. Reset user balance
    const { error: balanceError } = await supabaseClient
      .from('user_balances')
      .update({ balance: defaultBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (balanceError) throw balanceError;

    // 2. Delete user stocks
    const { error: stocksError } = await supabaseClient
      .from('user_stocks')
      .delete()
      .eq('user_id', userId);
    if (stocksError) throw stocksError;

    // 3. Delete transactions
    const { error: transactionsError } = await supabaseClient
      .from('transactions')
      .delete()
      .eq('user_id', userId);
    if (transactionsError) throw transactionsError;

    // 4. Delete gamification XP
    const { error: xpDeleteError } = await supabaseClient
      .from('gamification_xp')
      .delete()
      .eq('user_id', userId);
    if (xpDeleteError) throw xpDeleteError;

    // 5. Delete gamification streaks
    const { error: streaksDeleteError } = await supabaseClient
      .from('gamification_streaks')
      .delete()
      .eq('user_id', userId);
    if (streaksDeleteError) throw streaksDeleteError;

    // 6. Delete gamification badges
    const { error: badgesDeleteError } = await supabaseClient
      .from('gamification_badges')
      .delete()
      .eq('user_id', userId);
    if (badgesDeleteError) throw badgesDeleteError;

    // 7. Re-insert initial gamification XP and level
    const { error: xpInsertError } = await supabaseClient
      .from('gamification_xp')
      .insert({ user_id: userId, xp: 0, level: 1 });
    if (xpInsertError) throw xpInsertError;

    // 8. Re-insert initial gamification streaks
    const { error: streaksInsertError } = await supabaseClient
      .from('gamification_streaks')
      .insert({ user_id: userId, current_streak: 0, longest_streak: 0, last_activity_date: null });
    if (streaksInsertError) throw streaksInsertError;

    return new Response(JSON.stringify({ message: 'Account reset successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error resetting account:", error.message);
    return new Response(JSON.stringify({ error: `Failed to reset account: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});