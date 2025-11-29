/**
 * @typedef {'FIRST_THREAD' | 'FIRST_COMMENT' | 'FIRST_WAVE' | 'FIRST_PHOTO' | 'CONSISTENT_3'} AchievementId
 */

/**
 * @typedef {Object} AchievementDefinition
 * @property {AchievementId} id
 * @property {string} title
 * @property {string} description
 * @property {'bronze' | 'silver' | 'gold'} tier
 */

/** @type {AchievementId[]} */
export const ACHIEVEMENT_IDS = [
  'FIRST_THREAD',
  'FIRST_COMMENT',
  'FIRST_WAVE',
  'FIRST_PHOTO',
  'CONSISTENT_3',
];

/** @type {AchievementDefinition[]} */
export const ACHIEVEMENTS = [
  {
    id: 'FIRST_THREAD',
    title: 'Primo thread aperto',
    description: 'Hai avviato la tua prima conversazione nella community.',
    tier: 'bronze',
  },
  {
    id: 'FIRST_COMMENT',
    title: 'Prima risposta inviata',
    description: 'Hai scritto la tua prima risposta in un thread.',
    tier: 'bronze',
  },
  {
    id: 'FIRST_WAVE',
    title: 'Prima onda inviata',
    description: 'Hai mandato la tua prima onda di supporto o curiosità.',
    tier: 'bronze',
  },
  {
    id: 'FIRST_PHOTO',
    title: 'Prima foto allegata',
    description: 'Hai aggiunto una foto per dare più contesto.',
    tier: 'bronze',
  },
  {
    id: 'CONSISTENT_3',
    title: 'Serie da 3 giorni',
    description: 'Hai salvato una riflessione per 3 giorni di fila.',
    tier: 'silver',
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
