import { type Color, type PieceSymbol, type Square } from 'chess.js'
import {
  getBishopMobility,
  getKingMobility,
  getKnightMobility,
  getPawnMobility,
  getQueenMobility,
  getRookMobility
} from './pieces'
import type { EnrichedBoard, EnrichedSquare, Mobility } from './types.ts'
import { indicesToSquare, isValidSquare, squareToIndices } from './utils.ts'

type MovePattern = [number, number];
type MoveType = 'single' | 'sliding';

type PieceMovementConfig = {
  patterns: MovePattern[];
  type: MoveType;
  specialLogic?: (board: EnrichedBoard, square: Square, color: Color, mobility: Mobility) => void;
}

export const PIECE_MOVEMENTS: Record<string, PieceMovementConfig> = {
  knight: {
    patterns: [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ],
    type: 'single'
  },
  bishop: {
    patterns: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    type: 'sliding'
  },
  rook: {
    patterns: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    type: 'sliding'
  },
  queen: {
    patterns: [
      [-1, 0], [1, 0], [0, -1], [0, 1], // rook moves
      [-1, -1], [-1, 1], [1, -1], [1, 1] // bishop moves
    ],
    type: 'sliding'
  },
  king: {
    patterns: [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ],
    type: 'single'
  },
  pawn: {
    patterns: [], // Géré par specialLogic
    type: 'single',
    specialLogic: handlePawnMovement
  }
};

export function calculateMobility(
  board: EnrichedBoard,
  square: Square,
  color: Color,
  config: PieceMovementConfig
): Mobility {
  const mobility: Mobility = {
    moves: [],
    captures: [],
    checks: [],
    totalMobility: 0,
  };
  const { rank, file } = squareToIndices(square);
  // Si la pièce a une logique spéciale (comme le pion)
  if (config.specialLogic) {
    config.specialLogic(board, square, color, mobility);
  } else {
    // Logique standard pour les autres pièces
    for (const [rankDir, fileDir] of config.patterns) {
      if (config.type === 'single') {
        processSingleMove(board, rank, file, rankDir, fileDir, color, mobility);
      } else {
        processSlidingMove(board, rank, file, rankDir, fileDir, color, mobility);
      }
    }
  }

  // Calculer la mobilité totale
  mobility.totalMobility = mobility.moves.length + mobility.captures.length + mobility.checks.length;

  // Sauvegarder dans le board
  updateBoardMobility(board, rank, file, mobility);

  return mobility;
}

function processSingleMove(
  board: EnrichedBoard,
  rank: number,
  file: number,
  rankDir: number,
  fileDir: number,
  color: Color,
  mobility: Mobility
): void {
  const targetRank = rank + rankDir;
  const targetFile = file + fileDir;

  if (isValidSquare(targetRank, targetFile)) {
    const targetSquare = board[targetRank][targetFile];
    const targetSquareNotation = indicesToSquare(targetRank, targetFile);

    categorizeMove(targetSquare, targetSquareNotation, color, mobility);
  }
}

function processSlidingMove(
  board: EnrichedBoard,
  rank: number,
  file: number,
  rankDir: number,
  fileDir: number,
  color: Color,
  mobility: Mobility
): void {
  let currentRank = rank + rankDir;
  let currentFile = file + fileDir;

  while (isValidSquare(currentRank, currentFile)) {
    const targetSquare = board[currentRank][currentFile];
    const targetSquareNotation = indicesToSquare(currentRank, currentFile);

    const shouldStop = categorizeMove(targetSquare, targetSquareNotation, color, mobility);

    if (shouldStop) break;

    currentRank += rankDir;
    currentFile += fileDir;
  }
}

function categorizeMove(
  targetSquare: EnrichedSquare,
  targetSquareNotation: string,
  color: Color,
  mobility: Mobility
): boolean {
  if (!targetSquare.piece) {
    mobility.moves.push(targetSquareNotation);
    return false; // Continue pour les mouvements glissants
  }

  // Pièce ennemie : capture possible
  if (targetSquare.piece.color !== color) {
    if (targetSquare.piece.type === 'k') {
      mobility.checks.push(targetSquareNotation);
    } else {
      mobility.captures.push(targetSquareNotation);
    }
    return true; // Arrêter après capture
  }

  // Pièce alliée : bloquer le chemin
  return true; // Arrêter
}

function handlePawnMovement(
  board: EnrichedBoard,
  square: Square,
  color: Color,
  mobility: Mobility
): void {
  const { rank, file } = squareToIndices(square);
  const direction = color === 'w' ? -1 : 1;
  const startRank = color === 'w' ? 6 : 1;

  // Mouvement d'une case
  const oneSquareRank = rank + direction;
  if (isValidSquare(oneSquareRank, file) && !board[oneSquareRank][file].piece) {
    mobility.moves.push(indicesToSquare(oneSquareRank, file));

    // Mouvement de deux cases (premier coup)
    if (rank === startRank) {
      const twoSquareRank = rank + (2 * direction);
      if (isValidSquare(twoSquareRank, file) && !board[twoSquareRank][file].piece) {
        mobility.moves.push(indicesToSquare(twoSquareRank, file));
      }
    }
  }

  // Captures diagonales
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
}

function updateBoardMobility(
  board: EnrichedBoard,
  rank: number,
  file: number,
  mobility: Mobility
): void {
  board[rank][file].mobility.moves = mobility.moves;
  board[rank][file].mobility.captures = mobility.captures;
  board[rank][file].mobility.checks = mobility.checks;
  board[rank][file].mobility.totalMobility = mobility.totalMobility;
}

export function addMobility(board: EnrichedBoard) {
  board.forEach((rank: EnrichedSquare[]) => {
    rank.forEach((square: EnrichedSquare) => {
      if (square.piece) {
        getMobility(board, square.square, square.piece.type, square.piece.color)
      }
    })
  })
}

function getMobility(board: EnrichedBoard, square: Square, piece: PieceSymbol, color: Color) {
  switch (piece) {
    case 'p': {
      return getPawnMobility(board, square, color)
    }
    case 'b': {
      return getBishopMobility(board, square, color)
    }
    case 'n': {
      return getKnightMobility(board, square, color)
    }
    case 'r': {
      return getRookMobility(board, square, color)
    }
    case 'q': {
      return getQueenMobility(board, square, color)
    }
    case 'k': {
      return getKingMobility(board, square, color)
    }
  }
}