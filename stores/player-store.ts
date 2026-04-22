"use client";

import { create } from "zustand";

export interface PlayerTrack {
  id: string;
  title: string;
  audioUrl: string;
  color?: string;
  duration?: string;
}

interface PlayerState {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  audioDuration: number;
  play: (track: PlayerTrack) => void;
  pause: () => void;
  toggle: (track: PlayerTrack) => void;
  stop: () => void;
  seek: (time: number) => void;
}

let _audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!_audio) {
    _audio = new Audio();
    _audio.addEventListener("ended", () => {
      usePlayerStore.setState({ isPlaying: false });
    });
    _audio.addEventListener("timeupdate", () => {
      usePlayerStore.setState({ currentTime: _audio!.currentTime });
    });
    _audio.addEventListener("loadedmetadata", () => {
      usePlayerStore.setState({ audioDuration: _audio!.duration || 0, currentTime: 0 });
    });
    _audio.addEventListener("durationchange", () => {
      if (_audio!.duration && isFinite(_audio!.duration)) {
        usePlayerStore.setState({ audioDuration: _audio!.duration });
      }
    });
  }
  return _audio;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  audioDuration: 0,

  play: (track) => {
    const audio = getAudio();
    if (!audio) return;
    const current = get().currentTrack;
    if (current?.id !== track.id) {
      audio.src = track.audioUrl;
      audio.load();
      set({ currentTime: 0, audioDuration: 0 });
    }
    audio.play().catch(() => {});
    set({ currentTrack: track, isPlaying: true });
  },

  pause: () => {
    getAudio()?.pause();
    set({ isPlaying: false });
  },

  toggle: (track) => {
    const { currentTrack, isPlaying, play, pause } = get();
    if (currentTrack?.id === track.id && isPlaying) {
      pause();
    } else {
      play(track);
    }
  },

  stop: () => {
    const audio = getAudio();
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    set({ currentTrack: null, isPlaying: false, currentTime: 0, audioDuration: 0 });
  },

  seek: (time: number) => {
    const audio = getAudio();
    if (!audio) return;
    const clamped = Math.max(0, Math.min(time, audio.duration || 0));
    audio.currentTime = clamped;
    set({ currentTime: clamped });
  },
}));
