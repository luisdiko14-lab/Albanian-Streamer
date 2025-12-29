import { db } from "./db";
import {
  channels,
  type Channel,
  type InsertChannel,
  type UpdateChannelRequest,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getChannels(): Promise<Channel[]>;
  getChannel(id: number): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, updates: UpdateChannelRequest): Promise<Channel>;
  deleteChannel(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getChannels(): Promise<Channel[]> {
    return await db.select().from(channels).orderBy(channels.id);
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const [channel] = await db
      .insert(channels)
      .values(insertChannel)
      .returning();
    return channel;
  }

  async updateChannel(id: number, updates: UpdateChannelRequest): Promise<Channel> {
    const [updated] = await db
      .update(channels)
      .set(updates)
      .where(eq(channels.id, id))
      .returning();
    return updated;
  }

  async deleteChannel(id: number): Promise<void> {
    await db.delete(channels).where(eq(channels.id, id));
  }
}

export const storage = new DatabaseStorage();
