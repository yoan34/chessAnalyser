import type { BishopEvaluation, EnrichedSquare, KnightEvaluation, TeamStructure } from '../engine/types.ts'

interface TeamDisplayProps {
  team: TeamStructure;
  color: 'white' | 'black';
}

export default function TeamDisplay({ team, color }: TeamDisplayProps) {
  // Styles de base
  const containerStyle: React.CSSProperties = {
    padding: '16px',
    borderRadius: '8px',
    border: '2px solid',
    width: '500px',
    backgroundColor: color === 'white' ? '#f3f4f6' : '#1f2937',
    borderColor: color === 'white' ? '#d1d5db' : '#4b5563',
    color: color === 'white' ? '#000000' : '#ffffff'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '16px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  const blocksContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const blockStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: color === 'white' ? '#ffffff' : '#374151'
  };

  const blockTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px'
  };

  const statRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  };

  const statValueStyle: React.CSSProperties = {
    fontWeight: '500'
  };

  const pieceValueStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold'
  };

  const pawnStructureItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '4px'
  };

  const noStructureStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic'
  };

  const PieceBlock = ({ title, piece, defaultValue = 0 }: { title: string; piece: EnrichedSquare | null; defaultValue?: number }) => (
    <div style={blockStyle}>
      <div style={blockTitleStyle}>{title}</div>
      <div style={pieceValueStyle}>{piece ? piece.mobility.totalMobility : defaultValue}</div>
    </div>
  );

  const IndexedPieceBlock = ({ title, pieces, index }: { title: string; pieces: EnrichedSquare[]; index: number }) => (
    <div style={blockStyle}>
      <div style={blockTitleStyle}>{title}</div>
      {pieces.length > 0 && pieces[0].piece!.type === 'n' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '50px' }}>square</div>
            <div style={{ width: '60px' }}>mobility</div>
            <div style={{ width: '55px' }}>position</div>
            <div style={{ width: '65px' }}>outposts</div>
            <div style={{ width: '55px' }}>support</div>
            <div style={{ width: '45px' }}>safety</div>
            <div style={{ width: '50px' }}>total</div>
            <div style={{ width: '50px' }}>grade</div>
          </div>
          {pieces.map(piece => {
            if (piece.piece?.type !== 'n') return null
            const evaluation = piece.evaluation as KnightEvaluation | undefined
            if (!evaluation) return null
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '50px' }}>{piece.square}</div>
                <div style={{ width: '60px' }}>{evaluation.mobility}</div>
                <div style={{ width: '55px' }}>{evaluation.position}</div>
                <div style={{ width: '65px' }}>{evaluation.outposts}</div>
                <div style={{ width: '55px' }}>{evaluation.support}</div>
                <div style={{ width: '45px' }}>{evaluation.safety}</div>
                <div style={{ width: '50px' }}>{evaluation.totalScore}</div>
                <div>{evaluation.grade}</div>
              </div>
            )
          })}
        </div>

      )}
      {pieces.length > 0 && pieces[0].piece!.type === 'b' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '50px' }}>square</div>
            <div style={{ width: '60px' }}>mobility</div>
            <div style={{ width: '55px' }}>position</div>
            <div style={{ width: '65px' }}>diagonals</div>
            <div style={{ width: '55px' }}>support</div>
            <div style={{ width: '45px' }}>safety</div>
            <div style={{ width: '50px' }}>total</div>
            <div style={{ width: '50px' }}>grade</div>
          </div>
          {pieces.map(piece => {
            if (piece.piece?.type !== 'b') return null
            const evaluation = piece.evaluation as BishopEvaluation | undefined
            if (!evaluation) return null
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '50px' }}>{piece.square}</div>
                <div style={{ width: '60px' }}>{evaluation.mobility}</div>
                <div style={{ width: '55px' }}>{evaluation.position}</div>
                <div style={{ width: '65px' }}>{evaluation.diagonals}</div>
                <div style={{ width: '55px' }}>{evaluation.support}</div>
                <div style={{ width: '45px' }}>{evaluation.safety}</div>
                <div style={{ width: '50px' }}>{evaluation.totalScore}</div>
                <div>{evaluation.grade}</div>
              </div>
            )
          })}
        </div>

      )}
    </div>
  );

  const StatBlock = ({ title, stats }: { title: string; stats: Array<{ label: string; value: number }> }) => (
    <div style={blockStyle}>
      <div style={blockTitleStyle}>{title}</div>
      {stats.map((stat, index) => (
        <div key={index} style={statRowStyle}>
          <span>{stat.label}:</span>
          <span style={statValueStyle}>{stat.value}</span>
        </div>
      ))}
    </div>
  );

  const PawnStructureBlock = () => {
    const structures = [
      { label: 'Isolated', count: team.pawnStructure.isolated.length },
      { label: 'Doubled', count: team.pawnStructure.doubled.length },
      { label: 'Passed', count: team.pawnStructure.passed.length },
      { label: 'Backward', count: team.pawnStructure.backward.length },
      { label: 'Hanging', count: team.pawnStructure.hanging.length },
      { label: 'Blocked', count: team.pawnStructure.blocked.length }
    ].filter(structure => structure.count > 0);

    return (
      <div style={blockStyle}>
        <div style={blockTitleStyle}>
          Pawn Structure ({team.pawns.length})
        </div>
        {structures.length > 0 ? (
          structures.map((structure, index) => (
            <div key={index} style={pawnStructureItemStyle}>
              <span>{structure.label}:</span>
              <span style={statValueStyle}>{structure.count}</span>
            </div>
          ))
        ) : (
          <div style={noStructureStyle}>No special structures</div>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      {/* Couleur de l'équipe */}
      <div style={headerStyle}>
        <div style={titleStyle}>{color} Team - {team.phase.name} {team.phase.value.toFixed(2)}</div>
      </div>

      <div style={blocksContainerStyle}>
        {/* Bloc Mobility */}
        <StatBlock
          title="Mobility"
          stats={[
            { label: 'Total', value: team.totalMobility },
            { label: 'Average', value: Math.round(team.averageMobility * 10) / 10 }
          ]}
        />

        {/* Bloc Material */}
        <StatBlock
          title="Material"
          stats={[
            { label: 'Total Value', value: team.material.totalValue },
            { label: 'Piece Count', value: team.material.pieceCount },
            { label: 'Major Pieces', value: team.material.majorPieces },
            { label: 'Minor Pieces', value: team.material.minorPieces }
          ]}
        />

        {/* King */}
        {/*<PieceBlock title="King" piece={team.king} defaultValue={0} />*/}

        {/*/!* Queen *!/*/}
        {/*<PieceBlock title="Queen" piece={team.queen} defaultValue={0} />*/}

        {/*/!* Rooks *!/*/}
        {/*<IndexedPieceBlock title="Rook 1" pieces={team.rooks} index={0} />*/}
        {/*<IndexedPieceBlock title="Rook 2" pieces={team.rooks} index={1} />*/}

        {/* Bishops */}
        <IndexedPieceBlock title="Bishop 1" pieces={team.bishops} index={0} />

        {/* Knights */}
        <IndexedPieceBlock title="Knight 1" pieces={team.knights} index={0} />

        {/* Pawn Structure */}
        <PawnStructureBlock />
      </div>
    </div>
  );
};

