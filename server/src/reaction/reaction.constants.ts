export const REACTION_TYPES = [
  'like',
  'laugh',
  'wow',
  'sad',
  'fire',
  'clap',
  'love',
  'party',
  'pray',
] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];
