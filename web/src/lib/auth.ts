import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "customer", required: false },
      phone: { type: "string", required: false },
    },
  },
  // Phase 5: email + password works fully offline on local Postgres.
  // Magic link + Google land when RESEND / GOOGLE keys are added.
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: { clientId: googleClientId, clientSecret: googleClientSecret },
        },
      }
    : {}),
});

export type Session = typeof auth.$Infer.Session;
