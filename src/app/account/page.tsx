import { getSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import ChangePasswordForm from "./password-form";

export default async function AccountPage() {
    const supabase = getSupabaseServer();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) redirect("/auth/sign-in?redirect=/account");

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-semibold">Account</h1>
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="text-lg">{user.email}</p>
            </div>
            <div className="max-w-md">
                <ChangePasswordForm />
            </div>
        </div>
    );
}


