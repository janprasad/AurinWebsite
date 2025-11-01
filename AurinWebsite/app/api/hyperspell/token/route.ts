import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Hyperspell from "hyperspell";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hyperspellAppToken = process.env.HYPERSPELL_API_KEY;
    
    if (!hyperspellAppToken) {
      return NextResponse.json(
        { error: "Hyperspell API key not configured. Please set HYPERSPELL_API_KEY in your environment variables." },
        { status: 500 }
      );
    }

    // Use the Hyperspell SDK to generate a user token
    const client = new Hyperspell({ apiKey: hyperspellAppToken });
    const tokenResponse = await client.auth.userToken({ user_id: userId });

    return NextResponse.json({ 
      token: tokenResponse.token,
      expires_at: tokenResponse.expires_at 
    });
  } catch (error) {
    console.error("Error generating Hyperspell token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

