import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  canRoleAccessPath,
  getUnauthorizedRedirect,
  isAuthRoute,
  isDashboardRoute,
  isPasswordChangeRoute,
  isPortalRoute,
} from "@/lib/route-access";

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const user = request.auth?.user;
  const passwordChangeRoute = isPasswordChangeRoute(pathname);
  const protectedRoute =
    isDashboardRoute(pathname) || isPortalRoute(pathname) || passwordChangeRoute;

  if (isAuthRoute(pathname) && user) {
    return NextResponse.redirect(
      new URL(
        user.mustChangePassword
          ? "/change-password"
          : getUnauthorizedRedirect(user.role),
        request.url,
      ),
    );
  }

  if (protectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (user?.mustChangePassword && !passwordChangeRoute) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  if (user && !user.mustChangePassword && passwordChangeRoute) {
    return NextResponse.redirect(
      new URL(getUnauthorizedRedirect(user.role), request.url),
    );
  }

  if (protectedRoute && user && !canRoleAccessPath(user.role, pathname)) {
    return NextResponse.redirect(
      new URL(getUnauthorizedRedirect(user.role), request.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
