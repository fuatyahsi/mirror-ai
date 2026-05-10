import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Locale } from "@/i18n";
import type { NatalChart, SynastryReport } from "@/types/astrology";
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

type RelationshipJournalEntry = {
  id: string;
  relationship_key: string;
  nickname: string;
  event_text: string;
  mood?: string;
  created_at: string;
};

type RelationshipProfile = {
  relationship_key: string;
  nickname: string;
  relation_type: string;
  relation_type_value?: string;
  status: string;
  status_values?: string[];
  main_question?: string;
  question_intent?: string;
  partner_birth?: BirthInfo & { birth_time_known?: boolean };
  synastry?: SynastryReport;
  scores?: Record<string, number>;
  timing_context?: Record<string, unknown>;
  journal_count: number;
  last_context?: string;
  updated_at: string;
};

type UserState = {
  locale: Locale;
  profile: UserProfile;
  readings: ReadingOutput[];
  feedback: ReadingFeedback[];
  memoryEvents: MemoryEvent[];
  relationshipJournalEntries: RelationshipJournalEntry[];
  relationshipProfiles: RelationshipProfile[];
  dailySkyNotifications: {
    enabled: boolean;
    dailyHour: number;
    expoPushToken?: string;
    remoteRegistered?: boolean;
    updated_at?: string;
  };
  setLocale: (locale: Locale) => void;
  setBirthInfo: (birth: BirthInfo) => void;
  mergeRemoteProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: (profile: MysticProfile) => void;
  setNatalChart: (chart: NatalChart) => void;
  addReading: (reading: ReadingOutput) => void;
  addRelationshipJournalEntry: (entry: Omit<RelationshipJournalEntry, "id" | "created_at" | "relationship_key">) => RelationshipJournalEntry;
  upsertRelationshipProfile: (profile: Omit<RelationshipProfile, "updated_at">) => void;
  submitFeedback: (feedback: Omit<ReadingFeedback, "id" | "created_at">) => void;
  setDailySkyNotifications: (settings: Partial<UserState["dailySkyNotifications"]>) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      locale: "tr",
      profile: {
        birth: {},
        onboarding_completed: false,
        credits: 5
      },
      readings: [],
      feedback: [],
      memoryEvents: [],
      relationshipJournalEntries: [],
      relationshipProfiles: [],
      dailySkyNotifications: {
        enabled: false,
        dailyHour: 9
      },
      setLocale: (locale) => set({ locale }),
      setBirthInfo: (birth) =>
        set((state) => ({
          profile: {
            ...state.profile,
            birth,
            natal_chart: undefined
          }
        })),
      mergeRemoteProfile: (remoteProfile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...remoteProfile,
            birth: {
              ...state.profile.birth,
              ...(remoteProfile.birth ?? {})
            },
            onboarding_completed: remoteProfile.onboarding_completed ?? state.profile.onboarding_completed,
            credits: remoteProfile.credits ?? state.profile.credits
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
      addRelationshipJournalEntry: (entryInput) => {
        const createdAt = new Date().toISOString();
        const relationshipKey = normalizeRelationshipKey(entryInput.nickname);
        const entry: RelationshipJournalEntry = {
          ...entryInput,
          id: `relationship_journal_${Date.now()}`,
          relationship_key: relationshipKey,
          created_at: createdAt
        };

        set((state) => ({
          relationshipJournalEntries: [entry, ...state.relationshipJournalEntries],
          memoryEvents: [
            {
              id: `memory_relationship_${Date.now()}`,
              event_type: "relationship_journal",
              source_type: "relationship_journal",
              source_id: entry.id,
              memory_key: "relationship_cycle_event",
              memory_value: {
                nickname: entry.nickname,
                event_text: entry.event_text,
                mood: entry.mood
              },
              weight: 0.78,
              created_at: createdAt
            },
            ...state.memoryEvents
          ]
        }));

        return entry;
      },
      upsertRelationshipProfile: (profileInput) =>
        set((state) => {
          const updatedProfile: RelationshipProfile = {
            ...profileInput,
            updated_at: new Date().toISOString()
          };
          const existing = state.relationshipProfiles.filter(
            (item) => item.relationship_key !== updatedProfile.relationship_key
          );
          return {
            relationshipProfiles: [updatedProfile, ...existing].slice(0, 12)
          };
        }),
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
        }),
      setDailySkyNotifications: (settings) =>
        set((state) => ({
          dailySkyNotifications: {
            ...state.dailySkyNotifications,
            ...settings,
            updated_at: new Date().toISOString()
          }
        }))
    }),
    {
      name: "mirror-ai-user-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locale: state.locale,
        profile: state.profile,
        readings: state.readings,
        feedback: state.feedback,
        memoryEvents: state.memoryEvents,
        relationshipJournalEntries: state.relationshipJournalEntries,
        relationshipProfiles: state.relationshipProfiles,
        dailySkyNotifications: state.dailySkyNotifications
      })
    }
  )
);

function normalizeRelationshipKey(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, "_") || "unknown";
}
