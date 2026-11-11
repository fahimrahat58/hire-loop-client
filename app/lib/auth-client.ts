import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { jwtClient } from "better-auth/client/plugins"
import type { auth } from "@/app/lib/auth"

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), jwtClient()],
})

export const { signIn, signUp, useSession } = authClient
