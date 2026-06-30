import { db } from "@/lib/db";
import { minutesToTime } from "@/lib/slots";
import type { StaffInput, ScheduleEntry } from "./staff.schema";

export const staffAdminService = {
  async getForEdit(id: string) {
    const s = await db.staff.findUnique({
      where: { id },
      include: {
        services: { select: { serviceId: true } },
        schedules: true,
      },
    });
    if (!s) return null;

    const schedule: Record<number, { start: string; end: string }> = {};
    for (const sc of s.schedules) {
      schedule[sc.dayOfWeek] = {
        start: minutesToTime(sc.startMin),
        end: minutesToTime(sc.endMin),
      };
    }

    return {
      id: s.id,
      name: s.name,
      title: s.title ?? "",
      bio: s.bio ?? "",
      image: s.image ?? "",
      email: s.email ?? "",
      phone: s.phone ?? "",
      sortOrder: s.sortOrder,
      isActive: s.isActive,
      serviceIds: s.services.map((x) => x.serviceId),
      schedule,
    };
  },

  async create(input: StaffInput, schedules: ScheduleEntry[]) {
    return db.staff.create({
      data: {
        name: input.name,
        title: input.title || null,
        bio: input.bio || null,
        image: input.image || null,
        email: input.email || null,
        phone: input.phone || null,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
        services: {
          create: input.serviceIds.map((serviceId) => ({ serviceId })),
        },
        schedules: { create: schedules },
      },
    });
  },

  async update(id: string, input: StaffInput, schedules: ScheduleEntry[]) {
    return db.$transaction(async (tx) => {
      await tx.staffService.deleteMany({ where: { staffId: id } });
      await tx.staffSchedule.deleteMany({ where: { staffId: id } });
      return tx.staff.update({
        where: { id },
        data: {
          name: input.name,
          title: input.title || null,
          bio: input.bio || null,
          image: input.image || null,
          email: input.email || null,
          phone: input.phone || null,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
          services: {
            create: input.serviceIds.map((serviceId) => ({ serviceId })),
          },
          schedules: { create: schedules },
        },
      });
    });
  },

  remove(id: string) {
    return db.staff.delete({ where: { id } });
  },
};
