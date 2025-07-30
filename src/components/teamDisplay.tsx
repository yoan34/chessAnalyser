import { STANDARD_CRITERION_MAX } from '../engine/pieces/normalization.ts'
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

  // Déterminer si c'est l'équipe de droite (pour inverser l'ordre)
  const isRightTeam = color === 'black'; // Supposons que les noirs sont à droite par défaut

  // Composant Progress Bar standard
  const ProgressBar = ({ value, criteriaName, isTotal = false, grade }: {
    value: number | undefined;
    criteriaName?: keyof typeof STANDARD_CRITERION_MAX;
    isTotal?: boolean;
    grade?: string;
  }) => {
    const safeValue = value || 0;

    // Utiliser la valeur max appropriée selon le critère
    let maxValue = 2.5; // valeur par défaut
    if (isTotal) {
      maxValue = 10;
    } else if (criteriaName && STANDARD_CRITERION_MAX[criteriaName]) {
      maxValue = STANDARD_CRITERION_MAX[criteriaName];
    }

    const percentage = Math.min(100, (safeValue / maxValue) * 100);
    const displayGrade = grade || getCriteriaGrade(safeValue, maxValue);
    const colorClass = getGradeColor(displayGrade, isTotal);

    const width = isTotal ? '' : 'w-12';
    const height = isTotal ? 'h-5' : 'h-4';
    const customStyle = isTotal ? { width: '90px' } : {};

    return (
      <div
        className={`${width} ${height} relative bg-gray-200 rounded border overflow-hidden`}
        style={customStyle}
      >
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


  // Fonction pour calculer la moyenne des pions
  const getPawnAverage = (): { averageScore: number; grade: string } => {
    if (team.pawns.length === 0) return { averageScore: 0, grade: 'F' };

    const totalScore = team.pawns.reduce((sum, pawn) => {
      const evaluation = pawn.evaluation as PawnEvaluation;
      return sum + (evaluation?.totalScore || 0);
    }, 0);

    const averageScore = totalScore / team.pawns.length;
    const grade = getCriteriaGrade(averageScore, 10);

    return { averageScore, grade };
  };

  const PieceRow = ({ piece, type }: { piece: EnrichedSquare; type: 'n' | 'b' | 'r' | 'q' | 'k' | 'p' }) => {
    const evaluation = piece.evaluation;
    if (!evaluation || piece.piece?.type !== type) return null;

    const createRowContent = (children: React.ReactNode[]) => (
      <div className={`flex items-center mt-1 gap-2 ${isRightTeam ? 'flex-row-reverse justify-end' : 'justify-end'}`}>
        {children}
      </div>
    );

    switch (type) {
      case 'k': {
        const kingEval = evaluation as KingEvaluation;
        const content = [
          <div key="square" className="w-8 text-xs font-medium">{piece.square}</div>,
          <ProgressBar key="mobility" value={kingEval.mobility} criteriaName="mobility" />,
          <ProgressBar key="position" value={kingEval.position} criteriaName="position" />,
          <ProgressBar key="activity" value={kingEval.activity} criteriaName="activity" />,
          <ProgressBar key="castling" value={kingEval.castling} criteriaName="castling" />,
          <ProgressBar key="support" value={kingEval.support} criteriaName="support" />,
          <ProgressBar key="safety" value={kingEval.safety} criteriaName="safety" />,
          <ProgressBar key="total" value={kingEval.totalScore} isTotal={true} grade={kingEval.grade} />
        ];
        return createRowContent(content);
      }
      case 'q': {
        const queenEval = evaluation as QueenEvaluation;
        const content = [
          <div key="square" className="w-8 text-xs font-medium">{piece.square}</div>,
          <ProgressBar key="mobility" value={queenEval.mobility} criteriaName="mobility"/>,
          <ProgressBar key="position" value={queenEval.position} criteriaName="position"/>,
          <ProgressBar key="centralization" value={queenEval.centralization} criteriaName="centralization"/>,
          <ProgressBar key="tactics" value={queenEval.tactics} criteriaName="tactics"/>,
          <ProgressBar key="support" value={queenEval.support} criteriaName="support"/>,
          <ProgressBar key="safety" value={queenEval.safety} criteriaName="safety"/>,
          <ProgressBar key="total" value={queenEval.totalScore} isTotal={true} grade={queenEval.grade} />
        ];
        return createRowContent(content);
      }
      case 'r': {
        const rookEval = evaluation as RookEvaluation;
        const content = [
          <div key="square" className="w-8 text-xs font-medium">{piece.square}</div>,
          <ProgressBar key="mobility" value={rookEval.mobility} criteriaName="mobility" />,
          <ProgressBar key="position" value={rookEval.position} criteriaName="position" />,
          <ProgressBar key="openFiles" value={rookEval.openFiles} criteriaName="openFiles" />,
          <ProgressBar key="tactics" value={rookEval.tactics} criteriaName="tactics" />,
          <ProgressBar key="support" value={rookEval.support} criteriaName="support" />,
          <ProgressBar key="safety" value={rookEval.safety} criteriaName="safety" />,
          <ProgressBar key="total" value={rookEval.totalScore} isTotal={true} grade={rookEval.grade} />
        ];
        return createRowContent(content);
      }
      case 'b': {
        const bishopEval = evaluation as BishopEvaluation;
        const content = [
          <div key="square" className="w-8 text-xs font-medium">{piece.square}</div>,
          <ProgressBar key="mobility" value={bishopEval.mobility} criteriaName="mobility" />,
          <ProgressBar key="position" value={bishopEval.position} criteriaName="position" />,
          <ProgressBar key="diagonals" value={bishopEval.diagonals} criteriaName="diagonals" />,
          <ProgressBar key="tactics" value={bishopEval.tactics} criteriaName="tactics" />,
          <ProgressBar key="support" value={bishopEval.support} criteriaName="support" />,
          <ProgressBar key="safety" value={bishopEval.safety} criteriaName="safety" />,
          <ProgressBar key="total" value={bishopEval.totalScore} isTotal={true} grade={bishopEval.grade} />
        ];
        return createRowContent(content);
      }
      case 'n': {
        const knightEval = evaluation as KnightEvaluation;
        const content = [
          <div key="square" className="w-8 text-xs font-medium">{piece.square}</div>,
          <ProgressBar key="mobility" value={knightEval.mobility} criteriaName="mobility" />,
          <ProgressBar key="position" value={knightEval.position} criteriaName="position" />,
          <ProgressBar key="tactics" value={knightEval.tactics} criteriaName="tactics" />,
          <ProgressBar key="support" value={knightEval.support} criteriaName="support" />,
          <ProgressBar key="safety" value={knightEval.safety} criteriaName="safety" />,
          <ProgressBar key="total" value={knightEval.totalScore} isTotal={true} grade={knightEval.grade} />
        ];
        return createRowContent(content);
      }
      case 'p': {
        const pawnEval = evaluation as PawnEvaluation;
        const content = [
          <div key="square" className="w-8 text-xs font-medium">{piece.square}</div>,
          <ProgressBar key="mobility" value={pawnEval.mobility} criteriaName="mobility" />,
          <ProgressBar key="position" value={pawnEval.position} criteriaName="position" />,
          <ProgressBar key="structure" value={pawnEval.structure} criteriaName="structure" />,
          <ProgressBar key="advancement" value={pawnEval.advancement} criteriaName="advancement" />,
          <ProgressBar key="support" value={pawnEval.support} criteriaName="support" />,
          <ProgressBar key="safety" value={pawnEval.safety} criteriaName="safety" />,
          <ProgressBar key="total" value={pawnEval.totalScore} isTotal={true} grade={pawnEval.grade} />
        ];
        return createRowContent(content);
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
          {/* Headers avec inversion pour l'équipe de droite */}
          <div className={`flex items-center gap-2 justify-end text-xs font-medium text-gray-500 mb-1 ${isRightTeam ? 'flex-row-reverse' : ''}`}>
            {headers.map((header, idx) => (
              <div key={idx} className={
                idx === 0 ? "w-8 text-center" :
                  header === 'Tot' ? "text-center" :
                    "w-12 text-center"
              } style={header === 'Tot' ? { width: '90px' } : {}}>
                {header}
              </div>
            ))}
          </div>
          {pieces.map((piece, idx) => (
            <PieceRow key={idx} piece={piece} type={type} />
          ))}
          {/* Ligne moyenne pour les pions */}
          {type === 'p' && pieces.length > 1 && (() => {
            const { averageScore, grade } = getPawnAverage();
            const content = [
              <div key="avg-label" className="w-8 text-xs font-medium text-gray-500">Avg</div>,
              <div key="spacer1" className="w-12"></div>,
              <div key="spacer2" className="w-12"></div>,
              <div key="spacer3" className="w-12"></div>,
              <div key="spacer4" className="w-12"></div>,
              <div key="spacer5" className="w-12"></div>,
              <div key="spacer6" className="w-12"></div>,
              <ProgressBar key="avg-total" value={averageScore} isTotal={true} grade={grade} />
            ];
            return (
              <div className={`flex items-center gap-2 border-t mt-1 pt-1 ${isRightTeam ? 'flex-row-reverse' : ''}`}>
                {content}
              </div>
            );
          })()}
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
    <div className={`p-3 rounded-lg border-2 ${
      color === 'white'
        ? 'bg-gray-50 border-gray-300 text-black'
        : 'bg-gray-800 border-gray-600 text-white'
    }`} style={{ width: 'fit-content' }}>
      {/* Header */}
      <div className="text-center mb-2">
        <div className="text-sm font-bold uppercase">
          {color} - {team.phase.name} ({team.phase.value.toFixed(2)})
        </div>
      </div>

      <div className="flex flex-col gap-0">
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
            headers={['Sq', 'Mob', 'Pos', 'Act', 'Cas', 'Sup', 'Saf', 'Tot']}
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