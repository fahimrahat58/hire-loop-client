import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { db } from "./mongodb"

export const auth = betterAuth({
  database: mongodbAdapter(await db),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "seeker",
        input: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = user.role === "recruiter" ? "recruiter" : "seeker"

          return {
            data: {
              ...user,
              role,
            },
          }
        },
      },
    },
  },
})
