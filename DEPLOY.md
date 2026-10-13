# Hairven — Deploy Runbook (Hetzner VPS + own domain + Cloudflare Tunnel)

Target: Hairven live at `https://yourdomain` with your data (11 style photos,
catalogue, policies), independent of your laptop. No Vercel, no Supabase, no
subscriptions beyond VPS (~€5/mo) + domain (~₦5k–₦15k/yr).

## 0. Buy (you do this, ~30 min)

1. **VPS — Hetzner CX22** (hetzner.com/cloud): region Falkenstein or Nuremberg,
   image **Ubuntu 24.04**, add your SSH key. Note the server IPv4.
2. **Domain** (WhoGoHost / Namecheap / Cloudflare): e.g. `hairven.com.ng`.
   Nameservers → Cloudflare (free plan) so DNS + tunnel live in one place.
3. In Cloudflare dashboard → **Zero Trust → Networks → Tunnels → Create**:
   name `hairven`, port `http://web:3000`, hostname `yourdomain` (+ `www`).
   Copy the **tunnel token**.

## 1. Server prep (SSH in once)

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git unzip
sudo usermod -aG docker $USER  # log out + back in
git clone <your-github-repo-url> ~/hairven && cd ~/hairven
```

## 2. Secrets (on the server — never commit these)

```bash
cp web/.env.example web/.env   # then edit: real values below
nano web/.env
```

Set: `POSTGRES_PASSWORD` (long random), `DATABASE_URL` is injected by compose
(leave it), `BETTER_AUTH_SECRET` (long random), `BETTER_AUTH_URL=https://yourdomain`,
`BETTER_AUTH_TRUSTED_ORIGINS=https://yourdomain`,
`CRON_SECRET` (long random), `BANK_*` (copy from laptop .env),
`ADMIN_EMAIL`, `GEMINI_API_KEY`, `CLOUDFLARE_TUNNEL_TOKEN`,
plus Paystack/R2/Resend/WhatsApp/Termii keys as collected.
Copy `web/public/logo.png` from the laptop into place (it bakes into the image).

## 3. Data migration (laptop → server)

On the laptop: double-click `scripts\backup.bat` → folder `backups\hairven-<stamp>\`.
Copy it to the server (`scp -r` via PowerShell, or any file transfer), then:

```bash
chmod +x scripts/restore.sh
./scripts/restore.sh ~/hairven-<stamp>
```

This restores the database (catalogue, policies, accounts, bookings) and all
11+ style photos into the persistent volume.

## 4. Go live

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps        # all "running"
curl localhost:3000/api/health                        # expect {"db":"up"}
```

Open `https://yourdomain` (phone + laptop), sign in as owner, spot-check:
homepage photos → explore → request → inbox → appointment → `/api/health`.

## 5. After launch

- **Backups:** weekly `pg_dump` + volume copy (cron on VPS; R2 when keys land).
- **Updates:** `git pull` on VPS → `docker compose -f docker-compose.prod.yml up -d --build`.
- **Reminders:** point a 15-min scheduler (cron-job.org, free) at
  `POST https://yourdomain/api/cron/reminders` with `Authorization: Bearer <CRON_SECRET>`.
- **Paystack:** when keys arrive, set Website URL to `https://yourdomain` and
  Webhook URL to `https://yourdomain/api/payments/paystack` (stable forever —
  unlike the laptop tunnel links).
- **R2:** when keys arrive, uploads bypass the laptop entirely.
