import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // Basic validation (simple & clean)
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const htmlBody = `
      <div style="font-family: sans-serif; font-size: 15px; line-height: 1.6;">
        <h2>New Neurocient Contact Submission</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>

        <h3 style="margin-top: 16px;">Message:</h3>
        <p style="white-space: pre-line;">${message}</p>

        <br />
        <hr />
        <p style="font-size: 12px; color: #555;">Sent via Neurocient.com</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: `Neurocient <${process.env.RESEND_FROM_EMAIL}>`,
      to: ["hello@neurocient.com"],
      replyTo: email,
      subject: "New Neurocient Contact Submission",
      html: htmlBody,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
