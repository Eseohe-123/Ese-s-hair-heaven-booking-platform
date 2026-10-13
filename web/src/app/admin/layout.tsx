import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

// Owner/staff gate for everything under /admin.
// Customers (and logged-out visitors) are sent to login.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  const role = (user as { role?: string }).role;
  if (role !== "owner" && role !== "staff") {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-xs font-extrabold tracking-[3px] text-blush-600">PRIVATE</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-plum-700">
          Ese&apos;s side only
        </h1>
        <p className="mt-3 text-cocoa-500">
          This area is for the Hairven team. If you work here, ask Ese to upgrade your account.
        </p>
        <p className="mt-6">
          <a href="/" className="font-bold text-blush-600 underline">
            Back to the site
          </a>
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
