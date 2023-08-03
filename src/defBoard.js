class Tile {
  constructor(row, col, isLight, id) {
    this.row = row;
    this.col = col;
    this.piece = {
      type: '',
      color: '',
    };
    this.isHighlighted = false;
    this.isLight = isLight;
    this.isClickable = false;
    this.isInCheck = false;
  }
}

function DefaultBoard() {
  const defaultBoard = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => {
      const isLight = (row + col) % 2 === 0;
      const tile = new Tile(row, col, isLight);

      if (row === 1 || row === 6) {
        tile.piece.type = 'Pawn';
        tile.piece.color = row === 1 ? 'dark' : 'light';
        tile.piece.isInitPawn = true;
      } else if (row === 0 || row === 7) {
        const piecesOrder = ['Rook', 'Knight', 'Bishop', 'Queen', 'King', 'Bishop', 'Knight', 'Rook'];
        tile.piece.type = piecesOrder[col];
        tile.piece.color = row === 0 ? 'dark' : 'light';
      }
      
      if (tile.piece.color === 'light') {
        tile.isClickable = true;
      }
      
      return tile;
    })
  );

  return defaultBoard;
}

export default DefaultBoard;