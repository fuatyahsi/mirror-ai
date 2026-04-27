import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { BackButton } from "@/components/layout/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { calculateMysticProfile, type QuizAnswer } from "@/features/onboarding/profileScoring";
import { getProfileQuestions } from "@/features/onboarding/quizQuestions";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, radii, spacing } from "@/theme";

export default function ProfileQuizScreen() {
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const { locale, t } = useI18n();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = getProfileQuestions(locale);

  function select(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  }

  function finish() {
    const quizAnswers: QuizAnswer[] = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId,
      optionId
    }));
    const profile = calculateMysticProfile(quizAnswers, locale);
    completeOnboarding(profile);
    router.replace("/onboarding/result");
  }

  const completed = Object.keys(answers).length === questions.length;

  return (
    <Screen>
      <BackButton fallbackHref="/onboarding/birth-info" />
      <PageHeader eyebrow={t("quiz.eyebrow")} title={t("quiz.title")} subtitle={t("quiz.subtitle")} />
      {questions.map((question) => (
        <View key={question.id} style={styles.question}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          {question.options.map((option) => {
            const active = answers[question.id] === option.id;
            return (
              <Pressable
                key={option.id}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => select(question.id, option.id)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      <PrimaryButton disabled={!completed} onPress={finish}>
        {t("quiz.finish")}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  question: {
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  questionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23
  },
  option: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md
  },
  optionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },
  optionText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  optionTextActive: {
    color: colors.text,
    fontWeight: "700"
  }
});
