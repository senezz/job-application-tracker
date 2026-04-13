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

