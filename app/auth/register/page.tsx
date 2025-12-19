"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleAuthButton } from "@/components/ui/google-auth-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import regions from "@/data/regions.json";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    // Form State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        province: "ON",
        city: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        province: formData.province,
                        city: formData.city
                    },
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (signUpError) throw signUpError;

            // Check if email confirmation is required
            if (data?.user && !data?.session) {
                // User created but session is null -> Email confirmation required
                setError("Account created! Please check your email to confirm your account before logging in.");
                // We don't redirect here so they see the message
                return;
            }

            // If we have a session, they are logged in (Email confirmation disabled or auto-confirmed)
            router.push("/auth/login?registered=true");

        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md glass border-white/20">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Join InvaQuest</CardTitle>
                    <CardDescription className="text-center">
                        Become a guardian of Canada's ecosystems.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <GoogleAuthButton />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-muted-foreground bg-slate-900">Or sign up with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSignUp} className="grid gap-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="firstName" className="text-sm font-medium text-slate-300">First name</label>
                                <Input
                                    id="firstName"
                                    placeholder="Max"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="lastName" className="text-sm font-medium text-slate-300">Last name</label>
                                <Input
                                    id="lastName"
                                    placeholder="Robinson"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-white/5 border-white/10 text-white"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-300">Country</label>
                                <Input value="Canada" disabled className="bg-white/5 border-white/10 text-slate-400" />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="province" className="text-sm font-medium text-slate-300">Province</label>
                                <select
                                    id="province"
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.province}
                                    onChange={handleChange}
                                >
                                    {regions.map(r => (
                                        <option key={r.id} value={r.id} className="bg-slate-900">{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="city" className="text-sm font-medium text-slate-300">City (Optional)</label>
                            <Input
                                id="city"
                                placeholder="e.g. Toronto"
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(6,147,136,0.5)] transition-all"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <div className="text-sm text-slate-400 w-full text-center">
                        Already have an account? <Link href="/auth/login" className="underline text-accent hover:text-accent/80">Sign in</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
