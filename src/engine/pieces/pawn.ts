

import type { Color, Square } from 'chess.js'
import { calculateMobility, PIECE_MOVEMENTS } from '../mobility.ts'
import { positionScore } from '../psqt.ts'
import type {
  EnrichedBoard,
  Mobility,
  PawnBlocked,
  PawnEvaluation,
  PawnMetrics,
  PawnWeights,
  PhaseGame
} from '../types.ts'
import { indicesToSquare, isValidSquare, squareToIndices } from '../utils.ts'
import { getWeightsByPhase, mobilityScore, pieceScore, safetyScore, supportScore } from './utils.ts'

const PAWN_CRITERIA_KEYS: readonly (keyof PawnMetrics)[] = ["mobility", "position", "tactics", "support", "safety", "structure", "advancement"];

const PAWN_OPENING_WEIGHTS: PawnWeights = {
  mobility: 0.8,          // Modéré : développement et contrôle
  position: 1.5,          // IMPORTANT : contrôle du centre vital
  tactics: 0.5, // A MODIFIER
  structure: 1.3,         // Important : chaînes, pas de faiblesses
  advancement: 0.4,       // Faible : promotion lointaine
  support: 1.2,           // Important : soutien des pièces
  safety: 1.0             // Standard : éviter les pertes
};

const PAWN_MIDDLEGAME_WEIGHTS: PawnWeights = {
  mobility: 1.0,          // Standard : flexibilité tactique
  position: 1.2,          // Important : contrôle de l'espace
  tactics: 0.5, // A MODIFIER
  structure: 1.4,         // IMPORTANT : structure = stratégie
  advancement: 0.8,       // Modéré : pions passés émergents
  support: 1.1,           // Important : coordination avec pièces
  safety: 0.9             // Modéré : sacrifices parfois justifiés
};

const PAWN_ENDGAME_WEIGHTS: PawnWeights = {
  mobility: 1.2,          // Important : liberté de mouvement
  position: 0.8,          // Modéré : avancement > position
  tactics: 0.5, // A MODIFIER
  structure: 1.1,         // Important mais moins critique
  advancement: 2.0,       // MAXIMUM : promotion = victoire !
  support: 0.6,           // Faible : moins de pièces disponibles
  safety: 0.7             // Modéré : risques calculés pour promouvoir
};

export function getPawnMobility(board: EnrichedBoard, square: Square, color: Color): Mobility {
  const mobility = calculateMobility(board, square, color, PIECE_MOVEMENTS.pawn);

  const { rank, file } = squareToIndices(square);
  board[rank][file].pawnStructure.isPawn = true;
  board[rank][file].pawnStructure.isolated = isPawnIsolated(board, square, color);
  board[rank][file].pawnStructure.doubled = isPawnDoubled(board, square, color);
  board[rank][file].pawnStructure.passed = isPawnPassed(board, square, color);
  board[rank][file].pawnStructure.backward = isPawnBackward(board, square, color);
  board[rank][file].pawnStructure.blocked = isPawnBlocked(board, square, color);
  board[rank][file].pawnStructure.hanging = isHangingPawns(board, square, color);

  return mobility;
}

export function evaluatePawn(board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): PawnEvaluation {
  const { rank, file } = squareToIndices(square);
  const pawnSquare = board[rank][file];

  const weights = getWeightsByPhase(
    PAWN_OPENING_WEIGHTS,
    PAWN_MIDDLEGAME_WEIGHTS,
    PAWN_ENDGAME_WEIGHTS,
    phase.value
  );

  const metrics: PawnMetrics = {
    mobility: mobilityScore(pawnSquare, 3),
    position: positionScore('n', rank, file, color, phase.name),
    support: supportScore(pawnSquare),
    safety: safetyScore(pawnSquare),
    tactics: 1, // NEEoD GENERIQUE
    structure: 1,
    advancement: 1
  }

  const { scores, totalScore, grade } = pieceScore(metrics, weights, PAWN_CRITERIA_KEYS);
  return {
    ...scores,
    totalScore,
    grade,
  };
}

function isPawnIsolated(board: EnrichedBoard, square: Square, color: Color): boolean {
  const { file } = squareToIndices(square);

  const adjacentFiles = [file - 1, file + 1].filter(f => f >= 0 && f < 8);

  for (const adjFile of adjacentFiles) {
    for (let r = 0; r < 8; r++) {
      const piece = board[r][adjFile].piece;
      if (piece && piece.type === 'p' && piece.color === color) {
        return false;
      }
    }
  }
  return true;
}

function isPawnDoubled(board: EnrichedBoard, square: Square, color: Color): boolean {
  const { file } = squareToIndices(square);

  let pawnCount = 0;

  for (let r = 0; r < 8; r++) {
    const piece = board[r][file].piece;
    if (piece && piece.type === 'p' && piece.color === color) {
      pawnCount++;
    }
  }
  return pawnCount >= 2; // 2+ pions = doublé
}

function isPawnPassed(board: EnrichedBoard, square: Square, color: Color): boolean {
  const { rank, file } = squareToIndices(square);
  const opponentColor = color === 'w' ? 'b' : 'w';

  const direction = color === 'w' ? -1 : 1;
  const finalRank = color === 'w' ? 0 : 7;

  const columnsToCheck = [file - 1, file, file + 1].filter(f => f >= 0 && f < 8);

  for (let r = rank + direction; r !== finalRank + direction; r += direction) {
    for (const col of columnsToCheck) {
      const piece = board[r][col].piece;

      if (piece && piece.type === 'p' && piece.color === opponentColor) {
        return false;
      }
    }
  }
  return true;
}

function isPawnBackward(board: EnrichedBoard, square: Square, color: Color): boolean {
  const { rank, file } = squareToIndices(square);

  // 1. ✅ Vérifier si le pion est "moins avancé" que ses voisins
  let isBehindNeighbors = false;
  let hasNeighborPawns = false;

  for (const fileOffset of [-1, 1]) {
    const neighborFile = file + fileOffset;
    if (!isValidSquare(rank, neighborFile)) continue;

    // Chercher des pions alliés sur la colonne adjacente
    for (let r = 0; r < 8; r++) {
      const piece = board[r][neighborFile].piece;
      if (piece && piece.type === 'p' && piece.color === color) {
        hasNeighborPawns = true;

        // Le pion voisin est-il plus avancé ?
        const neighborIsMoreAdvanced = color === 'w' ? r < rank : r > rank;
        if (neighborIsMoreAdvanced) {
          isBehindNeighbors = true;
        }
      }
    }
  }

  // Si pas de voisins ou pas en retard, pas arriéré
  if (!hasNeighborPawns || !isBehindNeighbors) {
    return false;
  }

  // 2. ✅ Vérifier qu'il ne peut plus bénéficier de leur protection
  const canBeProtectedByNeighbors = [-1, 1].some(fileOffset => {
    const neighborFile = file + fileOffset;
    if (!isValidSquare(rank, neighborFile)) return false;

    for (let r = 0; r < 8; r++) {
      const piece = board[r][neighborFile].piece;
      if (piece && piece.type === 'p' && piece.color === color) {
        // Un pion peut protéger s'il est derrière ou au même niveau
        const canProtect = color === 'w' ? r >= rank : r <= rank;
        if (canProtect) return true;
      }
    }
    return false;
  });

  return !canBeProtectedByNeighbors;
}

function isPawnBlocked(board: EnrichedBoard, square: Square, color: Color): PawnBlocked {
  const { rank, file } = squareToIndices(square);
  const direction = color === 'w' ? -1 : 1;
  const nextRank = rank + direction;

  if (!isValidSquare(nextRank, file)) {
    return { isBlocked: false, blockedBy: undefined, permanentlyBlocked: false };
  }

  const piece = board[nextRank][file].piece;
  if (!piece) {
    return { isBlocked: false, blockedBy: undefined, permanentlyBlocked: false };
  }

  const blockedBy = indicesToSquare(nextRank, file);
  const permanentlyBlocked = piece.type === 'p' && piece.color !== color;

  return {
    isBlocked: true,
    blockedBy,
    permanentlyBlocked
  };
}

function isHangingPawns(board: EnrichedBoard, square: Square, color: Color): boolean {
  const { rank, file } = squareToIndices(square);

  // 1. Vérifier si le pion est dans les colonnes centrales (c, d, e, f = indices 2, 3, 4, 5)
  if (file < 2 || file > 5) {
    return false;
  }

  // 2. Chercher un pion allié adjacent sur la même rangée
  let adjacentPawnFile = -1;

  // Vérifier colonne de gauche
  if (file > 0) {
    const leftPiece = board[rank][file - 1].piece;
    if (leftPiece && leftPiece.type === 'p' && leftPiece.color === color) {
      adjacentPawnFile = file - 1;
    }
  }

  // Vérifier colonne de droite (seulement si pas trouvé à gauche)
  if (adjacentPawnFile === -1 && file < 7) {
    const rightPiece = board[rank][file + 1].piece;
    if (rightPiece && rightPiece.type === 'p' && rightPiece.color === color) {
      adjacentPawnFile = file + 1;
    }
  }

  // Si pas de pion adjacent, ce n'est pas un pion pendant
  if (adjacentPawnFile === -1) {
    return false;
  }

  // 3. Vérifier qu'il n'y a pas de pions alliés sur les colonnes extérieures
  const leftmostFile = Math.min(file, adjacentPawnFile);
  const rightmostFile = Math.max(file, adjacentPawnFile);

  // Vérifier colonne à gauche du duo
  if (leftmostFile > 0) {
    for (let r = 0; r < 8; r++) {
      const piece = board[r][leftmostFile - 1].piece;
      if (piece && piece.type === 'p' && piece.color === color) {
        return false; // Il y a un pion allié sur la colonne adjacente gauche
      }
    }
  }

  // Vérifier colonne à droite du duo
  if (rightmostFile < 7) {
    for (let r = 0; r < 8; r++) {
      const piece = board[r][rightmostFile + 1].piece;
      if (piece && piece.type === 'p' && piece.color === color) {
        return false; // Il y a un pion allié sur la colonne adjacente droite
      }
    }
  }

  // 4. Vérifier qu'il n'y a pas de pions adverses sur les colonnes du duo
  const filesToCheck = [leftmostFile, rightmostFile];

  for (const fileToCheck of filesToCheck) {
    for (let r = 0; r < 8; r++) {
      if (r === rank) continue; // Ignorer la rangée actuelle

      const piece = board[r][fileToCheck].piece;
      if (piece && piece.type === 'p' && piece.color !== color) {
        return false; // Il y a un pion adverse sur une des colonnes du duo
      }
    }
  }

  return true;
}