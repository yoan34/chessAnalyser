import type { Chess, Color, Square } from 'chess.js'
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

export function evaluateKing (board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame, chess: Chess): KingEvaluation {
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
    position: positionScore('k', rank, file, color, phase.name),
    support: supportScore(kingSquare),
    safety: safetyScore(kingSquare),
    activity: activityScore(board, square, color, phase),
    castling: castlingScore(board, square, color, phase, chess)
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

function activityScore(board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): number {
  const { rank, file } = squareToIndices(square);
  let score = 0;

  // 1. 🎯 CENTRALISATION (plus important en endgame)
  const centerDistance = Math.max(Math.abs(rank - 3.5), Math.abs(file - 3.5));
  const centralizationBonus = (3.5 - centerDistance) / 3.5; // 0 à 1
  score += centralizationBonus; // Max 1.0 point pour être au centre

  // 2. 🏃 MOBILITÉ EFFECTIVE (cases réellement accessibles)
  const kingSquare = board[rank][file];
  const effectiveMobility = kingSquare.mobility.moves.length; // Cases libres seulement
  score += Math.min(0.8, effectiveMobility / 8 * 0.8); // Max 0.8 point

  // 3. 👑 AGRESSIVITÉ ENVERS PIONS ENNEMIS (crucial en endgame)
  let enemyPawnProximity = 0;
  const opponentColor = color === 'w' ? 'b' : 'w';

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f].piece;
      if (piece && piece.type === 'p' && piece.color === opponentColor) {
        const distance = Math.max(Math.abs(r - rank), Math.abs(f - file));

        // Bonus selon la proximité - très important en endgame
        if (distance === 1) {
          enemyPawnProximity += 0.4; // Adjacent = excellent (peut attaquer)
        } else if (distance === 2) {
          enemyPawnProximity += 0.2; // Distance 2 = bon (peut soutenir attaque)
        } else if (distance === 3) {
          enemyPawnProximity += 0.1; // Distance 3 = correct (se rapproche)
        }
      }
    }
  }

  console.log('ENEMY PAWN ', enemyPawnProximity, color)
  const proximityWeight = phase.name === 'Endgame' ? 1.0 : 0.3;
  score += Math.min(0.7, enemyPawnProximity * proximityWeight);

  return Math.min(2.5, score);
}

function castlingScore(board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame, chess: Chess): number {
  // En endgame, le roque n'a plus d'importance
  if (phase.name === 'Endgame') {
    return 0;
  }

  const { rank, file } = squareToIndices(square);
  const castlingRights = chess.getCastlingRights(color);
  const canCastleKingside = castlingRights.k;
  const canCastleQueenside = castlingRights.q;

  // Base score = 0 (neutre)
  let score = 0;

  // 1. 🏰 VÉRIFIER SI LE ROI EST ROQUÉ
  const isKingOnStartingSquare = (color === 'w' && rank === 7 && file === 4) ||
    (color === 'b' && rank === 0 && file === 4);

  if (!isKingOnStartingSquare) {
    // Roi a bougé - vérifier s'il est en position roquée
    const isCastledKingside = (color === 'w' && rank === 7 && file === 6) ||
      (color === 'b' && rank === 0 && file === 6);
    const isCastledQueenside = (color === 'w' && rank === 7 && file === 2) ||
      (color === 'b' && rank === 0 && file === 2);

    if (isCastledKingside || isCastledQueenside) {
      // 🎉 ROQUE EFFECTUÉ - excellent score !
      score = 2.0;

      // Bonus pour structure de pions protectrice
      const pawnShieldBonus = evaluatePawnShield(board, rank, file, color);
      score += pawnShieldBonus; // Max +0.5

      console.log(`👑 Roi ${color} roqué en ${square}: score=${score.toFixed(2)}`);
    } else {
      // 😱 ROI DÉPLACÉ SANS ROQUER
      if (!canCastleKingside && !canCastleQueenside) {
        // Plus aucun droit de roque = très mauvais -> score très bas
        score = 0.2;
      } else {
        // Encore des droits mais roi exposé = mauvais -> score faible
        score = 0.8;
      }
      console.log(`⚠️ Roi ${color} déplacé sans roquer en ${square}: score=${score.toFixed(2)}`);
    }
  } else {
    // 2. 🤔 ROI ENCORE SUR CASE DE DÉPART
    if (canCastleKingside && canCastleQueenside) {
      // Tous les droits préservés = bon potentiel
      score = 1.8;
    } else if (canCastleKingside || canCastleQueenside) {
      // Un côté encore possible = potentiel modéré
      score = 1.2;
    } else {
      // Plus de droits de roque = mauvais
      score = 0.3;
    }
    console.log(`🏰 Roi ${color} sur case départ ${square}: droits K=${canCastleKingside} Q=${canCastleQueenside}, score=${score.toFixed(2)}`);
  }

  return Math.max(0, Math.min(2.5, score));
}

// 5. Fonction helper inchangée
function evaluatePawnShield(board: EnrichedBoard, kingRank: number, kingFile: number, color: Color): number {
  let shieldScore = 0;
  const pawnDirection = color === 'w' ? -1 : 1;
  const shieldRank = kingRank + pawnDirection;

  for (const fileOffset of [-1, 0, 1]) {
    const checkFile = kingFile + fileOffset;
    if (checkFile >= 0 && checkFile < 8 && shieldRank >= 0 && shieldRank < 8) {
      const piece = board[shieldRank][checkFile].piece;
      if (piece && piece.type === 'p' && piece.color === color) {
        shieldScore += 0.15;
      }
    }
  }
  console.log('SHIELD SCORE: ', shieldScore, color)
  return Math.min(0.5, shieldScore);
}