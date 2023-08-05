function pawnAttacks(pawn, board, check = false) {
  const direction = pawn.piece.color === 'light' ? -1 : 1;
  const oppositeColor = pawn.piece.color === 'light' ? 'dark' : 'light';
  let tilesToHighlight = [];

  const posCapture1 = pawn.row + direction < 8 && pawn.row + direction > -1 && pawn.col - 1 > - 1 ? board[pawn.row + direction][pawn.col - 1].piece : '';
  const posCapture2 = pawn.row + direction < 8 && pawn.row + direction > -1 && pawn.col + 1 < 8 ? board[pawn.row + direction][pawn.col + 1].piece : '';

  if (posCapture1.color === oppositeColor) {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col - 1}`);
  }
  if (posCapture2.color === oppositeColor) {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col + 1}`);
  }
  return tilesToHighlight;
}

function knightAttacks(knight, board, check = false) {
  const oppositeColor = knight.piece.color === 'light' ? 'dark' : 'light';

  const allPossibleTiles = [
    [knight.row + 2, knight.col - 1],
    [knight.row + 2, knight.col + 1],
    [knight.row - 2, knight.col - 1],
    [knight.row - 2, knight.col + 1],
    [knight.row + 1, knight.col - 2],
    [knight.row + 1, knight.col + 2],
    [knight.row - 1, knight.col - 2],
    [knight.row - 1, knight.col + 2]
  ];

  const filteredPoss = allPossibleTiles.filter(tile => (tile[0] > -1 && tile[0] < 8) && (tile[1] > -1 && tile[1] < 8));
  const final = filteredPoss.filter(tile => (board[tile[0]][tile[1]].piece.type === '' || board[tile[0]][tile[1]].piece.color === oppositeColor));

  return final.map(t => `${t[0]}${t[1]}`);
}

function bishopAttacks(bishop, board, check = false) {
  const oppositeColor = bishop.piece.color === 'light' ? 'dark' : 'light';
  const currRow = bishop.row;
  const currCol = bishop.col;

  const directions = [
    [-1, 1],
    [-1, -1],
    [1, -1],
    [1, 1],
  ];

  let result = [];

  o:for (const [dr, dc] of directions) {
    let i = 1;

    while (currRow + i * dr >= 0 && currRow + i * dr < 8 &&
           currCol + i * dc >= 0 && currCol + i * dc < 8) {
      const newRow = currRow + i * dr;
      const newCol = currCol + i * dc;
      const piece = board[newRow][newCol].piece;

      if (piece.type === '') {
        result.push(`${newRow}${newCol}`);
      } else if (piece.color === oppositeColor) {
        result.push(`${newRow}${newCol}`);
        continue o;
      } else {
        continue o;
      }

      i++;
    }
  }

  return result;
}

function rookAttacks(rook, board, check = false) {
  const oppositeColor = rook.piece.color === 'light' ? 'dark' : 'light';
  const currRow = rook.row;
  const currCol = rook.col;
  let result = [];

  const directions = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1]
  ];

  o:for (const [rowInc, colInc] of directions) {
    let newRow = currRow + rowInc;
    let newCol = currCol + colInc;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const piece = board[newRow][newCol].piece;
      if (piece.type === '') {
        result.push(`${newRow}${newCol}`);
      } else if (piece.color === oppositeColor) {
        result.push(`${newRow}${newCol}`);
        continue o;
      } else {
        continue o;
      }

      newRow += rowInc;
      newCol += colInc;
    }
  }

  return result;
}

function queenAttacks(queen, board, check = false) {
  const oppositeColor = queen.piece.color === 'light' ? 'dark' : 'light';
  const currRow = queen.row;
  const currCol = queen.col;
  const directions = [
    [-1, 0], [1, 0], [0, 1], [0, -1],
    [-1, 1], [-1, -1], [1, -1], [1, 1]
  ];

  let result = [];

  o:for (const [dr, dc] of directions) {
    let newRow = currRow + dr;
    let newCol = currCol + dc;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const piece = board[newRow][newCol].piece;

      if (piece.type === '') {
        result.push(`${newRow}${newCol}`);
      } else if (piece.color === oppositeColor) {
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

function kingAttacks(king, board) {
  const oppositeColor = king.piece.color === 'light' ? 'dark' : 'light';
  const currRow = king.row;
  const currCol = king.col;

  const directions = [
    [-1, 0], [1, 0], [0, 1], [0, -1],
    [-1, 1], [-1, -1], [1, -1], [1, 1]
  ];
  let result = [];

  for (const [dr, dc] of directions) {
    const newRow = currRow + dr;
    const newCol = currCol + dc;
    
    if (newRow > -1 && newRow < 8 && newCol > -1 && newCol < 8) {
      const piece = board[newRow][newCol].piece;

      if (piece.type === '' || piece.color === oppositeColor) {
        result.push(`${newRow}${newCol}`);
      }
    }
  }
  return result;
}

export default function attackedTiles(row, col, board) {
  if (board[row][col].piece.type === 'Pawn') {
    return pawnAttacks(board[row][col], board);
  }
  if (board[row][col].piece.type === 'Knight') {
    return knightAttacks(board[row][col], board);
  }
  if (board[row][col].piece.type === 'Bishop') {
    return bishopAttacks(board[row][col], board);
  }
  if (board[row][col].piece.type === 'Rook') {
    return rookAttacks(board[row][col], board);
  }
  if (board[row][col].piece.type === 'Queen') {
    return queenAttacks(board[row][col], board);
  }
  if (board[row][col].piece.type === 'King') {
    return kingAttacks(board[row][col], board);
  }
  return [];
};