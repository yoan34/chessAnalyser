import type { Color, Square } from 'chess.js'
import { positionScore } from '../psqt.ts'
import type { BishopEvaluation, BishopWeights, EnrichedBoard, Mobility, PhaseGame } from '../types.ts'
import { indicesToSquare, isValidSquare, squareToIndices } from '../utils.ts'
import { mobilityScore, getWeightsByPhase, supportScore, safetyScore, gradeFromScore } from './utils.ts'


const BISSHOP_OPENING_WEIGHTS: BishopWeights = {
  mobility: 0.8,
  position: 1.2,
  diagonals: 1.4,
  tactics: 1.0,
  support: 1.1,
  safety: 1.3
};

const BISSHOP_MIDDLEGAME_WEIGHTS: BishopWeights = {
  mobility: 1.3,
  position: 1.0,
  diagonals: 1.2,
  tactics: 1.6,
  support: 1.0,
  safety: 0.9
};

const BISSHOP_ENDGAME_WEIGHTS: BishopWeights = {
  mobility: 1.5,
  position: 0.8,
  diagonals: 1.1,
  tactics: 0.7,
  support: 0.7,
  safety: 0.8
};

export function getBishopMobility(board: EnrichedBoard, square: Square, color: Color): Mobility {
  const mobility: Mobility = {
    moves: [],
    captures: [],
    checks: [],
    totalMobility: 0,
  }

  const { rank, file } = squareToIndices(square);

  // 🎯 Directions diagonales : [rankOffset, fileOffset]
  const diagonalDirections = [
    [-1, -1], // Haut-gauche
    [-1, 1],  // Haut-droite
    [1, -1],  // Bas-gauche
    [1, 1]    // Bas-droite
  ];

  // 🎯 Pour chaque direction diagonale
  for (const [rankDir, fileDir] of diagonalDirections) {
    let currentRank = rank + rankDir;
    let currentFile = file + fileDir;

    // 🎯 Continue jusqu'à atteindre une pièce ou le bord de l'échiquier
    while (isValidSquare(currentRank, currentFile)) {
      const targetSquare = board[currentRank][currentFile];
      const targetSquareNotation = indicesToSquare(currentRank, currentFile);

      // 🎯 Case vide : mouvement possible
      if (!targetSquare.piece) {
        mobility.moves.push(targetSquareNotation);
      }
      // 🎯 Pièce ennemie : capture possible
      else if (targetSquare.piece.color !== color) {
        if (targetSquare.piece.type === 'k') {
          mobility.checks.push(targetSquareNotation);
        } else {
          mobility.captures.push(targetSquareNotation);
        }
        break; // Arrêter dans cette direction après capture
      }
      // 🎯 Pièce alliée : bloquer le chemin
      else {
        break; // Arrêter dans cette direction
      }

      // 🎯 Continuer dans la même direction
      currentRank += rankDir;
      currentFile += fileDir;
    }
  }

  // 🎯 Mettre à jour la mobilité totale
  mobility.totalMobility = mobility.moves.length + mobility.captures.length + mobility.checks.length;

  // 🎯 Sauvegarder dans le board
  board[rank][file].mobility.moves = mobility.moves;
  board[rank][file].mobility.captures = mobility.captures;
  board[rank][file].mobility.checks = mobility.checks;
  board[rank][file].mobility.totalMobility = mobility.totalMobility;

  console.log('BISHOP ', square, 'mobility:', mobility.totalMobility);
  console.log(mobility);

  return mobility;
}

export function evaluateBishop(board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): BishopEvaluation {
  const { rank, file } = squareToIndices(square);
  const bishopSquare = board[rank][file];

  const weights = getWeightsByPhase(
    BISSHOP_OPENING_WEIGHTS,
    BISSHOP_MIDDLEGAME_WEIGHTS,
    BISSHOP_ENDGAME_WEIGHTS,
    phase.value
  );

  const mobilityRaw = mobilityScore(bishopSquare, 13)
  const positionRaw = positionScore('b', rank, file, color, phase.name)
  const diagonalsRaw = diagonalsScore(board, square, color);
  const supportRaw = supportScore(bishopSquare)
  const safetyRaw = safetyScore(bishopSquare)


  const mobility = mobilityRaw * weights.mobility;
  const position = positionRaw * weights.position;
  const diagonals = diagonalsRaw * weights.diagonals;
  const support = supportRaw * weights.support;
  const safety = safetyRaw * weights.safety;

  const totalScore = mobility + position + diagonals + support + safety;
  const { normalizedScore, grade } = gradeFromScore(totalScore)

  return {
    mobility: Math.round(mobility * 10) / 10,
    position: Math.round(position * 10) / 10,
    diagonals: Math.round(diagonals * 10) / 10,
    support: Math.round(support * 10) / 10,
    safety: Math.round(safety * 10) / 10,
    totalScore: Math.round(normalizedScore * 10) / 10,
    grade,
  };
}

function diagonalsScore(board: EnrichedBoard, square: Square, color: Color): number {
  const { rank, file } = squareToIndices(square);
  let score = 0;

  // Vérifier si le fou est sur une grande diagonale
  const isOnLongDiagonal = (rank === file) || (rank + file === 7);
  if (isOnLongDiagonal) {
    score += 1.0; // Bonus pour grande diagonale
  }

  // Compter la longueur des diagonales contrôlées
  const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  let totalDiagonalLength = 0;

  for (const [rankDir, fileDir] of diagonalDirections) {
    let length = 0;
    let currentRank = rank + rankDir;
    let currentFile = file + fileDir;

    while (isValidSquare(currentRank, currentFile)) {
      const targetSquare = board[currentRank][currentFile];
      length++;

      // Arrêter si on rencontre une pièce
      if (targetSquare.piece) {
        // Bonus si c'est une pièce ennemie (contrôle)
        if (targetSquare.piece.color !== color) {
          length += 0.5;
        }
        break;
      }

      currentRank += rankDir;
      currentFile += fileDir;
    }

    totalDiagonalLength += length;
  }

  // Convertir la longueur totale en score (0-1.5 points)
  score += Math.min(1.5, totalDiagonalLength / 15);

  return Math.min(2.5, score);
}

