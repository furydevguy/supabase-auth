"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
    const supabase = getSupabaseClient();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/update-password` : undefined;
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });
            if (resetError) throw resetError;
            setMessage("If the email exists, we sent a reset link.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to send email.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Forgot password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                        </div>
                        {message && <p className="text-sm text-muted-foreground">{message}</p>}
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending..." : "Send reset link"}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


