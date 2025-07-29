import type { ArrowPreferences, SquarePreferences } from '../App.tsx'
import type { EnrichedSquare } from '../engine/types.ts'

type SquareCardProps = {
  square: EnrichedSquare | undefined
  arrowPreferences: ArrowPreferences
  onToggleAttackers: () => void
  onToggleDefenders: () => void
  squarePreferences: SquarePreferences
  onToggleMobility: () => void
}

export default function SquareCard ({
  square,
  arrowPreferences,
  onToggleAttackers,
  onToggleDefenders,
  squarePreferences,
  onToggleMobility
}: SquareCardProps) {
  if (!square) {
    return null
  }

  const getPieceIcon = (type: string, color: string) => {
    const pieces: Record<string, Record<string, string>> = {
      'k': { 'w': '♔', 'b': '♚' },
      'q': { 'w': '♕', 'b': '♛' },
      'r': { 'w': '♖', 'b': '♜' },
      'b': { 'w': '♗', 'b': '♝' },
      'n': { 'w': '♘', 'b': '♞' },
      'p': { 'w': '♙', 'b': '♟' }
    }
    return pieces[type]?.[color] || '?'
  }

  const getColorCircle = (color: string) => {
    return color === 'w' ? '⚪' : '⚫'
  }

  return (
    <div>
      <div className="flex items-center">
        <div className="text-lg font-bold">{square.square}</div>
        {square.piece && (
          <div className="text-2xl flex items-center gap-2">
            <span>{getPieceIcon(square.piece.type, square.piece.color)}</span>
            <span>{getColorCircle(square.piece.color)}</span>
          </div>
        )}
        {square.piece && (
          <div className="flex items-center gap-2">
            <div
              onClick={onToggleMobility}
              className="px-2 py-1 rounded-lg bg-blue-500 text-white text-xs cursor-pointer ml-2"
            >
              {squarePreferences.showMobility ? 'Hide mobility' : 'Show mobility'}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div>{square.piece ? 'attacks' : 'Black control'}: {square.attackers.length}</div>
        {square.attackers.length > 0 && (
          <div
            className={`px-2 py-1 rounded-lg text-white text-xs cursor-pointer ml-2 ${
              arrowPreferences.showAttackers ? 'bg-red-500' : 'bg-blue-500'
            }`}
            onClick={onToggleAttackers}
          >
            {arrowPreferences.showAttackers ? 'Hide' : 'Show'}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div>{square.piece ? 'defends' : 'White control'}: {square.defenders.length}</div>
        {square.defenders.length > 0 && (
          <div
            className={`px-2 py-1 rounded-lg text-white text-xs cursor-pointer ml-2 ${
              arrowPreferences.showDefenders ? 'bg-green-500' : 'bg-blue-500'
            }`}
            onClick={onToggleDefenders}
          >
            {arrowPreferences.showDefenders ? 'Hide' : 'Show'}
          </div>
        )}
      </div>

      {square.pawnStructure.isPawn && (
        <div>
          {square.pawnStructure.isolated && <div className="text-left">Isolated Pawn</div>}
          {square.pawnStructure.doubled && <div className="text-left">Doubled Pawn</div>}
          {square.pawnStructure.passed && <div className="text-left">Passed Pawn</div>}
          {square.pawnStructure.backward && <div className="text-left">Backward pawn</div>}
          {square.pawnStructure.hanging && <div className="text-left">Hanging Pawn</div>}
          {square.pawnStructure.blocked.isBlocked && <div className="text-left">Blocked Pawn</div>}
          {square.pawnStructure.blocked.permanentlyBlocked && <div className="text-left">Locked Pawn</div>}
        </div>
      )}
    </div>
  )
}