"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { api } from "./_generated/api";

const JWT_SECRET: string = process.env.JWT_SECRET || "hr360-secret-key";

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<{ token: string; user: any }> => {
    const user: any = await ctx.runQuery(api.users.getByEmail, { email: args.email });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword: boolean = await bcrypt.compare(args.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token: string = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        position: user.position,
        joinDate: user.joinDate,
        salary: user.salary,
        isActive: user.isActive,
      },
    };
  },
});

export const register = action({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("admin"), v.literal("hr"), v.literal("employee"), v.literal("candidate")),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    salary: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; userId: any }> => {
    const existingUser: any = await ctx.runQuery(api.users.getByEmail, { email: args.email });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash: string = await bcrypt.hash(args.password, 10);

    const userId: any = await ctx.runMutation(api.users.create, {
      email: args.email,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
      department: args.department,
      position: args.position,
      salary: args.salary,
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });

    return { success: true, userId };
  },
});

export const verifyToken = action({
  args: { token: v.string() },
  handler: async (ctx, args): Promise<any> => {
    try {
      const decoded: JwtPayload = jwt.verify(args.token, JWT_SECRET) as JwtPayload;
      const user: any = await ctx.runQuery(api.users.get, { id: decoded.userId });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        position: user.position,
        joinDate: user.joinDate,
        salary: user.salary,
        isActive: user.isActive,
      };
    } catch {
      throw new Error("Invalid token");
    }
  },
});
