import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(
    new URL(
      "/?error=callback&message=Este%20acceso%20ahora%20usa%20codigo%20por%20correo.%20Solicita%20uno%20nuevo.",
      requestUrl.origin,
    ),
  );
}
