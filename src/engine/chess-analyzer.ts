import { Chess, BLACK, WHITE } from 'chess.js'
import { initializeEmptyBoard } from './initialize-board.ts'
import { addMobility } from './mobility.ts'
import { buildTeams } from './teams.ts'
import type { EnrichedBoard, TeamStructure } from './types.ts'

export type AnalysisData = {
  board: EnrichedBoard;
  whiteTeam: TeamStructure
  blackTeam: TeamStructure
}

export async function chessAnalyzer (fen: string): Promise<AnalysisData> {

  const startAnalyze = Date.now()
  const chess = new Chess(fen)
  const board = initializeEmptyBoard()

  addPieces(board, chess)

  addAttackers(board, chess)
  addDefenders(board, chess)

  addMobility(board)

  const { whiteTeam, blackTeam } = buildTeams(board)

  const endAnalyze = Date.now()
  console.log(`Analyze in ${endAnalyze - startAnalyze}ms`)

  return {
    board,
    whiteTeam,
    blackTeam
  }
}

function addPieces (board: EnrichedBoard, chess: Chess) {
  board.forEach((rank, rankIndex) => {
    rank.forEach((square, fileIndex) => {
      board[rankIndex][fileIndex].piece = chess.get(square.square)
    })
  })
}

function addAttackers (board: EnrichedBoard, chess: Chess) {
  board.forEach((rank, rankIndex) => {
    rank.forEach((square, fileIndex) => {
      if (square.piece) {
        const attackerColor = square.piece.color === 'w' ? BLACK : WHITE
        board[rankIndex][fileIndex].attackers = chess.attackers(square.square, attackerColor)
      } else {
        board[rankIndex][fileIndex].attackers = chess.attackers(square.square, BLACK)
      }

    })
  })
}

function addDefenders (board: EnrichedBoard, chess: Chess) {
  board.forEach((rank, rankIndex) => {
    rank.forEach((square, fileIndex) => {
      if (square.piece) {
        const defenderColor = square.piece.color === 'w' ? WHITE : BLACK
        board[rankIndex][fileIndex].defenders = chess.attackers(square.square, defenderColor)
      } else {
        board[rankIndex][fileIndex].defenders = chess.attackers(square.square, WHITE)
      }
    })
  })
}
