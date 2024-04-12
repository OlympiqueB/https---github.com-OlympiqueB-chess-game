import attackedTiles from "./CalculateAttackedTiles";

export function checkCheck(r, c, board, checkSetter) {
  const movedPieceColor = board[r][c].piece.color;
  const playerPieces = board
    .flat(2)
    .filter((t) => t.piece.color === movedPieceColor && t.piece.color !== "");

  let attTiles = new Set();
  playerPieces.forEach((t) =>
    attackedTiles(t.row, t.col, board).forEach((attT) => attTiles.add(attT))
  );

  if (
    [...attTiles].filter(
      (t) => board[t.split("")[0]][t.split("")[1]].piece.type === "King"
    ).length > 0
  ) {
    checkSetter(true);
    return true;
  } else {
    checkSetter(false);
    return false;
  }
}
