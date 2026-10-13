import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "./notify/send";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  // Login must work from localhost AND the public tunnel link (which rotates).
  // Extra origins go in BETTER_AUTH_TRUSTED_ORIGINS, comma-separated.
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  ],
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "customer", required: false },
      phone: { type: "string", required: false },
    },
  },
  // Phase 5: email + password works fully offline on local Postgres.
  // Magic link + Google land when RESEND / GOOGLE keys are added.
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  databaseHooks: {
    user: {
      create: {
        // Tell Ese about every new member. Signup NEVER fails because of this.
        after: async (user) => {
          try {
            const admin = process.env.ADMIN_EMAIL;
            if (!admin) return;
            await sendEmail(
              admin,
              `New Hairven member: ${user.name}`,
              `A new client just created a Hairven account.\n\nName: ${user.name}\nEmail: ${user.email}\nTime: ${new Date().toLocaleString("en-NG")}\n\nSay hello on WhatsApp — first impressions count.`,
            );
          } catch (err) {
            console.error("admin signup mail failed (non-fatal)", err);
          }
        },
      },
    },
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: { clientId: googleClientId, clientSecret: googleClientSecret },
        },
      }
    : {}),
});

export type Session = typeof auth.$Infer.Session;
