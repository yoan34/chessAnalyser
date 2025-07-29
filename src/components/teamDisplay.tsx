import type {
  BishopEvaluation,
  EnrichedSquare,
  KnightEvaluation,
  TeamStructure,
  RookEvaluation,
  QueenEvaluation,
  KingEvaluation,
  PawnEvaluation
} from '../engine/types.ts'

interface TeamDisplayProps {
  team: TeamStructure;
  color: 'white' | 'black';
}

export default function TeamDisplay({ team, color }: TeamDisplayProps) {
  const blockClass = `p-2 rounded border text-xs ${
    color === 'white' ? 'bg-white border-gray-200' : 'bg-gray-700 border-gray-600'
  }`;

  // Fonction pour obtenir la couleur basée sur le grade
  const getGradeColor = (grade: string, isTotal: boolean = false) => {
    const colors = {
      A: isTotal ? 'bg-green-500' : 'bg-green-400',
      B: isTotal ? 'bg-lime-500' : 'bg-lime-400',
      C: isTotal ? 'bg-yellow-500' : 'bg-yellow-400',
      D: isTotal ? 'bg-orange-500' : 'bg-orange-400',
      F: isTotal ? 'bg-red-500' : 'bg-red-400'
    };
    return colors[grade as keyof typeof colors] || (isTotal ? 'bg-gray-500' : 'bg-gray-400');
  };

  // Fonction pour calculer le grade d'un critère individuel
  const getCriteriaGrade = (value: number, maxValue: number = 2.5): string => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 85) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  // Composant Progress Bar
  const ProgressBar = ({ value, maxValue = 2.5, isTotal = false, grade }: {
    value: number | undefined;
    maxValue?: number;
    isTotal?: boolean;
    grade?: string;
  }) => {
    // 🔧 Protection contre les valeurs undefined
    const safeValue = value || 0;
    const percentage = Math.min(100, (safeValue / maxValue) * 100);
    const displayGrade = grade || getCriteriaGrade(safeValue, maxValue);
    const colorClass = getGradeColor(displayGrade, isTotal);

    return (
      <div className="w-12 h-4 relative bg-gray-200 rounded border overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800">
          {safeValue.toFixed(1)}
        </div>
      </div>
    );
  };

  const PieceRow = ({ piece, type }: { piece: EnrichedSquare; type: 'n' | 'b' | 'r' | 'q' | 'k' | 'p' }) => {
    const evaluation = piece.evaluation;
    if (!evaluation || piece.piece?.type !== type) return null;

    switch (type) {
      case 'k': {
        const kingEval = evaluation as KingEvaluation;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 text-xs font-medium">{piece.square}</div>
            <ProgressBar value={kingEval.mobility} />
            <ProgressBar value={kingEval.position} />
            <ProgressBar value={kingEval.activity} />
            <ProgressBar value={kingEval.castling} />
            <ProgressBar value={kingEval.support} />
            <ProgressBar value={kingEval.safety} />
            <ProgressBar value={kingEval.totalScore} maxValue={10} isTotal={true} grade={kingEval.grade} />
          </div>
        );
      }
      case 'q': {
        const queenEval = evaluation as QueenEvaluation;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 text-xs font-medium">{piece.square}</div>
            <ProgressBar value={queenEval.mobility} />
            <ProgressBar value={queenEval.position} />
            <ProgressBar value={queenEval.centralization} />
            <ProgressBar value={queenEval.tactics} />
            <ProgressBar value={queenEval.support} />
            <ProgressBar value={queenEval.safety} />
            <ProgressBar value={queenEval.totalScore} maxValue={10} isTotal={true} grade={queenEval.grade} />
          </div>
        );
      }
      case 'r': {
        const rookEval = evaluation as RookEvaluation;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 text-xs font-medium">{piece.square}</div>
            <ProgressBar value={rookEval.mobility} />
            <ProgressBar value={rookEval.position} />
            <ProgressBar value={rookEval.openFiles} />
            <ProgressBar value={rookEval.tactics} />
            <ProgressBar value={rookEval.support} />
            <ProgressBar value={rookEval.safety} />
            <ProgressBar value={rookEval.totalScore} maxValue={10} isTotal={true} grade={rookEval.grade} />
          </div>
        );
      }
      case 'b': {
        const bishopEval = evaluation as BishopEvaluation;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 text-xs font-medium">{piece.square}</div>
            <ProgressBar value={bishopEval.mobility} />
            <ProgressBar value={bishopEval.position} />
            <ProgressBar value={bishopEval.diagonals} />
            <ProgressBar value={bishopEval.tactics} />
            <ProgressBar value={bishopEval.support} />
            <ProgressBar value={bishopEval.safety} />
            <ProgressBar value={bishopEval.totalScore} maxValue={10} isTotal={true} grade={bishopEval.grade} />
          </div>
        );
      }
      case 'n': {
        const knightEval = evaluation as KnightEvaluation;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 text-xs font-medium">{piece.square}</div>
            <ProgressBar value={knightEval.mobility} />
            <ProgressBar value={knightEval.position} />
            <ProgressBar value={knightEval.tactics} />
            <ProgressBar value={knightEval.support} />
            <ProgressBar value={knightEval.safety} />
            <ProgressBar value={knightEval.totalScore} maxValue={10} isTotal={true} grade={knightEval.grade} />
          </div>
        );
      }
      case 'p': {
        const pawnEval = evaluation as PawnEvaluation;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 text-xs font-medium">{piece.square}</div>
            <ProgressBar value={pawnEval.mobility} />
            <ProgressBar value={pawnEval.position} />
            <ProgressBar value={pawnEval.structure} />
            <ProgressBar value={pawnEval.advancement} />
            <ProgressBar value={pawnEval.support} />
            <ProgressBar value={pawnEval.safety} />
            <ProgressBar value={pawnEval.totalScore} maxValue={10} isTotal={true} grade={pawnEval.grade} />
          </div>
        );
      }
      default:
        return null;
    }
  };

  const PieceBlock = ({ title, pieces, type, headers }: {
    title: string;
    pieces: EnrichedSquare[];
    type: 'n' | 'b' | 'r' | 'q' | 'k' | 'p';
    headers: string[];
  }) => (
    <div className={blockClass}>
      <div className="font-semibold mb-1">{title}</div>
      {pieces.length > 0 ? (
        <>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
            {headers.map((header, idx) => (
              <div key={idx} className={idx === 0 ? "w-8 text-center" : "w-12 text-center"}>
                {header}
              </div>
            ))}
          </div>
          {pieces.map((piece, idx) => (
            <PieceRow key={idx} piece={piece} type={type} />
          ))}
        </>
      ) : (
        <div className="text-gray-500 italic">None</div>
      )}
    </div>
  );

  const StructureBlock = () => {
    const structures = [
      { label: 'Isolated', count: team.pawnStructure.isolated.length },
      { label: 'Doubled', count: team.pawnStructure.doubled.length },
      { label: 'Passed', count: team.pawnStructure.passed.length },
      { label: 'Backward', count: team.pawnStructure.backward.length },
      { label: 'Hanging', count: team.pawnStructure.hanging.length },
      { label: 'Blocked', count: team.pawnStructure.blocked.length }
    ].filter(structure => structure.count > 0);

    return (
      <div className={blockClass}>
        <div className="font-semibold mb-1">Pawn Structure ({team.pawns.length})</div>
        {structures.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {structures.map((structure, index) => (
              <span key={index} className="text-xs">
                {structure.label}: {structure.count}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">Clean structure</div>
        )}
      </div>
    );
  };

  return (
    <div className={`p-3 rounded-lg border-2 w-[600px] ${
      color === 'white'
        ? 'bg-gray-50 border-gray-300 text-black'
        : 'bg-gray-800 border-gray-600 text-white'
    }`}>
      {/* Header */}
      <div className="text-center mb-2">
        <div className="text-sm font-bold uppercase">
          {color} - {team.phase.name} ({team.phase.value.toFixed(2)})
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Mobility & Material - Une seule ligne chacun */}
        <div className={blockClass}>
          <div className="font-semibold mb-1">Mobility & Material</div>
          <div className="flex justify-between text-xs">
            <span>Total: {team.totalMobility} | Avg: {team.averageMobility.toFixed(1)}</span>
            <span>Value: {team.material.totalValue} | Pieces: {team.material.pieceCount}</span>
          </div>
        </div>

        {/* King */}
        {team.king && (
          <PieceBlock
            title="♔ King"
            pieces={[team.king]}
            type="k"
            headers={['Sq', 'Mob', 'Pos', 'Act', 'Cast', 'Sup', 'Saf', 'Tot']}
          />
        )}

        {/* Queen */}
        {team.queen && (
          <PieceBlock
            title="♕ Queen"
            pieces={[team.queen]}
            type="q"
            headers={['Sq', 'Mob', 'Pos', 'Cen', 'Tac', 'Sup', 'Saf', 'Tot']}
          />
        )}

        {/* Rooks */}
        <PieceBlock
          title="♖ Rooks"
          pieces={team.rooks}
          type="r"
          headers={['Sq', 'Mob', 'Pos', 'Open', 'Tac', 'Sup', 'Saf', 'Tot']}
        />

        {/* Bishops */}
        <PieceBlock
          title="♗ Bishops"
          pieces={team.bishops}
          type="b"
          headers={['Sq', 'Mob', 'Pos', 'Diag', 'Tac', 'Sup', 'Saf', 'Tot']}
        />

        {/* Knights */}
        <PieceBlock
          title="♘ Knights"
          pieces={team.knights}
          type="n"
          headers={['Sq', 'Mob', 'Pos', 'Tac', 'Sup', 'Saf', 'Tot']}
        />

        {/* Pawns */}
        <PieceBlock
          title="♙ Pawns"
          pieces={team.pawns}
          type="p"
          headers={['Sq', 'Mob', 'Pos', 'Str', 'Adv', 'Sup', 'Saf', 'Tot']}
        />

        {/* Pawn Structure */}
        <StructureBlock />
      </div>
    </div>
  );
}