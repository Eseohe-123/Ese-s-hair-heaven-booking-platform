import { formatKobo } from "@/lib/money";

export type TemplateId =
  | "deposit_due"
  | "secured"
  | "reminder_3d"
  | "reminder_1d"
  | "reminder_day"
  | "cancelled"
  | "rescheduled"
  | "review_ask";

export type AppointmentVars = {
  code: string;
  styleName: string;
  datetime: string;
  deposit: number; // kobo
  balance: number; // kobo
  total: number; // kobo
  location: string;
  customerName: string;
};

const PREP =
  "Prep: arrive with clean, dry hair unless told otherwise; bring your extensions if you have them; please come 10 minutes early.";

export function renderTemplate(
  template: string,
  v: AppointmentVars,
): { subject: string; text: string } {
  switch (template) {
    case "deposit_due":
      return {
        subject: `Secure your Hairven slot — ${v.code}`,
        text: `Hi${v.customerName ? ` ${v.customerName}` : ""}! Your Hairven appointment ${v.code} (${v.styleName}, ${v.datetime}) is agreed. Pay ${formatKobo(v.deposit)} deposit to secure it. Balance ${formatKobo(v.balance)} is paid in studio.`,
      };
    case "secured":
      return {
        subject: `Your Hairven slot is secured — ${v.code}`,
        text: `Lovely news — your Hairven appointment ${v.code} (${v.styleName}, ${v.datetime}) is secured! ${PREP} Outstanding balance: ${formatKobo(v.balance)}.`,
      };
    case "reminder_3d":
      return {
        subject: `3 days to your Hairven visit — ${v.code}`,
        text: `Reminder: your Hairven visit (${v.styleName}) is in 3 days — ${v.datetime} at ${v.location}. ${PREP} Balance due: ${formatKobo(v.balance)}.`,
      };
    case "reminder_1d":
      return {
        subject: `Tomorrow is hair day — ${v.code}`,
        text: `Tomorrow! ${v.styleName} — ${v.datetime} at ${v.location}. ${PREP} Balance due: ${formatKobo(v.balance)}. Reply here if anything changed.`,
      };
    case "reminder_day":
      return {
        subject: `Today is hair day — ${v.code}`,
        text: `Today's the day! ${v.styleName} — ${v.datetime} at ${v.location}. ${PREP} See you soon!`,
      };
    case "cancelled":
      return {
        subject: `Appointment ${v.code} cancelled`,
        text: `Your Hairven appointment ${v.code} (${v.styleName}, ${v.datetime}) has been cancelled. Any refund due goes to your original payment method. Reply here with questions.`,
      };
    case "rescheduled":
      return {
        subject: `New time for your Hairven visit — ${v.code}`,
        text: `Your Hairven visit moved to ${v.datetime} (${v.styleName}). Your deposit moved with it — no need to pay again. Reply here with questions.`,
      };
    case "review_ask":
      return {
        subject: `How was your Hairven visit?`,
        text: `Hope you're loving your hair! Please rate your visit (${v.code}) 1–5 stars — it takes 30 seconds and means the world. Thank you!`,
      };
    default:
      return { subject: `Hairven update — ${v.code}`, text: `Update on your Hairven appointment ${v.code}.` };
  }
}
