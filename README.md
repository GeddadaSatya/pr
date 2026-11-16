# Sovereign Wealth & Expense Command Suite (₹0 Free Tier)

An executive expense tracker and personal wealth command center built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL + Auth + Storage)**.

---

## ⚡ Features Built to Match Your UI

1. **Executive Financial Dashboard**
   - **Command Strip**: Personalized greeting, status indicators, and quick action launchpad (*Add Expense*, *Add Debt/Bill*, *Lend Money*).
   - **Key Wealth Indicators Carousel**: Real-time asset allocation bar (48% investments, 28% banks, 16% bullion, 8% cash), outstanding debts alert with countdown, loan yield ticker (+₹1,425/mo), and monthly budget tracker with progress gauge.
   - **Category Analytics**: Interactive SVG donut chart with central balance readout, category sector bars, and time filter with custom dual-month calendar popover.
   - **Recent Daily Expenses Notebook**: Filterable transaction table by text, category, and date, with one-click **CSV Ledger Export**.
   - **Immediate Action Center (Payables & Dues)**: Upcoming bills with urgency badges (*Due in 3d*, *Scheduled ACH*), and one-click "Record Payout" action.
   - **Active Loans & Interest Flow**: Money lent to others with APR rates, monthly interest accrual, and borrower initials avatar badges.
2. **Camera & Receipt Attachment**
   - Direct mobile camera capture (`capture="environment"`) or desktop drag-and-drop file upload.
   - Live image preview with delete/replace option.
   - Ready to stream into Supabase Free 1GB bucket.
3. **One-Click Privacy Mode**
   - Instant eye toggle in the sidebar masks all currency figures (`₹••••••`) to prevent shoulder surfing.
4. **Free Authentication (No SMS Costs)**
   - Supabase Email OTP / Magic Link flow (50,000 free monthly active users).

---

## 🚀 Getting Started

### 1. Run Locally
The project dependencies are already installed. Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Setting Up Supabase (100% Free Forever)

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire SQL script from [`supabase/schema.sql`](./supabase/schema.sql).
   - This automatically creates the `profiles`, `expenses`, `payables`, `loans` tables, storage bucket for receipts, and PostgreSQL Row Level Security (RLS) policies.
4. Go to **Project Settings → API** in Supabase:
   - Copy **Project URL** and **anon / public** key.
   - Paste them into your `.env.local` file:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```

---

## ☁️ Deploying to Vercel (₹0 Hosting)

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "Initial commit of Wealth Command expense tracker"
   git push origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Your app will be live on an HTTPS custom domain or `*.vercel.app` in under 60 seconds!
