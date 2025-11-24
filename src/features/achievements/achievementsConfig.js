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
    title: 'Pronto a partire',
    description: 'Hai scelto stanze, persona e ritmo per costruire il tuo feed.',
  },
  {
    id: 'FIRST_THREAD',
    title: 'Primo thread creato',
    description: 'Hai aperto la tua prima conversazione in una stanza.',
  },
  {
    id: 'FIRST_REPLY',
    title: 'Prima risposta',
    description: 'Hai scritto la tua prima risposta in un thread.',
  },
  {
    id: 'FIRST_IMAGE_REPLY',
    title: 'Risposta con immagine',
    description: 'Hai aggiunto un’immagine per dare più contesto.',
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
