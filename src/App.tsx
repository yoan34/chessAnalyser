import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { Chessboard, type Arrow } from 'react-chessboard'
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard'
import { Chess, type Square } from 'chess.js'
import SquareCard from './components/squareCard.tsx'
import TeamDisplay from './components/teamDisplay.tsx'
import { type AnalysisData, chessAnalyzer } from './engine/chess-analyzer'

interface LastMove {
  from: string;
  to: string;
}

type ExtendedArrow = Arrow & {
  id?: string;
}

export type ArrowPreferences = {
  showAttackers: boolean;
  showDefenders: boolean;
}
export type SquarePreferences = {
  showMobility: boolean;
}

type SquareStyle = Partial<Record<Square, {
  backgroundColor: string;
  type: 'MOBILITY' | 'LAST_MOVE';
}>>;

export default function App () {
  const chessGameRef = useRef(new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'))
  const chessGame = chessGameRef.current

  const [chessPosition, setChessPosition] = useState(chessGame.fen())
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [lastMove, setLastMove] = useState<LastMove | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [squareStyles, setSquareStyles] = useState<SquareStyle>()
  const [arrows, setArrows] = useState<ExtendedArrow[]>([])
  const [indexesSquare, setIndexesSquare] = useState<{ file: number, rank: number } | null>(null)

  const [arrowPreferences, setArrowPreferences] = useState<ArrowPreferences>({
    showAttackers: false,
    showDefenders: false
  })
  const [squarePreferences, setSquarePreferences] = useState<SquarePreferences>({
    showMobility: false,
  })

  useEffect(() => {
    analyzeCurrentPosition(chessGame.fen())
  }, [])

  useEffect(() => {
    if (indexesSquare && analysisData) {
      updateArrowsForCurrentSquare()
    }
  }, [indexesSquare, arrowPreferences, analysisData])

  useEffect(() => {
    if (indexesSquare && analysisData) {
      updateSquareForCurrentSquare()
    }
  }, [indexesSquare, squarePreferences, analysisData])

  const updateSquareForCurrentSquare = () => {
    if (!indexesSquare || !analysisData) return;

    const square = analysisData.board[indexesSquare.rank][indexesSquare.file];
    if (!square) return;

    const cleanedSquareStyles: SquareStyle = {};
    for (const key in squareStyles) {
      const style = squareStyles[key as Square];
      if (style?.type !== 'MOBILITY') {
        cleanedSquareStyles[key as Square] = style;
      }
    }
    const allMoves = [
      ...square.mobility.moves,
      ...square.mobility.captures,
      ...square.mobility.checks
    ]
    const newMobilitySquares: SquareStyle = {};
    if (squarePreferences.showMobility && allMoves.length > 0) {
      allMoves.forEach((move) => {
        newMobilitySquares[move as Square] = {
          backgroundColor: 'rgb(96, 149, 247)',
          type: 'MOBILITY',
        };
      });
    }

    setSquareStyles({
      ...cleanedSquareStyles,
      ...newMobilitySquares,
    });
  };

  const updateArrowsForCurrentSquare = () => {
    if (!indexesSquare || !analysisData) return

    const square = analysisData.board[indexesSquare.rank][indexesSquare.file]
    if (!square) return

    const newArrows: ExtendedArrow[] = []

    if (arrowPreferences.showAttackers && square.attackers.length > 0) {
      const attackArrows = square.attackers.map((attacker, index) => ({
        startSquare: attacker,
        endSquare: square.square,
        color: 'red',
        id: `ATK_${attacker}_${square.square}_${index}`
      }))
      newArrows.push(...attackArrows)
    }

    if (arrowPreferences.showDefenders && square.defenders.length > 0) {
      const defendArrows = square.defenders.map((defender, index) => ({
        startSquare: defender,
        endSquare: square.square,
        color: 'green',
        id: `DEF_${defender}_${square.square}_${index}`
      }))
      newArrows.push(...defendArrows)
    }

    setArrows(newArrows)
  }

  const toggleAttackers = () => {
    setArrowPreferences(prev => ({
      ...prev,
      showAttackers: !prev.showAttackers
    }))
  }

  const toggleDefenders = () => {
    setArrowPreferences(prev => ({
      ...prev,
      showDefenders: !prev.showDefenders
    }))
  }

  const toggleMobility = () => {
    setSquarePreferences(prev => ({
      ...prev,
      showMobility: !prev.showMobility
    }))
  }

  const toggleBoardOrientation = () => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }

  const analyzeCurrentPosition = async (fen: string) => {
    setIsAnalyzing(true)
    try {
      const data = await chessAnalyzer(fen)
      setAnalysisData(data)
      console.log('📊 Analyse terminée:', data)
    } catch (error) {
      console.error('❌ Erreur d\'analyse:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function onSquareClick ({ square }: SquareHandlerArgs) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const indexFile = files.indexOf(square[0])
    const indexRank = 8 - parseInt(square[1])
    setIndexesSquare({ file: indexFile, rank: indexRank })
  }

  function onPieceDrop ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!targetSquare) {
      return false
    }

    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      })

      const newFen = chessGame.fen()
      setChessPosition(newFen)
      analyzeCurrentPosition(newFen)

      const newStyles = { ...squareStyles }
      if (lastMove) {
        delete newStyles[lastMove.from as Square]
        delete newStyles[lastMove.to as Square]
      }
      setSquareStyles({
        ...newStyles,
        [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)', type: 'LAST_MOVE' },
        [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)', type: 'LAST_MOVE' },
      })
      setLastMove({ from: sourceSquare, to: targetSquare })

      return true
    } catch {
      return false
    }
  }

  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop,
    onSquareClick,
    squareStyles: squareStyles ? getOnlyCSSSquare(squareStyles) : {},
    allowDragging: true,
    id: 'basic-chessboard',
    arrows,
    boardOrientation
  }

  // Déterminer quelle équipe afficher à gauche et à droite selon l'orientation
  const leftTeam = boardOrientation === 'white' ? analysisData?.whiteTeam : analysisData?.blackTeam
  const rightTeam = boardOrientation === 'white' ? analysisData?.blackTeam : analysisData?.whiteTeam
  const leftTeamColor = boardOrientation === 'white' ? 'white' : 'black'
  const rightTeamColor = boardOrientation === 'white' ? 'black' : 'white'

  return (
    <div className="flex flex-row min-h-screen">
      {/* Team de gauche */}
      <div className="p-3">
        {leftTeam && <TeamDisplay team={leftTeam} color={leftTeamColor}/>}
      </div>

      {/* Section centrale : Chessboard + SquareCard */}
      <div className="flex flex-col p-1 items-center">
        {/* Bouton pour changer l'orientation */}
        <div className="mb-4">
          <button
            onClick={toggleBoardOrientation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Flip Board ({boardOrientation === 'white' ? 'Black' : 'White'} to bottom)
          </button>
        </div>

        {/* Chessboard */}
        <div className="w-[600px] mb-4">
          <Chessboard options={chessboardOptions}/>
        </div>

        {/* SquareCard */}
        <div className="w-[600px]">
          {indexesSquare ? (
            <div className="w-full h-40 bg-blue-50 p-2.5 rounded-lg border-2 border-blue-500 text-blue-800 font-bold text-center">
              <SquareCard
                key={indexesSquare?.file + '-' + indexesSquare?.rank}
                square={analysisData?.board[indexesSquare.rank][indexesSquare.file]}
                arrowPreferences={arrowPreferences}
                onToggleAttackers={toggleAttackers}
                onToggleDefenders={toggleDefenders}
                squarePreferences={squarePreferences}
                onToggleMobility={toggleMobility}
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-blue-50 p-2.5 rounded-lg border-2 border-blue-500 text-blue-800 font-bold text-center flex items-center justify-center">
              Cliquez sur une case
            </div>
          )}
        </div>
      </div>

      {/* Team de droite */}
      <div className="p-3">
        {rightTeam && <TeamDisplay team={rightTeam} color={rightTeamColor}/>}
      </div>
    </div>
  )
}

function getOnlyCSSSquare(obj: SquareStyle): Record<string, React.CSSProperties> {
  const result: Record<string, React.CSSProperties> = {};

  for (const key in obj) {
    const val = obj[key as Square];
    if (val) {
      const { backgroundColor } = val;
      result[key] = { backgroundColor };
    }
  }

  return result;
}