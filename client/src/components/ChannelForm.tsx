import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChannelSchema, type InsertChannel, type Channel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ChannelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertChannel) => void;
  isPending: boolean;
  initialData?: Channel;
  title: string;
}

export function ChannelForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isPending, 
  initialData, 
  title 
}: ChannelFormProps) {
  const form = useForm<InsertChannel>({
    resolver: zodResolver(insertChannelSchema),
    defaultValues: initialData || {
      name: "",
      url: "",
      logo: "",
      category: "General",
      userAgent: "",
      isFavorite: false
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    if (!initialData) form.reset(); // Only reset on create
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the stream details below. HLS (.m3u8) streams work best.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input 
              id="name" 
              {...form.register("name")} 
              className="bg-secondary border-white/10 focus:border-primary/50"
              placeholder="e.g. TV Klan HD"
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Stream URL</Label>
            <Input 
              id="url" 
              {...form.register("url")} 
              className="bg-secondary border-white/10 font-mono text-xs"
              placeholder="http://example.com/stream.m3u8"
            />
            {form.formState.errors.url && (
              <p className="text-destructive text-xs">{form.formState.errors.url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                {...form.register("category")}
                className="bg-secondary border-white/10" 
                placeholder="News, Sports..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL (Optional)</Label>
              <Input 
                id="logo" 
                {...form.register("logo")} 
                className="bg-secondary border-white/10"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userAgent">User Agent (Optional)</Label>
            <Input 
              id="userAgent" 
              {...form.register("userAgent")} 
              className="bg-secondary border-white/10 font-mono text-xs"
              placeholder="Mozilla/5.0..."
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isFavorite" 
              checked={form.watch("isFavorite") || false}
              onCheckedChange={(c) => form.setValue("isFavorite", c === true)}
              className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label htmlFor="isFavorite" className="cursor-pointer">Add to Favorites</Label>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-white min-w-[100px]"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? "Save Changes" : "Add Channel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
