import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sightingSchema } from "@/lib/validations/sighting";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Check auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse body
        const body = await request.json();
        const validation = sightingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { speciesId, latitude, longitude, description, imageUrl } = validation.data;

        // Insert into DB
        const { data, error } = await supabase
            .from("sightings")
            .insert({
                user_id: session.user.id,
                species_id: speciesId,
                latitude,
                longitude,
                description,
                image_url: imageUrl,
            })
            .select()
            .single();

        if (error) {
            console.error("Database Error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
