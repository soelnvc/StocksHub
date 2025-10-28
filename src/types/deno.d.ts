// This file provides type declarations for Deno and HTTP imports,
// acting as a workaround if the client-side TypeScript compiler
// mistakenly tries to process Deno-specific Edge Function files.

// Declare the Deno global object
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
  // Add other Deno types here if more errors related to Deno appear
}

// Declare modules for HTTP imports used in Supabase Edge Functions
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): Promise<void>;
}

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  import { SupabaseClient, createClient as originalCreateClient } from '@supabase/supabase-js';
  export const createClient: typeof originalCreateClient;
  export { SupabaseClient };
}