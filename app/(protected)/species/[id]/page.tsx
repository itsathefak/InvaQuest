import { type Species } from "@/types";
import speciesData from "@/data/species.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportButton } from "@/components/species/ReportButton";
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle, Info } from "lucide-react";

// Generate static params for all species
export async function generateStaticParams() {
    return speciesData.map((species) => ({
        id: species.id,
    }));
}

export default function SpeciesDetailPage({ params }: { params: { id: string } }) {
    const species = (speciesData as Species[]).find((s) => s.id === params.id);

    if (!species) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <Link href="/species">
                <Button variant="ghost" className="mb-4">← Back to Library</Button>
            </Link>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    <div className="overflow-hidden rounded-xl border bg-slate-100 aspect-square flex items-center justify-center text-xl text-muted-foreground">
                        [Image: {species.imageKey}]
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Identification Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2">
                                {species.identificationTips.map((tip, idx) => (
                                    <li key={idx} className="text-sm text-foreground">{tip}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold text-primary">{species.commonName}</h1>
                            {species.isOntarioPriority && <Badge variant="destructive">ON Priority</Badge>}
                        </div>
                        <p className="text-xl text-muted-foreground italic">{species.scientificName}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-sm">Category: {species.category}</Badge>
                        <Badge variant="outline" className="text-sm">Threat: {species.threatLevel}</Badge>
                        <Badge variant="outline" className="text-sm">Primary: {species.primaryRegion}</Badge>
                    </div>

                    <div className="prose max-w-none">
                        <h3 className="text-lg font-semibold">Description</h3>
                        <p>{species.description}</p>

                        <h3 className="text-lg font-semibold mt-4">Recommended Action</h3>
                        <p className="text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                            {species.recommendedAction}
                        </p>

                        {species.lookAlikes.length > 0 && (
                            <>
                                <h3 className="text-lg font-semibold mt-4">Look-alikes</h3>
                                <ul className="list-disc pl-5">
                                    {species.lookAlikes.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <ReportButton speciesId={species.id} />
                        {/* <Link href={`/ report ? species = ${ species.id } `}> ... </Link> REMOVED */}
                    </div>
                </div>
            </div>
        </div>
    );
}
