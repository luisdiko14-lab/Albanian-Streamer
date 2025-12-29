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

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;

export type CreateChannelRequest = InsertChannel;
export type UpdateChannelRequest = Partial<InsertChannel>;
