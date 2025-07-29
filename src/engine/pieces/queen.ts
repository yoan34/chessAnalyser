import type { Color, Square } from 'chess.js'
import { calculateMobility, MAX_MOBILITY, PIECE_MOVEMENTS } from '../mobility.ts'
import { positionScore } from '../psqt.ts'
import type { EnrichedBoard, Mobility, PhaseGame, QueenEvaluation, QueenMetrics, QueenWeights } from '../types.ts'
import { squareToIndices } from '../utils.ts'
import {
  calculateNormalizedPieceScore,
  getWeightsByPhase,
  mobilityScore,
  safetyScore,
  supportScore
} from './utils.ts'

const QUEEN_OPENING_WEIGHTS: QueenWeights = {
  mobility: 0.5,          // FAIBLE : développement prématuré dangereux
  position: 0.8,          // Modéré : éviter le centre trop tôt
  centralization: 0.6,    // Faible : centralisation prématurée = cible
  tactics: 0.7,           // Modéré : peu d'opportunités early
  support: 1.0,           // Standard : peut aider le développement
  safety: 2.0             // MAXIMUM : dame très vulnérable early game
}

const QUEEN_MIDDLEGAME_WEIGHTS: QueenWeights = {
  mobility: 1.6,          // IMPORTANT : flexibilité tactique maximale
  position: 1.1,          // Bon : positionnement stratégique
  centralization: 1.4,    // Important : domination du centre
  tactics: 1.8,           // MAXIMUM : reine des tactiques !
  support: 1.2,           // Important : coordonne les attaques
  safety: 1.0             // Standard : équilibre risque/récompense
}

const QUEEN_ENDGAME_WEIGHTS: QueenWeights = {
  mobility: 1.7,          // TRÈS IMPORTANT : polyvalence en finale
  position: 0.7,          // Modéré : activité > position
  centralization: 1.2,    // Bon : contrôle de l'espace
  tactics: 1.3,           // Important : menaces de mat
  support: 0.6,           // Faible : moins de pièces à coordonner
  safety: 0.8             // Modéré : moins de menaces directes
}

export function getQueenMobility (board: EnrichedBoard, square: Square, color: Color): Mobility {
  return calculateMobility(board, square, color, PIECE_MOVEMENTS.queen)
}

export function evaluateQueen (board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): QueenEvaluation {
  const { rank, file } = squareToIndices(square)
  const queenSquare = board[rank][file]

  const weights = getWeightsByPhase(
    QUEEN_OPENING_WEIGHTS,
    QUEEN_MIDDLEGAME_WEIGHTS,
    QUEEN_ENDGAME_WEIGHTS,
    phase.value
  )

  const metrics: QueenMetrics = {
    mobility: mobilityScore(queenSquare, MAX_MOBILITY.queen),
    position: positionScore('q', rank, file, color, phase.name),
    support: supportScore(queenSquare),
    safety: safetyScore(queenSquare),
    tactics: 1, // A IMPLEMENTER
    centralization: 1 // A IMPLEMENTER
  }

  const { scores, totalScore, grade } = calculateNormalizedPieceScore(metrics, weights, 'knight')

  return {
    mobility: scores.mobility,
    position: scores.position,
    tactics: scores.tactics,
    centralization: scores.centralization,
    support: scores.support,
    safety: scores.safety,
    totalScore,
    grade
  }
}
