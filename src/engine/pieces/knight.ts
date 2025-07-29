import type { Color, Square } from 'chess.js'
import { calculateMobility, PIECE_MOVEMENTS } from '../mobility.ts'
import { positionScore } from '../psqt.ts'
import type { EnrichedBoard, KnightEvaluation, KnightMetrics, KnightWeights, Mobility, PhaseGame } from '../types.ts'
import { isValidSquare, squareToIndices } from '../utils.ts'
import { getWeightsByPhase, mobilityScore, pieceScore, safetyScore, supportScore } from './utils.ts'

const KNIGHT_CRITERIA_KEYS: readonly (keyof KnightMetrics)[] = ["mobility", "position", "tactics", "support", "safety"] as const;

const KNIGHT_OPENING_WEIGHTS: KnightWeights = {
  mobility: 0.8,
  position: 1.3,
  tactics: 0.8,
  support: 1.1,
  safety: 1.4
};

const KNIGHT_MIDDLEGAME_WEIGHTS: KnightWeights = {
  mobility: 1.2,
  position: 0.9,
  tactics: 1.6,
  support: 1.0,
  safety: 0.9
};

const KNIGHT_ENDGAME_WEIGHTS: KnightWeights = {
  mobility: 1.6,
  position: 0.6,
  tactics: 1.0,
  support: 0.5,
  safety: 0.7
};

export function getKnightMobility(board: EnrichedBoard, square: Square, color: Color): Mobility {
  return calculateMobility(board, square, color, PIECE_MOVEMENTS.knight);
}

export function evaluateKnight(board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): KnightEvaluation {
  const { rank, file } = squareToIndices(square);
  const knightSquare = board[rank][file];

  const weights = getWeightsByPhase(
    KNIGHT_OPENING_WEIGHTS,
    KNIGHT_MIDDLEGAME_WEIGHTS,
    KNIGHT_ENDGAME_WEIGHTS,
    phase.value
  );

  const metrics: KnightMetrics = {
    mobility: mobilityScore(knightSquare, 8),
    position: positionScore('n', rank, file, color, phase.name),
    support: supportScore(knightSquare),
    safety: safetyScore(knightSquare),
    tactics: tacticScore(board, square, color, rank) // NEEoD GENERIQUE
  }

  const { scores, totalScore, grade } = pieceScore(metrics, weights, KNIGHT_CRITERIA_KEYS);
  return {
    ...scores,
    totalScore,
    grade,
  };
}

function tacticScore(board: EnrichedBoard, square: Square, color: Color, rank: number): number {
  const isInEnemyTerritory = color === 'w' ? rank <= 4 : rank >= 3;
  const isProtectedByPawn = isKnightProtectedByPawn(board, square, color);
  const canBeAttackedByEnemyPawn = canKnightBeAttackedByPawn(board, square, color);

  let outpostRaw = 0;

  if (isInEnemyTerritory && isProtectedByPawn && !canBeAttackedByEnemyPawn) {
    outpostRaw = 2.5;
  } else if (isInEnemyTerritory && (isProtectedByPawn || !canBeAttackedByEnemyPawn)) {
    outpostRaw = 1.5;
  } else if (isInEnemyTerritory) {
    outpostRaw = 0.5;
  }
  return outpostRaw;
}

function isKnightProtectedByPawn(board: EnrichedBoard, square: Square, color: Color): boolean {
  const { rank, file } = squareToIndices(square);
  const pawnDirection = color === 'w' ? 1 : -1;

  for (const fileOffset of [-1, 1]) {
    const pawnRank = rank + pawnDirection;
    const pawnFile = file + fileOffset;

    if (isValidSquare(pawnRank, pawnFile)) {
      const piece = board[pawnRank][pawnFile].piece;
      if (piece && piece.type === 'p' && piece.color === color) {
        return true;
      }
    }
  }
  return false;
}

function canKnightBeAttackedByPawn(board: EnrichedBoard, square: Square, color: Color): boolean {
  const { rank, file } = squareToIndices(square);
  const opponentColor = color === 'w' ? 'b' : 'w';
  const pawnDirection = opponentColor === 'w' ? -1 : 1;

  for (const fileOffset of [-1, 1]) {
    const pawnRank = rank - pawnDirection;
    const pawnFile = file + fileOffset;

    if (isValidSquare(pawnRank, pawnFile)) {
      const piece = board[pawnRank][pawnFile].piece;
      if (piece && piece.type === 'p' && piece.color === opponentColor) {
        return true;
      }
    }
  }
  return false;
}
