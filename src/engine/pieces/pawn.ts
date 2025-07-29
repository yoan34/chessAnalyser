

import type { Color, Square } from 'chess.js'
import type { EnrichedBoard, Mobility, PawnBlocked } from '../types.ts'

// 🎯 Exemple d'usage dans ta fonction pion
import { indicesToSquare, isValidSquare, squareToIndices } from '../utils.ts'

export function getPawnMobility(board: EnrichedBoard, square: Square, color: Color): Mobility {
  const mobility: Mobility = {
    moves: [],
    captures: [],
    checks: [],
    totalMobility: 0,
  }

  const { rank, file } = squareToIndices(square);
  const direction = color === 'w' ? -1 : 1;
  const startRank = color === 'w' ? 6 : 1;


  // 🎯 Mouvement d'une case
  const oneSquareRank = rank + direction;
  if (isValidSquare(oneSquareRank, file) && !board[oneSquareRank][file].piece) {
    mobility.moves.push(indicesToSquare(oneSquareRank, file));

    // 🎯 Mouvement de deux cases (premier coup)
    if (rank === startRank) {
      const twoSquareRank = rank + (2 * direction);
      if (isValidSquare(twoSquareRank, file) && !board[twoSquareRank][file].piece) {
        mobility.moves.push(indicesToSquare(twoSquareRank, file));
      }
    }
  }

  // 🎯 Captures diagonales
  for (const fileOffset of [-1, 1]) {
    const captureRank = rank + direction;
    const captureFile = file + fileOffset;

    if (isValidSquare(captureRank, captureFile)) {
      const targetSquare = board[captureRank][captureFile];
      if (targetSquare.piece && targetSquare.piece.color !== color) {
        if (targetSquare.piece.type === 'k') {
          mobility.checks.push(indicesToSquare(captureRank, captureFile));
        } else {
          mobility.captures.push(indicesToSquare(captureRank, captureFile));
        }

      }
    }
  }

  board[rank][file].mobility.moves = mobility.moves
  board[rank][file].mobility.captures = mobility.captures
  board[rank][file].mobility.checks = mobility.checks
  board[rank][file].mobility.totalMobility = mobility.moves.length + mobility.captures.length + + mobility.checks.length

  board[rank][file].pawnStructure.isPawn = true;
  board[rank][file].pawnStructure.isolated = isPawnIsolated(board, square, color);
  board[rank][file].pawnStructure.doubled = isPawnDoubled(board, square, color);
  board[rank][file].pawnStructure.passed = isPawnPassed(board, square, color);
  board[rank][file].pawnStructure.backward = isPawnBackward(board, square, color);
  board[rank][file].pawnStructure.blocked = isPawnBlocked(board, square, color);
  board[rank][file].pawnStructure.hanging = isHangingPawns(board, square, color);
  console.log('PAWN ', square, board[rank][file].pawnStructure.isolated)
  console.log(mobility)
  return mobility;
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