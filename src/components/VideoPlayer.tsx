import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onPlay?: () => void;
}
export function VideoPlayer({
  src,
  poster,
  title,
  onPlay
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration || 0);
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().then(() => {
        onPlay?.();
      }).catch(error => {
        console.error('Video play error:', error);
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  };
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time % 3600 / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 5000);
  };
  const handleInteraction = () => {
    resetControlsTimeout();
  };
  return <div ref={containerRef} className="relative w-full aspect-video bg-background rounded-none sm:rounded-lg overflow-hidden group" onMouseMove={handleInteraction} onTouchStart={handleInteraction} onMouseLeave={() => isPlaying && setShowControls(false)}>
      <video ref={videoRef} src={src} poster={poster} className="w-full h-full object-contain" preload="metadata" playsInline onClick={togglePlay} />

      {/* Play Button Overlay */}
      {!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-background/30 cursor-pointer" onClick={togglePlay}>
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/90 flex items-center justify-center hover:scale-110 transition-transform">
            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 sm:p-4 pb-[max(12px,env(safe-area-inset-bottom))] transition-opacity duration-300 z-50 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4">
          <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} className="cursor-pointer" />
        </div>

        <div className="flex items-center justify-between gap-1">
          {/* Left Controls - Play button only on mobile */}
          <div className="flex items-center gap-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              {isPlaying ? <Pause className="w-4 h-4 sm:w-6 sm:h-6" /> : <Play className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" />}
            </Button>

            {/* Skip buttons - hidden on mobile */}
            <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex">
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => skip(10)} className="h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex">
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Volume - Only on desktop */}
            
          </div>

          {/* Center - Time display (compact on mobile) */}
          <div className="flex-1 min-w-0 flex items-start justify-start">
            <span className="text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
              {formatTime(currentTime)}<span className="hidden sm:inline"> / {formatTime(duration)}</span>
            </span>
          </div>

          {/* Right Controls - Fullscreen ALWAYS visible */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {title && <span className="hidden lg:inline text-sm font-medium mr-2 max-w-xs truncate">{title}</span>}
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 bg-primary/20 hover:bg-primary/40">
              {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>;
}