import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

type SendArgs = {
  from?: string;
  to: string;
  subject: string;
  html: string;
  tags?: Array<{ name: string; value: string }>;
};

export type SendResult =
  | { ok: true; id: string | null; dev: boolean }
  | { ok: false; error: string };

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const from = args.from ?? "SOZO Review <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[email/dev-fallback] would send:", {
      to: args.to,
      subject: args.subject,
      htmlBytes: args.html.length,
    });
    return { ok: true, id: null, dev: true };
  }

  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      tags: args.tags,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? null, dev: false };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
