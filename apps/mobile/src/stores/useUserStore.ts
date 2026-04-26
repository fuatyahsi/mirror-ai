import { create } from "zustand";
import type { NatalChart } from "@/types/astrology";
import type { BirthInfo, MysticProfile, UserProfile } from "@/types/profile";
import type { ReadingFeedback, ReadingOutput } from "@/types/readings";

type MemoryEvent = {
  id: string;
  event_type: string;
  source_type: string;
  source_id?: string;
  memory_key: string;
  memory_value: Record<string, unknown>;
  weight: number;
  created_at: string;
};

type UserState = {
  profile: UserProfile;
  readings: ReadingOutput[];
  feedback: ReadingFeedback[];
  memoryEvents: MemoryEvent[];
  setBirthInfo: (birth: BirthInfo) => void;
  completeOnboarding: (profile: MysticProfile) => void;
  setNatalChart: (chart: NatalChart) => void;
  addReading: (reading: ReadingOutput) => void;
  submitFeedback: (feedback: Omit<ReadingFeedback, "id" | "created_at">) => void;
};

export const useUserStore = create<UserState>((set) => ({
  profile: {
    birth: {},
    onboarding_completed: false,
    credits: 5
  },
  readings: [],
  feedback: [],
  memoryEvents: [],
  setBirthInfo: (birth) =>
    set((state) => ({
      profile: {
        ...state.profile,
        birth
      }
    })),
  completeOnboarding: (mysticProfile) =>
    set((state) => ({
      profile: {
        ...state.profile,
        mystic_profile: mysticProfile,
        onboarding_completed: true
      }
    })),
  setNatalChart: (chart) =>
    set((state) => ({
      profile: {
        ...state.profile,
        natal_chart: chart
      }
    })),
  addReading: (reading) =>
    set((state) => ({
      readings: [reading, ...state.readings]
    })),
  submitFeedback: (feedbackInput) =>
    set((state) => {
      const createdAt = new Date().toISOString();
      const feedback: ReadingFeedback = {
        ...feedbackInput,
        id: `feedback_${Date.now()}`,
        created_at: createdAt
      };

      const memoryEvent: MemoryEvent = {
        id: `memory_${Date.now()}`,
        event_type: "feedback_submitted",
        source_type: "reading_feedback",
        source_id: feedback.reading_id,
        memory_key: "reading_feedback_signal",
        memory_value: {
          score: feedback.score,
          accuracy_rating: feedback.accuracy_rating,
          emotional_resonance: feedback.emotional_resonance
        },
        weight: feedback.score === "accurate" ? 0.9 : feedback.score === "partial" ? 0.6 : 0.3,
        created_at: createdAt
      };

      return {
        feedback: [feedback, ...state.feedback],
        memoryEvents: [memoryEvent, ...state.memoryEvents]
      };
    })
}));
