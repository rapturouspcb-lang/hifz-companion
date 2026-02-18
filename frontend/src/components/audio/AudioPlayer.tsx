'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { audioApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

interface Reciter {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  style: string;
}

interface AudioPlayerProps {
  currentAyahId?: number;
  ayahIds?: number[];
  onAyahChange?: (ayahId: number) => void;
}

type RepeatMode = 'none' | 'one' | 'range';

export function AudioPlayer({
  currentAyahId,
  ayahIds = [],
  onAyahChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string>('abdul_basit_murattal');
  const [showSettings, setShowSettings] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Fetch reciters
  useEffect(() => {
    audioApi.getReciters().then((res) => {
      setReciters(res.data.data.reciters);
    });
  }, []);

  // Update audio URL when ayah or reciter changes
  useEffect(() => {
    if (currentAyahId) {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/audio/ayah/${currentAyahId}?reciter=${selectedReciter}`;
      setAudioUrl(url);
      setCurrentIndex(ayahIds.indexOf(currentAyahId));
    }
  }, [currentAyahId, selectedReciter, ayahIds]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => handleTrackEnd();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [repeatMode, currentIndex, ayahIds]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      audioRef.current?.play();
    } else if (currentIndex < ayahIds.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextAyahId = ayahIds[nextIndex];
      setCurrentIndex(nextIndex);
      onAyahChange?.(nextAyahId);
    } else if (repeatMode === 'range') {
      setCurrentIndex(0);
      onAyahChange?.(ayahIds[0]);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, currentIndex, ayahIds, onAyahChange]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skipToAyah = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < ayahIds.length) {
      setCurrentIndex(newIndex);
      onAyahChange?.(ayahIds[newIndex]);
    }
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['none', 'one', 'range'];
    const currentModeIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentModeIndex + 1) % modes.length]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5];

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Progress Bar */}
      <div
        className="progress-bar mb-4 cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="progress-fill"
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Skip Back */}
        <button
          onClick={() => skipToAyah('prev')}
          disabled={currentIndex <= 0}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-4 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={() => skipToAyah('next')}
          disabled={currentIndex >= ayahIds.length - 1}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
        </div>

        {/* Repeat Mode */}
        <button
          onClick={cycleRepeatMode}
          className={cn(
            'p-2 rounded-full transition-colors',
            repeatMode !== 'none'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="w-5 h-5" />
          ) : (
            <Repeat className="w-5 h-5" />
          )}
        </button>

        {/* Playback Speed */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              'p-2 rounded-full',
              playbackRate !== 1
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <Settings className="w-5 h-5" />
          </button>

          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-48">
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Playback Speed</p>
                <div className="flex gap-1">
                  {playbackRates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        if (audioRef.current) {
                          audioRef.current.playbackRate = rate;
                        }
                      }}
                      className={cn(
                        'px-3 py-1 text-sm rounded',
                        playbackRate === rate
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Reciter</p>
                <select
                  value={selectedReciter}
                  onChange={(e) => setSelectedReciter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  {reciters.map((reciter) => (
                    <option key={reciter.id} value={reciter.id}>
                      {reciter.nameEnglish} ({reciter.style})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reciter Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          {reciters.find(r => r.id === selectedReciter)?.nameArabic}
        </p>
      </div>
    </div>
  );
}
