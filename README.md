# Job Application Tracker

A web app for tracking job applications — statuses, activity charts, and stats in one dashboard.

**Live demo:** https://job-application-tracker-smoky-three.vercel.app

## Features

- Email authentication with password reset
- Dashboard with application stats and charts
- Add, edit, and delete job applications
- Filter applications by status
- Your Data page with personal info, links, and CV upload
- Responsive UI with dark/light theme toggle

## Tech Stack

- React 19, TypeScript, Vite
- Custom Express backend (auth, profile, CV storage via R2)
- Tailwind CSS, shadcn/ui
- Recharts, React Query, React Hook Form, Zod

## Local Setup

### Prerequisites

- Node.js 18+
- The [backend](https://github.com/senezz/job-application-tracker-backend) running locally

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
VITE_API_URL=http://localhost:4000
```

### 4. Run the dev server

```bash
npm run dev
```

App will be available at `http://localhost:5173`.
