import { type Color, type PieceSymbol, type Square } from 'chess.js'
import {
  getPawnMobility,
  getBishopMobility,
  getKnightMobility,
  getRookMobility,
  getQueenMobility,
  getKingMobility
} from './pieces'
import type { EnrichedBoard, EnrichedSquare } from './types.ts'



export function addMobility(board: EnrichedBoard) {
  board.forEach((rank: EnrichedSquare[]) => {
    rank.forEach((square: EnrichedSquare) => {
      if (square.piece) {
        calculateMobility(board, square.square, square.piece.type, square.piece.color)
      }
    })
  })
}

function calculateMobility(board: EnrichedBoard, square: Square, piece: PieceSymbol, color: Color) {
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

