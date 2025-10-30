import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function getSupabaseServer() {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value, ...options });
                } catch {
                    // ignore during edge/runtime where headers may be locked
                }
            },
            remove(name: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value: "", ...options });
                } catch {
                    // ignore during edge/runtime where headers may be locked
                }
            },
        },
    });
}


