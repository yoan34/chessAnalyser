import type { Color, Square } from 'chess.js'
import { calculateMobility, MAX_MOBILITY, PIECE_MOVEMENTS } from '../mobility.ts'
import { positionScore } from '../psqt.ts'
import type { EnrichedBoard, Mobility, PhaseGame, RookEvaluation, RookMetrics, RookWeights } from '../types.ts'
import { squareToIndices } from '../utils.ts'
import {
  calculateNormalizedPieceScore,
  getWeightsByPhase,
  mobilityScore,
  safetyScore,
  supportScore
} from './utils.ts'

const ROOK_OPENING_WEIGHTS: RookWeights = {
  mobility: 0.6,        // Faible : développement lent, pièces bloquent
  position: 1.0,        // Standard : cases de développement importantes
  openFiles: 1.6,       // CRUCIAL : fichiers ouverts = force de la tour
  tactics: 0.7,         // Modéré : moins d'opportunités early game
  support: 1.3,         // Important : protection du roque
  safety: 1.5           // CRITIQUE : tours vulnérables si mal développées
}

const ROOK_MIDDLEGAME_WEIGHTS: RookWeights = {
  mobility: 1.4,        // Important : flexibilité pour attaques/défense
  position: 0.8,        // Moins critique que l'activité
  openFiles: 1.5,       // Toujours crucial mais autres facteurs montent
  tactics: 1.4,         // IMPORTANT : clouages, enfilades fréquents
  support: 1.0,         // Standard : équilibre attaque/défense
  safety: 0.8          // Prise de risques calculés
}

const ROOK_ENDGAME_WEIGHTS: RookWeights = {
  mobility: 1.8,        // MAXIMUM : roi actif, contrôle de l'espace
  position: 0.5,        // Faible : activité > position statique
  openFiles: 1.2,       // Bon mais moins crucial (moins de pièces)
  tactics: 1.1,         // Modéré : moins de cibles tactiques
  support: 0.4,         // Faible : peu de pièces à soutenir
  safety: 0.6          // Modéré : moins de menaces complexes
}

export function getRookMobility (board: EnrichedBoard, square: Square, color: Color): Mobility {
  return calculateMobility(board, square, color, PIECE_MOVEMENTS.rook)
}

export function evaluateRook (board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): RookEvaluation {
  const { rank, file } = squareToIndices(square)
  const rookSquare = board[rank][file]

  const weights = getWeightsByPhase(
    ROOK_OPENING_WEIGHTS,
    ROOK_MIDDLEGAME_WEIGHTS,
    ROOK_ENDGAME_WEIGHTS,
    phase.value
  )

  const metrics: RookMetrics = {
    mobility: mobilityScore(rookSquare, MAX_MOBILITY.rook),
    position: positionScore('r', rank, file, color, phase.name),
    support: supportScore(rookSquare),
    safety: safetyScore(rookSquare),
    tactics: 1,// A IMPLEMENTER
    openFiles: 1// A IMPLEMENTER
  }

  const { scores, totalScore, grade } = calculateNormalizedPieceScore(metrics, weights, 'rook')

  return {
    mobility: scores.mobility,
    position: scores.position,
    tactics: scores.tactics,
    openFiles: scores.openFiles,
    support: scores.support,
    safety: scores.safety,
    totalScore,
    grade
  }
}
