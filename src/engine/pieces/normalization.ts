// src/engine/pieces/normalization.ts

// 🎯 NORMALISATION AVEC CRITÈRES DIFFÉRENTS PAR PIÈCE

// 📊 SCORES MAX STANDARDISÉS PAR CRITÈRE
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

export const PIECE_CONFIGS: Record<string, PieceCriteriaConfig> = {
  // ♟️ PION - 7 critères (avec tactics)
  pawn: {
    criteria: ['mobility', 'position', 'tactics', 'structure', 'advancement', 'support', 'safety'],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 14.0
    targetNormalizedMax: 10
  },

  // ♞ CAVALIER - 5 critères
  knight: {
    criteria: ['mobility', 'position', 'tactics', 'support', 'safety'],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 9.5
    targetNormalizedMax: 10
  },

  // ♗ FOU - 6 critères
  bishop: {
    criteria: ['mobility', 'position', 'diagonals', 'tactics', 'support', 'safety'],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 11.5
    targetNormalizedMax: 10
  },

  // ♜ TOUR - 6 critères
  rook: {
    criteria: ['mobility', 'position', 'openFiles', 'tactics', 'support', 'safety'],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 11.5
    targetNormalizedMax: 10
  },

  // ♛ DAME - 6 critères
  queen: {
    criteria: ['mobility', 'position', 'centralization', 'tactics', 'support', 'safety'],
    maxPossibleRaw: 2.5 + 2.5 + 2.5 + 2.5 + 1.5 + 0.5, // = 11.5
    targetNormalizedMax: 10
  },

  // ♚ ROI - 6 critères (pas de tactics)
  king: {
    criteria: ['mobility', 'position', 'activity', 'castling', 'support', 'safety'],
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

// 🧮 FONCTIONS DE CALCUL DES CRITÈRES SPÉCIFIQUES

// 🎯 FONCTIONS SPÉCIFIQUES À IMPLÉMENTER

export function calculatePawnStructure(board: any, square: string, color: string): number {
  // TODO: Implémenter l'analyse de structure des pions
  // Pour l'instant, retourne une valeur basique
  return 1.5; // Placeholder sur 2.5
}

export function calculatePawnAdvancement(board: any, square: string, color: string): number {
  // TODO: Implémenter l'analyse d'avancement des pions
  // Pour l'instant, retourne une valeur basique
  return 1.0; // Placeholder sur 2.5
}

export function calculateKnightTactics(board: any, square: string, color: string): number {
  // TODO: Implémenter l'analyse tactique du cavalier (outposts, etc.)
  return 1.5; // Placeholder sur 2.5
}

export function calculateBishopDiagonals(board: any, square: string, color: string): number {
  // Utilise la fonction existante diagonalsScore mais normalise
  // diagonalsScore retourne 0-2.5, donc déjà normalisé
  return 1.8; // Placeholder - utilisera la fonction existante
}

export function calculateRookOpenFiles(board: any, square: string, color: string): number {
  // TODO: Implémenter l'analyse des colonnes ouvertes
  return 1.2; // Placeholder sur 2.5
}

export function calculateQueenCentralization(board: any, square: string, color: string): number {
  // TODO: Implémenter l'analyse de centralisation de la dame
  return 1.8; // Placeholder sur 2.5
}

export function calculateKingActivity(board: any, square: string, color: string, phase: any): number {
  // TODO: Implémenter l'analyse d'activité du roi (important en finale)
  return phase.name === 'Endgame' ? 2.0 : 0.5; // Plus actif en finale
}

export function calculateCastlingScore(board: any, square: string, color: string): number {
  // TODO: Implémenter l'analyse des droits de roque et sécurité
  return 1.5; // Placeholder sur 2.5
}