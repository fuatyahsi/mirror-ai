insert into public.tarot_decks
  (card_key, name, suit, arcana, upright_meaning, reversed_meaning)
values
  ('major_00_fool', 'The Fool', null, 'major', 'New beginning, openness, trust in the first step.', 'Recklessness, avoidance of practical signals.'),
  ('major_01_magician', 'The Magician', null, 'major', 'Agency, focus, turning intention into action.', 'Scattered will, performance without grounding.'),
  ('major_02_high_priestess', 'The High Priestess', null, 'major', 'Intuition, inner knowing, quiet observation.', 'Hidden information, distrust of intuition.'),
  ('major_03_empress', 'The Empress', null, 'major', 'Care, growth, embodiment, receiving.', 'Overgiving, blurred emotional boundaries.'),
  ('major_04_emperor', 'The Emperor', null, 'major', 'Structure, protection, clear limits.', 'Control, rigidity, emotional distance.'),
  ('major_05_hierophant', 'The Hierophant', null, 'major', 'Tradition, guidance, shared values.', 'Conformity, inherited rules, fear of difference.'),
  ('major_06_lovers', 'The Lovers', null, 'major', 'Choice, alignment, intimate honesty.', 'Mixed signals, misalignment, projection.'),
  ('major_07_chariot', 'The Chariot', null, 'major', 'Direction, self-command, movement.', 'Force, impatience, unresolved inner conflict.'),
  ('major_08_strength', 'Strength', null, 'major', 'Gentle courage, patience, emotional maturity.', 'Self-doubt, suppressed anger, fragile confidence.'),
  ('major_09_hermit', 'The Hermit', null, 'major', 'Solitude, reflection, inner guidance.', 'Isolation, withdrawal, refusing support.'),
  ('major_10_wheel', 'Wheel of Fortune', null, 'major', 'Cycle change, timing, turning point.', 'Repeating pattern, resistance to change.'),
  ('major_11_justice', 'Justice', null, 'major', 'Clarity, accountability, balanced decision.', 'Avoided truth, unfairness, confusion.'),
  ('major_12_hanged_man', 'The Hanged Man', null, 'major', 'Pause, reframing, surrender.', 'Stagnation, delay, self-sacrifice.'),
  ('major_13_death', 'Death', null, 'major', 'Ending, renewal, transformation.', 'Clinging, fear of transition.'),
  ('major_14_temperance', 'Temperance', null, 'major', 'Integration, moderation, emotional alchemy.', 'Excess, imbalance, impatience.'),
  ('major_15_devil', 'The Devil', null, 'major', 'Attachment, temptation, shadow pattern.', 'Release, seeing the loop, reclaiming choice.'),
  ('major_16_tower', 'The Tower', null, 'major', 'Disruption, truth breaking through illusion.', 'Fear of change, delayed honesty.'),
  ('major_17_star', 'The Star', null, 'major', 'Hope, healing, honest vulnerability.', 'Discouragement, guardedness, lost faith.'),
  ('major_18_moon', 'The Moon', null, 'major', 'Uncertainty, dreams, subconscious signals.', 'Anxiety clearing, illusion becoming visible.'),
  ('major_19_sun', 'The Sun', null, 'major', 'Warmth, vitality, visibility, joy.', 'Temporary dimming, overexposure, impatience.'),
  ('major_20_judgement', 'Judgement', null, 'major', 'Awakening, reflection, answering a call.', 'Avoidance, self-judgment, unfinished lesson.'),
  ('major_21_world', 'The World', null, 'major', 'Completion, integration, mature perspective.', 'Loose ends, almost-finished cycle.')
on conflict (card_key) do update set
  name = excluded.name,
  suit = excluded.suit,
  arcana = excluded.arcana,
  upright_meaning = excluded.upright_meaning,
  reversed_meaning = excluded.reversed_meaning;

