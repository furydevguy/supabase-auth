"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function Navbar() {
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null);

	useEffect(() => {
		const supabase = getSupabaseClient();

		let mounted = true;

		async function loadSession() {
			const { data } = await supabase.auth.getSession();
			if (!mounted) return;
			const session = data.session ?? null;
			setIsAuthenticated(Boolean(session));
			setUserEmail(session?.user?.email ?? null);
			setIsLoading(false);
		}

		loadSession();

		const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
			setIsAuthenticated(Boolean(session));
			setUserEmail(session?.user?.email ?? null);
		});

		return () => {
			mounted = false;
			subscription.subscription.unsubscribe();
		};
	}, []);

	async function handleSignOut() {
		const supabase = getSupabaseClient();
		await supabase.auth.signOut();
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-14 items-center justify-between px-4">
				<Link href="/" className="font-semibold">
					NFL Tracker
				</Link>
				<nav className="flex items-center gap-2">
					{isLoading ? (
						<span className="text-sm text-muted-foreground">Loading...</span>
					) : isAuthenticated ? (
						<>
							{userEmail && (
								<span className="text-sm text-muted-foreground hidden sm:inline">{userEmail}</span>
							)}
							<Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
						</>
					) : (
						<>
							<Link href="/auth/sign-in">
								<Button variant="ghost">Sign in</Button>
							</Link>
							<Link href="/auth/sign-up">
								<Button>Sign up</Button>
							</Link>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}

export default Navbar;


