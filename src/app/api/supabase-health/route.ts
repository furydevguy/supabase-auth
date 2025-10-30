 import { NextResponse } from 'next/server';
 import { createClient } from '@supabase/supabase-js';
 
 export async function GET() {
 	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
 	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 
 	if (!url || !anon) {
 		return NextResponse.json(
 			{ ok: false, error: 'Missing env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY' },
 			{ status: 500 }
 		);
 	}
 
 	try {
 		const supabase = createClient(url, anon);
 		// A lightweight call that hits Supabase Auth and verifies connectivity
 		const { data, error } = await supabase.auth.getSession();
 		if (error) {
 			return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
 		}
 		return NextResponse.json({ ok: true, hasSession: Boolean(data.session) });
 	} catch (err) {
 		return NextResponse.json(
 			{ ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
 			{ status: 500 }
 		);
 	}
 }

