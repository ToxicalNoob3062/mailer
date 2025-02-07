import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request): Promise<Response> {
  try {
    const { ownerEmail }: { ownerEmail: string } = await req.json();

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email notification
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ownerEmail,
      subject: `Suspicious Activity Alert: @Netsense 🔍️`,
      html: `
        <p style="color: red; font-weight: bold;">There is a very high possibility of someone switched off the extension for some time. ⚠️</p>
        <p style="line-height: 1.5;">
          If you are using the extension in your office computer for tracking the records of a 3rd party service, then it is a very serious issue. Please investigate further.
        </p>
        <p style="line-height: 1.5;">
          p.s. This is an automated email from Netsense.
        </p>
      `,
    });

    return NextResponse.json({ message: "Notification sent" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
