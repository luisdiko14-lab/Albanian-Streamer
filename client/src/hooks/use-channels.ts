import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateChannelRequest, type UpdateChannelRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/channels
export function useChannels() {
  return useQuery({
    queryKey: [api.channels.list.path],
    queryFn: async () => {
      const res = await fetch(api.channels.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch channels");
      return api.channels.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/channels/:id
export function useChannel(id: number) {
  return useQuery({
    queryKey: [api.channels.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.channels.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch channel");
      return api.channels.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/channels
export function useCreateChannel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateChannelRequest) => {
      const res = await fetch(api.channels.create.path, {
        method: api.channels.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
           const error = api.channels.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create channel");
      }
      return api.channels.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.channels.list.path] });
      toast({ title: "Success", description: "Channel added successfully" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });
}

// PUT /api/channels/:id
export function useUpdateChannel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateChannelRequest) => {
      const url = buildUrl(api.channels.update.path, { id });
      const res = await fetch(url, {
        method: api.channels.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Channel not found");
        throw new Error("Failed to update channel");
      }
      return api.channels.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.channels.list.path] });
      toast({ title: "Success", description: "Channel updated successfully" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });
}

// DELETE /api/channels/:id
export function useDeleteChannel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.channels.delete.path, { id });
      const res = await fetch(url, { 
        method: api.channels.delete.method,
        credentials: "include" 
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Channel not found");
        throw new Error("Failed to delete channel");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.channels.list.path] });
      toast({ title: "Success", description: "Channel deleted" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });
}
