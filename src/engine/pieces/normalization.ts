// src/engine/pieces/normalization.ts

// 🎯 NORMALISATION AVEC CRITÈRES DIFFÉRENTS PAR PIÈCE

// 📊 SCORES MAX STANDARDISÉS PAR CRITÈRE
import type { BishopMetrics, KingMetrics, KnightMetrics, PawnMetrics, QueenMetrics, RookMetrics } from '../types.ts'

export const STANDARD_CRITERION_MAX = {
  // Critères communs
  mobility: 2.5,
  position: 2.5,
  tactics: 2.5,
  support: 1.5,
  safety: 0.5,

  // Critères spécifiques
  structure: 2.5,      // Pion
  advancement: 2.5,    // Pion
  diagonals: 2.5,      // Fou
  openFiles: 2.5,      // Tour
  centralization: 2.5, // Dame
  activity: 2.5,       // Roi
  castling: 2.5        // Roi
};

// 🎯 CONFIGURATION DES CRITÈRES PAR PIÈCE
interface PieceCriteriaConfig {
  criteria: string[];           // Liste des critères utilisés
  maxPossibleRaw: number;       // Maximum théorique sans poids
  targetNormalizedMax: number;  // Cible après normalisation (10)
}

const PAWN_CRITERIA_KEYS: readonly (keyof PawnMetrics)[] = ["mobility", "position", "tactics", "support", "safety", "structure", "advancement"];
const KNIGHT_CRITERIA_KEYS: readonly (keyof KnightMetrics)[] = ["mobility", "position", "tactics", "support", "safety"];
const BISHOP_CRITERIA_KEYS: readonly (keyof BishopMetrics)[] = ['mobility', 'position', 'diagonals', 'tactics', 'support', 'safety'];
const ROOK_CRITERIA_KEYS: readonly (keyof RookMetrics)[] = ['mobility', 'position', 'openFiles', 'tactics', 'support', 'safety'];
const QUEEN_CRITERIA_KEYS: readonly (keyof QueenMetrics)[] = ['mobility', 'position', 'centralization', 'tactics', 'support', 'safety'];
const KING_CRITERIA_KEYS: readonly (keyof KingMetrics)[] = ["mobility", "position", "activity", "castling", "support", "safety"];

export const PIECE_CONFIGS: Record<string, PieceCriteriaConfig> = {
  // ♟️ PION - 7 critères (avec tactics)
  pawn: {
    criteria: [...PAWN_CRITERIA_KEYS],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 14.0
    targetNormalizedMax: 10
  },

  // ♞ CAVALIER - 5 critères
  knight: {
    criteria: [...KNIGHT_CRITERIA_KEYS],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 9.5
    targetNormalizedMax: 10
  },

  // ♗ FOU - 6 critères
  bishop: {
    criteria: [...BISHOP_CRITERIA_KEYS],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 11.5
    targetNormalizedMax: 10
  },

  // ♜ TOUR - 6 critères
  rook: {
    criteria: [...ROOK_CRITERIA_KEYS],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 11.5
    targetNormalizedMax: 10
  },

  // ♛ DAME - 6 critères
  queen: {
    criteria: [...QUEEN_CRITERIA_KEYS],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 11.5
    targetNormalizedMax: 10
  },

  // ♚ ROI - 6 critères (pas de tactics)
  king: {
    criteria: [...KING_CRITERIA_KEYS],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 11.5
    targetNormalizedMax: 10
  }
};

// 🔧 FONCTION DE NORMALISATION GÉNÉRIQUE
export function normalizePieceEvaluation(rawScores: Record<string, number>, weights: Record<string, number>, pieceType: string): {
  weightedScores: Record<string, number>,
  totalScore: number,
  grade: string
} {

  const config = PIECE_CONFIGS[pieceType];
  if (!config) {
    throw new Error(`Configuration not found for piece type: ${pieceType}`);
  }

  // 1. 🎯 APPLIQUER LES POIDS
  const weightedScores: Record<string, number> = {};
  let weightedTotal = 0;
  let maxPossibleWeighted = 0;

  for (const criterion of config.criteria) {
    const rawScore = rawScores[criterion] || 0;
    const weight = weights[criterion] || 0;
    const maxRawForCriterion = STANDARD_CRITERION_MAX[criterion as keyof typeof STANDARD_CRITERION_MAX] || 0;

    weightedScores[criterion] = rawScore * weight;
    weightedTotal += weightedScores[criterion];
    maxPossibleWeighted += maxRawForCriterion * weight;
  }

  // 2. 🎯 NORMALISER SUR 0-10
  const normalizedScore = maxPossibleWeighted > 0
    ? (weightedTotal / maxPossibleWeighted) * config.targetNormalizedMax
    : 0;

  // 3. 🎓 CALCULER LA GRADE
  const grade = getGrade(normalizedScore);

  return {
    weightedScores,
    totalScore: Math.round(normalizedScore * 10) / 10,
    grade
  };
}

// 🎓 FONCTION DE GRADE
function getGrade(score: number): string {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  if (score >= 5.0) return 'C';
  if (score >= 3.0) return 'D';
  return 'F';
}
