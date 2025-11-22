/**
 * @typedef {'ONBOARDING_DONE' | 'FIRST_THREAD' | 'FIRST_REPLY' | 'FIRST_IMAGE_REPLY'} AchievementId
 */

/**
 * @typedef {Object} AchievementDefinition
 * @property {AchievementId} id
 * @property {string} title
 * @property {string} description
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
  },
  {
    id: 'FIRST_THREAD',
    title: 'Primo thread',
    description: 'Hai creato il tuo primo thread in una stanza.',
  },
  {
    id: 'FIRST_REPLY',
    title: 'Prima risposta',
    description: 'Hai partecipato a una discussione con una risposta.',
  },
  {
    id: 'FIRST_IMAGE_REPLY',
    title: 'Risposta con immagine',
    description: 'Hai allegato un’immagine in una risposta.',
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
