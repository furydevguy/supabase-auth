"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ChangePasswordForm() {
    const supabase = getSupabaseClient();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            if (password !== confirmPassword) throw new Error("Passwords do not match");
            if (password.length < 8) throw new Error("Password must be at least 8 characters");
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            setMessage("Password updated successfully.");
            setPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change password</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New password</Label>
                        <Input id="new-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">Confirm password</Label>
                        <Input id="confirm-new-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                    </div>
                    {message && <p className="text-sm text-muted-foreground">{message}</p>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" disabled={loading} className="w-full">{loading ? "Saving..." : "Save password"}</Button>
                </form>
            </CardContent>
        </Card>
    );
}


