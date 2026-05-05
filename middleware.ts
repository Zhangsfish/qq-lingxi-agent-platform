import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("需要登录 QQ 灵犀 Demo", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="QQ Lingxi Demo"',
    },
  });
}

export function middleware(request: NextRequest) {
  const username = process.env.DEMO_AUTH_USER;
  const password = process.env.DEMO_AUTH_PASSWORD;

  if (!username || !password) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return unauthorized();
  }

  const [scheme, encoded] = authHeader.split(" ");

  if (scheme !== "Basic" || !encoded) {
    return unauthorized();
  }

  try {
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return unauthorized();
    }

    const providedUsername = decoded.slice(0, separatorIndex);
    const providedPassword = decoded.slice(separatorIndex + 1);

    if (providedUsername === username && providedPassword === password) {
      return NextResponse.next();
    }

    return unauthorized();
  } catch {
    return unauthorized();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

