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
  play: (track: PlayerTrack) => void;
  pause: () => void;
  toggle: (track: PlayerTrack) => void;
  stop: () => void;
}

let _audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!_audio) {
    _audio = new Audio();
    _audio.addEventListener("ended", () => {
      usePlayerStore.setState({ isPlaying: false });
    });
  }
  return _audio;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,

  play: (track) => {
    const audio = getAudio();
    if (!audio) return;
    const current = get().currentTrack;
    if (current?.id !== track.id) {
      audio.src = track.audioUrl;
      audio.load();
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
    set({ currentTrack: null, isPlaying: false });
  },
}));
