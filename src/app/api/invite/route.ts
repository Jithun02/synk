import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, joinUrl, inviterName } = body;

    if (!email || !joinUrl) {
      return NextResponse.json({ error: 'Email and joinUrl are required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Synk Invites <onboarding@resend.dev>',
            to: email,
            subject: `⚡ You're invited to collaborate on Synk Engineering Canvas by ${inviterName || 'your team'}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 24px;">
                  <span style="background-color: #6366f1; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 14px;">SYNK CANVAS</span>
                </div>
                <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-bottom: 8px;">Workspace Invitation</h1>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                  Hi <strong>${name || email}</strong>,<br/>
                  ${inviterName || 'Your colleague'} invited you to join their live real-time architecture workspace on <strong>Synk</strong> as a <strong>${(role || 'editor').toUpperCase()}</strong>.
                </p>
                <div style="margin: 28px 0; text-align: center;">
                  <a href="${joinUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                    👉 Join Real-Time Workspace Now
                  </a>
                </div>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 10px; font-size: 12px; color: #64748b; word-break: break-all;">
                  <strong>Direct Join Link:</strong><br/>
                  <a href="${joinUrl}" style="color: #4f46e5;">${joinUrl}</a>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center;">
                  Synk — Enterprise Collaborative Engineering Intelligence Platform
                </p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          return NextResponse.json({ success: true, method: 'resend', email });
        }
      } catch (err) {
        console.warn('[Invite API] Resend dispatch warning:', err);
      }
    }

    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      `⚡ Invitation to collaborate on Synk Workspace`
    )}&body=${encodeURIComponent(
      `Hi ${name || email},\n\n` +
      `You've been invited by ${inviterName || 'your teammate'} to join the real-time architecture canvas on Synk as a ${(role || 'editor').toUpperCase()}.\n\n` +
      `Click the link below on your laptop to join immediately:\n` +
      `${joinUrl}\n\n` +
      `Best regards,\n` +
      `Synk Team`
    )}`;

    return NextResponse.json({
      success: true,
      method: 'mailto_fallback',
      email,
      mailtoUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process invite request' }, { status: 500 });
  }
}
