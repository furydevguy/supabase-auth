import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return res;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(name: string) {
                return req.cookies.get(name)?.value;
            },
            set(name: string, value: string, options) {
                res.cookies.set({ name, value, ...options });
            },
            remove(name: string, options) {
                res.cookies.set({ name, value: "", ...options });
            },
        },
    });

    const { data } = await supabase.auth.getSession();
    const session = data.session;

    const url = req.nextUrl.clone();
    const pathname = url.pathname;

    // Only allow unauthenticated users to access the root page
    if (!session && pathname !== "/") {
        url.pathname = "/";
        url.searchParams.delete("redirect");
        return NextResponse.redirect(url);
    }

    return res;
}

export const config = {
    matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};


