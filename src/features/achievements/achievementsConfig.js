/**
 * @typedef {'ONBOARDING_DONE' | 'FIRST_THREAD' | 'FIRST_REPLY' | 'FIRST_IMAGE_REPLY'} AchievementId
 */

/**
 * @typedef {Object} AchievementDefinition
 * @property {AchievementId} id
 * @property {string} title
 * @property {string} description
 * @property {string} [icon]
 */

/** @type {AchievementId[]} */
export const ACHIEVEMENT_IDS = [
  'ONBOARDING_DONE',
  'FIRST_THREAD',
  'FIRST_REPLY',
  'FIRST_IMAGE_REPLY',
];

/** @type {AchievementDefinition[]} */
export const ACHIEVEMENTS = [
  {
    id: 'ONBOARDING_DONE',
    title: 'Onboarding completato',
    description: 'Hai scelto stanze, persona e preset per iniziare a navigare.',
    icon: '🎯',
  },
  {
    id: 'FIRST_THREAD',
    title: 'Primo thread',
    description: 'Hai creato il tuo primo thread in una stanza.',
    icon: '🧵',
  },
  {
    id: 'FIRST_REPLY',
    title: 'Prima risposta',
    description: 'Hai partecipato a una discussione con una risposta.',
    icon: '💬',
  },
  {
    id: 'FIRST_IMAGE_REPLY',
    title: 'Risposta con immagine',
    description: 'Hai allegato un’immagine in una risposta.',
    icon: '🖼️',
  },
];

export const ACHIEVEMENT_MAP = ACHIEVEMENTS.reduce(
  (acc, achievement) => {
    acc[achievement.id] = achievement;
    return acc;
  },
  /** @type {Record<AchievementId, AchievementDefinition>} */ ({})
);

/**
 * @param {AchievementId} id
 * @returns {AchievementDefinition | undefined}
 */
export function getAchievementDefinition(id) {
  return ACHIEVEMENT_MAP[id];
}
