import { PrismaClient, Role, RequestType, RequestStatus, AlertSeverity, AlertStatus, AppointmentStatus, TestResultStatus, PatientStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for all users (simple password for demo)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // USERS & PROFILES
  // ============================================
  console.log('Creating users and profiles...');

  // Create Patients
  const patient1User = await prisma.user.create({
    data: {
      email: 'john.smith@patient.com',
      password: hashedPassword,
      role: Role.PATIENT,
      name: 'John Smith',
      patient: {
        create: {
          roomNumber: '101',
          status: PatientStatus.STABLE,
          dateOfBirth: new Date('1975-05-15'),
          gender: 'Male',
          bloodType: 'O+',
          allergies: 'Penicillin',
        },
      },
    },
    include: { patient: true },
  });

  const patient2User = await prisma.user.create({
    data: {
      email: 'sarah.johnson@patient.com',
      password: hashedPassword,
      role: Role.PATIENT,
      name: 'Sarah Johnson',
      patient: {
        create: {
          roomNumber: '102',
          status: PatientStatus.RECOVERING,
          dateOfBirth: new Date('1988-09-22'),
          gender: 'Female',
          bloodType: 'A+',
          allergies: 'None',
        },
      },
    },
    include: { patient: true },
  });

  const patient3User = await prisma.user.create({
    data: {
      email: 'michael.brown@patient.com',
      password: hashedPassword,
      role: Role.PATIENT,
      name: 'Michael Brown',
      patient: {
        create: {
          roomNumber: '103',
          status: PatientStatus.CRITICAL,
          dateOfBirth: new Date('1962-03-10'),
          gender: 'Male',
          bloodType: 'B-',
          allergies: 'Latex, Shellfish',
        },
      },
    },
    include: { patient: true },
  });

  const patient4User = await prisma.user.create({
    data: {
      email: 'emily.davis@patient.com',
      password: hashedPassword,
      role: Role.PATIENT,
      name: 'Emily Davis',
      patient: {
        create: {
          roomNumber: '104',
          status: PatientStatus.STABLE,
          dateOfBirth: new Date('1995-11-30'),
          gender: 'Female',
          bloodType: 'AB+',
          allergies: 'Pollen',
        },
      },
    },
    include: { patient: true },
  });

  const patient5User = await prisma.user.create({
    data: {
      email: 'robert.wilson@patient.com',
      password: hashedPassword,
      role: Role.PATIENT,
      name: 'Robert Wilson',
      patient: {
        create: {
          roomNumber: '201',
          status: PatientStatus.ADMITTED,
          dateOfBirth: new Date('1980-07-18'),
          gender: 'Male',
          bloodType: 'O-',
          allergies: 'None',
        },
      },
    },
    include: { patient: true },
  });

  const patient6User = await prisma.user.create({
    data: {
      email: 'lisa.anderson@patient.com',
      password: hashedPassword,
      role: Role.PATIENT,
      name: 'Lisa Anderson',
      patient: {
        create: {
          roomNumber: '202',
          status: PatientStatus.RECOVERING,
          dateOfBirth: new Date('1972-12-05'),
          gender: 'Female',
          bloodType: 'A-',
          allergies: 'Aspirin',
        },
      },
    },
    include: { patient: true },
  });

  const patient7User = await prisma.user.create({
    data: {
      email: 'james.taylor@patient.com',
      password: hashedPassword,
      role: Role.PATIENT,
      name: 'James Taylor',
      patient: {
        create: {
          roomNumber: '203',
          status: PatientStatus.STABLE,
          dateOfBirth: new Date('1990-04-25'),
          gender: 'Male',
          bloodType: 'B+',
          allergies: 'None',
        },
      },
    },
    include: { patient: true },
  });

  // Create Staff Members
  const nurse1User = await prisma.user.create({
    data: {
      email: 'nurse.williams@hospital.com',
      password: hashedPassword,
      role: Role.NURSE,
      name: 'Jennifer Williams',
      staff: {
        create: {
          department: 'Cardiology',
          shift: 'Day Shift (7AM-7PM)',
        },
      },
    },
    include: { staff: true },
  });

  const nurse2User = await prisma.user.create({
    data: {
      email: 'nurse.martinez@hospital.com',
      password: hashedPassword,
      role: Role.NURSE,
      name: 'Carlos Martinez',
      staff: {
        create: {
          department: 'Emergency',
          shift: 'Night Shift (7PM-7AM)',
        },
      },
    },
    include: { staff: true },
  });

  const doctor1User = await prisma.user.create({
    data: {
      email: 'dr.thompson@hospital.com',
      password: hashedPassword,
      role: Role.PHYSICIAN,
      name: 'Dr. Amanda Thompson',
      staff: {
        create: {
          department: 'Cardiology',
          shift: 'Day Shift (8AM-6PM)',
        },
      },
    },
    include: { staff: true },
  });

  const doctor2User = await prisma.user.create({
    data: {
      email: 'dr.garcia@hospital.com',
      password: hashedPassword,
      role: Role.PHYSICIAN,
      name: 'Dr. Michael Garcia',
      staff: {
        create: {
          department: 'Internal Medicine',
          shift: 'Day Shift (8AM-6PM)',
        },
      },
    },
    include: { staff: true },
  });

  const doctor3User = await prisma.user.create({
    data: {
      email: 'dr.chen@hospital.com',
      password: hashedPassword,
      role: Role.PHYSICIAN,
      name: 'Dr. Lisa Chen',
      staff: {
        create: {
          department: 'Emergency',
          shift: 'On-Call',
        },
      },
    },
    include: { staff: true },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      password: hashedPassword,
      role: Role.ADMIN,
      name: 'Hospital Administrator',
      staff: {
        create: {
          department: 'Administration',
          shift: 'Business Hours',
        },
      },
    },
    include: { staff: true },
  });

  console.log('✅ Users and profiles created');

  // ============================================
  // VITALS
  // ============================================
  console.log('Creating vital signs data...');

  const patients = [patient1User, patient2User, patient3User, patient4User, patient5User, patient6User, patient7User];

  for (const patientUser of patients) {
    if (patientUser.patient) {
      // Create 5 vitals records for each patient over the past 24 hours
      for (let i = 0; i < 5; i++) {
        const hoursAgo = i * 4; // Every 4 hours
        await prisma.vital.create({
          data: {
            patientId: patientUser.patient.id,
            heartRate: Math.floor(Math.random() * 40) + 60, // 60-100
            bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 30) + 70}`,
            temperature: parseFloat((Math.random() * 2 + 97).toFixed(1)), // 97-99
            oxygenLevel: Math.floor(Math.random() * 5) + 95, // 95-100
            respiratoryRate: Math.floor(Math.random() * 8) + 12, // 12-20
            timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  console.log('✅ Vitals data created');

  // ============================================
  // TEST RESULTS
  // ============================================
  console.log('Creating test results...');

  // Patient 1 - Normal results
  await prisma.testResult.create({
    data: {
      patientId: patient1User.patient!.id,
      name: 'Complete Blood Count (CBC)',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: TestResultStatus.NORMAL,
      summary: 'All blood cell counts within normal range',
      detailedExplanation: 'Your blood test results look great! Your red blood cells, white blood cells, and platelets are all at healthy levels. This means your body is making enough blood cells to carry oxygen, fight infections, and help with clotting.',
      rawData: { hemoglobin: 14.5, wbc: 7200, platelets: 250000 },
    },
  });

  await prisma.testResult.create({
    data: {
      patientId: patient1User.patient!.id,
      name: 'Chest X-Ray',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: TestResultStatus.NORMAL,
      summary: 'No abnormalities detected',
      detailedExplanation: 'Your chest X-ray shows clear lungs with no signs of infection, fluid buildup, or other problems. Your heart size appears normal, and there are no concerning findings.',
    },
  });

  // Patient 2 - Mixed results
  await prisma.testResult.create({
    data: {
      patientId: patient2User.patient!.id,
      name: 'Lipid Panel',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: TestResultStatus.ABNORMAL,
      summary: 'Elevated LDL cholesterol detected',
      detailedExplanation: 'Your cholesterol test shows that your "bad" cholesterol (LDL) is higher than we\'d like to see. This increases your risk for heart disease. The good news is that this can often be improved with diet changes, exercise, and sometimes medication. Your doctor will discuss the best plan for you.',
      rawData: { totalCholesterol: 240, ldl: 160, hdl: 45, triglycerides: 180 },
    },
  });

  await prisma.testResult.create({
    data: {
      patientId: patient2User.patient!.id,
      name: 'Urinalysis',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: TestResultStatus.NORMAL,
      summary: 'No infection or abnormalities',
      detailedExplanation: 'Your urine test came back normal. There are no signs of infection, kidney problems, or other concerns. This is a good indicator of your kidney and urinary tract health.',
    },
  });

  // Patient 3 - Critical results
  await prisma.testResult.create({
    data: {
      patientId: patient3User.patient!.id,
      name: 'Cardiac Enzyme Test',
      date: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: TestResultStatus.CRITICAL,
      summary: 'Elevated troponin levels indicating cardiac event',
      detailedExplanation: 'This test shows elevated levels of troponin, which is a protein released when heart muscle is damaged. This is an important finding that requires immediate medical attention. Your care team is closely monitoring you and providing appropriate treatment.',
      rawData: { troponin: 2.5, ckMb: 18 },
    },
  });

  // Patient 4 - All normal
  await prisma.testResult.create({
    data: {
      patientId: patient4User.patient!.id,
      name: 'Comprehensive Metabolic Panel',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: TestResultStatus.NORMAL,
      summary: 'All metabolic markers within normal limits',
      detailedExplanation: 'This comprehensive test checks many important aspects of your health including kidney function, liver function, blood sugar, and electrolytes. All your results are within the normal range, which indicates your body\'s systems are working well together.',
      rawData: { glucose: 95, bun: 15, creatinine: 0.9, sodium: 140, potassium: 4.2 },
    },
  });

  // Patient 5 - Abnormal
  await prisma.testResult.create({
    data: {
      patientId: patient5User.patient!.id,
      name: 'Hemoglobin A1C',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: TestResultStatus.ABNORMAL,
      summary: 'Elevated A1C indicating poor blood sugar control',
      detailedExplanation: 'Your A1C test measures your average blood sugar over the past 3 months. Your level is higher than the target range, which suggests your diabetes is not well controlled. This is important because high blood sugar over time can damage your blood vessels and organs. Your doctor will work with you to adjust your treatment plan.',
      rawData: { a1c: 8.2 },
    },
  });

  console.log('✅ Test results created');

  // ============================================
  // APPOINTMENTS
  // ============================================
  console.log('Creating appointments...');

  const staffMembers = [doctor1User, doctor2User, doctor3User];

  // Past appointments
  await prisma.appointment.create({
    data: {
      patientId: patient1User.patient!.id,
      staffId: doctor1User.staff!.id,
      dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: 'Follow-up Consultation',
      status: AppointmentStatus.COMPLETED,
      notes: 'Patient recovering well, no complications',
      duration: 30,
    },
  });

  // Upcoming appointments
  await prisma.appointment.create({
    data: {
      patientId: patient1User.patient!.id,
      staffId: doctor1User.staff!.id,
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      type: 'Routine Checkup',
      status: AppointmentStatus.SCHEDULED,
      duration: 30,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient2User.patient!.id,
      staffId: doctor2User.staff!.id,
      dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      type: 'Post-Surgery Follow-up',
      status: AppointmentStatus.CONFIRMED,
      duration: 45,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient3User.patient!.id,
      staffId: doctor1User.staff!.id,
      dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      type: 'Cardiac Consultation',
      status: AppointmentStatus.SCHEDULED,
      duration: 60,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient4User.patient!.id,
      staffId: doctor3User.staff!.id,
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      type: 'Routine Checkup',
      status: AppointmentStatus.SCHEDULED,
      duration: 30,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient5User.patient!.id,
      staffId: doctor2User.staff!.id,
      dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      type: 'Diabetes Management',
      status: AppointmentStatus.SCHEDULED,
      duration: 45,
    },
  });

  console.log('✅ Appointments created');

  // ============================================
  // NON-URGENT REQUESTS
  // ============================================
  console.log('Creating help requests...');

  await prisma.nonUrgentRequest.create({
    data: {
      patientId: patient1User.patient!.id,
      type: RequestType.WATER,
      status: RequestStatus.QUEUED,
      notes: 'Need fresh water pitcher',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  await prisma.nonUrgentRequest.create({
    data: {
      patientId: patient2User.patient!.id,
      type: RequestType.BLANKET,
      status: RequestStatus.IN_PROGRESS,
      notes: 'Room feels cold',
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    },
  });

  await prisma.nonUrgentRequest.create({
    data: {
      patientId: patient3User.patient!.id,
      type: RequestType.NURSE,
      status: RequestStatus.QUEUED,
      notes: 'Have questions about medication schedule',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  });

  await prisma.nonUrgentRequest.create({
    data: {
      patientId: patient4User.patient!.id,
      type: RequestType.RESTROOM,
      status: RequestStatus.QUEUED,
      notes: 'Need assistance',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  });

  await prisma.nonUrgentRequest.create({
    data: {
      patientId: patient5User.patient!.id,
      type: RequestType.PAIN_MEDICATION,
      status: RequestStatus.QUEUED,
      notes: 'Lower back pain increasing',
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
    },
  });

  await prisma.nonUrgentRequest.create({
    data: {
      patientId: patient1User.patient!.id,
      type: RequestType.WATER,
      status: RequestStatus.COMPLETED,
      notes: 'Needed extra water',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      processedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Help requests created');

  // ============================================
  // ALERTS
  // ============================================
  console.log('Creating alerts...');

  await prisma.alert.create({
    data: {
      patientId: patient3User.patient!.id,
      severity: AlertSeverity.CRITICAL,
      status: AlertStatus.ACTIVE,
      reason: 'Cardiac enzyme levels critically elevated - immediate attention required',
      vitalsSnapshot: {
        heartRate: 125,
        bloodPressure: '160/95',
        oxygenLevel: 92,
        timestamp: new Date(),
      },
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  await prisma.alert.create({
    data: {
      patientId: patient1User.patient!.id,
      severity: AlertSeverity.LOW,
      status: AlertStatus.ACKNOWLEDGED,
      reason: 'Slight elevation in blood pressure',
      vitalsSnapshot: {
        heartRate: 78,
        bloodPressure: '142/88',
        oxygenLevel: 98,
        timestamp: new Date(),
      },
      acknowledgedBy: nurse1User.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  await prisma.alert.create({
    data: {
      patientId: patient2User.patient!.id,
      severity: AlertSeverity.MEDIUM,
      status: AlertStatus.ACTIVE,
      reason: 'Temperature slightly elevated at 100.4°F',
      vitalsSnapshot: {
        heartRate: 88,
        bloodPressure: '128/82',
        temperature: 100.4,
        oxygenLevel: 96,
        timestamp: new Date(),
      },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  await prisma.alert.create({
    data: {
      patientId: patient5User.patient!.id,
      severity: AlertSeverity.HIGH,
      status: AlertStatus.ESCALATED,
      reason: 'Blood sugar levels dangerously high at 350 mg/dL',
      vitalsSnapshot: {
        heartRate: 95,
        bloodPressure: '145/92',
        oxygenLevel: 97,
        timestamp: new Date(),
      },
      escalatedBy: nurse2User.id,
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    },
  });

  await prisma.alert.create({
    data: {
      patientId: patient6User.patient!.id,
      severity: AlertSeverity.MEDIUM,
      status: AlertStatus.ACTIVE,
      reason: 'Oxygen saturation dropped to 93%',
      vitalsSnapshot: {
        heartRate: 82,
        bloodPressure: '130/85',
        oxygenLevel: 93,
        respiratoryRate: 22,
        timestamp: new Date(),
      },
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },
  });

  console.log('✅ Alerts created');

  // ============================================
  // MESSAGES
  // ============================================
  console.log('Creating messages...');

  // Patient to Staff
  await prisma.message.create({
    data: {
      senderId: patient1User.id,
      receiverId: nurse1User.id,
      subject: 'Question about discharge',
      content: 'Hi, I was wondering when I might be able to go home. I\'m feeling much better.',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  // Staff to Patient
  const message1 = await prisma.message.create({
    data: {
      senderId: doctor1User.id,
      receiverId: patient2User.id,
      subject: 'Test Results Available',
      content: 'Your recent test results are now available in your patient portal. Please review them and let me know if you have any questions.',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  // Reply
  await prisma.message.create({
    data: {
      senderId: patient2User.id,
      receiverId: doctor1User.id,
      subject: 'Test Results Available',
      content: 'Thank you, I saw the results. Can we discuss the cholesterol findings during my next appointment?',
      threadId: message1.id,
      isRead: false,
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      senderId: patient3User.id,
      receiverId: nurse2User.id,
      subject: 'Medication side effects',
      content: 'I\'ve been experiencing some dizziness since starting the new medication. Is this normal?',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      senderId: nurse1User.id,
      receiverId: patient4User.id,
      subject: 'Appointment Reminder',
      content: 'Just a friendly reminder that you have an appointment scheduled for tomorrow at 2 PM with Dr. Chen.',
      isRead: true,
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      senderId: patient5User.id,
      receiverId: doctor2User.id,
      subject: 'Dietary questions',
      content: 'I received the new diet plan for managing my diabetes. Can you clarify if I should avoid all carbohydrates or just limit them?',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Messages created');

  // ============================================
  // PATIENT PREFERENCES
  // ============================================
  console.log('Creating patient preferences...');

  for (const patientUser of patients) {
    if (patientUser.patient) {
      await prisma.patientPreference.create({
        data: {
          patientId: patientUser.patient.id,
          language: 'en',
          notifications: true,
          preferences: {
            preferredContactMethod: 'email',
            quietHours: { start: '22:00', end: '07:00' },
          },
        },
      });
    }
  }

  console.log('✅ Patient preferences created');

  // ============================================
  // AUDIT LOGS
  // ============================================
  console.log('Creating audit logs...');

  await prisma.auditLog.create({
    data: {
      userId: patient1User.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: patient1User.id,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: nurse1User.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: nurse1User.id,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: doctor1User.id,
      action: 'VIEW_PATIENT',
      entityType: 'Patient',
      entityId: patient1User.patient!.id,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Audit logs created');

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('=================================================');
  console.log('DEMO LOGIN CREDENTIALS');
  console.log('=================================================');
  console.log('');
  console.log('PATIENT ACCOUNTS:');
  console.log('  Email: john.smith@patient.com');
  console.log('  Email: sarah.johnson@patient.com');
  console.log('  Email: michael.brown@patient.com');
  console.log('  Email: emily.davis@patient.com');
  console.log('  Email: robert.wilson@patient.com');
  console.log('  Email: lisa.anderson@patient.com');
  console.log('  Email: james.taylor@patient.com');
  console.log('  Password: password123');
  console.log('');
  console.log('STAFF ACCOUNTS:');
  console.log('  Nurse: nurse.williams@hospital.com (password123)');
  console.log('  Nurse: nurse.martinez@hospital.com (password123)');
  console.log('  Doctor: dr.thompson@hospital.com (password123)');
  console.log('  Doctor: dr.garcia@hospital.com (password123)');
  console.log('  Doctor: dr.chen@hospital.com (password123)');
  console.log('  Admin: admin@hospital.com (password123)');
  console.log('');
  console.log('=================================================');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

