import { action } from "./_generated/server";
import { api } from "./_generated/api";
import bcrypt from "bcryptjs";

export const seedUsers = action(async (ctx) => {
  const users = [
    {
      email: "admin@hr360.com",
      password: "password",
      firstName: "System",
      lastName: "Admin",
      role: "admin" as const,
      department: "IT",
      position: "System Administrator",
      salary: 100000,
    },
    {
      email: "hr@hr360.com",
      password: "password",
      firstName: "HR",
      lastName: "Manager",
      role: "hr" as const,
      department: "Human Resources",
      position: "HR Manager",
      salary: 80000,
    },
    {
      email: "employee@hr360.com",
      password: "password",
      firstName: "John",
      lastName: "Doe",
      role: "employee" as const,
      department: "Engineering",
      position: "Software Engineer",
      salary: 70000,
    },
    {
      email: "candidate@hr360.com",
      password: "password",
      firstName: "Jane",
      lastName: "Smith",
      role: "candidate" as const,
      department: "Engineering",
      position: "Frontend Developer",
      salary: 65000,
    },
  ];

  for (const userData of users) {
    const existingUser = await ctx.runQuery(api.users.getByEmail, { email: userData.email });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      await ctx.runMutation(api.users.create, {
        ...userData,
        passwordHash,
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
      });
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }

  return { success: true, message: "Users seeded successfully" };
});
