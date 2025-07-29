import type { Color, Square } from 'chess.js'
import type { EnrichedBoard, Mobility } from '../types.ts'
import { indicesToSquare, isValidSquare, squareToIndices } from '../utils.ts'

export function getKingMobility(board: EnrichedBoard, square: Square, color: Color): Mobility {
  const mobility: Mobility = {
    moves: [],
    captures: [],
    checks: [],
    totalMobility: 0,
  }

  const { rank, file } = squareToIndices(square);

  // 🎯 Les 8 mouvements possibles du roi : [rankOffset, fileOffset]
  // Le roi se déplace d'une case dans toutes les directions
  const kingMoves = [
    [-1, -1], // Haut-gauche
    [-1, 0],  // Haut
    [-1, 1],  // Haut-droite
    [0, -1],  // Gauche
    [0, 1],   // Droite
    [1, -1],  // Bas-gauche
    [1, 0],   // Bas
    [1, 1]    // Bas-droite
  ];

  // 🎯 Vérifier chaque mouvement possible
  for (const [rankOffset, fileOffset] of kingMoves) {
    const targetRank = rank + rankOffset;
    const targetFile = file + fileOffset;

    // 🎯 Vérifier si la case cible est valide
    if (isValidSquare(targetRank, targetFile)) {
      const targetSquare = board[targetRank][targetFile];
      const targetSquareNotation = indicesToSquare(targetRank, targetFile);

      // 🎯 Case vide : mouvement possible
      if (!targetSquare.piece) {
        mobility.moves.push(targetSquareNotation);
      }
      // 🎯 Pièce ennemie : capture possible
      else if (targetSquare.piece.color !== color) {
        // Note: Le roi ne peut jamais donner d'échec directement à un autre roi
        // car ils ne peuvent pas être adjacents
        mobility.captures.push(targetSquareNotation);
      }
      // 🎯 Pièce alliée : pas de mouvement possible (case occupée)
      // On ne fait rien, le roi ne peut pas aller sur cette case
    }
  }

  // 🎯 TODO: Ajouter les roques (castling) si nécessaire
  // - Petit roque (kingside castling)
  // - Grand roque (queenside castling)
  // Ces mouvements nécessitent des vérifications supplémentaires :
  // - Roi et tour n'ont pas bougé
  // - Pas de pièces entre le roi et la tour
  // - Le roi n'est pas en échec
  // - Le roi ne traverse pas de case attaquée

  // 🎯 Mettre à jour la mobilité totale
  mobility.totalMobility = mobility.moves.length + mobility.captures.length + mobility.checks.length;

  // 🎯 Sauvegarder dans le board
  board[rank][file].mobility.moves = mobility.moves;
  board[rank][file].mobility.captures = mobility.captures;
  board[rank][file].mobility.checks = mobility.checks;
  board[rank][file].mobility.totalMobility = mobility.totalMobility;

  console.log('KING ', square, 'mobility:', mobility.totalMobility);
  console.log(mobility);

  return mobility;
}