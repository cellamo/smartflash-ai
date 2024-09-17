import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { WelcomeEmail } from '@/components/email-templates/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, username } = await request.json();

    const data = await resend.emails.send({
      from: 'SmartFlash AI <noreply@account.smartflashai.com>',
      to: [to],
      subject: 'Welcome to SmartFlash AI!',
      react: WelcomeEmail({ username }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
