import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";

async function seedDatabase() {
  const existing = await storage.getChannels();
  if (existing.length === 0) {
    console.log("Seeding database with Albanian channels...");
    
    // TV Klan (Verified URL)
    await storage.createChannel({
      name: "TV Klan",
      url: "http://188.138.9.157:8081/streamrtmp/tvklan2/playlist.m3u8",
      category: "General",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/TV_Klan_logo.svg/1200px-TV_Klan_logo.svg.png",
      isFavorite: true
    });

    // Added Albanian Channels
    const albanianChannels = [
      { name: "Top Channel", url: "http://80.78.76.101:8000/top_channel/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Top_Channel_Albania_logo.svg" },
      { name: "Vizion Plus", url: "http://80.78.76.101:8000/vizion_plus/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Vizion_Plus_logo.png" },
      { name: "RTSH 1", url: "http://80.78.76.101:8000/rtsh_1/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/RTSH_logo.svg/1200px-RTSH_logo.svg.png" },
      { name: "Klan Kosova", url: "http://80.78.76.101:8000/klan_kosova/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Klan_Kosova_Logo.svg/2560px-Klan_Kosova_Logo.svg.png" },
      { name: "News 24", url: "http://80.78.76.101:8000/news_24/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/News24_Albania.png" }
    ];

    for (const ch of albanianChannels) {
      await storage.createChannel({
        ...ch,
        category: "Albanian",
        isFavorite: false
      });
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Authentication
  setupAuth(app);

  // Seed data on startup
  seedDatabase();

  // Device Linking
  app.post("/api/devices/link", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { mac } = req.body;
    if (!mac) return res.status(400).json({ message: "MAC address required" });
    
    let device = await storage.getDeviceByMac(mac);
    if (!device) {
      device = await storage.createDevice({ mac, name: "LG WebOS TV" });
    }
    
    const updated = await storage.linkDevice(mac, (req.user as any).id);
    res.json(updated);
  });

  // API Routes
  app.get(api.channels.list.path, async (req, res) => {
    const channels = await storage.getChannels();
    res.json(channels);
  });

  app.get(api.channels.get.path, async (req, res) => {
    const channel = await storage.getChannel(Number(req.params.id));
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    res.json(channel);
  });

  app.post(api.channels.create.path, async (req, res) => {
    try {
      const input = api.channels.create.input.parse(req.body);
      const channel = await storage.createChannel(input);
      res.status(201).json(channel);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.channels.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existing = await storage.getChannel(id);
      if (!existing) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const input = api.channels.update.input.parse(req.body);
      const updated = await storage.updateChannel(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.channels.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getChannel(id);
    if (!existing) {
      return res.status(404).json({ message: "Channel not found" });
    }
    await storage.deleteChannel(id);
    res.status(204).send();
  });

  // M3U Export Route
  app.get(api.channels.exportM3u.path, async (req, res) => {
    const channels = await storage.getChannels();
    
    let m3u = "#EXTM3U\n";
    
    for (const channel of channels) {
      // #EXTINF:-1 tvg-logo="[logo]" group-title="[category]",[name]
      // [url]
      const logoAttr = channel.logo ? ` tvg-logo="${channel.logo}"` : "";
      const groupAttr = channel.category ? ` group-title="${channel.category}"` : "";
      
      m3u += `#EXTINF:-1${logoAttr}${groupAttr},${channel.name}\n`;
      m3u += `${channel.url}\n`;
    }

    res.header("Content-Type", "text/plain");
    res.header("Content-Disposition", 'attachment; filename="playlist.m3u"');
    res.send(m3u);
  });

  return httpServer;
}
