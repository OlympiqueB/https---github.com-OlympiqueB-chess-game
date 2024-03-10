import { noSelfCheck } from "./NoSelfCheck";

function getOppositeColor(color) {
  return color === "light" ? "dark" : "light";
}

function isValidTile(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function findValidMoves(piece, directions, board) {
  const oppositeColor = getOppositeColor(piece.piece.color);
  const currRow = piece.row;
  const currCol = piece.col;
  let result = [];

  o: for (const [dr, dc] of directions) {
    let newRow = currRow + dr;
    let newCol = currCol + dc;

    while (isValidTile(newRow, newCol)) {
      const targetPiece = board[newRow][newCol].piece;

      if (noSelfCheck(newRow, newCol, currRow, currCol, oppositeColor, board)) {
        continue o;
      }

      if (targetPiece.type === "") {
        if (piece.piece.type === "King") {
          //king can only move 1 square
          result.push(`${newRow}${newCol}`);
          continue o;
        } else {
          result.push(`${newRow}${newCol}`);
        }
      } else if (targetPiece.color === oppositeColor) {
        result.push(`${newRow}${newCol}`);
        continue o;
      } else {
        continue o;
      }

      newRow += dr;
      newCol += dc;
    }
  }

  return result;
}

function pawnAttacks(pawn, board) {
  const direction = pawn.piece.color === "light" ? -1 : 1;
  const oppositeColor = getOppositeColor(pawn.piece.color);
  let tilesToHighlight = [];

  const posCaptureOne = isValidTile(pawn.row + direction, pawn.col - 1)
    ? board[pawn.row + direction][pawn.col - 1].piece
    : "";
  const posCaptureTwo = isValidTile(pawn.row + direction, pawn.col + 1)
    ? board[pawn.row + direction][pawn.col + 1].piece
    : "";

  if (
    posCaptureOne.color === oppositeColor ||
    (posCaptureOne.color === "" &&
      !noSelfCheck(
        pawn.row + direction,
        pawn.col - 1,
        pawn.row,
        pawn.col,
        oppositeColor,
        board
      ))
  ) {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col - 1}`);
  }
  if (
    posCaptureTwo.color === oppositeColor ||
    (posCaptureTwo.color === "" &&
      !noSelfCheck(
        pawn.row + direction,
        pawn.col + 1,
        pawn.row,
        pawn.col,
        oppositeColor,
        board
      ))
  ) {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col + 1}`);
  }

  return tilesToHighlight;
}

function knightAttacks(knight, board) {
  const allPossibleTiles = [
    [knight.row + 2, knight.col - 1],
    [knight.row + 2, knight.col + 1],
    [knight.row - 2, knight.col - 1],
    [knight.row - 2, knight.col + 1],
    [knight.row + 1, knight.col - 2],
    [knight.row + 1, knight.col + 2],
    [knight.row - 1, knight.col - 2],
    [knight.row - 1, knight.col + 2],
  ];

  const validMoves = allPossibleTiles.filter(([row, col]) =>
    isValidTile(row, col)
  );
  const oppositeColor = getOppositeColor(knight.piece.color);

  return validMoves
    .filter(
      ([row, col]) =>
        (board[row][col].piece.type === "" ||
          board[row][col].piece.color === oppositeColor) &&
        !noSelfCheck(row, col, knight.row, knight.col, oppositeColor, board)
    )
    .map(([row, col]) => `${row}${col}`);
}

function rookAttacks(rook, board) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
  ];

  return findValidMoves(rook, directions, board);
}

function bishopAttacks(bishop, board) {
  const directions = [
    [-1, 1],
    [-1, -1],
    [1, -1],
    [1, 1],
  ];

  return findValidMoves(bishop, directions, board);
}

function queenAttacks(queen, board) {
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

  return findValidMoves(queen, directions, board);
}

function kingAttacks(king, board) {
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

  return findValidMoves(king, directions, board);
}

const pieceAttackFunctions = {
  Pawn: pawnAttacks,
  Knight: knightAttacks,
  Bishop: bishopAttacks,
  Rook: rookAttacks,
  Queen: queenAttacks,
  King: kingAttacks,
};

export default function attackedTiles(row, col, board) {
  const piece = board[row][col].piece;
  const attackFunction = pieceAttackFunctions[piece.type];
  return attackFunction(board[row][col], board);
}