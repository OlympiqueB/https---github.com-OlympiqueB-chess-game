import attackedTiles from "./CalculateAttackedTiles.js";
import { noSelfCheck } from "./NoSelfCheck.js";

function pawnHighlights(pawn, board) {
  const direction = pawn.piece.color === "light" ? -1 : 1;
  const oppositeColor = pawn.piece.color === "light" ? "dark" : "light";

  const ahead1 =
    pawn.row + direction < 8 && pawn.row + direction > -1
      ? board[pawn.row + direction][pawn.col].piece.type
      : "notATile";
  const ahead2 =
    pawn.row + direction * 2 < 8 &&
    pawn.row + direction * 2 > -1 &&
    pawn.piece.isInitPawn
      ? board[pawn.row + direction * 2][pawn.col].piece.type
      : "notATile";

  const posCapture1 =
    pawn.row + direction < 8 && pawn.row + direction > -1 && pawn.col - 1 > -1
      ? board[pawn.row + direction][pawn.col - 1].piece
      : "";
  const posCapture2 =
    pawn.row + direction < 8 && pawn.row + direction > -1 && pawn.col + 1 < 8
      ? board[pawn.row + direction][pawn.col + 1].piece
      : "";

  const enPassantCol1 = pawn.col + 1 < 8 ? pawn.col + 1 : false;
  const enPassantCol2 = pawn.col - 1 > -1 ? pawn.col - 1 : false;
  const enPassantRow = pawn.row;
  const posEnPassant1 =
    enPassantCol1 &&
    board[enPassantRow][enPassantCol1].piece.type === "Pawn" &&
    board[enPassantRow][enPassantCol1].piece.enPassant &&
    board[enPassantRow][enPassantCol1].piece.color === oppositeColor;
  const posEnPassant2 =
    enPassantCol2 &&
    board[enPassantRow][enPassantCol2].piece.type === "Pawn" &&
    board[enPassantRow][enPassantCol2].piece.enPassant &&
    board[enPassantRow][enPassantCol2].piece.color === oppositeColor;

  let tilesToHighlight = [];

  if (
    posEnPassant1 &&
    !noSelfCheck(
      pawn.row + direction,
      pawn.col + 1,
      pawn.row,
      pawn.col,
      oppositeColor,
      board
    )
  ) {
    tilesToHighlight.push(`${enPassantRow + direction}${enPassantCol1}`);
  }
  if (
    posEnPassant2 &&
    !noSelfCheck(
      pawn.row + direction,
      pawn.col - 1,
      pawn.row,
      pawn.col,
      oppositeColor,
      board
    )
  ) {
    tilesToHighlight.push(`${enPassantRow + direction}${enPassantCol2}`);
  }

  if (
    posCapture1.color === oppositeColor &&
    posCapture1.type !== "King" &&
    !noSelfCheck(
      pawn.row + direction,
      pawn.col - 1,
      pawn.row,
      pawn.col,
      oppositeColor,
      board
    )
  ) {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col - 1}`);
  }
  if (
    posCapture2.color === oppositeColor &&
    posCapture2.type !== "King" &&
    !noSelfCheck(
      pawn.row + direction,
      pawn.col + 1,
      pawn.row,
      pawn.col,
      oppositeColor,
      board
    )
  ) {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col + 1}`);
  }

  if (
    !ahead1 &&
    ahead1 !== "notATile" &&
    !noSelfCheck(
      pawn.row + direction,
      pawn.col,
      pawn.row,
      pawn.col,
      oppositeColor,
      board
    )
  ) {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col}`);
  } else {
    return tilesToHighlight;
  }

  if (
    !ahead2 &&
    ahead2 !== "notATile" &&
    !noSelfCheck(
      pawn.row + direction * 2,
      pawn.col,
      pawn.row,
      pawn.col,
      oppositeColor,
      board
    )
  ) {
    tilesToHighlight.push(`${pawn.row + direction * 2}${pawn.col}`);
  } else {
    return tilesToHighlight;
  }

  return tilesToHighlight;
}

function kingHighlights(king, board) {
  const oppositeColor = king.piece.color === "light" ? "dark" : "light";
  const castleRow = king.piece.color === "light" ? 7 : 0;

  const currRow = king.row;
  const currCol = king.col;
  const leftRookMoved =
    king.piece.color === "light"
      ? board[7][0].piece.hasItMoved
      : board[0][0].piece.hasItMoved;
  const rightRookMoved =
    king.piece.color === "light"
      ? board[7][7].piece.hasItMoved
      : board[0][7].piece.hasItMoved;
  const rightEmpty =
    board[castleRow][6].piece.type === "" &&
    board[castleRow][5].piece.type === "";
  const leftEmpty =
    board[castleRow][1].piece.type === "" &&
    board[castleRow][2].piece.type === "" &&
    board[castleRow][3].piece.type === "";

  const oppPieces = board
    .flat(2)
    .filter((t) => t.piece.color !== king.piece.color && t.piece.color !== "");
  let attTiles = new Set();
  oppPieces
    .flat(2)
    .forEach((t) =>
      attackedTiles(t.row, t.col, board).forEach((calcT) => attTiles.add(calcT))
    );

  const isRightCastlePossible =
    !attTiles.has(`${castleRow}4`) &&
    !attTiles.has(`${castleRow}5`) &&
    !attTiles.has(`${castleRow}6`) &&
    rightEmpty &&
    !rightRookMoved &&
    !king.piece.hasItMoved;
  const isLeftCastlePossible =
    !attTiles.has(`${castleRow}1`) &&
    !attTiles.has(`${castleRow}2`) &&
    !attTiles.has(`${castleRow}3`) &&
    !attTiles.has(`${castleRow}4`) &&
    leftEmpty &&
    !leftRookMoved &&
    !king.piece.hasItMoved;

  const directions = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
    [-1, 1],
    [-1, -1],
    [1, -1],
    [1, 1],
  ];
  let result = [];

  if (isRightCastlePossible) {
    result.push(`${castleRow}6r`);
  }
  if (isLeftCastlePossible) {
    result.push(`${castleRow}2l`);
  }

  for (const [dr, dc] of directions) {
    const newRow = currRow + dr;
    const newCol = currCol + dc;

    if (newRow > -1 && newRow < 8 && newCol > -1 && newCol < 8) {
      const piece = board[newRow][newCol].piece;

      if (
        (piece.type === "" ||
          (piece.color === oppositeColor && piece.type !== "King")) &&
        !noSelfCheck(newRow, newCol, king.row, king.col, oppositeColor, board)
      ) {
        result.push(`${newRow}${newCol}`);
      }
    }
  }
  return result;
}

//attacked and possible squares are the same for all pieces, except pawns and kings (pawn capture, en passant, castle)
export default function hightlightPossibleMoves(row, col, board) {
  if (board[row][col].piece.type === "Pawn") {
    return pawnHighlights(board[row][col], board);
  }
  if (board[row][col].piece.type === "King") {
    return kingHighlights(board[row][col], board);
  }
  return attackedTiles(row, col, board);
}
