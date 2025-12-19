import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If no user, mock it for development or redirect? 
    // Ideally redirect, but for "Demo" mode we might want to stay loose.
    // However, this is (protected), so we should probably redirect login.
    if (!user) {
        redirect("/auth/login");
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="hidden w-64 md:block">
                <Sidebar className="h-full" user={user} />
            </div>
            <main className="flex-1 overflow-y-auto w-full pb-20 md:pb-0">
                {children}
            </main>
            <MobileNav />
        </div>
    );
}
