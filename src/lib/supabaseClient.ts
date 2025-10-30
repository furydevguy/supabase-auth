import { createClient } from '@supabase/supabase-js';

 // Singleton client for browser usage
 let browserSupabaseClient: ReturnType<typeof createClient> | null = null;

 export function getSupabaseClient() {
 	if (browserSupabaseClient) return browserSupabaseClient;
 
 	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 
 	if (!supabaseUrl || !supabaseAnonKey) {
 		throw new Error('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
 	}
 
 	browserSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
 		auth: {
 			autoRefreshToken: true,
 			persistSession: true,
 			detectSessionInUrl: true,
 		},
 	});
 	return browserSupabaseClient;
 }

