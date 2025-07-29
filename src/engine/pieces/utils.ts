import type { EnrichedSquare } from '../types.ts'
import { normalizePieceEvaluation, STANDARD_CRITERION_MAX } from './normalization.ts'

type PieceWeights = {
  [key: string]: number;
}

export function interpolateWeights<T extends PieceWeights> (from: T, to: T, t: number): T {
  const result = { ...from } as T

  for (const key in from) {
    if (typeof from[key] === 'number' && typeof to[key] === 'number') {
      result[key] = from[key] + t * (to[key] - from[key]) as number
    }
  }
  return result
}

export function getWeightsByPhase<T extends PieceWeights> (openingWeights: T, middlegameWeights: T, endgameWeights: T, phaseValue: number): T {
  if (phaseValue > 0.75) {
    return openingWeights
  } else if (phaseValue > 0.25) {
    // Interpolation selon la position dans le milieu de jeu
    if (phaseValue > 0.5) {
      // Entre milieu de jeu et ouverture
      const t = (phaseValue - 0.5) / 0.25
      return interpolateWeights(middlegameWeights, openingWeights, t)
    } else {
      // Entre finale et milieu de jeu
      const t = (phaseValue - 0.25) / 0.25
      return interpolateWeights(endgameWeights, middlegameWeights, t)
    }
  } else {
    return endgameWeights
  }
}

export function supportScore (square: EnrichedSquare, scorePerDefender: number = 0.5): number {
  return Math.min(STANDARD_CRITERION_MAX.support, square.defenders.length * scorePerDefender)
}

export function safetyScore (square: EnrichedSquare, penaltyPerAttacker: number = 0.1): number {
  const attackerCount = square.attackers.length
  return attackerCount === 0
    ? STANDARD_CRITERION_MAX.safety
    : Math.max(0, STANDARD_CRITERION_MAX.safety - (attackerCount * penaltyPerAttacker))
}

export function mobilityScore (square: EnrichedSquare, maxMobility: number): number {
  const currentMobility = square.mobility.totalMobility
  return Math.min(STANDARD_CRITERION_MAX.mobility, (currentMobility / maxMobility) * STANDARD_CRITERION_MAX.mobility)
}

export function gradeFromScore (score: number): { normalizedScore: number; grade: string } {
  const normalizedScore = Math.min(10, Math.max(0, score))

  let grade: string
  if (normalizedScore >= 8.5) grade = 'A'
  else if (normalizedScore >= 7) grade = 'B'
  else if (normalizedScore >= 5) grade = 'C'
  else if (normalizedScore >= 3) grade = 'D'
  else grade = 'F'

  return { normalizedScore, grade }
}

export function calculateNormalizedPieceScore<K extends readonly string[]> (
  rawScores: Record<K[number], number>,
  weights: Record<K[number], number>,
  pieceType: string
): {
  scores: { [P in K[number]]: number };
  totalScore: number;
  grade: string;
} {
  // Utilise la nouvelle fonction de normalisation
  const evaluation = normalizePieceEvaluation(rawScores, weights, pieceType);

  // Formatte les scores individuels pour l'affichage
  const scores = {} as { [P in K[number]]: number };
  for (const key in evaluation.weightedScores) {
    scores[key as K[number]] = Math.round(evaluation.weightedScores[key] * 10) / 10;
  }

  return {
    scores,
    totalScore: evaluation.totalScore,
    grade: evaluation.grade
  };
}