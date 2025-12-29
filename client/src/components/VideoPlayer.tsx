import ReactPlayer from 'react-player';
import { useState, useRef, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  url: string;
  onError?: () => void;
  className?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ url, onError, className, autoPlay = true }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  // Reset state when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [url]);

  const handleError = (e: any) => {
    console.error("Player error:", e);
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  const handleReady = () => {
    setIsLoading(false);
  };

  const handleBuffer = () => {
    setIsLoading(true);
  };

  const handleBufferEnd = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn("relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10", className)}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={autoPlay}
        controls
        onError={handleError}
        onReady={handleReady}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
        config={{
          file: {
            forceHLS: url.endsWith('.m3u8'),
            attributes: {
              controlsList: 'nodownload',
              crossOrigin: 'anonymous',
            }
          }
        }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-sm font-medium text-white/80">Buffering...</span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-20">
          <div className="text-center p-6 max-w-md">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Stream Unavailable</h3>
            <p className="text-muted-foreground text-sm">
              We couldn't connect to this stream. It might be offline or geo-restricted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
