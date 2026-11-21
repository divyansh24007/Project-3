import { createBrowserClient, createServerClient } from "@supabase/auth-helpers-nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

let browserClientInstance: any = null;

/**
 * Creates a browser-compatible Supabase client for Client Components.
 */
export function createClientComponentClient<Database = any>(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  if (!browserClientInstance) {
    try {
      browserClientInstance = createBrowserClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    } catch {
      browserClientInstance = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    }
  }

  return browserClientInstance as SupabaseClient<Database>;
}

/**
 * Creates a server-compatible Supabase client for Server Components or Route Handlers.
 */
export function createServerComponentClient<Database = any>(cookieStore?: any): SupabaseClient<Database> {
  if (cookieStore && typeof cookieStore.getAll === "function") {
    return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignored in Server Component renders
          }
        },
      },
    }) as any;
  }

  // Fallback for direct SSR or non-cookie contexts
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

// Default client singleton for quick usage - guaranteed non-null
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
