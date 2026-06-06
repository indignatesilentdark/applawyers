# approvedlawyer-case-platform

Plataforma privada mobile-first para onboarding, creación de perfiles y análisis preliminar de casos de fraude financiero digital.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Supabase Auth, Database y Storage
- OpenAI Responses API para informes preliminares estructurados

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` a partir de `.env.example`.

3. Ejecuta el SQL de [supabase/schema.sql](/Users/mauricioascanio/Documents/applawyers/supabase/schema.sql) en tu proyecto de Supabase.

4. Inicia la app:

```bash
npm run dev
```

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

## Flujo incluido

- `/` acceso con Magic Link
- `/auth/callback` procesamiento de sesión
- `/onboarding` creación de perfil
- `/dashboard` resumen privado y listado de casos
- `/cases/new` wizard multistep para crear casos y subir evidencia
- `/cases/[id]/report` dossier privado con informe preliminar
- `/api/analyze-case` generación y persistencia del informe

## Notas

- Si `OPENAI_API_KEY` no está configurada, la API devuelve un informe preliminar de respaldo para facilitar pruebas.
- El proyecto evita cualquier promesa de recuperación y mantiene lenguaje prudente e investigativo.
