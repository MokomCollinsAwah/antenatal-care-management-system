import { connectDB } from "@/lib/db";
import { AppointmentStatus, ReminderStatus, ReminderType } from "@/lib/constants";
import Appointment from "@/models/Appointment";
import Reminder from "@/models/Reminder";
import { createAuditLog } from "@/server/repositories/auditLogRepository";

export async function runMissedAppointmentChecker() {
  try {
    await connectDB();
    const now = new Date();
    const overdueAppointments = await Appointment.find({
      status: AppointmentStatus.SCHEDULED,
      scheduledDateTime: { $lt: now },
    })
      .select("_id patientId")
      .lean();

    for (const appointment of overdueAppointments) {
      const updated = await Appointment.updateOne(
        { _id: appointment._id, status: AppointmentStatus.SCHEDULED },
        { $set: { status: AppointmentStatus.MISSED } },
      );
      if (!updated.modifiedCount) continue;

      const existingReminder = await Reminder.exists({
        appointmentId: appointment._id,
        reminderType: ReminderType.FOLLOW_UP,
        title: "Missed Appointment",
      });
      if (!existingReminder) {
        await Reminder.create({
          patientId: appointment.patientId,
          appointmentId: appointment._id,
          title: "Missed Appointment",
          message: "You missed an antenatal appointment. Please contact your health worker for follow-up.",
          reminderType: ReminderType.FOLLOW_UP,
          dueDateTime: now,
          status: ReminderStatus.DUE,
        });
      }

      await createAuditLog({
        action: "APPOINTMENT_AUTO_MARKED_MISSED",
        entityType: "Appointment",
        entityId: appointment._id.toString(),
        description: "Automatically marked appointment as missed.",
      });
    }
  } catch (error) {
    console.error("Missed appointment checker failed", error);
  }
}

export async function runDueReminderChecker() {
  try {
    await connectDB();
    await Reminder.updateMany(
      { status: ReminderStatus.PENDING, dueDateTime: { $lte: new Date() } },
      { $set: { status: ReminderStatus.DUE } },
    );
  } catch (error) {
    console.error("Due reminder checker failed", error);
  }
}

export async function runDashboardMaintenance() {
  await Promise.all([runMissedAppointmentChecker(), runDueReminderChecker()]);
}
