import type { Square } from 'chess.js'
import type { EnrichedBoard, EnrichedSquare } from './types.ts'

export function initializeEmptyBoard (): EnrichedBoard {
  const board: EnrichedBoard = []

  for (let rank = 0; rank < 8; rank++) {
    board[rank] = []
    for (let file = 0; file < 8; file++) {
      board[rank][file] = createEmptySquare(rank, file)
    }
  }

  return board
}

function createEmptySquare (rank: number, file: number): EnrichedSquare {
  const square = getSquareName(rank, file)

  return {
    // Données de base
    piece: undefined,
    square,
    rank,
    file,

    // Analyse tactique
    attackers: [],
    defenders: [],
    mobility: { moves: [], captures: [], checks: [], totalMobility: 0 },

    // Contrôle
    control: { white: [], black: [], dominantColor: undefined },

    // Valeurs
    values: { pieceValue: 0, positionalValue: 0, tacticalValue: 0, totalValue: 0 },

    // Géométrie
    geometry: {
      isCenter: isCenterSquare(rank, file),
      isExtendedCenter: isExtendedCenter(rank, file),
      isEdge: isEdgeSquare(rank, file),
      isCorner: isCornerSquare(rank, file),
      isDarkSquare: (rank + file) % 2 === 1,
      distanceFromCenter: distanceFromCenter(rank, file)
    },

    // Structure de pions
    pawnStructure: {
      isPawn: false,
      isolated: false,
      doubled: false,
      passed: false,
      backward: false,
      hanging: false,
      blocked: {
        isBlocked: false,
        permanentlyBlocked: false,
        blockedBy: undefined
      },
      chain: false,
      support: 0,
      weakness: 0
    },

    // Sécurité roi
    kingSafety: {
      whiteKingDistance: 0, blackKingDistance: 0, inKingZone: false,
      castlingRights: false, escapeSquare: false
    },

    // Menaces
    threats: {
      isHanging: false, isPinned: false, isFork: false,
      isSkewer: false, threatLevel: 0
    },

    // Métadonnées
    metadata: {
      lastUpdated: Date.now(),
      analysisVersion: '1.0',
      isCalculated: false
    }
  }
}

function getSquareName (rank: number, file: number): Square {
  return String.fromCharCode(97 + file) + (8 - rank) as Square
}

function isCenterSquare (rank: number, file: number): boolean {
  return rank >= 3 && rank <= 4 && file >= 3 && file <= 4
}

function isExtendedCenter (rank: number, file: number): boolean {
  return rank >= 2 && rank <= 5 && file >= 2 && file <= 5
}

function isEdgeSquare (rank: number, file: number): boolean {
  return rank === 0 || rank === 7 || file === 0 || file === 7
}

function isCornerSquare (rank: number, file: number): boolean {
  return (rank === 0 || rank === 7) && (file === 0 || file === 7)
}

function distanceFromCenter (rank: number, file: number): number {
  const centerRank = 3.5
  const centerFile = 3.5
  return Math.sqrt(Math.pow(rank - centerRank, 2) + Math.pow(file - centerFile, 2))
}
