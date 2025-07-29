import type { PieceSymbol } from 'chess.js'
import { evaluateKing } from './pieces/king.ts'
import { evaluatePawn } from './pieces/pawn.ts'
import { evaluateQueen } from './pieces/queen.ts'
import { evaluateRook } from './pieces/rook.ts'
import type { EnrichedBoard, PhaseGame, PhaseName, TeamStructure } from './types.ts'
import { evaluateBishop } from './pieces/bishop.ts'
import { evaluateKnight } from './pieces/knight.ts'

export function buildTeams(board: EnrichedBoard): { whiteTeam: TeamStructure, blackTeam: TeamStructure } {
  const whiteTeam: TeamStructure = {
    phase: {
      name: 'Opening',
      value: 0
    },
    king: null,
    queen: null,
    rooks: [],
    bishops: [],
    knights: [],
    pawns: [],
    pawnStructure: {
      isolated: [],
      doubled: [],
      passed: [],
      backward: [],
      hanging: [],
      blocked: []
    },
    material: {
      totalValue: 0,
      pieceCount: 0,
      pawnCount: 0,
      majorPieces: 0,
      minorPieces: 0
    },
    totalMobility: 0,
    averageMobility: 0
  }

  const blackTeam: TeamStructure = {
    phase: {
      name: 'Opening',
      value: 0
    },
    king: null,
    queen: null,
    rooks: [],
    bishops: [],
    knights: [],
    pawns: [],
    pawnStructure: {
      isolated: [],
      doubled: [],
      passed: [],
      backward: [],
      hanging: [],
      blocked: []
    },
    material: {
      totalValue: 0,
      pieceCount: 0,
      pawnCount: 0,
      majorPieces: 0,
      minorPieces: 0
    },
    totalMobility: 0,
    averageMobility: 0
  }

  // Valeurs des pièces pour le calcul matériel
  const pieceValues = {
    p: 1, // pawn
    n: 3, // knight
    b: 3, // bishop
    r: 5, // rook
    q: 9, // queen
    k: 0  // king (invaluable)
  }

  const phase = determineGamePhase(board)
  whiteTeam.phase = phase
  blackTeam.phase = phase

  // Parcourir tout le board
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = board[rank][file]

      if (square.piece) {
        const team = square.piece.color === 'w' ? whiteTeam : blackTeam
        const pieceType = square.piece.type

        // Ajouter la pièce à la bonne catégorie
        switch (pieceType) {
          case 'k':
            square.evaluation = evaluateKing(board, square.square, square.piece.color, phase)
            team.king = square
            break
          case 'q':
            square.evaluation = evaluateQueen(board, square.square, square.piece.color, phase)
            team.queen = square
            team.material.majorPieces++
            break
          case 'r':
            square.evaluation = evaluateRook(board, square.square, square.piece.color, phase)
            team.rooks.push(square)
            team.material.majorPieces++
            break
          case 'b':
            square.evaluation = evaluateBishop(board, square.square, square.piece.color, phase)
            team.bishops.push(square)
            team.material.minorPieces++
            break
          case 'n':
            square.evaluation = evaluateKnight(board, square.square, square.piece.color, phase)
            team.knights.push(square)
            team.material.minorPieces++
            break
          case 'p':
            square.evaluation = evaluatePawn(board, square.square, square.piece.color, phase)
            team.pawns.push(square)
            team.material.pawnCount++

            // Analyser la structure du pion
            if (square.pawnStructure.isolated) team.pawnStructure.isolated.push(square)
            if (square.pawnStructure.doubled) team.pawnStructure.doubled.push(square)
            if (square.pawnStructure.passed) team.pawnStructure.passed.push(square)
            if (square.pawnStructure.backward) team.pawnStructure.backward.push(square)
            if (square.pawnStructure.hanging) team.pawnStructure.hanging.push(square)
            if (square.pawnStructure.blocked.isBlocked) team.pawnStructure.blocked.push(square)
            break
        }

        // Calculs globaux
        team.material.totalValue += pieceValues[pieceType as PieceSymbol]
        team.material.pieceCount++
        team.totalMobility += square.mobility.totalMobility
      }
    }
  }

  // Calculer la mobilité moyenne
  whiteTeam.averageMobility = whiteTeam.material.pieceCount > 0
    ? whiteTeam.totalMobility / whiteTeam.material.pieceCount
    : 0

  blackTeam.averageMobility = blackTeam.material.pieceCount > 0
    ? blackTeam.totalMobility / blackTeam.material.pieceCount
    : 0

  return { whiteTeam, blackTeam }
}

function determineGamePhase(board: EnrichedBoard): PhaseGame {
  let totalMaterial = 0;

  // Compter le matériel (sans les rois et pions)
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file].piece;
      if (piece && piece.type !== 'k' && piece.type !== 'p') {
        const values = { q: 9, r: 5, b: 3, n: 3 };
        totalMaterial += values[piece.type as keyof typeof values] || 0;
      }
    }
  }

  // Calcul de phase style Stockfish
  const maxMaterial = 62; // Matériel de départ complet
  const endgameLimit = 15; // Seuil de finale
  const value = Math.max(0, Math.min(1, (totalMaterial - endgameLimit) / (maxMaterial - endgameLimit)));

  let name: PhaseName;
  if (value > 0.85) name = 'Opening';
  else if (value > 0.25) name = 'Middlegame';
  else name = 'Endgame';

  return { name, value };
}

