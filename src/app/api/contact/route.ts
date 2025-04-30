import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  // Initialize Resend with API key at runtime, not build time
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    // Parse the request body
    const { name, email, subject, message } = await request.json();

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Send the email using Resend
    const { error } = await resend.emails.send({
      from: 'FlowForm Contact <onboarding@resend.dev>', // Update to your verified domain later
      to: ['phemonoex@gmail.com'], // Replace with your support email
      subject: subject || `New contact form submission from ${name}`,
      replyTo: email,
      text: `
Name: ${name}
Email: ${email}
${subject ? `Subject: ${subject}\n` : ''}
Message:
${message}
      `,
      // You can also use HTML for a more formatted email
      html: `
<h2>New contact form submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Your message has been sent successfully!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
