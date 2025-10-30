"use client";

import { useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

type Mode = "sign-in" | "sign-up";

export interface EmailPasswordFormProps {
	mode: Mode;
	redirectTo?: string;
}

export function EmailPasswordForm({ mode, redirectTo = "/" }: EmailPasswordFormProps) {
	const supabase = getSupabaseClient();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	const isSignUp = mode === "sign-up";

	const isSubmitDisabled = useMemo(() => {
		if (!email || !password) return true;
		if (isSignUp) {
			if (!fullName || confirmPassword !== password || password.length < 8) return true;
		}
		return false;
	}, [email, password, confirmPassword, fullName, isSignUp]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setMessage(null);
		try {
			if (isSignUp) {
				if (password !== confirmPassword) {
					throw new Error("Passwords do not match");
				}
				if (password.length < 8) {
					throw new Error("Password must be at least 8 characters");
				}
				const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
					email: email,
					password: password,
					options: {
						data: { full_name: fullName },
						emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}${redirectTo}` : undefined,
					},
				});
				if (signUpError) {
					const messageLower = (signUpError.message || "").toLowerCase();
					if (messageLower.includes("already registered") || messageLower.includes("already exists")) {
						throw new Error("Email already exists. Please sign in or use a different email.");
					}
					throw signUpError;
				}
				// If email confirmation is required, session will be null.
				if (signUpData?.session) {
					setMessage("Account created. Redirecting...");
					window.location.href = redirectTo;
				} else {
					setMessage("Account created. 	Please check your email to verify your address before signing in.");
				}
			} else {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email: email,
					password: password,
				});
				if (signInError) throw signInError;
				setMessage("Signed in. Redirecting...");
				window.location.href = redirectTo;
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="w-full max-w-xl shadow-xl">
			<CardHeader>
				<CardTitle className="text-3xl tracking-tight">
					{isSignUp ? "Create your account" : "Welcome back"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="email" className="text-base">Email</Label>
						<Input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							className="h-12 text-base"
						/>
					</div>

					{isSignUp && (
						<div className="space-y-2">
							<Label htmlFor="full-name" className="text-base">Full name</Label>
							<Input
								id="full-name"
								type="text"
								required
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								placeholder="John Doe"
								className="h-12 text-base"
							/>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="password" className="text-base">Password</Label>
						<Input
							id="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder={isSignUp ? "At least 8 characters" : "Your password"}
							className="h-12 text-base"
						/>
					</div>

					{isSignUp && (
						<div className="space-y-2">
							<Label htmlFor="confirm-password" className="text-base">Confirm password</Label>
							<Input
								id="confirm-password"
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Re-enter your password"
								className="h-12 text-base"
							/>
						</div>
					)}

					{error && <p className="text-sm text-destructive">{error}</p>}
					{message && <p className="text-sm text-muted-foreground">{message}</p>}

					<Button type="submit" className="w-full h-12 text-base" disabled={loading}>
						{loading ? (isSignUp ? "Creating account..." : "Signing in...") : isSignUp ? "Create account" : "Sign in"}
					</Button>

					<div className="text-sm text-muted-foreground text-center">
						{isSignUp ? (
							<span>
								Already have an account? <Link href="/auth/sign-in" className="text-primary hover:underline">Sign in</Link>
							</span>
						) : (
						<div className="flex flex-col items-center gap-1">
							<span>
								Don’t have an account? <Link href="/auth/sign-up" className="text-primary hover:underline">Create one</Link>
							</span>
							<span>
								Forgot your password? <Link href="/auth/forgot-password" className="text-primary hover:underline">Reset it</Link>
							</span>
						</div>
						)}
					</div>

				</form>
			</CardContent>
		</Card>
	);
}

export default EmailPasswordForm;


