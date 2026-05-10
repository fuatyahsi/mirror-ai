import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { MirrorMark } from "@/components/brand/MirrorMark";
import { TarotCardBack } from "@/components/brand/TarotCardBack";
import { PrimaryButton } from "@/components/forms/PrimaryButton";
import { TextField } from "@/components/forms/TextField";
import { PageHeader } from "@/components/layout/PageHeader";
import { Screen } from "@/components/layout/Screen";
import { SubtlePremiumOffer } from "@/components/paywall/SubtlePremiumOffer";
import { generateTarotReading } from "@/features/tarotReading/api";
import {
  assignSelectedTarotCards,
  buildShuffledTarotDeck,
  getRequiredCardCount,
  type SelectableTarotCard
} from "@/features/tarotReading/deck";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/stores/useUserStore";
import { colors, featureColors, radii, spacing, typography } from "@/theme";
import type { TarotCardDraw } from "@/types/readings";

const spreadOptions = [
  {
    id: "single",
    count: 1,
    tr: { title: "Hızlı içgörü", intent: "Tek mesajla net odak", positions: "Tek mesaj" },
    en: { title: "Quick insight", intent: "One focused message", positions: "One message" }
  },
  {
    id: "three_card",
    count: 3,
    tr: { title: "Zaman çizgisi", intent: "Süreci üç aşamada oku", positions: "Geçmiş / şimdi / olası yön" },
    en: { title: "Timeline", intent: "Read the process in three steps", positions: "Past / present / possible direction" }
  },
  {
    id: "relationship",
    count: 3,
    tr: { title: "İlişki dinamiği", intent: "İki kişi arasındaki alan", positions: "Sen / karşı taraf / dinamik" },
    en: { title: "Relationship dynamic", intent: "The field between two people", positions: "You / other person / dynamic" }
  },
  {
    id: "decision",
    count: 3,
    tr: { title: "Karar açılımı", intent: "Seçenekleri karşılaştır", positions: "Seçenek A / seçenek B / bilinçaltı etki" },
    en: { title: "Decision spread", intent: "Compare the options", positions: "Option A / option B / subconscious influence" }
  }
] as const;

const FAN_CARD_WIDTH = 50;
const FAN_CARD_HEIGHT = 82;
const FAN_STAGE_HEIGHT = 286;
const tarotCardAccents = [
  colors.accentGold,
  colors.accentTeal,
  colors.accentRose,
  colors.accentBlue,
  featureColors.coffee.accent
];
const tarotCardSurfaces = ["#071626", "#120E1D", "#15101A", "#0A1B22", "#1A100B"];

export default function TarotScreen() {
  const userProfile = useUserStore((state) => state.profile);
  const memoryEvents = useUserStore((state) => state.memoryEvents);
  const addReading = useUserStore((state) => state.addReading);
  const { locale, t } = useI18n();
  const [spreadType, setSpreadType] = useState("three_card");
  const [topic, setTopic] = useState(locale === "en" ? "love / relationships" : "aşk / ilişkiler");
  const [question, setQuestion] = useState("");
  const [clarifierQuestion, setClarifierQuestion] = useState("");
  const [deck, setDeck] = useState<SelectableTarotCard[]>(() => buildShuffledTarotDeck());
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [stageWidth, setStageWidth] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>();

  const requiredCards = getRequiredCardCount(spreadType);
  const wantsClarifier = clarifierQuestion.trim().length > 0;
  const totalRequiredCards = requiredCards + (wantsClarifier ? 1 : 0);
  const selectedDeckCards = selectedKeys
    .map((key) => deck.find((card) => card.card_key === key))
    .filter(Boolean) as SelectableTarotCard[];
  const selectedCards = useMemo<TarotCardDraw[]>(
    () => assignSelectedTarotCards(selectedDeckCards, spreadType, locale, wantsClarifier),
    [locale, selectedDeckCards, spreadType, wantsClarifier]
  );
  const fanCards = useMemo(() => buildFanCards(deck, stageWidth), [deck, stageWidth]);
  const baseSelectionComplete = selectedKeys.length >= requiredCards;
  const selectionComplete = selectedCards.length === totalRequiredCards;
  const copy = locale === "en" ? enCopy : trCopy;
  const selectedSpread = spreadOptions.find((option) => option.id === spreadType) ?? spreadOptions[1];
  const selectedSpreadCopy = getSpreadOptionCopy(selectedSpread, locale);

  useEffect(() => {
    if (!wantsClarifier && selectedKeys.length > requiredCards) {
      setSelectedKeys((current) => current.slice(0, requiredCards));
    }
  }, [requiredCards, selectedKeys.length, wantsClarifier]);

  function resetDeck(nextSpreadType = spreadType) {
    setDeck(buildShuffledTarotDeck());
    setSelectedKeys([]);
    setClarifierQuestion("");
    setSpreadType(nextSpreadType);
    setGenerationError(undefined);
  }

  function selectCard(cardKey: string) {
    setGenerationError(undefined);
    setSelectedKeys((current) => {
      if (current.includes(cardKey)) return current.filter((key) => key !== cardKey);
      if (current.length >= totalRequiredCards) return current;
      return [...current, cardKey];
    });
  }

  async function generate() {
    setIsGenerating(true);
    setGenerationError(undefined);
    try {
      const result = await generateTarotReading({
        spread_type: spreadType,
        topic: topic.trim(),
        question: question.trim(),
        clarifierQuestion: clarifierQuestion.trim() || undefined,
        selectedCards,
        profile: userProfile.mystic_profile,
        memory: memoryEvents,
        natalChart: userProfile.natal_chart,
        locale
      });
      addReading(result.reading);
      router.push(`/readings/${result.reading.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : t("tarot.error"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      <PageHeader eyebrow={t("tarot.eyebrow")} title={t("tarot.title")} subtitle={t("tarot.subtitle")} />
      <View style={styles.spreadIntro}>
        <Text style={styles.spreadLabel}>{copy.spreadLabel}</Text>
        <Text style={styles.spreadHint}>{copy.spreadHint}</Text>
      </View>
      <View style={styles.options}>
        {spreadOptions.map((option) => (
          <Pressable
            key={option.id}
            style={[styles.option, spreadType === option.id && styles.active]}
            onPress={() => resetDeck(option.id)}
          >
            <Text style={[styles.optionTitle, spreadType === option.id && styles.activeText]}>
              {getSpreadOptionCopy(option, locale).title}
            </Text>
            <Text style={styles.optionIntent}>{getSpreadOptionCopy(option, locale).intent}</Text>
            <Text style={styles.optionMeta}>
              {copy.cardCount.replace("{{count}}", String(option.count))}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.selectedSpreadCard}>
        <Text style={styles.selectedSpreadEyebrow}>{copy.selectedSpreadLabel}</Text>
        <Text style={styles.selectedSpreadTitle}>{selectedSpreadCopy.title}</Text>
        <Text style={styles.selectedSpreadBody}>
          {copy.selectedSpreadBody
            .replace("{{count}}", String(selectedSpread.count))
            .replace("{{positions}}", selectedSpreadCopy.positions)}
        </Text>
      </View>

      <TextField label={copy.topicLabel} value={topic} onChangeText={setTopic} placeholder={copy.topicPlaceholder} />
      <TextField
        label={copy.questionLabel}
        value={question}
        onChangeText={setQuestion}
        placeholder={t("tarot.questionPlaceholder")}
        multiline
      />
      {baseSelectionComplete ? (
        <View style={styles.clarifierCard}>
          <Text style={styles.clarifierEyebrow}>{copy.clarifierEyebrow}</Text>
          <Text style={styles.clarifierTitle}>{copy.clarifierTitle}</Text>
          <Text style={styles.clarifierBody}>{copy.clarifierBody}</Text>
          <TextField
            label={copy.clarifierLabel}
            value={clarifierQuestion}
            onChangeText={setClarifierQuestion}
            placeholder={copy.clarifierPlaceholder}
            multiline
          />
          {wantsClarifier ? (
            <Text style={styles.clarifierNeed}>
              {selectedKeys.length > requiredCards ? copy.clarifierSelected : copy.clarifierNeed}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.deckPanel}>
        <View style={styles.deckHeader}>
          <View style={styles.deckTitleWrap}>
            <Text style={styles.deckEyebrow}>{copy.deckEyebrow}</Text>
            <Text style={styles.deckTitle}>{copy.deckTitle}</Text>
          </View>
          <Pressable onPress={() => resetDeck()} style={styles.shuffleButton}>
            <Text style={styles.shuffleText}>{copy.shuffle}</Text>
          </Pressable>
        </View>
        <Text style={styles.deckInstruction}>
          {copy.deckInstruction
            .replace("{{count}}", String(requiredCards))
            .replace("{{positions}}", selectedSpreadCopy.positions)}
        </Text>
        <Text style={styles.selectionCounter}>
          {selectedCards.length}/{totalRequiredCards}
        </Text>
        {selectionComplete ? (
          <View style={styles.revealPanel}>
            <Text style={styles.revealTitle}>{copy.openedTitle}</Text>
            <View style={styles.revealedCards}>
              {selectedCards.map((card, index) => (
                <RevealedTarotCard key={`${card.card_key}-${card.position}`} card={card} index={index} />
              ))}
            </View>
          </View>
        ) : null}
        <View style={styles.deckStage} onLayout={(event) => setStageWidth(event.nativeEvent.layout.width)}>
          <View style={styles.deckAuraTeal} />
          <View style={styles.deckAuraGold} />
          <View style={styles.deckOrbitLarge} />
          <View style={styles.deckOrbitSmall} />
          <View style={styles.deckTableLine} />
          <View style={styles.deckTableGlow} />
          {fanCards.map(({ card, position }, index) => {
            const selectedOrder = selectedKeys.indexOf(card.card_key);
            const isSelected = selectedOrder >= 0;
            return (
              <SelectableDeckCard
                key={card.card_key}
                card={card}
                index={index}
                fanPosition={position}
                selected={isSelected}
                disabled={!isSelected && selectedKeys.length >= totalRequiredCards}
                selectedOrder={selectedOrder + 1}
                onPress={() => selectCard(card.card_key)}
              />
            );
          })}
        </View>
      </View>

      {!selectionComplete ? (
        <View style={styles.waitingCard}>
          <Text style={styles.waitingTitle}>{copy.waitingTitle}</Text>
          <Text style={styles.waitingBody}>{copy.waitingBody}</Text>
        </View>
      ) : null}

      <SubtlePremiumOffer feature="premium_tarot" compact />

      {generationError ? <Text style={styles.error}>{generationError}</Text> : null}
      <PrimaryButton disabled={!topic.trim() || !question.trim() || !selectionComplete || isGenerating} onPress={generate}>
        {isGenerating ? t("common.loadingMirror") : copy.readSelected}
      </PrimaryButton>
    </Screen>
  );
}

function SelectableDeckCard({
  index,
  fanPosition,
  selected,
  disabled,
  selectedOrder,
  onPress
}: {
  card: SelectableTarotCard;
  index: number;
  fanPosition: FanCardPosition;
  selected: boolean;
  disabled: boolean;
  selectedOrder: number;
  onPress: () => void;
}) {
  const deal = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value((index % 3) / 2)).current;

  useEffect(() => {
    deal.setValue(0);
    Animated.timing(deal, {
      toValue: 1,
      duration: 420,
      delay: index * 18,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [deal, index]);

  useEffect(() => {
    Animated.spring(lift, {
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 7
    }).start();
  }, [lift, selected]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2100 + (index % 5) * 170,
          delay: index * 34,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2300 + (index % 4) * 160,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [float, index]);

  const translateY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -28] });
  const ambientY = float.interpolate({ inputRange: [0, 1], outputRange: [1, -2] });
  const dealY = deal.interpolate({ inputRange: [0, 1], outputRange: [86, 0] });
  const dealScale = deal.interpolate({ inputRange: [0, 1], outputRange: [0.74, 1] });
  const selectedGlow = lift.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const scale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const totalTranslateY = Animated.add(ambientY, translateY);
  const accentColor = tarotCardAccents[index % tarotCardAccents.length];
  const surfaceColor = tarotCardSurfaces[index % tarotCardSurfaces.length];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.deckCardTapArea,
        {
          left: fanPosition.left,
          bottom: fanPosition.bottom,
          zIndex: selected ? 200 + selectedOrder : fanPosition.zIndex
        }
      ]}
    >
      <Animated.View
        style={[
          styles.deckCardHalo,
          {
            opacity: selectedGlow,
            borderColor: accentColor,
            backgroundColor: accentColor,
            transform: [{ translateY }, { scale }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.deckCardAnimated,
          disabled && styles.deckCardDisabled,
          selected && styles.deckCardSelected,
          {
            borderColor: selected ? accentColor : "transparent",
            shadowColor: accentColor,
            transform: [
              { translateY: dealY },
              { translateY: totalTranslateY },
              { scale: dealScale },
              { scale },
              { rotate: fanPosition.rotate }
            ]
          }
        ]}
      >
        <TarotCardBack
          width={FAN_CARD_WIDTH}
          height={FAN_CARD_HEIGHT}
          accentColor={accentColor}
          surfaceColor={surfaceColor}
          secondaryColor={index % 2 === 0 ? colors.accentGold : colors.accentTeal}
        />
        {selected ? (
          <View style={[styles.selectedBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.selectedBadgeText}>{selectedOrder}</Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

type FanCardPosition = {
  left: number;
  bottom: number;
  rotate: string;
  zIndex: number;
};

function buildFanCards(deck: SelectableTarotCard[], stageWidth: number) {
  const safeWidth = Math.max(stageWidth, 320);
  const center = safeWidth / 2;
  const tapWidth = FAN_CARD_WIDTH + 10;
  const radius = Math.min(safeWidth * 0.34, 126);
  const lift = 68;
  const sidePadding = 18;
  const startAngle = -58;
  const endAngle = 58;
  const step = deck.length > 1 ? (endAngle - startAngle) / (deck.length - 1) : 0;

  return deck.map((card, index) => {
    const angle = startAngle + step * index;
    const radians = (angle * Math.PI) / 180;
    const rawLeft = center + Math.sin(radians) * radius - tapWidth / 2;
    const left = Math.min(Math.max(rawLeft, sidePadding), safeWidth - tapWidth - sidePadding);
    const bottom = 22 + Math.cos(radians) * lift;

    return {
      card,
      position: {
        left,
        bottom,
        rotate: `${angle * 0.68}deg`,
        zIndex: index
      }
    };
  });
}

function getSpreadOptionCopy(option: (typeof spreadOptions)[number], locale: string) {
  return locale === "en" ? option.en : option.tr;
}

function RevealedTarotCard({ card, index }: { card: TarotCardDraw; index: number }) {
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 360,
      delay: index * 130,
      useNativeDriver: true
    }).start();
  }, [appear, index]);

  const translateY = appear.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const scale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });

  return (
    <Animated.View style={[styles.revealedCard, { opacity: appear, transform: [{ translateY }, { scale }] }]}>
      <View style={styles.revealedLayout}>
        <View style={styles.revealedFace}>
          <View style={[styles.revealedFaceCorner, styles.revealedFaceTopLeft]} />
          <View style={[styles.revealedFaceCorner, styles.revealedFaceTopRight]} />
          <View style={[styles.revealedFaceCorner, styles.revealedFaceBottomLeft]} />
          <View style={[styles.revealedFaceCorner, styles.revealedFaceBottomRight]} />
          <Text style={styles.revealedFaceIndex}>{index + 1}</Text>
          <View style={styles.revealedFaceMark}>
            <MirrorMark size={26} />
          </View>
          <View style={styles.revealedFaceLine} />
        </View>
        <View style={styles.revealedTextBlock}>
          <Text style={styles.revealedPosition}>{card.position_label ?? card.position}</Text>
          <Text style={styles.revealedName}>{card.card}</Text>
          <Text style={styles.revealedOrientation}>{card.orientation_label ?? card.orientation}</Text>
          {card.meaning ? <Text style={styles.revealedMeaning}>{card.meaning}</Text> : null}
        </View>
      </View>
    </Animated.View>
  );
}

const trCopy = {
  spreadLabel: "Açılım şablonu",
  spreadHint:
    "Burada konu seçmiyorsun; kart sayısını ve her kartın okuyacağı pozisyonu seçiyorsun. Konu ve soru aşağıda ayrı bağlam olarak kullanılır.",
  cardCount: "{{count}} kartlık açılım",
  selectedSpreadLabel: "Seçilen yapı",
  selectedSpreadBody: "{{count}} kart seçilecek. Kart pozisyonları: {{positions}}.",
  topicLabel: "Yorum konusu",
  topicPlaceholder: "Aşk, kariyer, aile, içsel durum...",
  questionLabel: "Net soru",
  clarifierEyebrow: "Opsiyonel derinleştirme",
  clarifierTitle: "Ana soruya bağlı ikinci soru",
  clarifierBody:
    "İstersen ilk sorudan kopmadan bir netleştirici soru sor. Bu durumda desteden tam 1 ek kart seçilir ve cevap ana konuya bağlı kalır.",
  clarifierLabel: "Netleştirici soru",
  clarifierPlaceholder: "Bu kararın en kritik noktası ne?",
  clarifierNeed: "Netleştirici soru için desteden 1 ek kart seç.",
  clarifierSelected: "Netleştirici kart seçildi; yorum ana sorudan kopmadan üretilecek.",
  deckEyebrow: "Seçim alanı",
  deckTitle: "Desteden kartlarını seç",
  deckInstruction:
    "Bu açılım için {{count}} kart seç. Pozisyonlar: {{positions}}. Seçtiğin kartlar açılacak, yorum konu ve soruyla birlikte üretilecek.",
  shuffle: "Karıştır",
  openedTitle: "Seçtiğin kartlar açıldı",
  waitingTitle: "Kartlar kapalı",
  waitingBody: "Önce sorunu yaz, sonra desteden içinden gelen kartları seç.",
  readSelected: "Seçilen kartlarla yorumla"
};

const enCopy = {
  spreadLabel: "Spread template",
  spreadHint:
    "This is not the topic. It chooses card count and the role of each card. Topic and question below become the reading context.",
  cardCount: "{{count}}-card spread",
  selectedSpreadLabel: "Selected structure",
  selectedSpreadBody: "{{count}} cards will be chosen. Card positions: {{positions}}.",
  topicLabel: "Reading topic",
  topicPlaceholder: "Love, career, family, inner state...",
  questionLabel: "Specific question",
  clarifierEyebrow: "Optional deepening",
  clarifierTitle: "A second question tied to the first",
  clarifierBody:
    "If you want, ask one clarifier question that stays attached to the first question. Then choose exactly 1 extra card.",
  clarifierLabel: "Clarifier question",
  clarifierPlaceholder: "What is the most important point in this decision?",
  clarifierNeed: "Choose 1 extra card for the clarifier question.",
  clarifierSelected: "Clarifier card selected; the reading will stay tied to the primary question.",
  deckEyebrow: "Selection area",
  deckTitle: "Choose from the deck",
  deckInstruction:
    "Pick {{count}} cards for this spread. Positions: {{positions}}. The chosen cards open, then the reading uses them with your topic and question.",
  shuffle: "Shuffle",
  openedTitle: "Your chosen cards are open",
  waitingTitle: "Cards are closed",
  waitingBody: "Write your question, then choose the cards that pull your attention.",
  readSelected: "Read selected cards"
};

const styles = StyleSheet.create({
  spreadIntro: {
    gap: 5
  },
  spreadLabel: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  spreadHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  option: {
    width: "48%",
    minHeight: 104,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: spacing.sm
  },
  active: {
    borderColor: featureColors.tarot.accent,
    backgroundColor: featureColors.tarot.surfaceDeep
  },
  optionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  optionIntent: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  optionMeta: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  activeText: {
    color: featureColors.tarot.accent
  },
  selectedSpreadCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.32)",
    backgroundColor: "#101624",
    padding: spacing.md,
    gap: 6
  },
  selectedSpreadEyebrow: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  selectedSpreadTitle: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600"
  },
  selectedSpreadBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  clarifierCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.32)",
    backgroundColor: "#081823",
    padding: spacing.md,
    gap: spacing.sm
  },
  clarifierEyebrow: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  clarifierTitle: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600"
  },
  clarifierBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  clarifierNeed: {
    color: colors.accentGold,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800"
  },
  deckPanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.5)",
    backgroundColor: "#0C101C",
    padding: spacing.md,
    gap: spacing.sm,
    overflow: "hidden",
    shadowColor: colors.accentGold,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  deckTitleWrap: {
    flex: 1,
    gap: 3
  },
  deckEyebrow: {
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  deckTitle: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "600"
  },
  shuffleButton: {
    minHeight: 36,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(94,196,192,0.48)",
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,25,35,0.78)"
  },
  shuffleText: {
    color: colors.accentTeal,
    fontSize: 12,
    fontWeight: "900"
  },
  deckInstruction: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  selectionCounter: {
    color: colors.accentGold,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right"
  },
  deckStage: {
    height: FAN_STAGE_HEIGHT,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(110,176,232,0.2)",
    backgroundColor: "#07111D",
    overflow: "hidden",
    position: "relative"
  },
  deckAuraTeal: {
    position: "absolute",
    top: -72,
    right: -58,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(94,196,192,0.12)"
  },
  deckAuraGold: {
    position: "absolute",
    bottom: -84,
    left: -62,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(216,181,109,0.1)"
  },
  deckOrbitLarge: {
    position: "absolute",
    alignSelf: "center",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: "rgba(110,176,232,0.18)"
  },
  deckOrbitSmall: {
    position: "absolute",
    alignSelf: "center",
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
    borderColor: "rgba(224,122,168,0.18)"
  },
  deckTableLine: {
    position: "absolute",
    alignSelf: "center",
    width: "84%",
    height: 1,
    bottom: 72,
    backgroundColor: "rgba(216,181,109,0.16)"
  },
  deckTableGlow: {
    position: "absolute",
    left: "8%",
    right: "8%",
    bottom: 22,
    height: 68,
    borderRadius: 70,
    backgroundColor: "rgba(216,181,109,0.08)",
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.14)"
  },
  deckCardTapArea: {
    position: "absolute",
    width: FAN_CARD_WIDTH + 10,
    height: FAN_CARD_HEIGHT + 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible"
  },
  deckCardAnimated: {
    borderRadius: radii.sm,
    borderWidth: 1,
    padding: 2,
    backgroundColor: "rgba(6,8,16,0.42)",
    shadowOpacity: 0.26,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  deckCardHalo: {
    position: "absolute",
    width: FAN_CARD_WIDTH + 16,
    height: FAN_CARD_HEIGHT + 22,
    borderRadius: radii.md,
    borderWidth: 1,
    opacity: 0.18
  },
  deckCardDisabled: {
    opacity: 0.3
  },
  deckCardSelected: {
    backgroundColor: "rgba(255,255,255,0.05)",
    shadowOpacity: 0.52,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  selectedBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#0C101C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accentGold,
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6
  },
  selectedBadgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "900"
  },
  revealPanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  revealTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  revealedCards: {
    gap: spacing.sm
  },
  revealedCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.34)",
    backgroundColor: "#101624",
    padding: spacing.md,
    gap: 5
  },
  revealedLayout: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "stretch"
  },
  revealedFace: {
    width: 58,
    minHeight: 88,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.58)",
    backgroundColor: "#071626",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  revealedFaceMark: {
    transform: [{ scale: 0.9 }]
  },
  revealedFaceLine: {
    position: "absolute",
    width: 1,
    height: "72%",
    backgroundColor: "rgba(94,196,192,0.24)"
  },
  revealedFaceIndex: {
    position: "absolute",
    top: 7,
    color: colors.accentGold,
    fontSize: 11,
    fontWeight: "900"
  },
  revealedFaceCorner: {
    position: "absolute",
    width: 9,
    height: 9,
    borderColor: "rgba(94,196,192,0.62)",
    borderWidth: 1
  },
  revealedFaceTopLeft: {
    top: 7,
    left: 7,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  revealedFaceTopRight: {
    top: 7,
    right: 7,
    borderLeftWidth: 0,
    borderBottomWidth: 0
  },
  revealedFaceBottomLeft: {
    bottom: 7,
    left: 7,
    borderRightWidth: 0,
    borderTopWidth: 0
  },
  revealedFaceBottomRight: {
    right: 7,
    bottom: 7,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  revealedTextBlock: {
    flex: 1,
    gap: 5
  },
  revealedPosition: {
    color: featureColors.tarot.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  revealedName: {
    color: colors.text,
    fontFamily: typography.display,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "600"
  },
  revealedOrientation: {
    color: colors.accentGold,
    fontSize: 12,
    fontWeight: "900"
  },
  revealedMeaning: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  waitingCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    gap: 5
  },
  waitingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  waitingBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  error: {
    color: colors.danger,
    lineHeight: 20
  }
});
