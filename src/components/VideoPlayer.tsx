import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  Component } from
'react';
import {
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  Volume2Icon,
  Volume1Icon,
  VolumeXIcon } from
'lucide-react';
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
export function VideoPlayer() {
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
  const VolumeIconComponent =
  isMuted || volume === 0 ?
  VolumeXIcon :
  volume < 0.5 ?
  Volume1Icon :
  Volume2Icon;
  return (
    <div
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
        className="w-full h-full object-cover cursor-pointer"
        autoPlay
        muted
        loop
        playsInline
        // REPLACE THIS URL WITH YOUR HOSTED MP4 FILE URL
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" />
      

      {/* Big play button overlay when paused */}
      {!isPlaying &&
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-5">
            <PlayIcon className="w-12 h-12 text-white fill-white" />
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