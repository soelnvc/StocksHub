import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error("Reset Account: Unauthorized - No Authorization header");
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
    console.error("Reset Account: Unauthorized - Invalid user session", userError?.message);
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  try {
    const userId = user.id;
    const defaultBalance = 100000.00;

    console.log(`Reset Account: Starting reset for user ${userId}`);

    // 1. Delete existing user balance (if any)
    console.log("Reset Account: Deleting user_balances...");
    const { error: balanceDeleteError } = await supabaseClient
      .from('user_balances')
      .delete()
      .eq('user_id', userId);
    if (balanceDeleteError) throw new Error(`Failed to delete user_balances: ${balanceDeleteError.message}`);
    console.log("Reset Account: user_balances deleted.");

    // 2. Re-insert initial balance for the user
    console.log("Reset Account: Inserting initial user_balances...");
    const { error: balanceInsertError } = await supabaseClient
      .from('user_balances')
      .insert({ user_id: userId, balance: defaultBalance });
    if (balanceInsertError) throw new Error(`Failed to insert user_balances: ${balanceInsertError.message}`);
    console.log("Reset Account: user_balances inserted.");

    // 3. Delete user stocks
    console.log("Reset Account: Deleting user_stocks...");
    const { error: stocksError } = await supabaseClient
      .from('user_stocks')
      .delete()
      .eq('user_id', userId);
    if (stocksError) throw new Error(`Failed to delete user_stocks: ${stocksError.message}`);
    console.log("Reset Account: user_stocks deleted.");

    // 4. Delete transactions
    console.log("Reset Account: Deleting transactions...");
    const { error: transactionsError } = await supabaseClient
      .from('transactions')
      .delete()
      .eq('user_id', userId);
    if (transactionsError) throw new Error(`Failed to delete transactions: ${transactionsError.message}`);
    console.log("Reset Account: transactions deleted.");

    // 5. Delete gamification XP
    console.log("Reset Account: Deleting gamification_xp...");
    const { error: xpDeleteError } = await supabaseClient
      .from('gamification_xp')
      .delete()
      .eq('user_id', userId);
    if (xpDeleteError) throw new Error(`Failed to delete gamification_xp: ${xpDeleteError.message}`);
    console.log("Reset Account: gamification_xp deleted.");

    // 6. Delete gamification streaks
    console.log("Reset Account: Deleting gamification_streaks...");
    const { error: streaksDeleteError } = await supabaseClient
      .from('gamification_streaks')
      .delete()
      .eq('user_id', userId);
    if (streaksDeleteError) throw new Error(`Failed to delete gamification_streaks: ${streaksDeleteError.message}`);
    console.log("Reset Account: gamification_streaks deleted.");

    // 7. Delete gamification badges
    console.log("Reset Account: Deleting gamification_badges...");
    const { error: badgesDeleteError } = await supabaseClient
      .from('gamification_badges')
      .delete()
      .eq('user_id', userId);
    if (badgesDeleteError) throw new Error(`Failed to delete gamification_badges: ${badgesDeleteError.message}`);
    console.log("Reset Account: gamification_badges deleted.");

    // 8. Re-insert initial gamification XP and level
    console.log("Reset Account: Inserting initial gamification_xp...");
    const { error: xpInsertError } = await supabaseClient
      .from('gamification_xp')
      .insert({ user_id: userId, xp: 0, level: 1 });
    if (xpInsertError) throw new Error(`Failed to insert gamification_xp: ${xpInsertError.message}`);
    console.log("Reset Account: gamification_xp inserted.");

    // 9. Re-insert initial gamification streaks
    console.log("Reset Account: Inserting initial gamification_streaks...");
    const { error: streaksInsertError } = await supabaseClient
      .from('gamification_streaks')
      .insert({ user_id: userId, current_streak: 0, longest_streak: 0, last_activity_date: null });
    if (streaksInsertError) throw new Error(`Failed to insert gamification_streaks: ${streaksInsertError.message}`);
    console.log("Reset Account: gamification_streaks inserted.");

    console.log(`Reset Account: Successfully reset account for user ${userId}`);
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