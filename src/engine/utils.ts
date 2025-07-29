import type { Square } from 'chess.js'

export function squareToIndices(square: Square): { rank: number, file: number } {
  const file = square.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
  const rank = 8 - parseInt(square[1]);   // '8' = 0, '7' = 1, etc.
  return { rank, file };
}

export function indicesToSquare(rank: number, file: number): string {
  const fileChar = String.fromCharCode(97 + file); // 0 = 'a', 1 = 'b', etc.
  const rankNum = 8 - rank;                        // 0 = '8', 1 = '7', etc.
  return fileChar + rankNum;
}

export function isValidSquare(rank: number, file: number): boolean {
  return rank >= 0 && rank < 8 && file >= 0 && file < 8;
}