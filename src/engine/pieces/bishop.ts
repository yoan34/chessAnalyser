import type { Color, Square } from 'chess.js'
import { calculateMobility, MAX_MOBILITY, PIECE_MOVEMENTS } from '../mobility.ts'
import { positionScore } from '../psqt.ts'
import type { BishopEvaluation, BishopMetrics, BishopWeights, EnrichedBoard, Mobility, PhaseGame } from '../types.ts'
import { isValidSquare, squareToIndices } from '../utils.ts'
import {
  calculateNormalizedPieceScore,
  getWeightsByPhase,
  mobilityScore,
  safetyScore,
  supportScore
} from './utils.ts'

const BISHOP_OPENING_WEIGHTS: BishopWeights = {
  mobility: 0.8,
  position: 1.2,
  diagonals: 1.4,
  tactics: 1.0,
  support: 1.1,
  safety: 1.3
}

const BISHOP_MIDDLEGAME_WEIGHTS: BishopWeights = {
  mobility: 1.3,
  position: 1.0,
  diagonals: 1.2,
  tactics: 1.6,
  support: 1.0,
  safety: 0.9
}

const BISHOP_ENDGAME_WEIGHTS: BishopWeights = {
  mobility: 1.5,
  position: 0.8,
  diagonals: 1.1,
  tactics: 0.7,
  support: 0.7,
  safety: 0.8
}

export function getBishopMobility (board: EnrichedBoard, square: Square, color: Color): Mobility {
  return calculateMobility(board, square, color, PIECE_MOVEMENTS.bishop)
}

export function evaluateBishop (board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): BishopEvaluation {
  const { rank, file } = squareToIndices(square)
  const bishopSquare = board[rank][file]

  const weights = getWeightsByPhase(
    BISHOP_OPENING_WEIGHTS,
    BISHOP_MIDDLEGAME_WEIGHTS,
    BISHOP_ENDGAME_WEIGHTS,
    phase.value
  )

  // 🎯 SCORES BRUTS NORMALISÉS
  const metrics: BishopMetrics = {
    mobility: mobilityScore(bishopSquare, MAX_MOBILITY.bishop),
    position: positionScore('b', rank, file, color, phase.name),
    diagonals: diagonalsScore(board, square, color),
    tactics: 1,
    support: supportScore(bishopSquare),
    safety: safetyScore(bishopSquare)
  }

  // 🎯 NORMALISATION - utilise la fonction générique
  const { scores, totalScore, grade } = calculateNormalizedPieceScore(metrics, weights, 'bishop')

  return {
    mobility: scores.mobility,
    position: scores.position,
    tactics: scores.tactics,
    diagonals: scores.diagonals,
    support: scores.support,
    safety: scores.safety,
    totalScore,
    grade
  }
}

function diagonalsScore (board: EnrichedBoard, square: Square, color: Color): number {
  const { rank, file } = squareToIndices(square)
  let score = 0

  // Vérifier si le fou est sur une grande diagonale
  const isOnLongDiagonal = (rank === file) || (rank + file === 7)
  if (isOnLongDiagonal) {
    score += 1.0 // Bonus pour grande diagonale
  }

  // Compter la longueur des diagonales contrôlées
  const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  let totalDiagonalLength = 0

  for (const [rankDir, fileDir] of diagonalDirections) {
    let length = 0
    let currentRank = rank + rankDir
    let currentFile = file + fileDir

    while (isValidSquare(currentRank, currentFile)) {
      const targetSquare = board[currentRank][currentFile]
      length++

      // Arrêter si on rencontre une pièce
      if (targetSquare.piece) {
        // Bonus si c'est une pièce ennemie (contrôle)
        if (targetSquare.piece.color !== color) {
          length += 0.5
        }
        break
      }

      currentRank += rankDir
      currentFile += fileDir
    }

    totalDiagonalLength += length
  }

  // Convertir la longueur totale en score (0-1.5 points)
  score += Math.min(1.5, totalDiagonalLength / 15)

  return Math.min(2.5, score)
}

