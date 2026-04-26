export function requiredCredits(readingType: string) {
  switch (readingType) {
    case "coffee":
      return 3;
    case "relationship":
      return 4;
    case "birth_chart":
      return 10;
    default:
      return 0;
  }
}

export function isPremiumReading(readingType: string) {
  return ["coffee", "relationship", "birth_chart"].includes(readingType);
}

