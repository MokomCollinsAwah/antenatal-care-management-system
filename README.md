# Antenatal Care Management System

A secure MVP for coordinating antenatal care at health-centre level. It supports
patient registration, appointments, visits, supplements, scans, follow-ups,
in-system reminders, dashboard statistics, reports, and audit logs.

## Core Features

- Credentials login with phone number or email
- JWT sessions with role-based route protection
- Admin management for health centres and health workers
- Patient registration with linked pregnant-woman accounts
- Scoped patient access for health workers
- Appointment scheduling and status management
- Visit records linked to attended appointments
- Supplement, scan, and follow-up records
- In-system reminders with read/dismiss workflows
- Pregnant woman portal for own care records
- Dashboard statistics and recent activity
- Reports for appointments, follow-ups, supplements, and scans
- Admin-only audit log viewer
- Automatic missed appointment checker
- Automatic due reminder checker
- Responsive dashboard with collapsible sidebar
- Mobile-friendly table layouts
- Show/hide password toggle on login

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- MongoDB and Mongoose
- Auth.js credentials authentication
- Zod validation
- React Hook Form
- bcryptjs password hashing
- ESLint

## Project Structure

```text
src/
  app/          App Router pages, layouts, error, and not-found states
  components/   Shared UI and layout components
  features/     Feature-specific actions, queries, and components
  lib/          Auth, DB, validation, permissions, constants, utilities
  models/       Mongoose models
  server/       Repositories and services
  types/        Shared TypeScript types
scripts/
  seed.ts       Idempotent demo data seed
```

## Environment Variables

Copy `.env.example` to `.env.local` and update values locally:

```env
MONGODB_URI=mongodb://localhost:27017/antenatal-care-management-system
AUTH_SECRET=replace-with-secure-secret
NEXTAUTH_SECRET=replace-with-secure-secret
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
APP_NAME="Antenatal Care Management System"
```

Never commit `.env.local` or real database credentials.

For MongoDB Atlas, put the full Atlas connection string only in `.env.local`.
Keep `.env.example` as placeholders only.

Generate a strong auth secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Use the same generated value for `AUTH_SECRET` and `NEXTAUTH_SECRET`.

## Production Deployment

For Vercel or any production host, do not use `localhost` values. Set production
environment variables in the hosting dashboard and redeploy:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database-name>
AUTH_SECRET=<strong-random-secret>
NEXTAUTH_SECRET=<same-strong-random-secret>
AUTH_URL=https://your-production-domain
NEXTAUTH_URL=https://your-production-domain
AUTH_TRUST_HOST=true
APP_NAME="Antenatal Care Management System"
```

For the current Vercel app, the URL values should use the deployed HTTPS domain,
for example:

```env
AUTH_URL=https://antenatal-care-management-system.vercel.app
NEXTAUTH_URL=https://antenatal-care-management-system.vercel.app
```

If production redirects to `localhost`, the production `AUTH_URL` or
`NEXTAUTH_URL` is still set to a local URL. Update the production environment
variables and redeploy.

## Local Setup

Install dependencies:

```bash
npm install
```

Start local MongoDB with Docker:

```bash
docker compose up -d
```

Seed demo data:

```bash
npm run seed
```

Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Login Credentials

| Role | Phone | Email | Password |
| --- | --- | --- | --- |
| Admin | `670000001` | `admin@anc.local` | `Admin123!` |
| Health Worker | `670000002` | `worker@anc.local` | `Worker123!` |
| Pregnant Woman 1 | `670000003` | `patient@anc.local` | `Patient123!` |
| Pregnant Woman 2 | `670000004` | `patient2@anc.local` | `Patient123!` |

Default routing:

- Admin -> `/dashboard`
- Health Worker -> `/dashboard`
- Pregnant Woman -> `/portal`

## Role Permissions

Admin:

- Manage health centres
- Manage health workers
- Register and manage patients
- Manage appointments, visits, supplements, scans, follow-ups, and reminders
- View dashboard, reports, and audit logs

Health Worker:

- Manage authorized patients only
- Manage appointments, visits, supplements, scans, follow-ups, and reminders for authorized patients
- View scoped dashboard and reports
- Cannot access admin-only pages

Pregnant Woman:

- Access `/portal` only
- View own profile, appointments, visits, supplements, scans, follow-ups, and reminders
- Mark own reminders as read or dismissed
- Cannot create or edit staff-managed medical records

## Main Workflows

Admin workflow:

1. Login as admin.
2. View dashboard.
3. Create health centres and health workers.
4. Register pregnant women.
5. Schedule and manage appointments.
6. View reports and audit logs.

Health worker workflow:

1. Login as health worker.
2. View scoped dashboard.
3. Register pregnant women in authorized scope.
4. Schedule appointments.
5. Record visits.
6. Add supplements, scans, and follow-ups.
7. Review reminders and scoped reports.

Pregnant woman workflow:

1. Login as pregnant woman.
2. View portal profile summary.
3. View upcoming appointments, recent visits, supplements, scans, follow-ups, and reminders.
4. Mark own reminders as read or dismissed.

## Demo Seed Data

`npm run seed` is idempotent. It creates or updates:

- One admin user
- One health centre
- One health worker
- Two pregnant women and patient profiles
- Upcoming, attended, and missed appointments
- A visit record
- An active supplement record
- A scan record with next scan date
- A follow-up linked to the missed appointment
- Pending and due reminders
- Demo audit logs

## Quality Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Run these before pushing production changes.

## Security Notes

- Never commit `.env.local` or real database credentials.
- `.env.example` must contain placeholders only.
- Rotate any database password that was ever pasted into chat, committed, or exposed in deployment logs.
- Passwords are hashed with bcryptjs.
- `passwordHash` is excluded from normal user queries and session data.
- Admin pages are server-side protected.
- Health worker data is scoped by authorized patient access.
- Pregnant woman portal data is scoped to the logged-in patient profile.
- Audit logs are admin-only and read-only.
- Auth.js errors are routed through the app login page instead of exposing the default server error page.

## MVP Status

This MVP is ready for demonstration with local MongoDB or MongoDB Atlas.

## Limitations

- No SMS reminders in this MVP.
- No email reminders in this MVP.
- No PDF export in this MVP.
- No billing.
- No laboratory management.
- No pharmacy stock management.
- No delivery room management.
- No diagnosis logic.
- The system supports health workers but does not replace professional medical judgment.
