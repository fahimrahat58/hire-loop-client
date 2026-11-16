/**
 * Shared HTTP error translation for the HireLoop API clients.
 *
 * 401 means the session/token is unusable and the user needs to sign in again.
 * 403 means the user is signed in but lacks permission, so it must never be
 * treated as a sign-in redirect.
 */
export function getHttpErrorMessage(
  status: number,
  fallback: string,
  serverMessage?: string
): string {
  const message = serverMessage?.trim()

  switch (status) {
    case 400:
      return (
        message ||
        "The request was invalid. Please check the details and try again."
      )
    case 401:
      return message || "Your session has expired. Please sign in again."
    case 403:
      return (
        message ||
        "You do not have permission to perform this action."
      )
    case 404:
      return message || "The requested resource could not be found."
    case 409:
      return message || "This action has already been completed."
    case 429:
      return message || "You have reached your plan or usage limit."
    default:
      if (status >= 500) {
        return message || "The server encountered an error. Please try again."
      }

      return message || fallback
  }
}
