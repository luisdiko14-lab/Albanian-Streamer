import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("stream_url").notNull(),
  logo: text("logo_url"),
  category: text("category").default("General"),
  userAgent: text("user_agent"),
  isFavorite: boolean("is_favorite").default(false),
});

export const insertChannelSchema = createInsertSchema(channels).omit({ id: true });

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  mac: text("mac").notNull().unique(),
  name: text("name"),
  userId: text("user_id"), // linked to Discord ID
});

export const insertDeviceSchema = createInsertSchema(devices).omit({ id: true });
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
