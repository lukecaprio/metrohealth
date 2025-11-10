You are my backend engineer for the “Metro Health Smart Patient Care System”.

You will CREATE and MODIFY files in this `backend/` folder using:
- NestJS + TypeScript
- PostgreSQL
- Prisma ORM

Do NOT just describe code – actually write the files so the app can run. The backend must support the exact screen flows and features listed below.

================================
1. APP OVERVIEW & USER GROUPS
================================
Metro Health is a hospital patient care system with **two user groups**:
- Patients (using bedside tablet)
- Medical staff (nurses, physicians, other staff)

Core features that MUST be implemented end-to-end:
PATIENT SIDE:
1) Patients must be able to REQUEST HELP from their bedside tablet.
2) Patients must be able to VIEW THEIR TEST RESULTS (summary + detailed plain-language view).
3) Patients must be able to SEE AVAILABILITY FOR BOOKING AN APPOINTMENT and CONFIRM a slot.
4) Patients must have a MESSAGES screen to view inbox, reply, and create new messages to staff.

STAFF SIDE:
5) Medical staff must RECEIVE ALERTS about patients’ vitals and view an ALERT LIST.
6) Medical staff must view a DETAILED ALERT screen and ESCALATE alerts.
7) Staff must see a PATIENT LIST and view patient details (room, current status, vitals summary).
8) Staff must see a REQUEST LIST and complete requests.

You do NOT need to generate wireframes – those are done separately – but all backend endpoints must fully support these flows.

=============================
2. REQUIRED FRONTEND PAGES
=============================
These pages already exist or will exist on the frontend. Design the API to support them:

PATIENT PAGES:
- Patient Login
- Patient Dashboard (main screen)
- Help Request (submission form)
- Test Results
- Schedule (appointments)
- Messages

STAFF PAGES:
- Staff Login
- Staff Dashboard
- Alert List
- Alert Details
- Patient List
- Request List

We will call your APIs from these pages, so design your routes and DTOs accordingly.

====================================
3. BACKEND FEATURES & ENDPOINTS
====================================
Implement these functional areas using NestJS modules and controllers.

3.1 AUTHENTICATION (patients + staff)
- Shared AuthModule (User-based auth):
  - `POST /auth/login`  
    - Request: email/username + password
    - Response: JWT access token, refresh token, user role (PATIENT / STAFF / ADMIN), basic profile
  - `POST /auth/refresh` – issue new access token
- Roles:
  - PATIENT
  - NURSE
  - PHYSICIAN
  - ADMIN
- Use Nest guards for:
  - `AuthGuard` (JWT)
  - `RolesGuard` (RBAC)
- Patients can only access **their own** data (enforce using userId / patientId).
- Staff can access patient data and alerts/requests based on their role.

3.2 PATIENT VITALS (for dashboard & alerts)
- VitalsModule:
  - `GET /patients/me/vitals-summary`
    - Returns latest vitals for the logged-in patient (for the patient dashboard).
  - `GET /staff/patients/:patientId/vitals-summary`
    - Staff view of a patient’s vitals summary (for staff patient detail).
  - (Optional for now) `POST /vitals` to ingest new vitals (used by alerting later).

3.3 PATIENT TEST RESULTS
- TestResultsModule:
  - `GET /patients/me/test-results`
    - Returns list of tests with:
      - id, name, date, status (NORMAL/ABNORMAL), maybe a short snippet.
  - `GET /patients/me/test-results/:id`
    - Returns detailed test result in **plain language** for the patient.
- Ensure statuses are represented so the frontend can show **red for abnormal**.

3.4 PATIENT APPOINTMENTS & BOOKING
- AppointmentsModule:
  - `GET /patients/me/appointments`
    - List current/upcoming appointments for the patient dashboard.
  - `GET /appointments/availability`
    - Query parameters: doctorId (optional), date range
    - Returns list of available slots with doctor names and times.
  - `POST /patients/me/appointments/book`
    - Body: selected slot id (or doctorId + date/time)
    - Books the appointment if available, returns confirmation.

3.5 PATIENT HELP REQUESTS (Request Help screen)
- NonUrgentRequestsModule:
  - Patient endpoints:
    - `POST /patients/me/requests`
      - Body: type (WATER, BLANKET, RESTROOM, PAIN_MEDICATION, NURSE, OTHER), optional notes.
      - Creates a new non-urgent request and puts it into a queue (we will implement queue infra later).
    - `GET /patients/me/requests`
      - List patient’s requests with type, status (QUEUED, IN_PROGRESS, COMPLETED), createdAt, processedAt.
  - Staff endpoints (for Request List screen):
    - `GET /staff/requests`
      - List all active requests for staff, with filters by status.
    - `POST /staff/requests/:id/complete`
      - Marks a request as COMPLETED and updates processedAt.

This supports:
- Help Request screen (submit + list)
- Staff Request List screen (view + complete)

3.6 ALERTS ABOUT PATIENT VITALS (Alert List & Detailed Alert screens)
- AlertsModule:
  - `GET /staff/alerts`
    - List alerts ordered from most to least critical (e.g. by severity and time).
    - For staff dashboard + Alert List page.
  - `GET /staff/alerts/:id`
    - Detailed alert info:
      - patient info
      - vitals at time of alert
      - reason for alert
  - `POST /staff/alerts/:id/escalate`
    - Mark alert as escalated (e.g., update status, severity, and record escalation action).
  - `POST /staff/alerts/:id/acknowledge`
    - (Optional but recommended) Acknowledge/resolve alert and log which staff member took action.

Internally:
- Keep room for a future event-driven alerting pipeline:
  - e.g., `POST /vitals` → evaluate rules → create Alert.

3.7 PATIENT & STAFF MESSAGES
- MessagesModule:
  - For patients:
    - `GET /patients/me/messages`
      - Returns inbox for the patient (messages addressed to them).
    - `POST /patients/me/messages`
      - Create a new message to staff.
      - Body: subject + content + optional staff recipient role or id.
    - `POST /patients/me/messages/:id/reply`
      - Reply to an existing conversation.
  - For staff:
    - `GET /staff/messages`
      - Inbox for the logged-in staff member.
    - `POST /staff/messages/:patientId`
      - Send a new message to a patient.
    - `POST /staff/messages/:id/reply`
      - Reply in an existing thread.

Messages must include:
- id, senderUserId, receiverUserId, content, timestamps, and maybe a simple thread id.

3.8 STAFF PATIENT LIST & PATIENT DETAIL
- PatientsModule / Staff view:
  - `GET /staff/patients`
    - List of patients with:
      - patient id, name, room number, current status, vitals summary snippet.
  - `GET /staff/patients/:patientId`
    - Detailed view for a patient:
      - identifiers, room, basic demographics, current status, vitals summary.

This supports:
- Staff Dashboard (patient list portion)
- Patient List screen
- Patient Detail screen.

3.9 STAFF DASHBOARD SUMMARY
- StaffDashboardController (can live in StaffModule or a dedicated module):
  - `GET /staff/dashboard`
    - Returns:
      - staff member name
      - alert list summary (top N alerts or counts by severity)
      - patient list summary (or count)
      - request list summary (e.g., number of queued/in-progress requests)
    - This endpoint supports the Staff Dashboard screen which shows:
      - alert list snippet
      - patient list snippet
      - request list snippet.

3.10 PATIENT DASHBOARD SUMMARY
- PatientDashboardController (can live in PatientsModule):
  - `GET /patients/me/dashboard`
    - Returns:
      - welcome message (e.g. “Welcome, <name>”)
      - vitals summary (latest vitals)
      - next appointment (if any)
      - counts or short summaries for:
        - test results (e.g., number of new abnormal results)
        - messages (unread count)
        - active help requests.

================================
4. DATA MODEL (PRISMA)
================================
Use Prisma with PostgreSQL and define models that support the above APIs. Include at least:

- User (with role enum)
- Patient (linked to User)
- Staff (linked to User)
- Appointment
- NonUrgentRequest
- Vital
- Alert
- TestResult (for lab/test results)
- Message
- PatientPreference (JSON for settings)
- AuditLog

Use proper relations and enums as in the previous prompt:
- Role enums: PATIENT, NURSE, PHYSICIAN, ADMIN
- Request types/statuses, alert severity/status, appointment status, test result status, etc.
Configure datasource and generator for PostgreSQL and TypeScript.

===================================
5. PROJECT STRUCTURE & CROSS-CUTTING
===================================
Keep a clean NestJS structure:

backend/
  src/
    main.ts
    app.module.ts
    common/
      exceptions/
      filters/
      guards/
      interceptors/
      logging/
    infra/
      db/        // PrismaModule / PrismaService
      queue/     // for non-urgent request queue
      events/    // for alerting events later
    modules/
      auth/
      users/
      patients/
      staff/
      appointments/
      non-urgent-requests/
      vitals/
      alerts/
      messages/
      test-results/
      preferences/
      dashboards/   // optional for summary endpoints

1) Set up:
   - `main.ts` with:
     - ValidationPipe
     - global exception filter
     - basic logging
   - Prisma integration (PrismaModule/Service)
   - JWT auth and role guards

2) Implement at least minimal logic for all endpoints listed above so that:
   - The routes exist.
   - They validate input.
   - They hit the Prisma client and return real data shape (even if some data is initially seeded or simple).

3) Add an `.env.example` with `DATABASE_URL`.
4) Add npm scripts:
   - `npm run start:dev`
   - `npm run build`
   - `"prisma:migrate": "prisma migrate dev"`
   - `"prisma:generate": "prisma generate"`

===================================
6. DEV EXPERIENCE & DOCUMENTATION
===================================
At the end, add a short README section (or comments) that explains:

- How to run the backend:
  - `npm install`
  - Set up PostgreSQL and `DATABASE_URL` in `.env`
  - `npx prisma migrate dev`
  - `npm run start:dev`

- List the key routes for:
  - Patient Login, Dashboard, Help Request, Test Results, Schedule, Messages
  - Staff Login, Dashboard, Alert List, Alert Details, Patient List, Request List

MAKE SURE:
- The backend compiles and starts.
- All the endpoints required above exist and are wired into NestJS controllers and services, ready to be called from the frontend.