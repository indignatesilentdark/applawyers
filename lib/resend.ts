import { Resend } from "resend";
import { env, hasResendEnv } from "@/lib/env";

let resendClient: Resend | null = null;

export function createResendClient() {
  if (!hasResendEnv) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  if (!resendClient) {
    resendClient = new Resend(env.resendApiKey);
  }

  return resendClient;
}

export function buildOtpEmailHtml(code: string) {
  return `
    <div style="margin:0;padding:32px 16px;background:#07111f;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
      <div style="max-width:560px;margin:0 auto;background:linear-gradient(180deg,#1a2639 0%,#0d1728 100%);border:1px solid #1d3557;border-radius:28px;padding:40px 32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;padding:10px 18px;border:1px solid #1d3557;border-radius:999px;background:#13233a;color:#9fb2cc;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;">
            Entorno privado
          </div>
        </div>
        <p style="margin:0 0 12px 0;color:#8fa6c4;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;">
          ApproveLawyers
        </p>
        <h1 style="margin:0 0 18px 0;font-size:38px;line-height:1.08;color:#ffffff;font-weight:700;">
          Tu código de acceso
        </h1>
        <p style="margin:0 0 18px 0;color:#b9c7da;font-size:17px;line-height:1.7;">
          Usa este código para acceder a tu entorno privado y continuar con la activación de tu dossier.
        </p>
        <div style="margin:28px 0;padding:22px 20px;border-radius:20px;background:#0b1626;border:1px solid #1d3557;text-align:center;">
          <div style="font-size:40px;line-height:1;font-weight:700;letter-spacing:0.22em;color:#18c487;">
            ${code}
          </div>
        </div>
        <p style="margin:0 0 16px 0;color:#9fb2cc;font-size:14px;line-height:1.7;">
          Este código expira en 10 minutos. Si no solicitaste este acceso, puedes ignorar este mensaje.
        </p>
        <p style="margin:0;color:#7187a4;font-size:13px;line-height:1.7;">
          Este correo no constituye asesoría legal ni promesa de resultado.
        </p>
      </div>
    </div>
  `.trim();
}
