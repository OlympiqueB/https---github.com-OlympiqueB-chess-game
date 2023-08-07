import attackedTiles from './attackedTiles.js'

function pawnHighlights(pawn, board) {
  const direction = pawn.piece.color === 'light' ? -1 : 1;
  const oppositeColor = pawn.piece.color === 'light' ? 'dark' : 'light';

  const ahead1 = pawn.row + direction < 8 && pawn.row + direction > -1 ? board[pawn.row + direction][pawn.col].piece.type : 'notATile';
  const ahead2 = pawn.row + direction * 2 < 8 && pawn.row + direction * 2 > -1 && pawn.piece.isInitPawn ? board[pawn.row + direction * 2][pawn.col].piece.type : 'notATile';

  const posCapture1 = pawn.row + direction < 8 && pawn.row + direction > -1 && pawn.col - 1 > - 1 ? board[pawn.row + direction][pawn.col - 1].piece : '';
  const posCapture2 = pawn.row + direction < 8 && pawn.row + direction > -1 && pawn.col + 1 < 8 ? board[pawn.row + direction][pawn.col + 1].piece : '';

  const enPassantCol1 = pawn.col + 1 < 8 ? pawn.col + 1 : false;
  const enPassantCol2 = pawn.col - 1 > -1 ? pawn.col - 1 : false;
  const enPassantRow = pawn.row;
  const posEnPassant1 = enPassantCol1 && board[enPassantRow][enPassantCol1].piece.type === 'Pawn' && board[enPassantRow][enPassantCol1].piece.enPassant && board[enPassantRow][enPassantCol1].piece.color === oppositeColor;
  const posEnPassant2 = enPassantCol2 && board[enPassantRow][enPassantCol2].piece.type === 'Pawn' && board[enPassantRow][enPassantCol2].piece.enPassant && board[enPassantRow][enPassantCol2].piece.color === oppositeColor;

  let tilesToHighlight = [];
  
  if (posEnPassant1) {
    tilesToHighlight.push(`${enPassantRow + direction}${enPassantCol1}`);
  }
  if (posEnPassant2) {
    tilesToHighlight.push(`${enPassantRow + direction}${enPassantCol2}`);
  }

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
  const final = filteredPoss.filter(tile => (board[tile[0]][tile[1]].piece.type === '') || (board[tile[0]][tile[1]].piece.color === oppositeColor && board[tile[0]][tile[1]].piece.type !== 'King'));

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

  o:for (const [dr, dc] of directions) {
    let i = 1;

    while (currRow + i * dr >= 0 && currRow + i * dr < 8 &&
           currCol + i * dc >= 0 && currCol + i * dc < 8) {
      const newRow = currRow + i * dr;
      const newCol = currCol + i * dc;
      const piece = board[newRow][newCol].piece;

      if (piece.type === '') {
        result.push(`${newRow}${newCol}`);
      } else if (piece.color === oppositeColor && piece.type !== 'King') {
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

  o:for (const [rowInc, colInc] of directions) {
    let newRow = currRow + rowInc;
    let newCol = currCol + colInc;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const piece = board[newRow][newCol].piece;
      if (piece.type === '') {
        result.push(`${newRow}${newCol}`);
      } else if (piece.color === oppositeColor && piece.type !== 'King') {
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

function queenHighlights(queen, board) {
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
      } else if (piece.color === oppositeColor && piece.type !== 'King') {
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

function kingHighlights(king, board) {
  const oppositeColor = king.piece.color === 'light' ? 'dark' : 'light';
  const castleRow = king.piece.color === 'light' ? 7 : 0;

  const currRow = king.row;
  const currCol = king.col;
  const leftRookMoved = king.piece.color === 'light' ? board[7][0].piece.hasItMoved : board[0][0].piece.hasItMoved;
  const rightRookMoved = king.piece.color === 'light' ? board[7][7].piece.hasItMoved : board[0][7].piece.hasItMoved;
  const rightEmpty = board[castleRow][6].piece.type === '' && board[castleRow][5].piece.type === '';
  const leftEmpty = board[castleRow][1].piece.type === '' && board[castleRow][2].piece.type === '' && board[castleRow][3].piece.type === '';

  const oppPieces = board.flat(2).filter(t => t.piece.color !== king.piece.color && t.piece.color !== '');
  let attTiles = new Set();
  oppPieces.flat(2).forEach(t => attackedTiles(t.row, t.col, board).forEach(calcT => attTiles.add(calcT)));

  const isRightCastlePossible = (!attTiles.has(`${castleRow}4`) && !attTiles.has(`${castleRow}5`) && !attTiles.has(`${castleRow}6`)) && rightEmpty && !rightRookMoved && !king.piece.hasItMoved;
  const isLeftCastlePossible = (!attTiles.has(`${castleRow}1`) && !attTiles.has(`${castleRow}2`) && !attTiles.has(`${castleRow}3`) && !attTiles.has(`${castleRow}4`)) && leftEmpty && !leftRookMoved && !king.piece.hasItMoved;
  
  const directions = [
    [-1, 0], [1, 0], [0, 1], [0, -1],
    [-1, 1], [-1, -1], [1, -1], [1, 1]
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