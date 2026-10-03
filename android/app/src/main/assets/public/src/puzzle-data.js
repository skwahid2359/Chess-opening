export const BOARD_PUZZLES = [
  {
    id:"queen-mate-g7", category:"mate", level:"Foundation", title:"Queen and king: mate in one",
    prompt:"White to move. Find checkmate in one move.",
    fen:"7k/8/5KQ1/8/8/8/8/8 w - - 0 1", solution:"Qg7#", goal:"mate",
    hint:"Look for a queen check that is protected by the king and covers the escape squares.",
    explanation:"Qg7 is protected by the king on f6. The queen checks along the diagonal to h8 and controls the king's escape squares."
  },
  {
    id:"passed-pawn-promotion", category:"endgame", level:"Foundation", title:"Promote the passed pawn",
    prompt:"White to move. Promote the pawn immediately with check.",
    fen:"7k/P7/2K5/8/8/8/8/8 w - - 0 1", solution:"a8=Q+", goal:"promotion",
    hint:"The pawn is one step from the eighth rank; consider the strongest promotion.",
    explanation:"a8=Q+ promotes the pawn to a queen with check. In a real ending, calculate the king's route and any tactical counterplay before assuming promotion wins."
  },
  {
    id:"win-loose-rook", category:"tactics", level:"Foundation", title:"Take the undefended rook",
    prompt:"White to move. Win the loose rook with the queen.",
    fen:"7k/6pp/r7/8/8/3Q4/8/4K3 w - - 0 1", solution:"Qxa6", goal:"capture",
    hint:"Trace the queen's diagonal to the rook on a6. Check that no piece blocks the path.",
    explanation:"Qxa6 wins the rook along the diagonal d3–c4–b5–a6. Always check whether a captured piece is defended and whether the reply creates a stronger threat."
  },
  {
    id:"king-support-pawn", category:"endgame", level:"Intermediate", title:"Activate the king",
    prompt:"White to move. Improve the king to support the passed pawn and challenge the opposing king.",
    fen:"4k3/8/4K3/4P3/8/8/8/8 w - - 0 1", solution:"Kd6", goal:"move",
    hint:"In king-and-pawn endings, the king is an active piece. Step toward the pawn's promotion route while respecting opposition.",
    explanation:"Kd6 centralizes the king and supports the e-pawn. This is a training position for king activity; exact winning/drawing status depends on the full position and move order."
  }

  ,{
    id:"mirror-queen-mate", category:"mate", level:"Foundation", title:"Queen and king: mirrored mate",
    prompt:"White to move. Find checkmate in one move.",
    fen:"k7/8/1QK5/8/8/8/8/8 w - - 0 1", solution:"Qb7#", goal:"mate",
    hint:"Look for a queen check protected by the king that covers the corner king's escape squares.",
    explanation:"Qb7# checks the king on a8 along the diagonal. The white king protects b7, while the queen controls a7 and b8."
  },
  {
    id:"h-pawn-promotion-check", category:"endgame", level:"Foundation", title:"Promote the h-pawn with check",
    prompt:"White to move. Promote the passed pawn to a queen with check.",
    fen:"k7/7P/5K2/8/8/8/8/8 w - - 0 1", solution:"h8=Q+", goal:"promotion",
    hint:"The pawn is one step from promotion. Consider the checking line created by the new queen.",
    explanation:"h8=Q+ promotes with check along the eighth rank. After promotion, calculate the king's response and the resulting material before deciding the ending is won."
  },
  {
    id:"queen-mate-e6-g7", category:"mate", level:"Intermediate", title:"Queen mate on g7",
    prompt:"White to move. Find the queen move that mates immediately.",
    fen:"7k/8/4Q1K1/8/8/8/8/8 w - - 0 1", solution:"Qg7#", goal:"mate",
    hint:"The white king can protect a checking square next to the black king.",
    explanation:"Qg7# is protected by the king on g6. The queen covers h7 and g8, leaving the black king no legal escape."
  },
  {
    id:"knight-wins-queen", category:"tactics", level:"Foundation", title:"Capture the loose queen",
    prompt:"White to move. Capture the undefended queen with the knight.",
    fen:"7k/8/2q5/4N3/8/8/8/4K3 w - - 0 1", solution:"Nxc6", goal:"capture",
    hint:"Check the knight's L-shaped moves from e5 and see which valuable piece it can capture.",
    explanation:"Nxc6 captures the queen on c6. Before making a capture in a real game, always check whether the capturing piece can be recaptured."
  },
  {
    id:"mirror-loose-rook", category:"tactics", level:"Foundation", title:"Take the rook on h6",
    prompt:"White to move. Win the loose rook with the queen.",
    fen:"k7/pp6/7r/8/8/4Q3/8/3K4 w - - 0 1", solution:"Qxh6", goal:"capture",
    hint:"Trace the queen's diagonal from e3 to h6. The path must be clear.",
    explanation:"Qxh6 wins the rook along the diagonal. The rook is not protected by the nearby a- and b-pawns."
  },
  {
    id:"king-activity-pawn", category:"endgame", level:"Intermediate", title:"Bring the king toward the passer",
    prompt:"White to move. Activate the king to support the passed pawn.",
    fen:"4k3/8/2K5/3P4/8/8/8/8 w - - 0 1", solution:"Kd6", goal:"move",
    hint:"In king-and-pawn endings, the king should help the pawn advance while respecting the opposing king's approach.",
    explanation:"Kd6 brings the king closer to the pawn's promotion route. This is a positional practice move, not an engine-certified best-move claim."
  }


  ,{
    id:"fools-mate-pattern", category:"mate", level:"Foundation", title:"Fool's Mate pattern",
    prompt:"Black to move. Find the immediate checkmate after White weakens the king's diagonal.",
    fen:"rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2", solution:"Qh4#", goal:"mate",
    hint:"Look at the diagonal from the queen toward the white king. The f-pawn has moved, opening the diagonal.",
    explanation:"Qh4# exploits the opened diagonal toward e1. This pattern shows why early king-sheltering pawn moves should be considered carefully."
  },
  {
    id:"scholars-mate-pattern", category:"mate", level:"Foundation", title:"Scholar's Mate pattern",
    prompt:"White to move. Find the checkmate after the queen and bishop coordinate against f7.",
    fen:"r1bqkb1r/pppp1ppp/2n2n2/7Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", solution:"Qxf7#", goal:"mate",
    hint:"The queen can capture on f7, and the bishop on c4 supports that square.",
    explanation:"Qxf7# combines the queen's check with the bishop's support of f7. This is a basic mating pattern, not a recommendation to rely on a trap against prepared opponents."
  }

];
