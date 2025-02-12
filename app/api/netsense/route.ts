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
  // if teq has a query parameter email then just set a http secure cookie non modfiable by client side and return status 200
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (email) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Set-Cookie": `userEmail=${email}; Secure; HttpOnly; SameSite=Strict; Path=/`,
      },
    });
  }
  //check the cookies to find a cookie name userEmail
  const userEmail = (await cookies()).get("userEmail");

  //if nothing found return 404
  if (!userEmail) {
    return new NextResponse(JSON.stringify({ error: "User email not found" }), {
      status: 404,
      headers,
    });
  }

  //return the email found in cookies
  return new NextResponse(userEmail.value, {
    status: 200,
    headers,
  });
}
