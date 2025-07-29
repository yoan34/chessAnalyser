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
      <div style={styles.squareBasicInfo}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{square.square}</div>
        {square.piece && (
          <div style={{
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{getPieceIcon(square.piece.type, square.piece.color)}</span>
            <span>{getColorCircle(square.piece.color)}</span>
          </div>
        )}
        {square.piece && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div onClick={onToggleMobility} style={{ ...styles.btn, backgroundColor: 'blue' }}>
              {squarePreferences.showMobility ? 'Hide mobility' : 'Show mobility'}
            </div>
          </div>
        )}

      </div>

      <div style={styles.attackContainer}>
        <div>{square.piece ? 'attacks' : 'Black control'}: {square.attackers.length}</div>
        {square.attackers.length > 0 && (
          <div
            style={{
              ...styles.btn,
              backgroundColor: arrowPreferences.showAttackers ? '#f44336' : '#2196f3'
            }}
            onClick={onToggleAttackers}
          >
            {arrowPreferences.showAttackers ? 'Hide' : 'Show'}
          </div>
        )}
      </div>

      <div style={styles.attackContainer}>
        <div>{square.piece ? 'defends' : 'White control'}: {square.defenders.length}</div>
        {square.defenders.length > 0 && (
          <div
            style={{
              ...styles.btn,
              backgroundColor: arrowPreferences.showDefenders ? '#4caf50' : '#2196f3'
            }}
            onClick={onToggleDefenders}
          >
            {arrowPreferences.showDefenders ? 'Hide' : 'Show'}
          </div>
        )}
      </div>
      {square.pawnStructure.isPawn && (
        <div>
          {square.pawnStructure.isolated && <div style={{textAlign: 'left'}}>Isolated Pawn</div>}
          {square.pawnStructure.doubled && <div style={{textAlign: 'left'}}>Doubled Pawn</div>}
          {square.pawnStructure.passed && <div style={{textAlign: 'left'}}>Passed Pawn</div>}
          {square.pawnStructure.backward && <div style={{textAlign: 'left'}}>Backward pawn</div>}
          {square.pawnStructure.hanging && <div style={{textAlign: 'left'}}>Hanging Pawn</div>}
          {square.pawnStructure.blocked.isBlocked && <div style={{textAlign: 'left'}}>Blocked Pawn</div>}
          {square.pawnStructure.blocked.permanentlyBlocked && <div style={{textAlign: 'left'}}>Locked Pawn</div>}
        </div>
      )}
    </div>
  )
}

const styles = {
  squareBasicInfo: {
    display: 'flex',
    alignItems: 'center'
  },
  attackContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px'
  },
  btn: {
    padding: '4px 8px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    marginLeft: '8px'
  }
}
