// app/api/contact/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Option 1: Using Resend (Recommended)
    // Uncomment after installing resend and adding RESEND_API_KEY to .env.local
    /*
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: 'SEMMA-AI <onboarding@resend.dev>', // Change to your verified domain
      to: 'support@semma-ai.com',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })
    */

    // Option 2: Using your own SMTP (Gmail, etc.)
    // For now, we'll just log it (replace with actual email service)
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // You can also save to a database here
    // await db.contacts.create({ name, email, phone, subject, message })

    return NextResponse.json(
      { success: true, message: 'Thank you! We will get back to you soon.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
