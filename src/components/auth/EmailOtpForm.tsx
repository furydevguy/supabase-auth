"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { Label } from "@/components/ui/label";

type Mode = "sign-in" | "sign-up";

export interface EmailOtpFormProps {
	mode: Mode;
	redirectTo?: string;
}

export function EmailOtpForm({ mode, redirectTo = "/" }: EmailOtpFormProps) {
	const supabase = getSupabaseClient();
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [stage, setStage] = useState<"enter-email" | "enter-code">("enter-email");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleSendCode(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setMessage(null);
		try {
			const { error: signInError } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}${redirectTo}` : undefined,
					// Do not create users via OTP to avoid passwordless accounts when the app expects password login
					shouldCreateUser: false,
				},
			});
			if (signInError) throw signInError;
			setStage("enter-code");
			setMessage("We sent a 6-digit code to your email. Enter it below.");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to send code.");
		} finally {
			setLoading(false);
		}
	}

	async function handleVerifyCode(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setMessage(null);
		try {
			const { error: verifyError } = await supabase.auth.verifyOtp({
				email,
				token: code,
				type: "email",
			});
			if (verifyError) throw verifyError;
			setMessage("Success! Redirecting...");
			window.location.href = redirectTo;
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Invalid code. Try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="max-w-md mx-auto">
			<CardHeader>
				<CardTitle>{mode === "sign-in" ? "Sign in" : "Create account"}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={stage === "enter-email" ? handleSendCode : handleVerifyCode} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={stage === "enter-code" || loading}
							placeholder="you@example.com"
						/>
					</div>

					{stage === "enter-code" && (
						<div className="space-y-2">
							<Label htmlFor="code">6-digit code</Label>
							<OtpInput
								value={code}
								onChange={(val) => setCode(val)}
								length={6}
								disabled={loading}
								name="otp"
							/>
						</div>
					)}

					{message && (
						<p className="text-sm text-muted-foreground">{message}</p>
					)}
					{error && (
						<p className="text-sm text-destructive">{error}</p>
					)}

					<div className="flex items-center gap-2">
						<Button type="submit" disabled={loading}>
							{stage === "enter-email" ? (loading ? "Sending..." : "Send code") : loading ? "Verifying..." : "Verify"}
						</Button>
						{stage === "enter-code" && (
							<Button type="button" variant="secondary" disabled={loading} onClick={handleSendCode}>
								Resend code
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

export default EmailOtpForm;


