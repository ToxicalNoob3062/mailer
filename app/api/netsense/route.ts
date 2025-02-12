import { Resend } from "resend";
import { NextResponse } from "next/server";

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

// send encryption key to the client
export async function GET(req: Request): Promise<Response> {
  //return withh 400 if there is no query parameter of  pass is not netsense
  if (!req.url.includes("pass=netsense")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 400,
      headers,
    });
  }
  const key = process.env.NETSENSE_ENCRYPTION_KEY;
  return new NextResponse(JSON.stringify({ key }), { status: 200, headers });
}
