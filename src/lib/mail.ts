import { env } from '../config/env';
import { HttpError } from './httpError';

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
}): Promise<void> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new HttpError(503, 'Email delivery is not configured');
  }

  const from = env.EMAIL_FROM.includes('<') ? env.EMAIL_FROM : `Rentelyo <${env.EMAIL_FROM}>`;
  const to = Array.isArray(input.to) ? input.to : [input.to];
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content.toString('base64'),
        contentType: file.contentType,
      })),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Resend email failed', response.status, detail.slice(0, 300));
    throw new HttpError(502, 'Unable to send email');
  }
}

export function mailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}
