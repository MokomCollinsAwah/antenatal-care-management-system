import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function seed() {
  const [
    { default: mongoose },
    { connectDB },
    { hashPassword },
    { UserRole, UserStatus },
    { default: HealthCentre },
    { default: User },
  ] = await Promise.all([
    import("mongoose"),
    import("../src/lib/db"),
    import("../src/lib/password"),
    import("../src/lib/constants"),
    import("../src/models/HealthCentre"),
    import("../src/models/User"),
  ]);

  try {
    await connectDB();

    const healthCentre = await HealthCentre.findOneAndUpdate(
      {
        name: "Molyko Integrated Health Centre",
        location: "Molyko, Buea",
      },
      {
        $set: {
          name: "Molyko Integrated Health Centre",
          location: "Molyko, Buea",
          phone: "670100100",
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    const admin = await User.findOneAndUpdate(
      {
        $or: [{ phone: "670000001" }, { email: "admin@anc.local" }],
      },
      {
        $set: {
          fullName: "System Administrator",
          phone: "670000001",
          email: "admin@anc.local",
          passwordHash: await hashPassword("Admin123!"),
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    ).select("+passwordHash");

    const healthWorker = await User.findOneAndUpdate(
      {
        $or: [{ phone: "670000002" }, { email: "worker@anc.local" }],
      },
      {
        $set: {
          fullName: "Grace Ngeh",
          phone: "670000002",
          email: "worker@anc.local",
          passwordHash: await hashPassword("Worker123!"),
          role: UserRole.HEALTH_WORKER,
          status: UserStatus.ACTIVE,
          healthCentreId: healthCentre._id,
          createdById: admin._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    ).select("+passwordHash");

    await User.findOneAndUpdate(
      {
        $or: [{ phone: "670000003" }, { email: "patient@anc.local" }],
      },
      {
        $set: {
          fullName: "Mary Atia",
          phone: "670000003",
          email: "patient@anc.local",
          passwordHash: await hashPassword("Patient123!"),
          role: UserRole.PREGNANT_WOMAN,
          status: UserStatus.ACTIVE,
          healthCentreId: healthCentre._id,
          createdById: healthWorker._id,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    console.log(`
Seed completed successfully.

Admin
  Phone: 670000001
  Email: admin@anc.local
  Password: Admin123!

Health Worker
  Phone: 670000002
  Email: worker@anc.local
  Password: Worker123!

Pregnant Woman
  Phone: 670000003
  Email: patient@anc.local
  Password: Patient123!
`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error(
    "Seed failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});

