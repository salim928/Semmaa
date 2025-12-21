// app/api/newsletter/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Option 1: Using Mailchimp
    // Uncomment after adding MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID to .env.local
    /*
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID
    const DATACENTER = MAILCHIMP_API_KEY?.split('-')[1]

    const response = await fetch(
      `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      if (error.title === 'Member Exists') {
        return NextResponse.json(
          { error: 'This email is already subscribed!' },
          { status: 400 }
        )
      }
      throw new Error(error.detail || 'Failed to subscribe')
    }
    */

    // Option 2: Save to database
    // await db.newsletter.create({ email, subscribedAt: new Date() })

    // For now, just log it
    console.log('Newsletter subscription:', {
      email,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to newsletter!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
