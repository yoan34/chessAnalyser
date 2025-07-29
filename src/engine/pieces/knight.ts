import type { Color, Square } from 'chess.js'
import { positionScore } from '../psqt.ts'
import type { EnrichedBoard, KnightEvaluation, KnightWeights, Mobility, PhaseGame } from '../types.ts'
import { indicesToSquare, isValidSquare, squareToIndices } from '../utils.ts'
import { getWeightsByPhase, gradeFromScore, mobilityScore, safetyScore, supportScore } from './utils.ts'

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
  const mobility: Mobility = {
    moves: [],
    captures: [],
    checks: [],
    totalMobility: 0,
  }

  const { rank, file } = squareToIndices(square);

  // 🎯 Les 8 mouvements possibles du cavalier : [rankOffset, fileOffset]
  const knightMoves = [
    [-2, -1], // 2 haut, 1 gauche
    [-2, 1],  // 2 haut, 1 droite
    [-1, -2], // 1 haut, 2 gauche
    [-1, 2],  // 1 haut, 2 droite
    [1, -2],  // 1 bas, 2 gauche
    [1, 2],   // 1 bas, 2 droite
    [2, -1],  // 2 bas, 1 gauche
    [2, 1]    // 2 bas, 1 droite
  ];

  // 🎯 Vérifier chaque mouvement possible
  for (const [rankOffset, fileOffset] of knightMoves) {
    const targetRank = rank + rankOffset;
    const targetFile = file + fileOffset;

    // 🎯 Vérifier si la case cible est valide
    if (isValidSquare(targetRank, targetFile)) {
      const targetSquare = board[targetRank][targetFile];
      const targetSquareNotation = indicesToSquare(targetRank, targetFile);

      // 🎯 Case vide : mouvement possible
      if (!targetSquare.piece) {
        mobility.moves.push(targetSquareNotation);
      }
      // 🎯 Pièce ennemie : capture possible
      else if (targetSquare.piece.color !== color) {
        if (targetSquare.piece.type === 'k') {
          mobility.checks.push(targetSquareNotation);
        } else {
          mobility.captures.push(targetSquareNotation);
        }
      }
      // 🎯 Pièce alliée : pas de mouvement possible (case occupée)
      // On ne fait rien, le cavalier ne peut pas aller sur cette case
    }
  }

  // 🎯 Mettre à jour la mobilité totale
  mobility.totalMobility = mobility.moves.length + mobility.captures.length + mobility.checks.length;

  // 🎯 Sauvegarder dans le board
  board[rank][file].mobility.moves = mobility.moves;
  board[rank][file].mobility.captures = mobility.captures;
  board[rank][file].mobility.checks = mobility.checks;
  board[rank][file].mobility.totalMobility = mobility.totalMobility;

  console.log('KNIGHT ', square, 'mobility:', mobility.totalMobility);
  console.log(mobility);

  return mobility;
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

  const mobilityRaw = mobilityScore(knightSquare, 8)
  const positionRaw = positionScore('n', rank, file, color, phase.name)
  const supportRaw = supportScore(knightSquare)
  const safetyRaw = safetyScore(knightSquare)
  const tacticRaw = tacticScore(board, square, color, rank)


  const mobility = mobilityRaw * weights.mobility;
  const position = positionRaw * weights.position;
  const tactics = tacticRaw * weights.tactics;
  const support = supportRaw * weights.support;
  const safety = safetyRaw * weights.safety;

  // 📊 CALCUL FINAL
  const totalScore = mobility + position + tactics + support + safety;
  const { normalizedScore, grade } = gradeFromScore(totalScore)

  return {
    mobility: Math.round(mobility * 10) / 10,
    position: Math.round(position * 10) / 10,
    tactics: Math.round(tactics * 10) / 10,
    support: Math.round(support * 10) / 10,
    safety: Math.round(safety * 10) / 10,
    totalScore: Math.round(normalizedScore * 10) / 10,
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
