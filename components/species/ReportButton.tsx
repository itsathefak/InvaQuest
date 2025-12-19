"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReportModal } from "@/components/game/ReportModal";

export function ReportButton({ speciesId }: { speciesId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                size="lg"
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-red-500/20"
                onClick={() => setIsOpen(true)}
            >
                Report Sighting
            </Button>

            <ReportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                defaultSpeciesId={speciesId}
            // In a real scenario we'd get User Location here via navigator.geolocation
            />
        </>
    );
}
