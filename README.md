# approvedlawyer-case-platform

Plataforma privada mobile-first para acceso con código OTP por correo, onboarding y análisis preliminar de casos de fraude financiero digital.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Supabase Database y Storage
- Resend para OTP por email
- OpenAI Responses API para informes preliminares estructurados

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` a partir de `.env.example`.

3. Ejecuta el SQL base de [supabase/schema.sql](/Users/mauricioascanio/Documents/applawyers/supabase/schema.sql) en tu proyecto de Supabase.

4. Si ya habías desplegado la versión anterior con `auth.users`, ejecuta también [supabase/resend-otp-migration.sql](/Users/mauricioascanio/Documents/applawyers/supabase/resend-otp-migration.sql).

5. Inicia la app:

```bash
npm run dev
```

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_TEMPLATE_ID=
EMAIL_FROM="ApproveLawyers <no-reply@approvelawyers.com>"
AUTH_OTP_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

## Flujo incluido

- `/` acceso con código OTP enviado por Resend
- `/onboarding` creación de perfil
- `/dashboard` resumen privado y listado de casos
- `/cases/new` wizard multistep para crear casos y subir evidencia
- `/cases/[id]/report` dossier privado con informe preliminar
- `/api/auth/request-code` envío del código
- `/api/auth/verify-code` validación y creación de sesión

## Notas

- Si `RESEND_TEMPLATE_ID` no está configurado, la app usa un HTML interno como respaldo para el correo OTP.
- Si `OPENAI_API_KEY` no está configurada, la API devuelve un informe preliminar de respaldo para facilitar pruebas.
- El proyecto evita cualquier promesa de recuperación y mantiene lenguaje prudente e investigativo.
