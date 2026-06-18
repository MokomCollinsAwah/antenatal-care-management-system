# Antenatal Care Management System: Project Review and Defense Guide

## 1. Executive Summary

The Antenatal Care Management System is a web-based application for organizing antenatal care activities in health centres. It supports administrators, health workers, and pregnant women with role-specific workflows for patient registration, appointments, antenatal visits, supplements, scans, follow-ups, reminders, dashboards, reports, and audit logs.

The system was built as a secure MVP rather than a full hospital information system. Its focus is care coordination: registering pregnant women, assigning them to the correct health centre and health worker, tracking clinical support activities, and giving each user access only to the parts of the system they are allowed to use.

The project uses:

- Next.js 16 App Router for routing, server rendering, server actions, layouts, and pages.
- TypeScript for safer development and clearer domain contracts.
- MongoDB with Mongoose for document storage and schema modeling.
- Auth.js / NextAuth credentials authentication for phone/email and password login.
- Zod and React Hook Form for validation and form handling.
- bcryptjs for password hashing.
- Tailwind CSS for responsive UI styling.

## 2. Problem Statement

In many antenatal care environments, especially small health centres, patient records, appointment tracking, supplement tracking, and follow-up reminders may be handled manually or across disconnected tools. This creates problems such as:

- Missed antenatal appointments.
- Poor continuity of care when records are not centralized.
- Difficulty knowing which health worker is responsible for which pregnant woman.
- Weak reporting on appointments, visits, reminders, scans, and supplements.
- Limited accountability for administrative and clinical record changes.

This system addresses those problems by providing a structured digital workspace for antenatal care management.

## 3. Project Scope

The system includes:

- Public landing page.
- Secure login.
- Forced password change after account creation or reset.
- Admin dashboard.
- Health worker dashboard.
- Pregnant woman portal.
- Health centre management.
- Health worker management.
- Patient registration and profile management.
- Appointment scheduling and status updates.
- Visit record creation.
- Supplement records and supplement reminders.
- Scan records and scan reminders.
- Follow-up records.
- Reminder status tracking.
- Reports.
- Audit logs.

The system intentionally excludes:

- SMS/email delivery integration.
- Online payment or billing.
- Laboratory and pharmacy inventory modules.
- Delivery management.
- Diagnosis automation.
- PDF export.
- Real-time chat.

These exclusions keep the project focused on antenatal care coordination and reduce clinical risk.

## 4. User Roles

### Admin

The admin manages the system-level setup and oversight:

- Manage health centres.
- Manage health workers.
- Register and manage pregnant women.
- View and manage appointments, visits, supplements, scans, follow-ups, reminders, reports, and audit logs.
- Reset health worker and patient passwords.
- Suspend or activate health worker accounts.

Admin access is required for routes under `/admin`.

### Health Worker

The health worker manages antenatal care records for assigned patients or patients within the worker's health centre context:

- Register pregnant women.
- Assign patients to the correct health centre and health worker.
- Schedule appointments.
- Record visits.
- Record supplements.
- Record scans.
- Record follow-ups.
- View reminders and reports relevant to accessible patients.
- Reset patient passwords where the patient is accessible.

The system enforces health worker scoping in server-side services and repository queries, not only in the UI.

### Pregnant Woman

The pregnant woman uses the portal:

- View her own antenatal profile.
- View appointments, visits, supplements, scans, follow-ups, and reminders.
- Mark reminders as read or dismissed.
- Change password when required.

Pregnant women are redirected to `/portal` instead of the staff dashboard.

## 5. Technology Stack and Why Each Tool Was Used

### Next.js 16 App Router

Next.js was used because it combines routing, server rendering, API/auth integration, layouts, and server actions in one framework. The App Router structure fits this project well because different areas of the application have different layouts:

- Public pages.
- Auth pages.
- Dashboard pages.
- Patient portal.

Server components are useful for loading protected data directly on the server before rendering pages. Client components are used only where browser interactivity is needed, such as forms, dropdowns, password visibility toggles, and action menus.

### TypeScript

TypeScript was used to reduce runtime mistakes and make domain data structures explicit. Shared types in `src/types/index.ts` describe records such as users, patients, appointments, visits, supplements, scans, follow-ups, reminders, and reports.

### MongoDB and Mongoose

MongoDB was chosen because antenatal records are document-oriented and evolve naturally over time. Mongoose adds schemas, validation, indexes, model relationships through ObjectIds, and query helpers.

The data is not completely unstructured: models define required fields, enum values, references, and indexes. This provides flexibility while still enforcing important rules.

### Auth.js / NextAuth

Auth.js credentials authentication was used because users sign in with phone/email and password, not with external OAuth providers. It integrates well with Next.js and supports JWT sessions.

### bcryptjs

Passwords are never stored as plain text. bcryptjs hashes passwords using a salt. Even if the database is exposed, the original password is not directly visible.

### Zod

Zod validates form input on the server and defines clear rules such as:

- Phone numbers must be exactly 9 digits.
- Required fields must be present.
- Blood group must be one of the predefined values.
- Expected delivery date must be after last menstrual period.
- New password must not be the default password.

### React Hook Form

React Hook Form manages form state efficiently on the client. It works with Zod through resolvers, allowing the same validation rules to be reflected in the form experience.

### Tailwind CSS

Tailwind CSS was used for fast, consistent UI development. The app uses reusable UI components such as `Input`, `Select`, `Textarea`, `Card`, `Badge`, `PageHeader`, `Pagination`, `EmptyState`, and `FeedbackAlert`.

## 6. High-Level Architecture

The codebase follows a layered architecture:

```text
App routes and pages
        |
Feature components, queries, and server actions
        |
Server services
        |
Repositories
        |
Mongoose models
        |
MongoDB
```

This separation makes the application easier to reason about:

- Pages handle route-level rendering.
- Components handle UI.
- Actions handle form submissions.
- Services enforce business rules.
- Repositories perform database queries.
- Models define database structure.

## 7. Folder Structure

```text
src/
  app/                  Next.js App Router pages, layouts, route groups
  components/           Shared UI, auth, and layout components
  features/             Feature-specific UI, queries, and server actions
  lib/                  Shared utilities, constants, auth helpers, validation
  models/               Mongoose schemas and models
  server/
    repositories/       Database access functions
    services/           Business logic and domain rules
  types/                Shared TypeScript types
scripts/
  seed.ts               Demo data seeding script
docs/
  PROJECT_REVIEW_AND_DEFENSE_GUIDE.md
```

The important design decision is that domain behavior is not embedded directly inside UI components. For example, assigning a patient to a health worker is validated in `patientService.ts`, not only by filtering a dropdown in the form.

## 8. Routing Structure

The application uses App Router route groups:

- `src/app/page.tsx`: public landing page.
- `src/app/(auth)/login/page.tsx`: login page.
- `src/app/(auth)/change-password/page.tsx`: password change page.
- `src/app/(dashboard)/layout.tsx`: authenticated staff layout.
- `src/app/(dashboard)/dashboard/page.tsx`: dashboard overview.
- `src/app/(dashboard)/patients`: patient module.
- `src/app/(dashboard)/appointments`: appointment module.
- `src/app/(dashboard)/visits`: visit module.
- `src/app/(dashboard)/supplements`: supplement module.
- `src/app/(dashboard)/scans`: scan module.
- `src/app/(dashboard)/follow-ups`: follow-up module.
- `src/app/(dashboard)/reminders`: reminder module.
- `src/app/(dashboard)/reports`: reporting module.
- `src/app/(dashboard)/admin`: admin-only modules.
- `src/app/portal/page.tsx`: pregnant woman portal.
- `src/app/api/auth/[...nextauth]/route.ts`: Auth.js route handler.

The dashboard layout is marked dynamic because it depends on the current authenticated user.

## 9. Authentication Workflow

Authentication is configured in `src/auth.ts`.

Login flow:

1. User submits phone/email and password.
2. `loginSchema` validates the input.
3. The system searches the `User` collection by phone or email.
4. The stored `passwordHash` is explicitly selected.
5. bcrypt compares the submitted password with the stored hash.
6. Suspended users are rejected.
7. Auth.js creates a JWT session with user id, name, phone, role, status, health centre id, and `mustChangePassword`.
8. A login audit log is recorded.

The application supports login by phone or email, but email is optional because not all users may have email addresses.

## 10. Authorization and Route Protection

Route access is enforced in `src/proxy.ts` and `src/lib/route-access.ts`.

The proxy checks:

- Whether the route is protected.
- Whether the user is authenticated.
- Whether the user must change password.
- Whether the user's role can access the requested path.

Role routing rules:

- Pregnant women can access `/portal`.
- Admins and health workers can access dashboard routes.
- Only admins can access `/admin/users`, `/admin/health-centres`, and `/admin/audit-logs`.
- Users with `mustChangePassword` are forced to `/change-password`.

This means authorization is enforced before protected pages are rendered.

## 11. Password Policy

The system uses a default temporary password:

```text
12345678
```

This password is used when:

- A new health worker account is created.
- A new pregnant woman account is created.
- A health worker password is reset.
- A patient password is reset.

After using the default temporary password, the user must change it on first login. The new password cannot be the default password.

This is implemented using:

- `DEFAULT_TEMPORARY_PASSWORD` in `src/lib/constants.ts`.
- `mustChangePassword` field on the `User` model.
- Password change validation in `changePasswordSchema`.
- Forced redirect logic in `src/proxy.ts`.
- Password hashing in `src/lib/password.ts`.

Important review note: the current runtime logic uses `12345678`, but `scripts/seed.ts` still seeds older demo passwords (`Admin123!`, `Worker123!`, `Patient123!`). The README also contains those older demo credentials. This should be aligned before final submission if the seed data is part of the demonstration.

## 12. Database Models

### User

Represents all login accounts:

- Admins.
- Health workers.
- Pregnant women.

Important fields:

- `fullName`
- `phone`
- `email`
- `passwordHash`
- `role`
- `status`
- `healthCentreId`
- `mustChangePassword`
- `createdById`

The password hash is marked `select: false`, so it is not returned unless explicitly requested for authentication or password change.

### HealthCentre

Represents a health facility:

- `name`
- `location`
- `phone`

Health workers and pregnant women are linked to health centres.

### PatientProfile

Stores antenatal profile data for a pregnant woman:

- Linked `userId`
- `age`
- `address`
- emergency contact details
- `healthCentreId`
- `assignedHealthWorkerId`
- last menstrual period
- expected delivery date
- gravidity
- parity
- blood group
- risk note

This split between `User` and `PatientProfile` is important. Login/account data stays in `User`, while antenatal medical/profile data stays in `PatientProfile`.

### Appointment

Represents scheduled antenatal events:

- `patientId`
- appointment type
- scheduled date/time
- status
- reason
- notes
- creator

Statuses include scheduled, attended, missed, and cancelled.

### VisitRecord

Represents a completed antenatal visit:

- appointment id
- patient id
- visit date
- weight
- blood pressure
- complaint
- advice
- notes
- next appointment date
- recorded by

### SupplementRecord

Represents supplement instructions or treatment support:

- patient id
- supplement name
- dosage
- frequency
- start and end dates
- instructions
- status
- recorded by

Creating a supplement can create a supplement reminder.

### ScanRecord

Represents scan information:

- patient id
- scan date
- scan type
- health centre
- result note
- next scan date
- recorded by

If a next scan date exists, the system can create a scan reminder.

### FollowUpRecord

Represents follow-up activity:

- patient id
- optional appointment id
- follow-up date
- method
- outcome
- notes
- followed by

Follow-up methods include call, SMS, WhatsApp, physical visit, and other.

### Reminder

Represents reminder items:

- patient id
- optional appointment, supplement, or scan id
- title
- message
- reminder type
- due date/time
- status

Reminder statuses include pending, due, read, and dismissed.

### AuditLog

Records important events:

- actor
- action
- entity type
- entity id
- description
- timestamp

Audit logs support accountability and are useful during project defense because they show the system tracks sensitive operations.

## 13. Main Workflows

### Admin Setup Workflow

1. Admin logs in.
2. Admin creates a health centre.
3. Admin creates health worker accounts and assigns each worker to a health centre.
4. Admin can view audit logs and reports.

### Health Worker Account Workflow

1. Admin creates a health worker account.
2. The account receives the default temporary password.
3. `mustChangePassword` is set to true.
4. The health worker logs in.
5. The system redirects the worker to `/change-password`.
6. After changing password, the worker signs in again.
7. The worker can access dashboard workflows.

### Patient Registration Workflow

1. Admin or health worker opens the patient registration form.
2. Required fields are marked with red asterisks.
3. Phone must be exactly 9 digits.
4. Blood group is selected from predefined values.
5. Health centre is selected.
6. Assigned health worker options are filtered by the selected health centre.
7. Server-side validation checks that the assigned health worker belongs to the selected health centre.
8. A `User` account is created with role `PREGNANT_WOMAN`.
9. A `PatientProfile` is created and linked to that user.
10. The account starts with the default temporary password and must change password on first login.
11. An audit log is created.

The server-side assignment validation is important because UI filtering alone is not secure.

### Appointment Workflow

1. Staff selects an accessible patient.
2. Staff chooses appointment type and date/time.
3. The system creates the appointment with status `SCHEDULED`.
4. Staff can later mark the appointment as attended, missed, or cancelled.
5. Visit creation can mark an appointment as attended.
6. The maintenance checker can automatically mark overdue scheduled appointments as missed.

### Visit Workflow

1. Staff opens a scheduled appointment.
2. Staff records visit details such as date, weight, blood pressure, complaint, advice, and notes.
3. The visit is linked to the appointment and patient.
4. The appointment becomes attended.

### Supplement Workflow

1. Staff creates a supplement record for an accessible patient.
2. Supplement details include name, dosage, frequency, start date, and status.
3. The system creates a supplement reminder based on the start date.

### Scan Workflow

1. Staff records scan details for an accessible patient.
2. If a next scan date is provided, a scan reminder is created.

### Follow-Up Workflow

1. Staff creates follow-up records after missed appointments or routine checks.
2. If connected to an appointment, the system checks that the appointment belongs to the selected patient.

### Reminder Workflow

1. Reminders start as pending.
2. Maintenance logic can change pending reminders to due when the due time arrives.
3. Staff can update reminder status.
4. Pregnant women can mark their own reminders as read or dismissed in the portal.

### Patient Portal Workflow

1. Pregnant woman logs in.
2. If password change is required, she is redirected to `/change-password`.
3. After changing password and signing in again, she accesses `/portal`.
4. She sees only her own records.
5. She can update reminder status for her own reminders.

## 14. Validation Rules

Important validation rules are centralized in `src/lib/validations.ts`.

Examples:

- Phone numbers must match exactly 9 digits.
- Email is optional but must be valid if provided.
- Health centre name and location are required.
- Health worker full name, phone, and health centre are required.
- Patient full name, phone, age, address, health centre, assigned worker, last menstrual period, and expected delivery date are required.
- Expected delivery date must be after last menstrual period.
- Blood group must be one of `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`.
- Date range filters require the end date to be after or equal to the start date.
- Password confirmation must match.
- New password cannot be `12345678`.

Reusable `Input`, `Select`, and `Textarea` components render red asterisks for required fields, giving a consistent form experience.

## 15. Business Rules

Key business rules include:

- A health worker belongs to a health centre.
- Patient assignment must use a health worker from the same health centre.
- Pregnant woman accounts are separate from their patient profile records.
- Health workers cannot use admin-only pages.
- Pregnant women cannot use dashboard pages.
- Suspended users cannot log in.
- Password reset does not reveal or reuse a previous password; it sets the temporary password and forces password change.
- Blood group is a controlled dropdown, not free text.
- Phone numbers use the local 9-digit format required by the project.
- Sensitive actions are logged in the audit log.

## 16. Server Actions and Feature Modules

The `features/` folder groups each module's UI, queries, and server actions.

Examples:

- `features/admin/users`: health worker forms, tables, actions.
- `features/admin/health-centres`: health centre management.
- `features/patients`: patient forms, filters, details, reset password.
- `features/appointments`: appointment forms and actions.
- `features/visits`: visit recording.
- `features/supplements`: supplement records.
- `features/scans`: scan records.
- `features/followups`: follow-up records.
- `features/reminders`: reminder status updates.
- `features/reports`: report views.
- `features/dashboard`: dashboard summary widgets.

Server actions are used for form submissions because they keep mutation logic close to the feature while still running securely on the server.

## 17. Service Layer

The service layer contains business logic.

Examples:

- `patientService.ts` validates patient assignment, handles duplicate phone/email checks, creates patient accounts, updates profiles, and resets patient passwords.
- `userService.ts` creates and updates health worker accounts, checks health centre existence, resets passwords, and records status changes.
- `appointmentService.ts` scopes appointment access, creates appointments, and changes appointment status.
- `clinicalSupportService.ts` manages supplements, scans, follow-ups, reminders, and reminder transitions.
- `dashboardService.ts` composes dashboard statistics from multiple modules.
- `reportService.ts` builds report summaries.
- `systemMaintenanceService.ts` marks overdue appointments as missed and changes due reminders from pending to due.

This layer is important because it prevents the UI from becoming the only place where rules are enforced.

## 18. Repository Layer

Repositories perform database operations and aggregations.

The repository layer:

- Connects to MongoDB.
- Builds Mongoose queries.
- Performs aggregation lookups between collections.
- Applies role and health centre filters.
- Excludes password hashes from query projections.
- Sorts and filters list results.

This keeps database-specific details away from page and component code.

## 19. Dashboard and Reporting

The dashboard summarizes:

- Total pregnant women.
- Upcoming appointments.
- Missed appointments.
- Completed visits.
- Active supplements.
- Pending follow-ups.
- Due reminders.
- Recent scans.

Reports combine filters and summaries for:

- Registered pregnant women.
- Scheduled, attended, missed, and cancelled appointments.
- Visit records.
- Active supplements.
- Scan records.
- Follow-ups.
- Reminders.

Reports are role-scoped, so health workers do not receive the same unrestricted data access as admins.

## 20. UI and UX Implementation

The UI is built around a staff dashboard and a simpler patient portal.

Notable UI decisions:

- Sidebar navigation separates main care modules from admin modules.
- Admin "Users" was refined into "Health Workers" because patients have a dedicated patients module.
- Email is hidden from health worker tables because email is optional.
- Action buttons in dense tables are placed in a three-dot dropdown to avoid overly wide action columns.
- Required fields show red asterisks.
- Blood group uses a dropdown because the values are predefined.
- Phone input is treated as numeric text with max length rather than `type="number"` to avoid browser number input issues and preserve formatting control.
- Tables include filters for search, status, health centre, role-specific scope, and date ranges where relevant.

## 21. Security Review

Security controls currently implemented:

- Passwords are hashed with bcrypt.
- Password hash is excluded by default from user queries.
- Auth uses server-side credential checks.
- Suspended accounts cannot log in.
- JWT sessions include role and status.
- Protected routes are guarded in the proxy.
- Role-specific redirects prevent users from entering the wrong area.
- Users with temporary passwords must change password before continuing.
- New passwords cannot equal the default temporary password.
- Admin routes are restricted to admins.
- Pregnant women only access their own portal.
- Patient assignment rules are enforced on the server.
- Sensitive events are written to audit logs.
- Environment variables are used for database and auth secrets.

Security limitations and possible improvements:

- Add rate limiting to login attempts.
- Add CSRF review for all custom mutation flows.
- Add stronger password complexity rules if required by the institution.
- Add audit log export.
- Add session invalidation after admin password reset.
- Align seed/demo credentials with the temporary password policy.

## 22. Testing and Verification

Current verification available in the project:

- `npm run lint` checks code quality through ESLint.
- `npm run build` validates that the Next.js application builds successfully.
- TypeScript checks are part of the build process.
- Zod validation protects server actions and form submissions.
- Manual workflow testing can be performed using seeded demo data.

Recent implementation verification:

- Lint passed.
- Production build passed.

Current testing gap:

- There is no dedicated automated test suite yet.
- There are no unit tests for services.
- There are no integration tests for server actions.
- There are no end-to-end tests for login, patient registration, appointment scheduling, password reset, or patient portal workflows.

Recommended tests before final defense:

- Unit tests for validation schemas.
- Unit tests for patient assignment rules.
- Unit tests for password reset and change-password behavior.
- Integration tests for patient registration and appointment creation.
- End-to-end tests for admin, health worker, and patient workflows.
- Access-control tests to confirm each role is redirected correctly.

If asked during defense, the honest answer is that the project currently relies on linting, build checks, validation, and manual testing, and automated tests are a planned improvement.

## 23. Environment and Setup

Required environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/antenatal-care
AUTH_SECRET=your-secret
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
APP_NAME=Antenatal Care Management System
```

Common commands:

```bash
npm install
npm run seed
npm run dev
npm run lint
npm run build
```

The Next.js config includes `allowedDevOrigins` for local network development. This was added because newer Next.js versions block cross-origin access to development resources such as HMR and fonts unless the origin is explicitly allowed.

## 24. Known Issues and Review Observations

### Seed credentials need alignment

The application creation/reset flow now uses `12345678`, but the seed script still uses older passwords. Before demonstration, decide whether seeded demo accounts should also start with `12345678` and `mustChangePassword: true`.

### Automated testing is not yet implemented

The project builds and lints successfully, but it does not yet have automated test coverage.

### Reminder delivery is internal

The system tracks reminders inside the application. It does not send SMS, WhatsApp, email, or push notifications.

### Clinical decision support is intentionally limited

The system stores clinical support records but does not diagnose conditions or recommend treatment. That is appropriate for a student care-management system and avoids unsafe medical automation.

### Reporting is screen-based

Reports are visible in the application but there is no PDF/CSV export yet.

## 25. Why AI Use Is Acceptable and How to Defend It

A strong defense answer:

> I used AI as a development assistant, similar to a pair programmer. It helped generate code, suggest structure, and speed up implementation. However, I reviewed the output, tested the workflows, corrected business logic, and made decisions based on the project requirements. The final responsibility for the system design, validation rules, workflows, and presentation is mine.

Important points to emphasize:

- AI did not replace understanding; it accelerated implementation.
- The project has a coherent architecture that can be explained.
- Business rules were checked and refined manually.
- The health centre and health worker assignment logic was improved based on real-life workflow.
- The temporary password and forced change flow was intentionally implemented for account safety.
- The project uses standard technologies that are common in modern web development.

## 26. Possible Defense Questions and Answers

### What problem does your project solve?

It helps health centres manage antenatal care records digitally. It organizes pregnant women, health workers, appointments, visits, supplements, scans, follow-ups, reminders, reports, and audit logs in one role-based system.

### Why did you use Next.js?

Next.js provides routing, server rendering, server actions, layouts, and API/auth integration in one framework. The App Router is useful because the system has public pages, auth pages, staff dashboard pages, admin pages, and a patient portal.

### Why did you use MongoDB?

Antenatal records are document-oriented and can vary by module. MongoDB works well for storing users, profiles, appointments, scans, supplements, reminders, and logs. Mongoose gives structure through schemas, validation, references, and indexes.

### Why separate `User` and `PatientProfile`?

`User` stores account and authentication data. `PatientProfile` stores antenatal profile data. This separation avoids mixing login credentials with medical/profile information and allows pregnant women to have login accounts linked to their clinical profiles.

### How do you protect passwords?

Passwords are hashed with bcrypt before storage. The password hash is excluded from normal user queries and only selected when needed for login or password change.

### How does role-based access work?

The proxy checks the session and role before protected pages load. Admins can access admin modules, health workers can access care modules, and pregnant women can only access the portal. Unauthorized users are redirected.

### Why is the temporary password always `12345678`?

It creates a simple controlled onboarding flow for a school project demonstration. The security part is that users cannot continue using the system until they change it, and the system rejects choosing the default as the new password.

### How do you make sure a health worker belongs to the correct health centre?

Each health worker has a `healthCentreId`. During patient registration, the UI filters health workers by selected health centre, and the server also checks that the selected worker's `healthCentreId` matches the patient's health centre. Server-side validation is the most important part.

### Why is blood group a dropdown?

Blood group has predefined values, so a dropdown prevents invalid entries like misspellings or unsupported values.

### Why is phone exactly 9 digits?

The project uses the local expected phone number format. The validation schema enforces exactly 9 digits, and the form input limits entry accordingly.

### What happens when an appointment is missed?

Appointments can be manually marked missed, and the maintenance service can automatically mark overdue scheduled appointments as missed. It can also create a follow-up reminder for missed appointments.

### How does the patient portal protect privacy?

Pregnant women are routed only to `/portal`, and portal queries load records linked to the current user's patient profile. They cannot access dashboard or admin routes.

### What is the purpose of audit logs?

Audit logs record important actions such as login, account creation, password reset, patient creation, appointment creation, status updates, and reminder updates. They improve accountability.

### What tests did you run?

The project has been verified with linting and production build checks. Manual workflow testing was used for key flows. Automated tests are a recommended next improvement.

### What would you improve next?

I would add automated tests, align seed credentials with the new temporary password policy, add SMS/WhatsApp reminder delivery, add PDF/CSV exports, add login rate limiting, and improve reporting.

## 27. Implementation Decisions Table

| Decision | Reason |
| --- | --- |
| Next.js App Router | Supports layouts, server components, server actions, and clean route grouping. |
| TypeScript | Improves maintainability and catches type errors early. |
| MongoDB/Mongoose | Fits document-style care records while still supporting schemas and references. |
| Auth.js credentials login | Supports phone/email and password login without external providers. |
| bcrypt password hashing | Protects stored passwords. |
| `mustChangePassword` flag | Forces users to replace temporary passwords. |
| Server-side validation with Zod | Ensures invalid data is rejected even if UI validation is bypassed. |
| Service/repository separation | Keeps business rules separate from database queries and UI code. |
| Health centre worker filtering | Reflects real-life health centre assignment rules. |
| Audit logs | Provides accountability for sensitive actions. |
| Blood group dropdown | Prevents invalid free-text values. |
| Three-dot table actions | Keeps tables readable on smaller screens and avoids wide action columns. |

## 28. Final Defense Summary

This project is a role-based antenatal care management system built with a modern full-stack TypeScript architecture. It uses Next.js for the application structure, Auth.js for secure login, MongoDB/Mongoose for data persistence, Zod for validation, and a service/repository pattern for maintainable business logic.

The strongest technical points are:

- Clear role separation between admin, health worker, and pregnant woman.
- Server-enforced access control.
- Secure password hashing and forced password change flow.
- Realistic health centre and health worker assignment logic.
- Structured patient, appointment, visit, supplement, scan, follow-up, reminder, report, and audit modules.
- Consistent validation and UI behavior.

The main limitations are:

- No automated test suite yet.
- No external notification delivery.
- No export feature for reports.
- Seed credentials need alignment with the latest password policy.

Overall, the system demonstrates a complete working MVP for antenatal care coordination and provides a strong foundation for future expansion.
