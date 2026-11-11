import { authClient } from "./auth-client"

/**
 * Returns the short-lived JWT issued by the Better Auth JWT plugin.
 *
 * The backend verifies this token with the public JWKS endpoint, so the
 * browser must send it as a Bearer token for protected endpoints such as
 * saved jobs. A fresh token is requested for every call because the token
 * has a short expiry.
 */
export async function getAuthToken() {
  const { data, error } = await authClient.token()

  if (error || !data?.token) {
    throw new Error(
      "Unable to get an authentication token. Please sign in again."
    )
  }

  return data.token
}

export function bearerHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  }
}
