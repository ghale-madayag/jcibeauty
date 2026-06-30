import { db } from "@/lib/db";

export type StaffMember = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  image: string | null;
};

export const staffService = {
  async list(): Promise<StaffMember[]> {
    const rows = await db.staff.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, title: true, bio: true, image: true },
    });
    return rows;
  },

  /** Active staff who can perform a given service. */
  async forService(serviceId: string): Promise<StaffMember[]> {
    const rows = await db.staff.findMany({
      where: { isActive: true, services: { some: { serviceId } } },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, title: true, bio: true, image: true },
    });
    return rows;
  },

  /** Active staff with the list of service ids each can perform. */
  async listWithServiceIds(): Promise<(StaffMember & { serviceIds: string[] })[]> {
    const rows = await db.staff.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
        image: true,
        services: { select: { serviceId: true } },
      },
    });
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      title: s.title,
      bio: s.bio,
      image: s.image,
      serviceIds: s.services.map((x) => x.serviceId),
    }));
  },
};
