/**
 * Sanitiza a URL de retorno para prevenir ataques de Open Redirect.
 * Permite apenas rotas relativas internas que comecem com "/" e que não sejam
 * schema-relative ("//") ou com esquemas absolutos (":").
 */
export function sanitizeRedirectUrl(returnTo: string | null | undefined): string {
  if (!returnTo) return "/profile";

  try {
    const decoded = decodeURIComponent(returnTo).trim();

    if (
      decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !decoded.startsWith("/\\") &&
      !decoded.includes(":")
    ) {
      return decoded;
    }
  } catch {
    return "/profile";
  }

  return "/profile";
}

