# API Spec

All generation endpoints are Supabase Edge Functions. The mobile app calls these through Supabase once real backend wiring is enabled. The current mobile prototype uses mock local services with matching response shapes.

## generate-daily-insight

Input:

```json
{
  "topic": "love",
  "mood": "confused",
  "question": "What should I notice today?"
}
```

Output:

```json
{
  "reading_id": "uuid",
  "title": "Today's Relationship Energy",
  "summary": "...",
  "sections": [{ "title": "Main Theme", "body": "..." }],
  "explanation": {
    "based_on": ["profile", "recent feedback", "selected topic"],
    "confidence": 0.74
  }
}
```

## generate-coffee-reading

Input:

```json
{
  "cup_image_url": "string",
  "plate_image_url": "string",
  "topic": "love",
  "question": "What is this connection showing?",
  "context": "They have been distant recently."
}
```

## generate-tarot-reading

Input:

```json
{
  "spread_type": "three_card",
  "topic": "relationship",
  "question": "Should I continue this connection?"
}
```

## generate-relationship-reading

Input:

```json
{
  "relationship_id": "uuid",
  "question": "What might this person be feeling?",
  "recent_context": "They replied late to my last message."
}
```

## submit-feedback

Input:

```json
{
  "reading_id": "uuid",
  "score": "partial",
  "accuracy_rating": 4,
  "emotional_resonance": 5,
  "comment": "The love section resonated, career did not."
}
```

## calculate-natal-chart

Input:

```json
{
  "birth_date": "1998-08-24",
  "birth_time": "14:30",
  "latitude": 41.0082,
  "longitude": 28.9784,
  "timezone": "Europe/Istanbul",
  "house_system": "P"
}
```

Output:

```json
{
  "chart_id": "uuid",
  "chart": {
    "sun": { "sign_label": "Başak", "degree": 1.4 },
    "moon": { "sign_label": "Akrep", "degree": 8.7 },
    "ascendant": { "sign_label": "Yay", "degree": 7.2 },
    "planets": [],
    "houses": [],
    "aspects": []
  }
}
```
