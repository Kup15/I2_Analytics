import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubePlayerHandle {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
}

interface Props {
  videoId: string;
  className?: string;
}

let apiLoadPromise: Promise<void> | null = null;

function loadIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });
  return apiLoadPromise;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(({ videoId, className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => {
      try { return playerRef.current?.getCurrentTime?.() ?? 0; } catch { return 0; }
    },
    seekTo: (seconds: number) => {
      try { playerRef.current?.seekTo?.(seconds, true); } catch { /* ignore */ }
    },
    play:  () => { try { playerRef.current?.playVideo?.();  } catch { /* ignore */ } },
    pause: () => { try { playerRef.current?.pauseVideo?.(); } catch { /* ignore */ } },
  }), []);

  useEffect(() => {
    let cancelled = false;
    loadIframeAPI().then(() => {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
      });
    });
    return () => {
      cancelled = true;
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
      playerRef.current = null;
    };
  }, [videoId]);

  return (
    <div className={className ?? 'aspect-video w-full overflow-hidden rounded-xl bg-black'}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';
export default YouTubePlayer;
