// 🏆 PIECE-SQUARE TABLES COMPLÈTES DE STOCKFISH
// Tables extraites et adaptées du code source de Stockfish
// Format: [rang8...rang1] où rang8 = index 0, rang1 = index 7

// ♟️ PION - OUVERTURE/MILIEU DE JEU
import type { Color, PieceSymbol } from 'chess.js'
import { STANDARD_CRITERION_MAX } from './pieces/normalization.ts'
import type { PhaseName } from './types.ts'

export const PAWN_PSQT_OPENING = [
  [  0,   0,   0,   0,   0,   0,   0,   0], // Rang 8 (impossible)
  [ 98, 134,  61,  95,  68, 126,  34, -11], // Rang 7
  [ -6,   7,  26,  31,  65,  56,  25, -20], // Rang 6
  [-14,  13,   6,  21,  23,  12,  17, -23], // Rang 5
  [-27,  -2,  -5,  12,  17,   6,  10, -25], // Rang 4
  [-26,  -4,  -4, -10,   3,   3,  33, -12], // Rang 3
  [-35,  -1, -20, -23, -15,  24,  38, -22], // Rang 2
  [  0,   0,   0,   0,   0,   0,   0,   0]  // Rang 1 (impossible)
];

// ♟️ PION - FINALE
export const PAWN_PSQT_ENDGAME = [
  [  0,   0,   0,   0,   0,   0,   0,   0], // Rang 8
  [178, 173, 158, 134, 147, 132, 165, 187], // Rang 7
  [ 94, 100,  85,  67,  56,  53,  82, 84],  // Rang 6
  [ 32,  24,  13,   5,  -2,   4,  17, 17],  // Rang 5
  [ 13,   9,  -3,  -7,  -7,  -8,   3, -1],  // Rang 4
  [  4,   7,  -6,   1,   0,  -5,  -1, -8],  // Rang 3
  [ 13,   8,   8,  10,  13,   0,   2, -7],  // Rang 2
  [  0,   0,   0,   0,   0,   0,   0,   0]   // Rang 1
];

// ♞ CAVALIER - OUVERTURE/MILIEU DE JEU
export const KNIGHT_PSQT_OPENING = [
  [-167, -89, -34, -49,  61, -97, -15, -107], // Rang 8
  [ -73, -41,  72,  36,  23,  62,   7,  -17], // Rang 7
  [ -47,  60,  37,  65,  84, 129,  73,   44], // Rang 6
  [  -9,  17,  19,  53,  37,  69,  18,   22], // Rang 5
  [ -13,   4,  16,  13,  28,  19,  21,   -8], // Rang 4
  [ -23,  -9,  12,  10,  19,  17,  25,  -16], // Rang 3
  [ -29, -53, -12,  -3,  -1,  18, -14,  -19], // Rang 2
  [-105, -21, -58, -33, -17, -28, -19,  -23]  // Rang 1
];

// ♞ CAVALIER - FINALE
export const KNIGHT_PSQT_ENDGAME = [
  [-58, -38, -13, -28, -31, -27, -63, -99], // Rang 8
  [-25,  -8, -25,  -2,  -9, -25, -24, -52], // Rang 7
  [-24, -20,  10,   9,  -1,  -9, -19, -41], // Rang 6
  [-17,   3,  22,  22,  22,  11,   8, -18], // Rang 5
  [-18,  -6,  16,  25,  16,  17,   4, -18], // Rang 4
  [-23,  -3,  -1,  15,  10,  -3, -20, -22], // Rang 3
  [-42, -20, -10,  -5,  -2, -20, -23, -44], // Rang 2
  [-29, -51, -23, -15, -22, -18, -50, -64]  // Rang 1
];

// ♗ FOU - OUVERTURE/MILIEU DE JEU
export const BISHOP_PSQT_OPENING = [
  [-29,   4, -82, -37, -25, -42,   7,  -8], // Rang 8
  [-26,  16, -18, -13,  30,  59,  18, -47], // Rang 7
  [-16,  37,  43,  40,  35,  50,  37,  -2], // Rang 6
  [ -4,   5,  19,  50,  37,  37,   7,  -2], // Rang 5
  [ -6,  13,  13,  26,  34,  12,  10,   4], // Rang 4
  [  0,  15,  15,  15,  14,  27,  18,  10], // Rang 3
  [  4,  15,  16,   0,   7,  21,  33,   1], // Rang 2
  [-33,  -3, -14, -21, -13, -12, -39, -21]  // Rang 1
];

// ♗ FOU - FINALE  
export const BISHOP_PSQT_ENDGAME = [
  [-14, -21, -11,  -8,  -7,  -9, -17, -24], // Rang 8
  [ -8,  -4,   7, -12,  -3, -13,  -4, -14], // Rang 7
  [  2,  -8,   0,  -1,  -2,   6,   0,   4], // Rang 6
  [ -3,   9,  12,   9,  14,  10,   3,   2], // Rang 5
  [ -6,   3,  13,  19,   7,  10,  -3,  -9], // Rang 4
  [-12,  -3,   8,  10,  13,   3,  -7, -15], // Rang 3
  [-14, -18,  -7,  -1,   4,  -9, -15, -27], // Rang 2
  [-23,  -9, -23,  -5,  -9, -16,  -5, -17]  // Rang 1
];

// ♜ TOUR - OUVERTURE/MILIEU DE JEU
export const ROOK_PSQT_OPENING = [
  [ 32,  42,  32,  51, 63,   9,  31,  43], // Rang 8
  [ 27,  32,  58,  62, 80,  67,  26,  44], // Rang 7
  [ -5,  19,  26,  36, 17,  45,  61,  16], // Rang 6
  [-24, -11,   7,  26, 24,  35,  -8, -20], // Rang 5
  [-36, -26, -12,  -1,  9,  -7,   6, -23], // Rang 4
  [-45, -25, -16, -17,  3,   0,  -5, -33], // Rang 3
  [-44, -16, -20,  -9, -1,  11,  -6, -71], // Rang 2
  [-19, -13,   1,  17, 16,   7, -37, -26]  // Rang 1
];

// ♜ TOUR - FINALE
export const ROOK_PSQT_ENDGAME = [
  [13, 10, 18, 15, 12,  12,   8,   5], // Rang 8
  [11, 13, 13, 11, -3,   3,   8,   3], // Rang 7
  [ 7,  7,  7,  5,  4,  -3,  -5,  -3], // Rang 6
  [ 4,  3, 13,  1,  2,   1,  -1,   2], // Rang 5
  [ 3,  5,  8,  4, -5,  -6,  -8, -11], // Rang 4
  [-4,  0, -5, -1, -7, -12,  -8, -16], // Rang 3
  [-6, -6,  0,  2, -9,  -9, -11,  -3], // Rang 2
  [-9,  2,  3, -1, -5, -13,   4, -20]  // Rang 1
];

// ♛ DAME - OUVERTURE/MILIEU DE JEU
export const QUEEN_PSQT_OPENING = [
  [-28,   0,  29,  12,  59,  44,  43,  45], // Rang 8
  [-24, -39,  -5,   1, -16,  57,  28,  54], // Rang 7
  [-13, -17,   7,   8,  29,  56,  47,  57], // Rang 6
  [-27, -27, -16, -16,  -1,  17,  -2,   1], // Rang 5
  [ -9, -26,  -9, -10,  -2,  -4,   3,  -3], // Rang 4
  [-14,   2, -11,  -2,  -5,   2,  14,   5], // Rang 3
  [-35,  -8,  11,   2,   8,  15,  -3,   1], // Rang 2
  [ -1, -18,  -9,  10, -15, -25, -31, -50]  // Rang 1
];

// ♛ DAME - FINALE
export const QUEEN_PSQT_ENDGAME = [
  [ -9,  22,  22,  27,  27,  19,  10,  20], // Rang 8
  [-17,  20,  32,  41,  58,  25,  30,   0], // Rang 7
  [-20,   6,   9,  49,  47,  35,  19,   9], // Rang 6
  [  3,  22,  24,  45,  57,  40,  57,  36], // Rang 5
  [-18,  28,  19,  47,  31,  34,  39,  23], // Rang 4
  [-16, -27,  15,   6,   9,  17,  10,   5], // Rang 3
  [-22, -23, -30, -16, -16, -23, -36, -32], // Rang 2
  [-33, -28, -22, -43,  -5, -32, -20, -41]  // Rang 1
];

// ♚ ROI - OUVERTURE/MILIEU DE JEU
export const KING_PSQT_OPENING = [
  [-65,  23,  16, -15, -56, -34,   2,  13], // Rang 8
  [ 29,  -1, -20,  -7,  -8,  -4, -38, -29], // Rang 7
  [ -9,  24,   2, -16, -20,   6,  22, -22], // Rang 6
  [-17, -20, -12, -27, -30, -25, -14, -36], // Rang 5
  [-49,  -1, -27, -39, -46, -44, -33, -51], // Rang 4
  [-14, -14, -22, -46, -44, -30, -15, -27], // Rang 3
  [  1,   7,  -8, -64, -43, -16,   9,   8], // Rang 2
  [-15,  36,  12, -54,   8, -28,  24,  14]  // Rang 1
];

// ♚ ROI - FINALE
export const KING_PSQT_ENDGAME = [
  [-74, -35, -18, -18, -11,  15,   4, -17], // Rang 8
  [-12,  17,  14,  17,  17,  38,  23,  11], // Rang 7
  [ 10,  17,  23,  15,  20,  45,  44,  13], // Rang 6
  [ -8,  22,  24,  27,  26,  33,  26,   3], // Rang 5
  [-18,  -4,  21,  24,  27,  23,   9, -11], // Rang 4
  [-19,  -3,  11,  21,  23,  16,   7,  -9], // Rang 3
  [-27, -11,   4,  13,  14,   4,  -5, -17], // Rang 2
  [-53, -34, -21, -11, -28, -14, -24, -43]  // Rang 1
];

export function getPSQTValue(
  piece: PieceSymbol,
  rank: number,
  file: number,
  color: Color,
  isOpening: boolean
): number {
  const adjustedRank = color === 'w' ? 7 - rank : rank;

  const tables = {
    p: { opening: PAWN_PSQT_OPENING, endgame: PAWN_PSQT_ENDGAME },
    n: { opening: KNIGHT_PSQT_OPENING, endgame: KNIGHT_PSQT_ENDGAME },
    b: { opening: BISHOP_PSQT_OPENING, endgame: BISHOP_PSQT_ENDGAME },
    r: { opening: ROOK_PSQT_OPENING, endgame: ROOK_PSQT_ENDGAME },
    q: { opening: QUEEN_PSQT_OPENING, endgame: QUEEN_PSQT_ENDGAME },
    k: { opening: KING_PSQT_OPENING, endgame: KING_PSQT_ENDGAME }
  };

  const table = isOpening ? tables[piece].opening : tables[piece].endgame;
  return table[adjustedRank][file];
}

export const PSQT_RANGES = {
  pawn: {
    opening: { min: -35, max: 134 },
    endgame: { min: -8, max: 187 }
  },
  knight: {
    opening: { min: -167, max: 129 },
    endgame: { min: -99, max: 25 }
  },
  bishop: {
    opening: { min: -82, max: 59 },
    endgame: { min: -27, max: 19 }
  },
  rook: {
    opening: { min: -71, max: 80 },
    endgame: { min: -20, max: 18 }
  },
  queen: {
    opening: { min: -50, max: 57 },
    endgame: { min: -43, max: 58 }
  },
  king: {
    opening: { min: -65, max: 36 },
    endgame: { min: -74, max: 45 }
  }
};

export function positionScore(
  piece: 'p' | 'n' | 'b' | 'r' | 'q' | 'k',
  rank: number,
  file: number,
  color: Color,
  phaseName: PhaseName
): number {
  const adjustedRank = color === 'b' ? 7 - rank : rank;
  const isOpening = phaseName === 'Opening';

  // Sélectionner la table appropriée
  const tables = {
    p: { opening: PAWN_PSQT_OPENING, endgame: PAWN_PSQT_ENDGAME },
    n: { opening: KNIGHT_PSQT_OPENING, endgame: KNIGHT_PSQT_ENDGAME },
    b: { opening: BISHOP_PSQT_OPENING, endgame: BISHOP_PSQT_ENDGAME },
    r: { opening: ROOK_PSQT_OPENING, endgame: ROOK_PSQT_ENDGAME },
    q: { opening: QUEEN_PSQT_OPENING, endgame: QUEEN_PSQT_ENDGAME },
    k: { opening: KING_PSQT_OPENING, endgame: KING_PSQT_ENDGAME }
  };

  // 🎯 UTILISER PSQT_RANGES AU LIEU DE DUPLIQUER
  const pieceRanges = {
    p: PSQT_RANGES.pawn,
    n: PSQT_RANGES.knight,
    b: PSQT_RANGES.bishop,
    r: PSQT_RANGES.rook,
    q: PSQT_RANGES.queen,
    k: PSQT_RANGES.king
  };

  const table = isOpening ? tables[piece].opening : tables[piece].endgame;
  const range = isOpening ? pieceRanges[piece].opening : pieceRanges[piece].endgame;

  const psqtValue = table[adjustedRank][file];
  const normalizedValue = (psqtValue - range.min) / (range.max - range.min);

  return Math.max(0, Math.min(STANDARD_CRITERION_MAX.position, normalizedValue * STANDARD_CRITERION_MAX.position));
}