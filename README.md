# approvedlawyer-case-platform

Plataforma privada mobile-first para acceso con codigo OTP por correo, onboarding y analisis preliminar de casos de fraude financiero digital.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Supabase Database y Storage
- Supabase Auth + Resend para OTP por email
- OpenAI Responses API para informes preliminares estructurados

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` a partir de `.env.example`.

3. Ejecuta el SQL base de [supabase/schema.sql](/Users/mauricioascanio/Documents/applawyers/supabase/schema.sql) en tu proyecto de Supabase.

4. Si ya habías desplegado la versión anterior con `auth.users`, ejecuta también [supabase/resend-otp-migration.sql](/Users/mauricioascanio/Documents/applawyers/supabase/resend-otp-migration.sql).

5. Si ya tenias la plataforma en produccion y quieres habilitar el flujo `/register` con leads precargados, ejecuta despues [supabase/register-otp-upgrade.sql](/Users/mauricioascanio/Documents/applawyers/supabase/register-otp-upgrade.sql).

6. En Supabase Auth, configura el template de email OTP para usar `{{ .Token }}` en vez de Magic Link y conecta tu SMTP de Resend.

7. Inicia la app:

```bash
npm run dev
```

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_TEMPLATE_ID=
EMAIL_FROM="ApproveLawyers <no-reply@approvelawyers.com>"
ADMIN_EMAILS=
APP_URL=https://app.approvelawyers.com
APP_BASE_URL=
FUNNEL_URL=https://funnels.approvelawyers.com
HUMAN_REVIEW_EMAIL=
AUTH_OTP_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

## Flujo incluido

- `/` acceso con codigo OTP legado enviado por Resend
- `/register` registro desde `funnels.approvelawyers.com` con lead precargado y OTP de Supabase Auth
- `/onboarding` creacion de perfil
- `/dashboard` resumen privado y listado de casos
- `/admin` panel interno con lista de usuarios y casos
- `/cases/new` wizard multistep para crear casos y subir evidencia
- `/cases/[id]/report` dossier privado con informe preliminar
- `/api/cases/[id]/pdf` descarga del dossier en PDF
- `/api/cases/[id]/review` solicitud de revisión humana
- `/api/auth/request-code` envio del codigo legado
- `/api/auth/verify-code` validacion y creacion de sesion legado
- `/api/leads/transfer` validacion server-side del lead transferido
- `/api/register/complete` cierre del registro OTP y asociacion del lead

## Notas

- Si `RESEND_TEMPLATE_ID` no esta configurado, la app usa un HTML interno como respaldo para el correo OTP legado.
- Si `ADMIN_EMAILS` esta configurada con correos separados por comas, esos usuarios veran y podran abrir el panel `/admin`.
- Si `OPENAI_API_KEY` no esta configurada, la API devuelve un informe preliminar de respaldo para facilitar pruebas.
- Si `APP_URL` o `APP_BASE_URL` estan configuradas, los correos de dossier incluyen enlace directo al caso.
- Si `HUMAN_REVIEW_EMAIL` esta configurada, la solicitud de revision humana notifica al equipo por correo y adjunta el PDF del dossier.
- El proyecto evita cualquier promesa de recuperacion y mantiene lenguaje prudente e investigativo.
