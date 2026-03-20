import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  } from
'react';
import {
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  Volume2Icon,
  Volume1Icon,
  VolumeXIcon,
  MaximizeIcon,
  MinimizeIcon } from
'lucide-react';
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
export function VideoPlayer() {
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Auto-hide controls after 3 seconds of inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setIsVolumeOpen(false);
      }
    }, 3000);
  }, []);
  // Show controls on any interaction
  const handleMouseMove = () => resetHideTimer();
  const handleMouseLeave = () => {
    if (videoRef.current && !videoRef.current.paused) {
      setShowControls(false);
      setIsVolumeOpen(false);
    }
  };
  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      if (video.duration) {
        setProgress(video.currentTime / video.duration * 100);
        setCurrentTime(video.currentTime);
      }
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      setShowControls(true);
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);
  // Initial hide timer
  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetHideTimer]);
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      resetHideTimer();
    } else {
      video.pause();
    }
  };
  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    resetHideTimer();
  };
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    if (isMuted && volume === 0) {
      setVolume(0.5);
      video.volume = 0.5;
    }
    resetHideTimer();
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
    resetHideTimer();
  };
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    video.currentTime = percentage * video.duration;
    resetHideTimer();
  };
  const handleVideoClick = () => {
    togglePlay();
  };
  const toggleFullscreen = async () => {
    const player = playerRef.current;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!player && !video) return;
    try {
      const orientation = (screen as any).orientation as { lock?: (o: string) => Promise<void> | void; unlock?: () => void };
      const lockLandscape = async () => {
        try {
          await orientation?.lock?.('landscape');
        } catch {
          // Ignore if the browser blocks orientation locking.
        }
      };
      const unlockOrientation = async () => {
        try {
          orientation?.unlock?.();
        } catch {
          // Ignore if the browser blocks unlocking.
        }
      };

      if (document.fullscreenElement) {
        await document.exitFullscreen();
        await unlockOrientation();
      } else {
        await lockLandscape();
        // Prefer the iOS Safari fullscreen API so it can honor landscape better.
        if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        } else if (video?.requestFullscreen) {
          await video.requestFullscreen();
        } else if (player?.requestFullscreen) {
          await player.requestFullscreen();
        }
      }
    } catch {
      // Ignore fullscreen errors when browser blocks request.
    }
    resetHideTimer();
  };
  const VolumeIconComponent =
  isMuted || volume === 0 ?
  VolumeXIcon :
  volume < 0.5 ?
  Volume1Icon :
  Volume2Icon;
  return (
    <div
      ref={playerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_0_60px_rgba(46,125,50,0.3)] aspect-video select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleVideoClick}>
      
      <style>{`
        input[type="range"].volume-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          width: 80px;
          height: 4px;
        }
        input[type="range"].volume-slider::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.3);
        }
        input[type="range"].volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          margin-top: -5px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        input[type="range"].volume-slider::-moz-range-track {
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.3);
        }
        input[type="range"].volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          border: none;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
      `}</style>

      <video
        ref={videoRef}
        className={`w-full h-full cursor-pointer ${isFullscreen ? 'object-contain' : 'object-cover'}`}
        autoPlay
        muted
        loop
        playsInline
        src="/videos/why-so-many-promo.mp4" />
      
      {/* Always-visible quick mute toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-black/55 hover:bg-black/70 text-white px-3 py-2 backdrop-blur-md border border-white/25 transition-colors focus:outline-none"
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}>
        <VolumeIconComponent className="w-4 h-4" />
        <span className="text-xs font-semibold tracking-wide">
          {isMuted || volume === 0 ? 'Unmute' : 'Mute'}
        </span>
      </button>


      {/* Big play button overlay when paused */}
      {!isPlaying &&
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 sm:p-4 md:p-5">
            <PlayIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white fill-white" />
          </div>
        </div>
      }

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-4 pt-10">
          {/* Progress bar */}
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/progress hover:h-2.5 transition-all duration-200"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Video progress">
            
            <div
              className="h-full bg-gradient-to-r from-[#2E7D32] to-[#43A047] rounded-full relative transition-[width] duration-150 ease-linear"
              style={{
                width: `${progress}%`
              }}>
              
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200" />
            </div>
          </div>

          {/* Control buttons row */}
          <div className="flex items-center justify-between gap-3">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="text-white hover:text-[#43A047] p-1.5 rounded-lg transition-colors focus:outline-none"
                aria-label={isPlaying ? 'Pause' : 'Play'}>
                
                {isPlaying ?
                <PauseIcon className="w-5 h-5 fill-current" /> :

                <PlayIcon className="w-5 h-5 fill-current" />
                }
              </button>

              <button
                onClick={restart}
                className="text-white hover:text-[#43A047] p-1.5 rounded-lg transition-colors focus:outline-none"
                aria-label="Restart video">
                
                <RotateCcwIcon className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[#43A047] p-1.5 rounded-lg transition-colors focus:outline-none"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                {isFullscreen ?
                <MinimizeIcon className="w-4.5 h-4.5" /> :
                <MaximizeIcon className="w-4.5 h-4.5" />
                }
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 relative">
                <button
                  onClick={toggleMute}
                  onMouseEnter={() => setIsVolumeOpen(true)}
                  className="text-white hover:text-[#43A047] p-1.5 rounded-lg transition-colors focus:outline-none"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  
                  <VolumeIconComponent className="w-5 h-5" />
                </button>

                <div
                  className={`flex items-center overflow-hidden transition-all duration-300 ${isVolumeOpen ? 'w-20 opacity-100 ml-1' : 'w-0 opacity-0'}`}
                  onMouseLeave={() => setIsVolumeOpen(false)}>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                    aria-label="Volume" />
                  
                </div>
              </div>

              {/* Time display */}
              <span className="text-white/80 text-xs font-mono ml-2 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>);

}