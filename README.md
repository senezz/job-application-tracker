# Job Application Tracker

A web app for tracking job applications — statuses, activity charts, and stats in one dashboard.

**Live demo:** https://job-application-tracker-smoky-three.vercel.app

## Features

- Email & Google OAuth authentication
- Dashboard with application stats and charts
- Add, edit, and filter job applications by status
- Responsive UI with dark theme

## Tech Stack

- React 19, TypeScript, Vite
- Supabase (auth + database)
- Tailwind CSS, shadcn/ui
- Recharts, React Query, React Hook Form, Zod

## Local Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repo

```bash
git clone https://github.com/senezz/job-application-tracker.git
cd job-application-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are in **Supabase → Project Settings → API**.

### 4. Run the dev server

```bash
npm run dev
```

App will be available at `http://localhost:5173`.

## Supabase Setup

### Database

Run the following SQL in **Supabase → SQL Editor**:

```sql
create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  company text not null,
  position text not null,
  status text not null default 'applied',
  applied_date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

alter table applications enable row level security;

create policy "Users can manage their own applications"
  on applications for all
  using (auth.uid() = user_id);
```

### Google OAuth (optional)

1. Create an OAuth 2.0 client in [Google Cloud Console](https://console.cloud.google.com)
2. Add the Supabase callback URL to **Authorized redirect URIs**:
   `https://your-project.supabase.co/auth/v1/callback`
3. Copy **Client ID** and **Client Secret** to **Supabase → Authentication → Providers → Google**

## Deployment (Vercel)

1. Import the GitHub repo in [Vercel](https://vercel.com)
2. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Deploy

After deploy, update in **Supabase → Authentication → URL Configuration**:
- **Site URL:** `https://your-vercel-domain.vercel.app`
- **Redirect URLs:** `https://your-vercel-domain.vercel.app/**`
