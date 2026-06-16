# Antenatal Care Management System

A production-oriented foundation for coordinating antenatal care records,
appointments, visits, supplements, scans, reminders, and follow-ups.

## Tech Stack

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS
- MongoDB and Mongoose
- Zod
- bcryptjs
- React Hook Form
- ESLint

## Current Progress

Foundation and authentication setup. The project currently provides:

- Responsive landing, login, dashboard, and patient portal layouts
- Reusable UI components and dashboard navigation
- Shared domain enums, types, permission helpers, and validation schemas
- Cached MongoDB connection utility
- Mongoose models and indexes for the planned data model
- Placeholder routes for each planned application area
- Credentials login with phone number or email
- JWT sessions and role-based route protection
- Role-aware dashboard navigation and patient portal routing
- Seeded test users for all three roles
- Admin health centre creation, editing, detail views, and worker counts
- Health worker account creation, search, filtering, and health centre assignment
- Health worker activation, suspension, and secure password reset
- Audit logging for health centre and health worker administration
- Patient registration with linked pregnant-woman user accounts
- Antenatal profile list, details, editing, and scoped health-worker access
- Pregnant woman portal profile summary
- Appointment scheduling, filtering, detail views, and status updates
- Missed appointment tracking through the appointment status filter
- Visit records created from attended appointments
- Patient details and portal pages now show appointments and visits

Supplements, scans, reminders, follow-ups, reporting, and dashboard real
statistics are intentionally not implemented yet.

## Planned Features

- Health centre and user administration
- Patient profile registration and care assignment
- Appointment, visit, supplement, scan, reminder, and follow-up workflows
- Patient self-service portal
- Operational reports and audit history

## Setup

### Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop, or a separately managed MongoDB instance

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy `.env.example` to `.env.local` and update secrets as appropriate:

```env
MONGODB_URI=mongodb://localhost:27017/antenatal-care-management
NEXTAUTH_SECRET=replace-with-secure-secret
NEXTAUTH_URL=http://localhost:3000
APP_NAME="Antenatal Care Management System"
```

Use a strong, unique `NEXTAUTH_SECRET` outside local development.

### Start MongoDB with Docker

```bash
docker compose up -d
```

The MongoDB container is exposed on port `27017` and stores data in the
`mongodb_data` Docker volume.

### Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed authentication users

With MongoDB running and `.env.local` configured:

```bash
npm run seed
```

The seed is idempotent and can be run more than once.

## Test Login Credentials

| Role | Phone | Email | Password |
| --- | --- | --- | --- |
| Admin | `670000001` | `admin@anc.local` | `Admin123!` |
| Health Worker | `670000002` | `worker@anc.local` | `Worker123!` |
| Pregnant Woman | `670000003` | `patient@anc.local` | `Patient123!` |

Role routing:

- Admin -> `/dashboard`
- Health Worker -> `/dashboard`
- Pregnant Woman -> `/portal`

Dashboard routes require an active admin or health worker session. Admin pages
are restricted to administrators, and the patient portal is restricted to
pregnant women.

## Admin Module

After seeding, sign in as the administrator and use:

- `/admin/health-centres` to create, view, and edit health centres
- `/admin/users` to search and filter users
- `/admin/users/new` to create health worker accounts
- User detail pages to edit assignments, activate or suspend workers, and reset passwords

Admin mutations are validated server-side and recorded in the audit log.
Health worker passwords are hashed and never returned to the browser.

## Patient Registration

Admins and health workers can use `/patients` to manage pregnant women
registered for antenatal care.

- `/patients` lists patient profiles with search and filters
- `/patients/new` creates a pregnant-woman user account and linked antenatal profile
- `/patients/[id]` shows account, personal, and antenatal profile details
- `/patients/[id]/edit` updates safe account and profile fields
- `/portal` shows the logged-in pregnant woman's profile summary when available

Patient registration creates audit logs and hashes the temporary password.
Health workers can only manage patients in their authorized scope. Pregnant
women cannot access `/patients` routes.

## Appointments And Visits

Admins and health workers can use `/appointments` to schedule and manage
appointments.

- `/appointments/new` schedules an appointment for an authorized patient
- `/appointments/[id]` shows appointment details and valid status actions
- `/appointments?status=MISSED` shows missed appointments
- `/visits/new?appointmentId=...` records a visit and marks the appointment attended
- `/visits` lists visit records for authorized patients

Creating a visit can optionally create the next antenatal appointment. Appointment
and visit actions create audit logs. Pregnant women cannot access appointment or
visit management pages, but their portal shows upcoming appointments, recent
visits, and missed appointment warnings.

## Quality Commands

```bash
npm run lint
npm run build
```

## Project Structure

```text
src/
  app/                 App Router pages and route groups
  components/          Reusable UI, layout, and dashboard components
  features/            Feature ownership boundaries for later workflows
  lib/                 Database, validation, permission, and utility modules
  models/              Mongoose domain models
  server/              Server actions, repositories, and services
  types/               Shared TypeScript types
```

## Limitations

- Does not diagnose pregnancy complications
- Does not replace health workers or professional medical judgment
- Does not manage delivery operations
- Does not manage billing
- Does not include SMS or email reminders in the MVP
