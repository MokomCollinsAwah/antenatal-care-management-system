import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const dayMs = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => new Date(Date.now() + days * dayMs);

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local before running the seed.");
  }

  const [
    { default: mongoose, Types },
    { connectDB },
    { hashPassword },
    {
      AppointmentStatus,
      AppointmentType,
      FollowUpMethod,
      FollowUpOutcome,
      ReminderStatus,
      ReminderType,
      SupplementStatus,
      UserRole,
      UserStatus,
    },
    { default: Appointment },
    { default: AuditLog },
    { default: FollowUpRecord },
    { default: HealthCentre },
    { default: PatientProfile },
    { default: Reminder },
    { default: ScanRecord },
    { default: SupplementRecord },
    { default: User },
    { default: VisitRecord },
  ] = await Promise.all([
    import("mongoose"),
    import("../src/lib/db"),
    import("../src/lib/password"),
    import("../src/lib/constants"),
    import("../src/models/Appointment"),
    import("../src/models/AuditLog"),
    import("../src/models/FollowUpRecord"),
    import("../src/models/HealthCentre"),
    import("../src/models/PatientProfile"),
    import("../src/models/Reminder"),
    import("../src/models/ScanRecord"),
    import("../src/models/SupplementRecord"),
    import("../src/models/User"),
    import("../src/models/VisitRecord"),
  ]);

  const passwordHashes = {
    admin: await hashPassword("Admin123!"),
    worker: await hashPassword("Worker123!"),
    patient: await hashPassword("Patient123!"),
  };

  try {
    await connectDB();

    const healthCentre = await HealthCentre.findOneAndUpdate(
      { name: "Molyko Integrated Health Centre", location: "Molyko, Buea" },
      { $set: { name: "Molyko Integrated Health Centre", location: "Molyko, Buea", phone: "670100100" } },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    const admin = await User.findOneAndUpdate(
      { $or: [{ phone: "670000001" }, { email: "admin@anc.local" }] },
      {
        $set: {
          fullName: "Admin Ngwa",
          phone: "670000001",
          email: "admin@anc.local",
          passwordHash: passwordHashes.admin,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    const healthWorker = await User.findOneAndUpdate(
      { $or: [{ phone: "670000002" }, { email: "worker@anc.local" }] },
      {
        $set: {
          fullName: "Grace Ngeh",
          phone: "670000002",
          email: "worker@anc.local",
          passwordHash: passwordHashes.worker,
          role: UserRole.HEALTH_WORKER,
          status: UserStatus.ACTIVE,
          healthCentreId: healthCentre._id,
          createdById: admin._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    const patientUsers = await Promise.all([
      User.findOneAndUpdate(
        { $or: [{ phone: "670000003" }, { email: "patient@anc.local" }] },
        {
          $set: {
            fullName: "Mary Atia",
            phone: "670000003",
            email: "patient@anc.local",
            passwordHash: passwordHashes.patient,
            role: UserRole.PREGNANT_WOMAN,
            status: UserStatus.ACTIVE,
            healthCentreId: healthCentre._id,
            createdById: healthWorker._id,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      ),
      User.findOneAndUpdate(
        { $or: [{ phone: "670000004" }, { email: "patient2@anc.local" }] },
        {
          $set: {
            fullName: "Esther Mafor",
            phone: "670000004",
            email: "patient2@anc.local",
            passwordHash: passwordHashes.patient,
            role: UserRole.PREGNANT_WOMAN,
            status: UserStatus.ACTIVE,
            healthCentreId: healthCentre._id,
            createdById: healthWorker._id,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      ),
    ]);

    const [maryProfile, estherProfile] = await Promise.all([
      PatientProfile.findOneAndUpdate(
        { userId: patientUsers[0]._id },
        {
          $set: {
            userId: patientUsers[0]._id,
            age: 27,
            address: "Molyko, Buea",
            emergencyContactName: "Peter Atia",
            emergencyContactPhone: "670300301",
            healthCentreId: healthCentre._id,
            assignedHealthWorkerId: healthWorker._id,
            lastMenstrualPeriod: daysFromNow(-150),
            expectedDeliveryDate: daysFromNow(130),
            gravidity: 2,
            parity: 1,
            bloodGroup: "O+",
            riskNote: "No current high-risk note.",
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      ),
      PatientProfile.findOneAndUpdate(
        { userId: patientUsers[1]._id },
        {
          $set: {
            userId: patientUsers[1]._id,
            age: 31,
            address: "Great Soppo, Buea",
            emergencyContactName: "Agnes Mafor",
            emergencyContactPhone: "670300302",
            healthCentreId: healthCentre._id,
            assignedHealthWorkerId: healthWorker._id,
            lastMenstrualPeriod: daysFromNow(-95),
            expectedDeliveryDate: daysFromNow(185),
            gravidity: 1,
            parity: 0,
            bloodGroup: "A+",
            riskNote: "First pregnancy; routine monitoring.",
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      ),
    ]);

    const upcomingAppointment = await Appointment.findOneAndUpdate(
      { patientId: maryProfile._id, reason: "Seed demo upcoming ANC visit" },
      {
        $set: {
          patientId: maryProfile._id,
          appointmentType: AppointmentType.ANTENATAL_VISIT,
          scheduledDateTime: daysFromNow(7),
          status: AppointmentStatus.SCHEDULED,
          reason: "Seed demo upcoming ANC visit",
          notes: "Routine antenatal check.",
          createdById: healthWorker._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    const attendedAppointment = await Appointment.findOneAndUpdate(
      { patientId: maryProfile._id, reason: "Seed demo attended appointment" },
      {
        $set: {
          patientId: maryProfile._id,
          appointmentType: AppointmentType.ANTENATAL_VISIT,
          scheduledDateTime: daysFromNow(-14),
          status: AppointmentStatus.ATTENDED,
          reason: "Seed demo attended appointment",
          notes: "Completed routine visit.",
          createdById: healthWorker._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    const missedAppointment = await Appointment.findOneAndUpdate(
      { patientId: estherProfile._id, reason: "Seed demo missed appointment" },
      {
        $set: {
          patientId: estherProfile._id,
          appointmentType: AppointmentType.SUPPLEMENT_CHECK,
          scheduledDateTime: daysFromNow(-5),
          status: AppointmentStatus.MISSED,
          reason: "Seed demo missed appointment",
          notes: "Patient did not attend.",
          createdById: healthWorker._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    await VisitRecord.findOneAndUpdate(
      { appointmentId: attendedAppointment._id },
      {
        $set: {
          appointmentId: attendedAppointment._id,
          patientId: maryProfile._id,
          visitDate: daysFromNow(-14),
          weightKg: 68,
          systolicBP: 118,
          diastolicBP: 76,
          complaint: "Mild morning nausea.",
          advice: "Continue hydration and routine supplements.",
          notes: "Mother and baby stable at routine check.",
          nextAppointmentDate: daysFromNow(7),
          recordedById: healthWorker._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    const supplement = await SupplementRecord.findOneAndUpdate(
      { patientId: maryProfile._id, supplementName: "Iron and Folic Acid" },
      {
        $set: {
          patientId: maryProfile._id,
          supplementName: "Iron and Folic Acid",
          dosage: "1 tablet",
          frequency: "Once daily after meals",
          startDate: daysFromNow(-10),
          instructions: "Take with clean water after food.",
          status: SupplementStatus.ACTIVE,
          recordedById: healthWorker._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    const scan = await ScanRecord.findOneAndUpdate(
      { patientId: estherProfile._id, scanType: "Routine Obstetric Scan" },
      {
        $set: {
          patientId: estherProfile._id,
          scanDate: daysFromNow(-3),
          scanType: "Routine Obstetric Scan",
          healthCentreId: healthCentre._id,
          resultNote: "Routine scan note recorded for follow-up.",
          nextScanDate: daysFromNow(28),
          recordedById: healthWorker._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    await FollowUpRecord.findOneAndUpdate(
      { appointmentId: missedAppointment._id },
      {
        $set: {
          patientId: estherProfile._id,
          appointmentId: missedAppointment._id,
          followUpDate: daysFromNow(-4),
          method: FollowUpMethod.CALL,
          outcome: FollowUpOutcome.CONTACTED,
          notes: "Patient contacted and advised to reschedule at the health centre.",
          followedById: healthWorker._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    await Promise.all([
      Reminder.findOneAndUpdate(
        { patientId: maryProfile._id, appointmentId: upcomingAppointment._id, title: "Upcoming Appointment" },
        {
          $set: {
            patientId: maryProfile._id,
            appointmentId: upcomingAppointment._id,
            title: "Upcoming Appointment",
            message: "You have an upcoming antenatal appointment at Molyko Integrated Health Centre.",
            reminderType: ReminderType.APPOINTMENT,
            dueDateTime: daysFromNow(6),
            status: ReminderStatus.PENDING,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      ),
      Reminder.findOneAndUpdate(
        { patientId: maryProfile._id, supplementId: supplement._id, title: "Supplement Reminder" },
        {
          $set: {
            patientId: maryProfile._id,
            supplementId: supplement._id,
            title: "Supplement Reminder",
            message: "Take Iron and Folic Acid - 1 tablet, once daily after meals.",
            reminderType: ReminderType.SUPPLEMENT,
            dueDateTime: daysFromNow(-1),
            status: ReminderStatus.DUE,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      ),
      Reminder.findOneAndUpdate(
        { patientId: estherProfile._id, appointmentId: missedAppointment._id, title: "Missed Appointment" },
        {
          $set: {
            patientId: estherProfile._id,
            appointmentId: missedAppointment._id,
            title: "Missed Appointment",
            message: "You missed an antenatal appointment. Please contact your health worker for follow-up.",
            reminderType: ReminderType.FOLLOW_UP,
            dueDateTime: daysFromNow(-4),
            status: ReminderStatus.DUE,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      ),
      Reminder.findOneAndUpdate(
        { patientId: estherProfile._id, scanId: scan._id, title: "Scan Reminder" },
        {
          $set: {
            patientId: estherProfile._id,
            scanId: scan._id,
            title: "Scan Reminder",
            message: "You have an upcoming scan scheduled at Molyko Integrated Health Centre.",
            reminderType: ReminderType.SCAN,
            dueDateTime: daysFromNow(28),
            status: ReminderStatus.PENDING,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      ),
    ]);

    const auditLogs = [
      { actorId: admin._id, action: "HEALTH_CENTRE_CREATED", entityType: "HealthCentre", entityId: healthCentre._id.toString(), description: "Seeded Molyko Integrated Health Centre." },
      { actorId: admin._id, action: "HEALTH_WORKER_CREATED", entityType: "User", entityId: healthWorker._id.toString(), description: "Seeded health worker Grace Ngeh." },
      { actorId: healthWorker._id, action: "PATIENT_CREATED", entityType: "PatientProfile", entityId: maryProfile._id.toString(), description: "Seeded patient profile for Mary Atia." },
      { actorId: healthWorker._id, action: "APPOINTMENT_CREATED", entityType: "Appointment", entityId: upcomingAppointment._id.toString(), description: "Seeded upcoming antenatal appointment." },
      { actorId: healthWorker._id, action: "SCAN_CREATED", entityType: "ScanRecord", entityId: scan._id.toString(), description: "Seeded routine scan record." },
    ];

    for (const log of auditLogs) {
      await AuditLog.findOneAndUpdate(
        { action: log.action, entityType: log.entityType, entityId: log.entityId },
        { $set: { ...log, actorId: new Types.ObjectId(log.actorId), createdAt: new Date() } },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      );
    }

    console.log(`
Seed completed successfully.

Demo records created or updated:
  Health centres: 1
  Health workers: 1
  Pregnant women: 2
  Appointments: upcoming, attended, missed
  Visit records, supplements, scans, follow-ups, reminders, and audit logs

Admin
  Phone: 670000001
  Email: admin@anc.local
  Password: Admin123!

Health Worker
  Phone: 670000002
  Email: worker@anc.local
  Password: Worker123!

Pregnant Woman 1
  Phone: 670000003
  Email: patient@anc.local
  Password: Patient123!

Pregnant Woman 2
  Phone: 670000004
  Email: patient2@anc.local
  Password: Patient123!
`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error("Seed failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
