import type { Color, Square } from 'chess.js'
import { calculateMobility, MAX_MOBILITY, PIECE_MOVEMENTS } from '../mobility.ts'
import { positionScore } from '../psqt.ts'
import type { EnrichedBoard, KingEvaluation, KingMetrics, KingWeights, Mobility, PhaseGame } from '../types.ts'
import { squareToIndices } from '../utils.ts'
import { calculateNormalizedPieceScore, getWeightsByPhase, mobilityScore, safetyScore, supportScore } from './utils.ts'

const KING_OPENING_WEIGHTS: KingWeights = {
  mobility: 0.3,          // TRÈS FAIBLE : immobilité souhaitée
  position: 1.4,          // Important : coins sûrs, éviter centre
  safety: 2.2,            // MAXIMUM : ne pas mourir !
  activity: 0.2,          // TRÈS FAIBLE : opposé de la sécurité
  support: 1.1,           // Important : pions et pièces protectrices
  castling: 1.8           // CRITIQUE : roque = priorité absolue
}

const KING_MIDDLEGAME_WEIGHTS: KingWeights = {
  mobility: 0.4,          // Faible : encore vulnérable
  position: 1.2,          // Important : rester en sécurité
  safety: 1.8,            // TRÈS IMPORTANT : attaques fréquentes
  activity: 0.5,          // Faible : prudence requise
  support: 1.3,           // Important : coordination défensive
  castling: 0.8           // Modéré : souvent déjà fait
}

const KING_ENDGAME_WEIGHTS: KingWeights = {
  mobility: 1.6,          // IMPORTANT : roi actif crucial
  position: 0.9,          // Modéré : centralisation devient bonne
  safety: 0.7,            // Modéré : moins de pièces dangereuses
  activity: 1.8,          // MAXIMUM : roi doit être actif !
  support: 0.4,           // Faible : peu de pièces pour soutenir
  castling: 0.0           // Nul : plus pertinent en finale
}

export function getKingMobility (board: EnrichedBoard, square: Square, color: Color): Mobility {
  return calculateMobility(board, square, color, PIECE_MOVEMENTS.king)
}

export function evaluateKing (board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): KingEvaluation {
  const { rank, file } = squareToIndices(square)
  const kingSquare = board[rank][file]

  const weights = getWeightsByPhase(
    KING_OPENING_WEIGHTS,
    KING_MIDDLEGAME_WEIGHTS,
    KING_ENDGAME_WEIGHTS,
    phase.value
  )

  const metrics: KingMetrics = {
    mobility: mobilityScore(kingSquare, MAX_MOBILITY.king),
    position: positionScore('r', rank, file, color, phase.name),
    support: supportScore(kingSquare),
    safety: safetyScore(kingSquare),
    activity: 1,// A IMPLEMENTER
    castling: 1// A IMPLEMENTER
  }

  const { scores, totalScore, grade } = calculateNormalizedPieceScore(metrics, weights, 'king')

  return {
    mobility: scores.mobility,
    position: scores.position,
    activity: scores.activity,
    castling: scores.castling,
    support: scores.support,
    safety: scores.safety,
    totalScore,
    grade
  }
}
