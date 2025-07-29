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

// 🎯 NOUVEAU : State global pour les préférences d'affichage
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

  // 🎯 NOUVEAU : Effet pour mettre à jour les flèches quand la case change
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

    // Ajouter les flèches d'attaque si activées
    if (arrowPreferences.showAttackers && square.attackers.length > 0) {
      const attackArrows = square.attackers.map((attacker, index) => ({
        startSquare: attacker,
        endSquare: square.square,
        color: 'red',
        id: `ATK_${attacker}_${square.square}_${index}`
      }))
      newArrows.push(...attackArrows)
    }

    // Ajouter les flèches de défense si activées
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
    // 🎯 Ne plus vider les flèches ici - elles seront mises à jour automatiquement
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
    arrows
  }


  console.log(analysisData?.whiteTeam)
  return (
    <div style={styles.body}>
      <div style={{ padding: 20 }}>
        <div style={styles.container}>
          <Chessboard options={chessboardOptions}/>
        </div>
      </div>

      <div style={styles.sidePanel}>
        {indexesSquare ? (
          <div style={styles.helloPanel}>
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
          <div style={styles.helloPanel}>
            Cliquez sur une case
          </div>
        )}
        {analysisData?.whiteTeam && <TeamDisplay team={analysisData?.whiteTeam} color={'white'}/>}
        {analysisData?.blackTeam && <TeamDisplay team={analysisData?.blackTeam} color={'black'}/>}
      </div>
    </div>
  )
}

const styles = {
  body: {
    display: 'flex',
    flexDirection: 'row' as const
  },
  container: {
    width: '600px',
    margin: '0 auto'
  },
  sidePanel: {
    padding: '20px',
    display: 'flex',
    gap: "4px"
  },
  helloPanel: {
    width: 'fit-content',
    height: '160px',
    backgroundColor: '#e3f2fd',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '2px solid #2196f3',
    color: '#1976d2',
    fontWeight: 'bold',
    textAlign: 'center' as const
  }
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