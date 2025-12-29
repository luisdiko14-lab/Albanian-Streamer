import { Play, Edit2, Trash2, Heart, Tv2 } from "lucide-react";
import { useState } from "react";
import { type Channel } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  onPlay: (channel: Channel) => void;
  onEdit: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
  onToggleFavorite: (channel: Channel) => void;
}

export function ChannelCard({ 
  channel, 
  isActive, 
  onPlay, 
  onEdit, 
  onDelete,
  onToggleFavorite
}: ChannelCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "group relative rounded-xl overflow-hidden transition-all duration-300 border border-white/5",
        "hover:shadow-xl hover:shadow-black/50 hover:scale-[1.02]",
        isActive ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02] z-10" : "bg-card"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image / Gradient */}
      <div className="aspect-video w-full bg-secondary relative">
        {channel.logo ? (
          <img 
            src={channel.logo} 
            alt={channel.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
            onError={(e) => {
              // Fallback to gradient if image fails
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-zinc-800', 'to-zinc-900');
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <span className="text-4xl font-display font-bold text-white/10">{channel.name.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
        
        {/* Play Overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          isActive || isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button
            onClick={() => onPlay(channel)}
            className="p-4 rounded-full bg-primary/90 text-white hover:bg-primary hover:scale-110 transition-all shadow-lg shadow-black/50"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        </div>

        {/* Status Badge */}
        {isActive && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-xs font-bold rounded shadow-lg animate-pulse">
            LIVE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-semibold text-lg leading-tight truncate pr-2" title={channel.name}>
              {channel.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">
              {channel.category || "General"}
            </p>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(channel); }}
            className={cn(
              "transition-colors duration-200",
              channel.isFavorite ? "text-primary fill-primary" : "text-muted-foreground hover:text-white"
            )}
          >
            <Heart className={cn("w-5 h-5", channel.isFavorite && "fill-current")} />
          </button>
        </div>

        {/* Device Linking Button (New) */}
        <div className={cn(
          "absolute bottom-4 left-4 flex gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <button 
            onClick={async (e) => { 
              e.stopPropagation(); 
              const mac = prompt("Enter LG WebOS MAC Address (e.g. AA:BB:CC:DD:EE:FF):");
              if (mac) {
                const res = await fetch("/api/devices/link", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ mac })
                });
                if (res.ok) alert("Device linked successfully!");
                else alert("Failed to link device. Are you logged in?");
              }
            }}
            className="p-2 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary-foreground transition-colors border border-primary/20"
            title="Link LG TV"
          >
            <Tv2 className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons (visible on hover) */}
        <div className={cn(
          "absolute bottom-4 right-4 flex gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(channel); }}
            className="p-2 rounded-lg bg-secondary hover:bg-white/20 text-white transition-colors border border-white/10"
            title="Edit Channel"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(channel); }}
            className="p-2 rounded-lg bg-secondary hover:bg-red-500/20 hover:text-red-500 text-white transition-colors border border-white/10"
            title="Delete Channel"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
