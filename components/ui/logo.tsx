import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("relative aspect-[2.5/1]", className)}>
            <Image
                src="/logo.png"
                alt="InvaQuest Logo"
                fill
                className="object-contain" // Use contain to preserve aspect ratio
                priority
            />
        </div>
    );
}
