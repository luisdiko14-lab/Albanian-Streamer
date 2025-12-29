import { useState, useMemo } from "react";
import { useChannels, useCreateChannel, useUpdateChannel, useDeleteChannel } from "@/hooks/use-channels";
import { ChannelCard } from "@/components/ChannelCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ChannelForm } from "@/components/ChannelForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  MonitorPlay, 
  Download, 
  LayoutGrid, 
  ListFilter,
  Loader2,
  Tv2,
  LogOut,
  User as UserIcon,
  LogIn
} from "lucide-react";
import { type Channel, type User } from "@shared/schema";
import { api } from "@shared/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: channels, isLoading } = useChannels();
  const { data: user } = useQuery<User>({ queryKey: ["/api/me"] });
  const { toast } = useToast();
  
  const createMutation = useCreateChannel();
  const updateMutation = useUpdateChannel();
  const deleteMutation = useDeleteChannel();

  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  // Derived state
  const categories = useMemo(() => {
    if (!channels) return ["All"];
    const cats = new Set(channels.map(c => c.category || "General"));
    return ["All", "Favorites", ...Array.from(cats).sort()];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    if (!channels) return [];
    return channels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "All" 
        ? true 
        : filterCategory === "Favorites" 
          ? channel.isFavorite 
          : channel.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, filterCategory]);

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
  };

  const handleDelete = (channel: Channel) => {
    if (confirm(`Are you sure you want to delete ${channel.name}?`)) {
      deleteMutation.mutate(channel.id);
      if (activeChannel?.id === channel.id) setActiveChannel(null);
    }
  };

  const handleToggleFavorite = (channel: Channel) => {
    updateMutation.mutate({ 
      id: channel.id, 
      isFavorite: !channel.isFavorite 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
            <Tv2 className="absolute inset-0 m-auto w-10 h-10 text-white" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <MonitorPlay className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-white">
                AlbStream<span className="text-primary">.</span>
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search channels..." 
                className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="hidden sm:flex border-white/10 hover:bg-white/5 gap-2"
              asChild
            >
              <a href={api.channels.exportM3u.path} target="_blank" download="playlist.m3u">
                <Download className="w-4 h-4" />
                <span>Export M3U</span>
              </a>
            </Button>
            
            <Button 
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl gap-2 hover:scale-105 transition-all"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Channel</span>
            </Button>

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Avatar className="h-9 w-9 border border-white/10">
                  <AvatarImage src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-white"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.reload();
                  }}
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="gap-2 text-muted-foreground hover:text-white"
                onClick={() => window.location.href = "/api/auth/login"}
                data-testid="button-login"
              >
                <LogIn className="h-5 w-5" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Featured Player Area */}
        <section className="w-full">
          {activeChannel ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="aspect-video w-full max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                <VideoPlayer url={activeChannel.url} />
              </div>
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {activeChannel.name}
                  </h2>
                  <p className="text-muted-foreground">{activeChannel.category}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveChannel(null)} className="text-muted-foreground hover:text-white">
                  Close Player
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-[400px] rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/5 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent group-hover:opacity-20 transition-opacity duration-1000" />
              
              <MonitorPlay className="w-20 h-20 text-white/20 mb-6 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-500" />
              <h2 className="text-3xl font-display font-bold text-white mb-2 relative z-10">Ready to Watch?</h2>
              <p className="text-muted-foreground max-w-md relative z-10">Select a channel from the grid below to start streaming live content instantly.</p>
              
              <div className="mt-8 flex gap-2 relative z-10">
                {filteredChannels.slice(0, 3).map(channel => (
                  <button 
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <PlaySmallIcon /> {channel.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
          <div className="flex items-center gap-1 pr-4 border-r border-white/10">
            <ListFilter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${filterCategory === cat 
                  ? "bg-white text-black shadow-lg shadow-white/10 scale-105" 
                  : "bg-secondary/50 text-muted-foreground hover:text-white hover:bg-secondary"}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Channel Grid */}
        <section>
          {filteredChannels.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex p-4 rounded-full bg-secondary mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No channels found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel?.id === channel.id}
                  onPlay={setActiveChannel}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Dialogs */}
      <ChannelForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(data) => {
          createMutation.mutate(data, {
            onSuccess: () => setIsCreateOpen(false)
          });
        }}
        isPending={createMutation.isPending}
        title="Add New Channel"
      />

      {editingChannel && (
        <ChannelForm
          open={!!editingChannel}
          onOpenChange={(open) => !open && setEditingChannel(null)}
          onSubmit={(data) => {
            if (editingChannel) {
              updateMutation.mutate({ id: editingChannel.id, ...data }, {
                onSuccess: () => setEditingChannel(null)
              });
            }
          }}
          isPending={updateMutation.isPending}
          initialData={editingChannel}
          title="Edit Channel"
        />
      )}
    </div>
  );
}

function PlaySmallIcon() {
  return (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
