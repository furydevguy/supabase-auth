import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
    const supabase = getSupabaseServer();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/");
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <EmailPasswordForm mode="sign-up" />
        </div>
    );
}


