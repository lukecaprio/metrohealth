# Metro Health - Backend API

> Smart Patient Care System Backend built with NestJS, PostgreSQL, and Prisma

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/metrohealth?schema=public"
JWT_SECRET="metro-health-demo-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
```

Replace `username` and `password` with your PostgreSQL credentials.

3. **Set up the database**

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with demo data
npm run prisma:seed
```

4. **Start the development server**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

## 🗄️ Database Management

```bash
# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset
```

## 🔐 Demo Credentials

### Patient Accounts
All patients use password: `password123`

- `john.smith@patient.com` - Room 101, Stable
- `sarah.johnson@patient.com` - Room 102, Recovering
- `michael.brown@patient.com` - Room 103, Critical
- `emily.davis@patient.com` - Room 104, Stable
- `robert.wilson@patient.com` - Room 201, Admitted
- `lisa.anderson@patient.com` - Room 202, Recovering
- `james.taylor@patient.com` - Room 203, Stable

### Staff Accounts
All staff use password: `password123`

**Nurses:**
- `nurse.williams@hospital.com` - Jennifer Williams (Cardiology)
- `nurse.martinez@hospital.com` - Carlos Martinez (Emergency)

**Physicians:**
- `dr.thompson@hospital.com` - Dr. Amanda Thompson (Cardiology)
- `dr.garcia@hospital.com` - Dr. Michael Garcia (Internal Medicine)
- `dr.chen@hospital.com` - Dr. Lisa Chen (Emergency)

**Admin:**
- `admin@hospital.com` - Hospital Administrator

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All endpoints except `/auth/login` require JWT authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔑 Authentication Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.smith@patient.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john.smith@patient.com",
    "name": "John Smith",
    "role": "PATIENT"
  }
}
```

---

## 👤 Patient Endpoints

### Get Patient Dashboard
```http
GET /api/patients/me/dashboard
Authorization: Bearer <patient-token>
```

Returns: Welcome message, vitals summary, next appointment, counts for messages/test results/requests

### Get Vitals Summary
```http
GET /api/patients/me/vitals-summary
Authorization: Bearer <patient-token>
```

Returns: Latest vital signs (heart rate, blood pressure, temperature, oxygen level)

### Get Test Results
```http
GET /api/patients/me/test-results
Authorization: Bearer <patient-token>
```

Returns: List of all test results with status (NORMAL/ABNORMAL/CRITICAL)

### Get Test Result Detail
```http
GET /api/patients/me/test-results/:id
Authorization: Bearer <patient-token>
```

Returns: Detailed plain-language explanation of test result

### Get Appointments
```http
GET /api/patients/me/appointments
Authorization: Bearer <patient-token>
```

Returns: List of all appointments (past and upcoming)

### Get Help Requests
```http
GET /api/patients/me/requests
Authorization: Bearer <patient-token>
```

Returns: List of patient's help requests with status

### Submit Help Request
```http
POST /api/patients/me/requests
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "type": "WATER",
  "notes": "Need fresh water pitcher"
}
```

**Request Types:** `WATER`, `BLANKET`, `RESTROOM`, `PAIN_MEDICATION`, `NURSE`, `OTHER`

### Get Messages
```http
GET /api/patients/me/messages
Authorization: Bearer <patient-token>
```

Returns: Patient's message inbox

### Send Message
```http
POST /api/patients/me/messages
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "subject": "Question about medication",
  "content": "I have a question about my medication schedule..."
}
```

### Reply to Message
```http
POST /api/patients/me/messages/:id/reply
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "content": "Thank you for the information..."
}
```

---

## 👨‍⚕️ Staff Endpoints

### Get Staff Dashboard
```http
GET /api/staff/dashboard
Authorization: Bearer <staff-token>
```

Returns: Alert summary, patient counts, active requests, unread messages

### Get Patient List
```http
GET /api/staff/patients
Authorization: Bearer <staff-token>
```

Returns: List of all active patients with room numbers and latest vitals

### Get Patient Detail
```http
GET /api/staff/patients/:patientId
Authorization: Bearer <staff-token>
```

Returns: Comprehensive patient information including vitals, alerts, requests, test results, appointments

### Get Patient Vitals
```http
GET /api/staff/patients/:patientId/vitals-summary
Authorization: Bearer <staff-token>
```

Returns: Detailed vitals history for specific patient

### Get Alerts
```http
GET /api/staff/alerts?status=ACTIVE
Authorization: Bearer <staff-token>
```

Query params: `status` (optional) - ACTIVE, ACKNOWLEDGED, ESCALATED, RESOLVED

Returns: List of alerts sorted by severity and time

### Get Alert Detail
```http
GET /api/staff/alerts/:id
Authorization: Bearer <staff-token>
```

Returns: Detailed alert information with patient data and vitals snapshot

### Escalate Alert
```http
POST /api/staff/alerts/:id/escalate
Authorization: Bearer <staff-token>
Content-Type: application/json

{
  "reason": "Patient condition worsening, escalating to physician"
}
```

### Acknowledge Alert
```http
POST /api/staff/alerts/:id/acknowledge
Authorization: Bearer <staff-token>
Content-Type: application/json

{
  "notes": "Patient stable, continuing to monitor"
}
```

### Get Help Requests
```http
GET /api/staff/requests?status=QUEUED
Authorization: Bearer <staff-token>
```

Query params: `status` (optional) - QUEUED, IN_PROGRESS, COMPLETED

Returns: List of patient help requests

### Complete Request
```http
POST /api/staff/requests/:id/complete
Authorization: Bearer <staff-token>
Content-Type: application/json

{
  "notes": "Water pitcher delivered"
}
```

### Get Messages
```http
GET /api/staff/messages
Authorization: Bearer <staff-token>
```

Returns: Staff member's message inbox

### Send Message to Patient
```http
POST /api/staff/messages/:patientId
Authorization: Bearer <staff-token>
Content-Type: application/json

{
  "subject": "Test Results Available",
  "content": "Your recent test results are now available..."
}
```

### Reply to Message
```http
POST /api/staff/messages/:id/reply
Authorization: Bearer <staff-token>
Content-Type: application/json

{
  "content": "I'd be happy to discuss this with you..."
}
```

---

## 📅 Appointments Endpoints

### Get Available Slots
```http
GET /api/appointments/availability?staffId=uuid&startDate=2024-01-01&endDate=2024-01-07
Authorization: Bearer <token>
```

Query params (all optional):
- `staffId` - Filter by specific doctor
- `startDate` - Start of date range
- `endDate` - End of date range

Returns: Available appointment slots with doctor information

### Book Appointment
```http
POST /api/appointments/book
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "staffId": "doctor-uuid",
  "dateTime": "2024-01-15T14:00:00Z",
  "type": "Routine Checkup",
  "notes": "Follow-up for blood pressure"
}
```

---

## 🏗️ Architecture

### Technology Stack
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** class-validator, class-transformer
- **Password Hashing:** bcrypt

### Project Structure
```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── common/                    # Shared utilities
│   │   ├── decorators/            # Custom decorators (@CurrentUser, @Roles)
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Auth & Role guards
│   │   └── interceptors/          # Logging interceptor
│   ├── infra/                     # Infrastructure
│   │   └── db/                    # Prisma service & module
│   └── modules/                   # Feature modules
│       ├── auth/                  # Authentication
│       ├── patients/              # Patient endpoints
│       ├── staff/                 # Staff endpoints
│       └── appointments/          # Appointment management
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed data script
├── package.json
├── tsconfig.json
└── README.md
```

### Cross-Cutting Concerns

#### Security
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation on all endpoints
- Patients can only access their own data

#### Logging
- Global logging interceptor
- Audit log database table
- All critical actions logged (login, data access, modifications)

#### Error Handling
- Global exception filter
- Consistent error response format
- Detailed error logging

#### Validation
- Global ValidationPipe
- DTO-based request validation
- Type safety with TypeScript

## 🧪 Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@patient.com","password":"password123"}'
```

**Get Patient Dashboard:**
```bash
curl http://localhost:3000/api/patients/me/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Submit Help Request:**
```bash
curl -X POST http://localhost:3000/api/patients/me/requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"WATER","notes":"Need fresh water"}'
```

### Using Postman

1. Import the base URL: `http://localhost:3000/api`
2. Create a login request to get JWT token
3. Set Authorization header for subsequent requests: `Bearer <token>`
4. Test all endpoints documented above

## 📊 Database Schema

### Key Models

**User** - Authentication and base user information
- Roles: PATIENT, NURSE, PHYSICIAN, ADMIN

**Patient** - Patient-specific information
- Linked to User
- Includes room number, status, demographics

**Staff** - Staff member information
- Linked to User
- Includes department, shift

**Vital** - Patient vital signs
- Heart rate, blood pressure, temperature, oxygen level

**Alert** - Critical patient alerts
- Severity levels: LOW, MEDIUM, HIGH, CRITICAL
- Statuses: ACTIVE, ACKNOWLEDGED, ESCALATED, RESOLVED

**TestResult** - Lab and test results
- Statuses: NORMAL, ABNORMAL, PENDING, CRITICAL
- Plain-language explanations for patients

**NonUrgentRequest** - Patient help requests
- Types: WATER, BLANKET, RESTROOM, PAIN_MEDICATION, NURSE, OTHER
- Statuses: QUEUED, IN_PROGRESS, COMPLETED

**Appointment** - Scheduling
- Statuses: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

**Message** - Patient-staff communication
- Supports threaded conversations

**AuditLog** - System activity tracking
- Records all important actions

## 🚨 Important Notes

### For Demo/Prototype Use Only
- Simplified authentication (no refresh tokens)
- Simple passwords acceptable
- CORS enabled for all origins
- No rate limiting
- Not production-ready

### Security Considerations for Production
If deploying to production, implement:
- Refresh token rotation
- Rate limiting
- Strong password requirements
- Password reset functionality
- Two-factor authentication
- API key management
- Stricter CORS policy
- Input sanitization
- SQL injection prevention (Prisma handles this)
- HTTPS enforcement

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify DATABASE_URL in .env
# Ensure database exists
createdb metrohealth
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Reset database
npx prisma migrate reset

# View current database state
npm run prisma:studio
```

## 📝 Development Scripts

```json
{
  "start:dev": "nest start --watch",
  "build": "nest build",
  "start:prod": "node dist/main",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "prisma:seed": "ts-node prisma/seed.ts"
}
```

## 🤝 Contributing

This is a prototype/demo application for educational purposes.

## 📄 License

MIT

---

**Metro Health Backend** - Built with NestJS, PostgreSQL, and Prisma

