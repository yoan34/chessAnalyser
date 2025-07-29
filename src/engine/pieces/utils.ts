import type { EnrichedSquare } from '../types.ts'

interface PieceWeights {
  [key: string]: number;
}

export function interpolateWeights<T extends PieceWeights>(
  from: T,
  to: T,
  t: number
): T {
  const result = { ...from } as T;

  for (const key in from) {
    if (typeof from[key] === 'number' && typeof to[key] === 'number') {
      result[key] = from[key] + t * (to[key] - from[key]) as number;
    }
  }

  return result;
}

export function getWeightsByPhase<T extends PieceWeights>(
  openingWeights: T,
  middlegameWeights: T,
  endgameWeights: T,
  phaseValue: number
): T {
  if (phaseValue > 0.75) {
    return openingWeights;
  } else if (phaseValue > 0.25) {
    // Interpolation selon la position dans le milieu de jeu
    if (phaseValue > 0.5) {
      // Entre milieu de jeu et ouverture
      const t = (phaseValue - 0.5) / 0.25;
      return interpolateWeights(middlegameWeights, openingWeights, t);
    } else {
      // Entre finale et milieu de jeu
      const t = (phaseValue - 0.25) / 0.25;
      return interpolateWeights(endgameWeights, middlegameWeights, t);
    }
  } else {
    return endgameWeights;
  }
}

export function supportScore(
  square: EnrichedSquare,
  maxScore: number = 1.5,
  scorePerDefender: number = 0.3
): number {
  return Math.min(maxScore, square.defenders.length * scorePerDefender);
}

export function safetyScore(
  square: EnrichedSquare,
  maxScore: number = 0.5,
  penaltyPerAttacker: number = 0.1
): number {
  const attackerCount = square.attackers.length;
  return attackerCount === 0
    ? maxScore
    : Math.max(0, maxScore - (attackerCount * penaltyPerAttacker));
}

export function mobilityScore(
  square: EnrichedSquare,
  maxMobility: number,
  maxScore: number = 3.0
): number {
  const currentMobility = square.mobility.totalMobility;
  return Math.min(maxScore, (currentMobility / maxMobility) * maxScore);
}

export function gradeFromScore(score: number): { normalizedScore: number; grade: string } {
  const normalizedScore = Math.min(10, Math.max(0, score));

  let grade: string;
  if (normalizedScore >= 8.5) grade = 'A';
  else if (normalizedScore >= 7) grade = 'B';
  else if (normalizedScore >= 5) grade = 'C';
  else if (normalizedScore >= 3) grade = 'D';
  else grade = 'F';

  return { normalizedScore, grade };
}