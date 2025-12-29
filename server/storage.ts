import { db } from "./db";
import {
  channels,
  devices,
  type Channel,
  type InsertChannel,
  type UpdateChannelRequest,
  type Device,
  type InsertDevice,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getChannels(): Promise<Channel[]>;
  getChannel(id: number): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, updates: UpdateChannelRequest): Promise<Channel>;
  deleteChannel(id: number): Promise<void>;
  // User methods
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Device methods
  getDevices(): Promise<Device[]>;
  getDeviceByMac(mac: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  linkDevice(mac: string, userId: string): Promise<Device>;
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

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getDevices(): Promise<Device[]> {
    return await db.select().from(devices);
  }

  async getDeviceByMac(mac: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.mac, mac));
    return device;
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db.insert(devices).values(insertDevice).returning();
    return device;
  }

  async linkDevice(mac: string, userId: string): Promise<Device> {
    const [device] = await db
      .update(devices)
      .set({ userId })
      .where(eq(devices.mac, mac))
      .returning();
    return device;
  }
}

export const storage = new DatabaseStorage();
