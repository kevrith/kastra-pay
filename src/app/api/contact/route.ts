import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // TODO: Implement email sending using your preferred service
    // Options: SendGrid, AWS SES, Resend, Nodemailer, etc.
    // For now, just log the contact form data
    console.log("Contact form submission:", { name, email, subject, message });

    // You can also save to database if needed
    // await prisma.contactSubmission.create({ data: { name, email, subject, message } });

    return NextResponse.json({ 
      success: true, 
      message: "Thank you! We'll get back to you soon." 
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
