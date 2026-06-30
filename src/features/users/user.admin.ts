import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ASSIGNABLE_ROLES } from "@/lib/permissions";
import type { CreateUserInput, UpdateUserInput } from "./user.schema";

// Panel accounts are those that can sign into /admin.
const PANEL_ROLES: Role[] = [...ASSIGNABLE_ROLES];

export const userAdminService = {
  list() {
    return db.user.findMany({
      where: { role: { in: PANEL_ROLES } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  },

  async getForEdit(id: string) {
    const u = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name ?? "",
      email: u.email,
      role: u.role,
    };
  },

  async create(input: CreateUserInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    return db.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        passwordHash,
      },
    });
  },

  async update(id: string, input: UpdateUserInput) {
    const data: {
      name: string;
      email: string;
      role: Role;
      passwordHash?: string;
    } = {
      name: input.name,
      email: input.email,
      role: input.role,
    };
    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 10);
    }
    return db.user.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.user.delete({ where: { id } });
  },

  countAdmins() {
    return db.user.count({ where: { role: "ADMIN" } });
  },
};
