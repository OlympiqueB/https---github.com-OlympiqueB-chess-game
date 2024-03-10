import attackedTilesClone from "./CalculatePieceAttacksClone";
import { deepCopy } from "./DeepCopy";

export function noSelfCheck(
  targetRow,
  targetCol,
  currRow,
  currCol,
  color,
  board
) {
  let checkBoard = deepCopy(board);
  checkBoard[targetRow][targetCol].piece = deepCopy(
    checkBoard[currRow][currCol].piece
  );
  checkBoard[currRow][currCol].piece = {
    type: "",
    color: "",
  };

  const playerPieces = checkBoard
    .flat(2)
    .filter((t) => t.piece.color === color && t.piece.color !== "");

  let attTiles = new Set();
  playerPieces.forEach((t) =>
    attackedTilesClone(t.row, t.col, checkBoard).forEach((attT) =>
      attTiles.add(attT)
    )
  );

  if (
    [...attTiles].filter(
      (t) => checkBoard[t.split("")[0]][t.split("")[1]].piece.type === "King"
    ).length > 0
  ) {
    return true;
  } else {
    return false;
  }
}
