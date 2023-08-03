function pawnHighlights(pawn, board) {
  const direction = pawn.piece.color === 'light' ? -1 : 1;
  const oppositeColor = pawn.piece.color === 'light' ? 'dark' : 'light';

  const ahead1 = pawn.row + direction < 8 && pawn.row + direction > -1 ? board[pawn.row + direction][pawn.col].piece.type : 'notATile';
  const ahead2 = pawn.row + direction * 2 < 8 && pawn.row + direction * 2 > -1 && pawn.piece.isInitPawn ? board[pawn.row + direction * 2][pawn.col].piece.type : 'notATile';

  const posCapture1 = pawn.row + direction < 8 && pawn.col - 1 > - 1 ? board[pawn.row + direction][pawn.col - 1].piece : '';
  const posCapture2 = pawn.row + direction < 8 && pawn.col + 1 < 8 ? board[pawn.row + direction][pawn.col + 1].piece : '';

  const tilesToHighlight = [];

  if (posCapture1.color === oppositeColor && posCapture1.type !== 'King') {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col - 1}`);
  }
  if (posCapture2.color === oppositeColor && posCapture2.type !== 'King') {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col + 1}`);
  }
  
  if (!ahead1 && ahead1 !== 'notATile') {
    tilesToHighlight.push(`${pawn.row + direction}${pawn.col}`);
  } else {
    return tilesToHighlight;
  }

  if (!ahead2 && ahead2 !== 'notATile') {
    tilesToHighlight.push(`${pawn.row + direction * 2}${pawn.col}`);
  } else {
    return tilesToHighlight;
  }
  
  return tilesToHighlight;
}

function knightHighlights(knight, board) {
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
  const final = filteredPoss.filter(tile => board[tile[0]][tile[1]].piece.type === '' || (board[tile[0]][tile[1]].piece.color === oppositeColor && board[tile[0]][tile[1]].piece.type !== 'King'));
  return final.map(t => `${t[0]}${t[1]}`);
}

function bishopHighlights(bishop, board) {
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

  for (const [dr, dc] of directions) {
    let i = 1;

    while (currRow + i * dr >= 0 && currRow + i * dr < 8 &&
           currCol + i * dc >= 0 && currCol + i * dc < 8) {
      const newRow = currRow + i * dr;
      const newCol = currCol + i * dc;

      if (board[newRow][newCol].piece.type === '') {
        result.push(`${newRow}${newCol}`);
      } else if (board[newRow][newCol].piece.color === oppositeColor && board[newRow][newCol].piece.type !== 'King') {
        result.push(`${newRow}${newCol}`);
        break;
      } else {
        break;
      }

      i++;
    }
  }

  return result;
}

function rookHighlights(rook, board) {
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

  for (const [rowInc, colInc] of directions) {
    let newRow = currRow + rowInc;
    let newCol = currCol + colInc;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const piece = board[newRow][newCol].piece;
      if (piece.type === '') {
        result.push(`${newRow}${newCol}`);
      } else if (piece.color === oppositeColor && piece.type !== 'King') {
        result.push(`${newRow}${newCol}`);
        break;
      } else {
        break;
      }
      newRow += rowInc;
      newCol += colInc;
    }
  }

  return result;
}

function queenHighlights(queen, board) {
  const oppositeColor = queen.piece.color === 'light' ? 'dark' : 'light';
  const currRow = queen.row;
  const currCol = queen.col;
  const directions = [
    [-1, 0], [1, 0], [0, 1], [0, -1],
    [-1, 1], [-1, -1], [1, -1], [1, 1]
  ];

  let result = [];

  for (const [dr, dc] of directions) {
    let newRow = currRow + dr;
    let newCol = currCol + dc;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const piece = board[newRow][newCol].piece;

      if (piece.type === '') {
        result.push(`${newRow}${newCol}`);
      } else if (piece.color === oppositeColor && piece.type !== 'King') {
        result.push(`${newRow}${newCol}`);
        break;
      } else {
        break;
      }

      newRow += dr;
      newCol += dc;
    }
  }

  return result;
}

function kingHighlights(king, board) {
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
      const isNewTileAttacked = ''; //have to check if the new tile is attacked by an opponent's piece

      if (piece.type === '' || (piece.color === oppositeColor && piece.type !== 'King')) {
        result.push(`${newRow}${newCol}`);
      }
    }
  }
  return result;
}

export default function calcHighlights(row, col, board) {
  if (board[row][col].piece.type === 'Pawn') {
    return pawnHighlights(board[row][col], board);
  }
  if (board[row][col].piece.type === 'Knight') {
    return knightHighlights(board[row][col], board);
  }
  if (board[row][col].piece.type === 'Bishop') {
    return bishopHighlights(board[row][col], board);
  }
  if (board[row][col].piece.type === 'Rook') {
    return rookHighlights(board[row][col], board);
  }
  if (board[row][col].piece.type === 'Queen') {
    return queenHighlights(board[row][col], board);
  }
  if (board[row][col].piece.type === 'King') {
    return kingHighlights(board[row][col], board);
  }
  return [];
};