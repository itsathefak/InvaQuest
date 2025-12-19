"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleAuthButton } from "@/components/ui/google-auth-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // Form State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setSuccess("Account created! Please sign in.");
        }
    }, [searchParams]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Success!
            router.push("/map");
            router.refresh();

        } catch (err: any) {
            setError(err.message || "Invalid login credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md glass border-white/20">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                    Sign in to continue your quest.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <GoogleAuthButton />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-transparent px-2 text-muted-foreground bg-slate-900">Or continue with email</span>
                    </div>
                </div>

                <form onSubmit={handleSignIn} className="grid gap-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-md text-center">
                            {success}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                            <Link href="#" className="text-xs text-slate-400 hover:text-white">Forgot password?</Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            className="bg-white/5 border-white/10 text-white"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(6,147,136,0.5)] transition-all"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                <div className="text-sm text-slate-400 w-full text-center">
                    Don&apos;t have an account? <Link href="/auth/register" className="underline text-accent hover:text-accent/80">Sign up</Link>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
