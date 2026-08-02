import { NextResponse, type NextRequest } from "next/server";
import {
  isLocale,
  localeCookieName,
  localizePathname,
  pathnameHasLocale,
  resolveLocale,
} from "./i18n/config";

const publicAssetPattern = /\.(?:avif|bmp|css|gif|ico|jpg|jpeg|js|json|map|png|svg|webp|wasm|glb)$/i;
const reservedPrefixes = ["/_next", "/_vinext", "/api", "/models", "/anatomy", "/basis", "/draco"];
const reservedPaths = ["/signin-with-chatgpt", "/signout-with-chatgpt", "/callback"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkip(pathname)) return NextResponse.next();

  const currentLocale = pathname.split("/").filter(Boolean)[0];
  if (isLocale(currentLocale)) {
    const response = NextResponse.next();
    response.cookies.set(localeCookieName, currentLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const locale = resolveLocale({
    cookieLocale: request.cookies.get(localeCookieName)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  });

  const url = request.nextUrl.clone();
  url.pathname = localizePathname(pathname, locale);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};

function shouldSkip(pathname: string): boolean {
  return (
    publicAssetPattern.test(pathname) ||
    reservedPaths.includes(pathname) ||
    reservedPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    (pathnameHasLocale(pathname) && reservedPaths.includes(pathname.replace(/^\/[^/]+/, "")))
  );
}
