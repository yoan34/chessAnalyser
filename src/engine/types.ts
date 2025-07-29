import type { Color, PieceSymbol, Square } from 'chess.js'


export type PawnBlocked = {
  isBlocked: boolean;
  blockedBy: string | undefined;
  permanentlyBlocked: boolean;
}
export type EnrichedSquare = {
  piece: {
    type: PieceSymbol;
    color: Color;
  } | undefined;
  evaluation: PawnEvaluation | KnightEvaluation | BishopEvaluation | RookEvaluation | QueenEvaluation | KingEvaluation | undefined

  // ===== INFORMATIONS POSITION =====
  square: Square;        // 'e4', 'a1', etc.
  rank: number;         // 0-7 (0 = 8ème rangée)
  file: number;         // 0-7 (0 = colonne a)

  // ===== ANALYSE TACTIQUE =====
  attackers: string[];

  defenders: string[];

  mobility: {
    moves: string[];        // Cases accessibles depuis ici
    captures: string[];     // Captures possibles
    checks: string[];       // Coups donnant échec
    totalMobility: number;  // Nombre total de coups
  };

  // ===== CONTRÔLE ET INFLUENCE =====
  control: {
    white: Square[];  // Force du contrôle blanc
    black: Square[];  // Force du contrôle noir
    dominantColor: Color | undefined;
  };

  // ===== VALEURS ET SCORES =====
  values: {
    pieceValue: number;      // Valeur de la pièce présente
    positionalValue: number; // Valeur positionnelle
    tacticalValue: number;   // Valeur tactique
    totalValue: number;      // Valeur totale
  };

  // ===== PROPRIÉTÉS GÉOMÉTRIQUES =====
  geometry: {
    isCenter: boolean;           // Case centrale (d4,d5,e4,e5)
    isExtendedCenter: boolean;   // Centre étendu
    isEdge: boolean;            // Case de bord
    isCorner: boolean;          // Case de coin
    isDarkSquare: boolean;      // Case noire
    distanceFromCenter: number; // Distance du centre
  };

  // ===== STRUCTURE DE PIONS =====
  pawnStructure: {
    isPawn: boolean;
    isolated: boolean;      // Pion isolé
    doubled: boolean;       // Pion doublé
    passed: boolean;        // Pion passé
    backward: boolean;      // Pion arriéré
    hanging: boolean;       // Pion pendant
    chain: boolean;         // Dans une chaîne
    support: number;        // Nombre de soutiens
    weakness: number;       // Score de faiblesse (0-10)
    blocked: PawnBlocked
  };

  // ===== SÉCURITÉ ROI =====
  kingSafety: {
    whiteKingDistance: number;  // Distance au roi blanc
    blackKingDistance: number;  // Distance au roi noir
    inKingZone: boolean;       // Dans zone du roi
    castlingRights: boolean;   // Affecte le roque
    escapeSquare: boolean;     // Case de fuite pour roi
  };

  // ===== MENACES ET TENSIONS =====
  threats: {
    isHanging: boolean;        // Pièce en prise
    isPinned: boolean;         // Pièce clouée
    isFork: boolean;          // Dans une fourchette
    isSkewer: boolean;        // Dans un enfilage
    threatLevel: number;      // Niveau de menace (0-10)
  };

  // ===== MÉTADONNÉES =====
  metadata: {
    lastUpdated: number;      // Timestamp
    analysisVersion: string;  // Version de l'analyse
    isCalculated: boolean;    // Analyse terminée ?
  };
}

export type EnrichedBoard = EnrichedSquare[][];

export type Mobility = {
  moves: string[];
  captures: string[];
  checks: string[];
  totalMobility: number;
};

export type TeamStructure = {
  phase: PhaseGame
  king: EnrichedSquare | null
  queen: EnrichedSquare | null
  rooks: EnrichedSquare[]
  bishops: EnrichedSquare[]
  knights: EnrichedSquare[]
  pawns: EnrichedSquare[]

  // Structures spécifiques
  pawnStructure: {
    isolated: EnrichedSquare[]
    doubled: EnrichedSquare[]
    passed: EnrichedSquare[]
    backward: EnrichedSquare[]
    hanging: EnrichedSquare[]
    blocked: EnrichedSquare[]
  }

  // Statistiques globales
  material: {
    totalValue: number
    pieceCount: number
    pawnCount: number
    majorPieces: number // tours + dame
    minorPieces: number // fous + cavaliers
  }

  // Mobilité globale
  totalMobility: number
  averageMobility: number
}

///////////////////////////////
/////////// PIECES ////////////
///////////////////////////////

export type PieceCommonMetrics = {
  mobility: number;
  position: number;
  tactics: number;
  support: number;
  safety: number;
};
export type PieceScore = {
  totalScore: number;
  grade: string;
}
/////////// PAWN ////////////
export type PawnMetrics = PieceCommonMetrics & { structure: number; advancement: number; };
export type PawnWeights = PawnMetrics
export type PawnEvaluation = PawnWeights & PieceScore

/////////// KNIGHT ////////////
export type KnightMetrics = PieceCommonMetrics
export type KnightWeights = KnightMetrics
export type KnightEvaluation = KnightMetrics & PieceScore

/////////// BISHOP ///////////

export type BishopMetrics = PieceCommonMetrics & { diagonals: number; }
export type BishopWeights = BishopMetrics
export type BishopEvaluation = BishopWeights & PieceScore

/////////// ROOKS ////////////
export type RookMetrics = PieceCommonMetrics & { openFiles: number; }
export type RookWeights = RookMetrics
export type RookEvaluation = RookWeights & PieceScore


/////////// QUEEN ////////////
export type QueenMetrics = PieceCommonMetrics & { centralization: number; }
export type QueenWeights = QueenMetrics
export type QueenEvaluation = QueenWeights & PieceScore

/////////// KING ////////////
export type KingMetrics = Omit<PieceCommonMetrics, 'tactics'> & { activity: number; castling: number; };
export type KingWeights = KingMetrics
export type KingEvaluation = KingWeights & PieceScore


export type PhaseName = 'Opening' | 'Middlegame' | 'Endgame'
export type PhaseGame = {
  name: PhaseName
  value: number
}