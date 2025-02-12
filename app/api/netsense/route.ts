import { Resend } from "resend";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY!);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: Request): Promise<Response> {
  try {
    const { ownerEmail, html }: { ownerEmail: string; html: string } =
      await req.json();

    if (!ownerEmail) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers }
      );
    }

    // Send email notification
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ownerEmail,
      subject: `Suspicious Activity Alert: @Netsense 🔍️`,
      html,
    });

    return new NextResponse(JSON.stringify({ message: "Notification sent" }), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to send email", details: error.message }),
      { status: 500, headers }
    );
  }
}

// send cookie email to the client side
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const isSecure = req.url.startsWith("https");

  if (email) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Set-Cookie": `userEmail=${email}; ${
          isSecure ? "Secure;" : ""
        } HttpOnly; SameSite=Strict; Path=/`,
      },
    });
  }

  const userEmail = (await cookies()).get("userEmail");

  if (!userEmail) {
    return new NextResponse(JSON.stringify({ error: "User email not found" }), {
      status: 404,
      headers,
    });
  }

  return new NextResponse(userEmail.value, {
    status: 200,
    headers,
  });
}
