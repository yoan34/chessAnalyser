import type { Color, Square } from 'chess.js'
import { positionScore } from '../psqt.ts'
import type { EnrichedBoard, KnightEvaluation, Mobility, PhaseGame, RookWeights } from '../types.ts'
import { indicesToSquare, isValidSquare, squareToIndices } from '../utils.ts'
import { getWeightsByPhase, gradeFromScore, mobilityScore, safetyScore, supportScore } from './utils.ts'

const ROOK_OPENING_WEIGHTS: RookWeights = {
  mobility: 0.6,        // Faible : développement lent, pièces bloquent
  position: 1.0,        // Standard : cases de développement importantes
  openFiles: 1.6,       // CRUCIAL : fichiers ouverts = force de la tour
  tactics: 0.7,         // Modéré : moins d'opportunités early game
  support: 1.3,         // Important : protection du roque
  safety: 1.5           // CRITIQUE : tours vulnérables si mal développées
};

const ROOK_MIDDLEGAME_WEIGHTS: RookWeights = {
  mobility: 1.4,        // Important : flexibilité pour attaques/défense
  position: 0.8,        // Moins critique que l'activité
  openFiles: 1.5,       // Toujours crucial mais autres facteurs montent
  tactics: 1.4,         // IMPORTANT : clouages, enfilades fréquents
  support: 1.0,         // Standard : équilibre attaque/défense
  safety: 0.8          // Prise de risques calculés
};

const ROOK_ENDGAME_WEIGHTS: RookWeights = {
  mobility: 1.8,        // MAXIMUM : roi actif, contrôle de l'espace
  position: 0.5,        // Faible : activité > position statique
  openFiles: 1.2,       // Bon mais moins crucial (moins de pièces)
  tactics: 1.1,         // Modéré : moins de cibles tactiques
  support: 0.4,         // Faible : peu de pièces à soutenir
  safety: 0.6          // Modéré : moins de menaces complexes
};

export function getRookMobility(board: EnrichedBoard, square: Square, color: Color): Mobility {
  const mobility: Mobility = {
    moves: [],
    captures: [],
    checks: [],
    totalMobility: 0,
  }

  const { rank, file } = squareToIndices(square);

  // 🎯 Directions horizontales et verticales : [rankOffset, fileOffset]
  const rookDirections = [
    [-1, 0], // Haut
    [1, 0],  // Bas
    [0, -1], // Gauche
    [0, 1]   // Droite
  ];

  // 🎯 Pour chaque direction
  for (const [rankDir, fileDir] of rookDirections) {
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

  console.log('ROOK ', square, 'mobility:', mobility.totalMobility);
  console.log(mobility);

  return mobility;
}

export function evaluateRook(board: EnrichedBoard, square: Square, color: Color, phase: PhaseGame): KnightEvaluation {
  const { rank, file } = squareToIndices(square);
  const rookSquare = board[rank][file];

  const weights = getWeightsByPhase(
    ROOK_OPENING_WEIGHTS,
    ROOK_MIDDLEGAME_WEIGHTS,
    ROOK_ENDGAME_WEIGHTS,
    phase.value
  );

  const mobilityRaw = mobilityScore(rookSquare, 14)
  const positionRaw = positionScore('n', rank, file, color, phase.name)
  const supportRaw = supportScore(rookSquare)
  const safetyRaw = safetyScore(rookSquare)
  const tacticRaw = 1 // A IMPLEMENTER


  const mobility = mobilityRaw * weights.mobility;
  const position = positionRaw * weights.position;
  const tactics = tacticRaw * weights.tactics;
  const support = supportRaw * weights.support;
  const safety = safetyRaw * weights.safety;

  // 📊 CALCUL FINAL
  const totalScore = mobility + position + tactics + support + safety;
  const { normalizedScore, grade } = gradeFromScore(totalScore)

  return {
    mobility: Math.round(mobility * 10) / 10,
    position: Math.round(position * 10) / 10,
    tactics: Math.round(tactics * 10) / 10,
    support: Math.round(support * 10) / 10,
    safety: Math.round(safety * 10) / 10,
    totalScore: Math.round(normalizedScore * 10) / 10,
    grade,
  };
}
