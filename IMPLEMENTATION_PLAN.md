# Hairven — Implementation Plan

Source: `Eses_Hair_Heaven_PRD_Consolidated.docx.md` (37 sections).
Goal: booking platform covering inspiration → request → free consultation → price + time agreement → 50% deposit → reminders → service → balance → review → loyalty. Solo-owner (Ese) operation, future team + product sales + multi-stylist.

## 0. Guiding decisions

### 0.1 MVP vs full PRD
MVP = High-priority items from PRD §36 only:
- Price agreement before deposit, payment classification, refund/cancellation records, reconciliation, audit trail, role-based financial permissions (single admin to start), payment/refund history, complaint process, business/customer data separation, banking/Tax ID/CAC fields + invoice/receipt structure.
Out of MVP: vendor/WHT automation, staff contracts, product inventory, investor reporting, gift cards, advanced accounts. Build hooks for them, do not build them.

### 0.2 Non-negotiable rules (from PRD, made config-driven)
- Deposit % (current 50), customer-cancel retain % (current 50% of deposit), reschedule fee (TBD), no-show fee (TBD), notice period (current 48h). Per §33.8: NEVER hard-code. Store in `business_policy` table with effective dates + audit.
- Deposit only after style + specs + final price + date/time agreed (§11, §33.6-33.7).
- Ese confirms or counters every requested time; no auto-confirm on customer-suggested slots (§10).
- Guest checkout allowed everywhere; account is benefit-only (§14).

### 0.3 Success metrics
- Request → agreed price → deposit conversion rate
- No-show / cancel / reschedule rates
- Deposit reconciliation match rate (target 100%)
- Reminder delivery rate, review rate, repeat booking rate
- Admin time per booking (should fall after Phase 7)

## 1. Architecture decisions

### 1.1 Decided stack (local-first, no Supabase, no Vercel)
- **Frontend + Backend: Next.js 14+ (TypeScript, App Router)** — one deployable, SEO for Gallery/Homepage, server actions/API routes for booking state machine.
- **Styling: Tailwind CSS + shadcn/ui** — fast feminine theme iteration, accessible primitives.
- **DB: Local PostgreSQL 16 + Prisma** — runs on your own device via Docker Compose (`postgres:16-alpine` + persistent volume) or native Postgres installer + pgAdmin. No Supabase. Connection e.g. `postgresql://postgres:postgres@localhost:5432/hair_heaven`. Prisma manages migrations + audit tables. Backups via `pg_dump` cron to R2.
- **Auth: Better Auth + guest session IDs** — email magic link + Google via Better Auth with Prisma adapter on local Postgres. Guest browsing/booking supported; guest-to-account merge by phone/email code. Roles: owner/staff/customer enforced server-side.
- **Files: Cloudflare R2 (S3-compatible)** — hairstyle photos, inspiration uploads, customer looks. Private bucket + presigned upload/download URLs, image variants via Cloudflare Images or on-upload thumbnails, moderation flag. No Cloudinary.
- **Payments: Paystack first, Flutterwave fallback** — cards, bank transfer, USSD; webhooks for verification; manual-transfer reference flow for bank transfers. All amounts in kobo (integer), never float.
- **Notifications: WhatsApp Cloud API (consultation + updates), Resend/SES (email receipts), Termii (SMS Nigeria)** — queue-based with provider fallback + delivery log.
- **Background jobs (local): BullMQ + local Redis via Docker** — reminders (T-3d, T-1d, T-day), expiry of pending holds, reconciliation retries. No Trigger.dev/Inngest cloud required.
- **Hosting (local for now): Node 20 on your device** — run with Docker Compose: `web (next start on :3000) + postgres:16 + redis:7`. No Vercel. Expose for testing via Cloudflare Tunnel when needed; move to a VPS later without code changes.
- **Analytics: PostHog Cloud (free tier) or self-host later** — funnel + Recently Viewed without heavy tracking.
- **Why this fits:** zero DB/hosting subscription, full money-model control locally, R2 cheap storage, Better Auth owns your user data, easy move to VPS later.

### 1.2 System shape
Monolith-first, modular boundaries:
`/catalog /requests /consultations /scheduling /pricing /payments /notifications /reviews /loyalty /admin /finance`
Each module owns its tables + server actions; `finance` is append-only (no updates, only reversing entries + audit log with old/new/user/time/reason).

### 1.3 Key domain machines
**Appointment status:** `draft → awaiting_consult → awaiting_price → awaiting_time → pending_deposit → secured → reminded → completed → reviewed` plus branches `cancelled_customer / cancelled_business / rescheduled / no_show / payment_failed`.
Deposit never moves `pending_deposit → secured` without verified payment + agreed policy snapshot.
**Reschedule:** links `original_appointment_id → new_appointment_id`, carries deposit forward, adds fee line item separately. No duplicate deposit.
**Refund:** `requested → approved/rejected → processing → completed`, stores paid, charge, retained, refundable, method, reference.

### 1.4 Integrations contract
- Paystack/Flutterwave webhooks: verify signature, idempotency key = `provider_reference`, reconcile `booking_id ↔ provider_txn ↔ settlement`.
- WhatsApp: deep link `wa.me/<business_number>?text=<request_id + encoded summary>` for MVP; upgrade to Cloud API templates for reminders. Every consultation message stores `request_id`.
- Email/SMS: templated (confirmation, receipt, reminder, policy change, cancellation). Consent flags per channel (NDPA Nigeria).

## 2. Design system (Phase 1 foundation)

PRD brand: warm, welcoming, girly/feminine, modern, premium-but-affordable, fun/youthful. Words: Classy • Cute • Unique. Palette/logo/tagline TBD — this phase unblocks them.

### 2.1 Proposed direction (to confirm with Ese + flyer inspiration)
- **Palette (warm, cute, distinctive):** Blush Rose `#F472A0` (primary), Deep Plum `#6B2148` (ink/contrast), Cream `#FFF7F0` (background), Gold `#D4A017` (premium accent), Cocoa `#3E2A2E` (text). All WCAG AA for text. Dark mode deferred.
- **Typography:** Fraunces or Playfair Display (display, classy) + Nunito Sans / Inter (body, friendly + legible). Big rounded headings, generous line-height.
- **Shape/language:** 16–20px radii, soft shadows, sticker-like badges (New, Promo, Bestseller), scalloped dividers for fun/youthful without cheapening.
- **Imagery:** real work first, no stock braids; before/after slider component; studio photos in Visit Us.

### 2.2 Tokens + components
Tokens: color, spacing, radius, shadow, font, motion (150–250ms). Components: Button (primary/secondary/ghost), Card (hairstyle), Badge, Price display (Starting from ₦X), Filter chips, Photo uploader (multi + annotate combo: colour/length/curls), Slot picker, Policy box (must tick before deposit), Receipt view, Review stars, Chat bubble (bot), Admin table + audit pill.
Storybook or Next.js `/design` route as living spec. Empty/loading/error states designed once.

### 2.3 UX principles enforced
Mobile-first (most traffic = phone + WhatsApp), 3-tap request, simple nav (max 6–7 items, not 14 — collapse rest into More/Account), guest-first, Ese-control visible (“Ese will confirm within X hours”).

### 2.4 Navigation (simplified from §29)
`Home | Explore | Tell Ese What I Want | Gallery | Customer Looks | Offers | Help` + `My Bookings` (guest lookup via phone/email code) + `Account` (optional). Visit Us as footer + section, not top-level clutter.

## 3. Data model (minimum, maps to §35)

- `user` (optional): id, name, phone, email, role (owner/staff/customer), loyalty_points, consents
- `guest_session`: id, phone/email, lookup_code
- `category`, `hairstyle` (name, starting_price_kobo, description, photos), `addon` (name, price_type), `extension_option`
- `request`: id, customer/guest ref, hairstyle_id?, custom_name, description, inspiration_photos[] with combo_tags, hair_details, special_requests, preferred_datetime, status
- `consultation`: id, request_id, channel (whatsapp_online/physical), whatsapp_thread_ref, notes, status
- `price_agreement`: id, request_id, base_price, customisations, extensions_cost, discount, final_price, customer_approval_at, policy_snapshot_id
- `appointment`: id, request_id, price_agreement_id, datetime, status, location_snapshot, original_appointment_id (for reschedules)
- `business_policy`: deposit_pct, cancel_retain_pct, reschedule_fee_kobo, noshow_fee_kobo, notice_hours, effective_from, audit
- `payment` (deposit/final/extension): appointment_id, type, amount_kobo, method, provider, provider_ref, status, settled_at
- `refund`: payment_id, reason, retained_kobo, refundable_kobo, approval_by, method, reference, status
- `cancellation`, `reschedule` (original→new, fee, deposit_carried)
- `discount`, `vendor_payment`, `audit_log` (entity, old, new, user, time, reason)
- `review` (rating 1–5, text?, photo?, permission_to_feature, moderation_status)
- `notification` (channel, template, status, provider_ref), `loyalty_ledger` (earn/reverse), `gallery_item`, `customer_look`

Money = integers (kobo). No delete on finance tables. Sequential receipt/invoice numbers.

## 4. Phased build

### Phase 0 — Foundations (0.5–1 wk, local-first)
Docker Desktop + Node 20 + Docker Compose (`web + postgres:16-alpine + redis:7`), env (`.env.local`, staging later), CI (lint/type/test), local run `docker compose up` → `http://localhost:3000`, healthcheck + Prisma migrate pipeline green. Create Cloudflare R2 bucket + API keys, Better Auth Google/email keys, Paystack/Flutterwave test keys, WhatsApp number, Termii sender, Resend domain. Seed script for local Postgres. Collect studio address/hours, CAC/Tax ID placeholders, bank account for settlement.
Exit: `docker compose up` runs web + local Postgres + Redis; Prisma migrate + seed + healthcheck green on your device.

### Phase 1 — Design system + public shell (1–2 wks)
Tokens, UI kit, Header/Footer/nav, Homepage (hero with Explore Hairstyles primary + Tell Ese What I Want secondary, featured styles, promos slot, selected reviews), Visit Us, Help skeleton, Gallery grid (static seed), SEO + performance budget (<200KB JS, LCP <2.5s on 4G).
Exit: Ese approves palette + homepage on mobile.

### Phase 2 — Catalogue + custom request + consultation link (1–2 wks)
Categories/search/filter (price, length, colour, type), hairstyle detail (photos, starting price, add-ons, Request This Style), custom request form (multi-photo upload + combo explainer + hair details + preferred datetime), request ID generation, WhatsApp deep-link with prefilled `EHH-XXXX + summary`, request status page (guest lookup). Ese inbox v0 (list + WhatsApp jump + notes field).
Exit: end-to-end test request → WhatsApp thread retains ID → Ese sees it in inbox.

### Phase 3 — Scheduling + price agreement + deposit (2–3 wks, core money)
Ese availability calendar (open/closed slots), customer preferred-time submit, Ese confirm/counter flow, price-agreement screen (base + add-ons + extensions + discount = final, policy snapshot + tick-box), deposit checkout (Paystack/Flutterwave + manual-transfer-with-reference option), webhook verification, receipt + confirmation email, appointment summary page (style, add-ons, extension, total, deposit, balance, datetime, location, policy, status). Reconciliation job v0 (booking ↔ provider ↔ settlement). Audit log on every money change.
Exit: can complete agreed-price → 50% deposit → secured → receipt with 100% reconciliation in staging.

### Phase 4 — Pre-visit + visit + post-visit (1–2 wks)
Reminder queue (T-3d, T-1d, T-day via WhatsApp/Email/SMS with balance + prep + Contact Ese), prep instructions, reschedule/cancel/no-show flows with fees + policy display, balance payment in-studio (record cash/transfer), completion → review prompt (stars + optional text/photo + feature consent), Customer Looks publishing with moderation flag.
Exit: full lifecycle test including cancel (50% of deposit math), reschedule (fee + carry-forward), no-show, business-cancel (100% refund).

### Phase 5 — Accounts, loyalty, content (1–2 wks)
Magic-link/Google auth, guest-to-account merge (by phone/email code), My Bookings, Favourites, Saved inspiration, Recently Viewed (local + server for logged-in), consultation/payment/history, loyalty earn/reverse on refund/cancel, Offers page (new-customer, member, birthday, seasonal, referral — occasional only), email/SMS/WhatsApp-Status broadcast hooks (manual first).
Exit: guest books → creates account → history/favourites/loyalty carry over; refund reverses points.

### Phase 6 — Support bot + escalation + notifications hardening (1 wk)
Branded bot (booking, prices, consultation, deposits, extensions, policies, prep FAQs from PRD), Talk to a Person routing (urgent/unresolved/explicit request → Ese/customer-care queue), support inbox in admin, delivery logs + retry + opt-out, quiet hours.
Exit: 80% FAQ containment in staging scripts; escalation always visible.

### Phase 7 — Ese admin + finance controls (1–2 wks)
Dashboard (requests, pending confirmations, payments to verify, today’s appointments), CRUD for styles/categories/add-ons/extensions, availability manager, promo manager, gallery/customer-looks moderation, review moderation, user lookup + history, refund approve/reject with roles (staff can submit, only Ese approves > threshold), discount/price-change approvals, finance reports (gross, fees, refunds, net, outstanding), receipt/invoice numbering, CSV exports, audit viewer.
Exit: Ese can run a full day on admin alone; every money mutation shows who/when/why.

### Phase 8 — Hardening + compliance + launch (1–2 wks)
Security (rate limits, upload scanning, RBAC tests), privacy (NDPA notice, consents, photo/review permissions, retention), consumer-protection wording (pricing, cancellation, remedies), complaint/remedy flow (§33.15) separate from cancels, payment-error handling (duplicates, success-but-booking-fail, no double-charge), dispute evidence pack (booking + agreement + terms + receipt + comms), backups + outage fallback (paper/WhatsApp booking + payment verification SOP), CAC/tax records fields, UAT with real customers, launch checklist + rollback.
Exit: launch readiness sign-off, support hours published.

### Phase 9 — Future-ready (post-launch, do not build now)
Product inventory (extensions for sale vs consumed in service), multi-stylist roles + commission/contract types + solicitation/IP clauses, investor/shareholder reports, gift cards/credits, advanced accounts. Keep schema extensible (`stylist_id` nullable on appointment, `inventory_item` separate).

## 5. Testing strategy per phase
Unit (policy math, refund math, state transitions), integration (webhooks, reminders), E2E (Playwright: guest request → consult → agree → deposit → secured → reminder → completed → review; plus cancel/reschedule/no-show), reconciliation test (duplicate webhook, overpay, failed booking), accessibility + mobile + 4G perf checks. Seed data: 8 styles, 3 categories, 2 promos, 1 test policy set.

## 6. Risks + mitigations
- WhatsApp context loss → request ID in every message + inbox linking.
- Manual bank transfers unverified → pending-verification state, reference required, Ese one-tap verify, no double-charge while verifying.
- Policy disputes → snapshot policy at agreement + show before payment + evidence pack.
- Triple-channel cost/spam → consent per channel, SMS only for urgent, templates versioned.
- Scope creep (§33–34 depth) → MVP gate in §0.1; everything else behind feature flags.

## 7. Open decisions needed from Ese (maps to §32/§37)
Categories/services, starting + add-on prices, reschedule/no-show fees, loyalty earn/burn, member promos, studio address/hours, payment provider(s), care hours, review moderation rules, logo/palette/tagline, Terms + Refund/Cancel Policy + Privacy Notice, stylist/contract + IP ownership, deposit accounting treatment, refund approval limits.

## 8. Build order summary
0 Foundations → 1 Design + shell → 2 Catalogue/Request/Consult → 3 Schedule/Price/Deposit (money) → 4 Reminders/Visit/Reviews → 5 Accounts/Loyalty/Content → 6 Bot/Notifications → 7 Admin/Finance → 8 Harden/Launch → 9 Future.
Do not start 3 until policy table + receipt numbering exist. Do not launch until 8 exit criteria met.
