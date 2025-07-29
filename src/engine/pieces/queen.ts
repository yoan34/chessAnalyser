import type { Color, Square } from 'chess.js'
import type { EnrichedBoard, Mobility } from '../types.ts'
import { indicesToSquare, isValidSquare, squareToIndices } from '../utils.ts'

export function getQueenMobility(board: EnrichedBoard, square: Square, color: Color): Mobility {
  const mobility: Mobility = {
    moves: [],
    captures: [],
    checks: [],
    totalMobility: 0,
  }

  const { rank, file } = squareToIndices(square);

  // 🎯 Directions de la dame : horizontales, verticales ET diagonales
  const queenDirections = [
    // Directions de la tour (horizontales/verticales)
    [-1, 0], // Haut
    [1, 0],  // Bas
    [0, -1], // Gauche
    [0, 1],  // Droite
    // Directions du fou (diagonales)
    [-1, -1], // Haut-gauche
    [-1, 1],  // Haut-droite
    [1, -1],  // Bas-gauche
    [1, 1]    // Bas-droite
  ];

  // 🎯 Pour chaque direction
  for (const [rankDir, fileDir] of queenDirections) {
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

  console.log('QUEEN ', square, 'mobility:', mobility.totalMobility);
  console.log(mobility);

  return mobility;
}