import './App.css';
import { useState, useEffect } from 'react';
import DefaultBoard from './defBoard.js';
import calcHighlights from './pieceMoves.js';
import attackedTiles from './attackedTiles.js'

function Tile({ piece, color, active, isLight, clickHandler, kingCheck }) {
  return (
    <div
      className={kingCheck ? 'kingInCheck' : active ? (isLight ? 'highlightedLightTile' : 'highlightedDarkTile') : (isLight ? 'lightTile' : 'darkTile')}
      onClick={clickHandler}
    >
      {piece ? 
        <img src={process.env.PUBLIC_URL + `/${color}${piece}.png`}
          width="80"
          height="80"
          alt={piece}>
        </img> : null}
    </div>
  )
}

function PromotionPopup({ onSelectPromotion, color }) {
  return (
    <div className="promotionPopup">
      <img alt='Queen' width="170" height="170" src={process.env.PUBLIC_URL + `${color}Queen.png`} onClick={() => onSelectPromotion('Queen')}></img>
      <img alt='Rook' width="170" height="170" src={process.env.PUBLIC_URL + `${color}Rook.png`} onClick={() => onSelectPromotion('Rook')}></img>
      <img alt='Knight' width="170" height="170" src={process.env.PUBLIC_URL + `${color}Knight.png`} onClick={() => onSelectPromotion('Knight')}></img>
      <img alt='Bishop' width="170" height="170" src={process.env.PUBLIC_URL + `${color}Bishop.png`} onClick={() => onSelectPromotion('Bishop')}></img>
    </div>
  );
}

function Chessboard() {
  const [board, setBoard] = useState(DefaultBoard());
  const [activePiece, setActivePiece] = useState('');
  const [turn, setTurn] = useState(false);
  const [showPromoteSelect, setShowPromoteSelect] = useState(false);
  const [promoteSquare, setPromoteSquare] = useState('');
  const [kingInCheck, setKingInCheck] = useState(false);
  const [attackedSquares, setAttackedSquares] = useState('');
  const [enPasPawn, setEnPasPawn] = useState([]);

  useEffect(() => {
    setAttackedSquares(calcAttackedTiles(board));
  }, [turn]);

  const [promRow, promCol] = promoteSquare.split('');

  function calcAttackedTiles(board, color = turn ? 'light' : 'dark') {
    const selectedPieces = board.flat(2).filter(t => t.piece.color === color);
    let attTiles = new Set();
    selectedPieces.flat(2).forEach(t => attackedTiles(t.row, t.col, board).forEach(attT => attTiles.add(attT)));
    return attTiles;
  }

  function handleClick(r, c) {
    const [aRow, aCol] = activePiece.split('');
    let newBoard = deepCopy(board);
    

    if (activePiece) {
      const possibleMoves = calcHighlights(aRow, aCol, newBoard);

      if (enPasPawn.length !== 0 && r != enPasPawn[0] && c != enPasPawn[1]) { // en passant can only be done in next turn (right after the init pawn move)
        delete newBoard[enPasPawn[0]][enPasPawn[1]].piece.enPassant;
        setEnPasPawn([]);
      }

      if (activePiece === `${r}${c}`) { // if you click the same piece --> deactivate it
        deActivatePiece(newBoard);
        return;
      }

      if (newBoard[aRow][aCol].piece.type === 'Pawn' && (r == (turn ? 7 : 0)) && checkCheck(r, c, newBoard, moveThePiece)) { // check if it's a pawn about to be promoted
        setPromoteSquare(`${r}${c}`);
        setShowPromoteSelect(true);
      }

      if (possibleMoves.includes(`${r}${c}r`)) { // castle to right
        execCastleToRight(r, c, newBoard);
        setBoard(newBoard);
        newTurn(newBoard);
        return;
      }

      if (possibleMoves.includes(`${r}${c}l`)) { // castle to left
        execCastleToLeft(r, c, newBoard);
        setBoard(newBoard);
        newTurn(newBoard);
        return;
      }

      if (newBoard[aRow][aCol].piece.type === 'Pawn' && aCol != c && newBoard[r][c].piece.type === '' && checkCheck(r, c, newBoard, execEnPassant)) { // en passant
        execEnPassant(r, c, newBoard);
        setBoard(newBoard);
        newTurn(newBoard);
        return;
      }

      if (possibleMoves.includes(`${r}${c}`) && checkCheck(r, c, newBoard, moveThePiece)) { // if you click a viable tile
        moveThePiece(r, c, newBoard);
        setBoard(newBoard);
        newTurn(newBoard);
        return;
      }
    }

    deActivatePiece(newBoard);
    activatePiece(r, c, newBoard);
  }

  function newTurn(board) {
    setTurn(!turn);
    board.forEach(r => r.forEach(c => {
      if (turn) {
        if (c.piece.color === 'light') {
          c.isClickable = true;
        } else {
          c.isClickable = false;
        }
      } else {
        if (c.piece.color === 'dark') {
          c.isClickable = true;
        } else {
          c.isClickable =  false;
        }
      }
    }));
    setBoard(board);
  }

  function activatePiece(r, c, board) {
    if (board[r][c].piece.type === '') {
      return;
    }

    let activeTiles = calcHighlights(r, c, board).map(t => t.split(''));
    
    activeTiles.forEach(t => {
      board[t[0]][t[1]].isHighlighted = true;
      board[t[0]][t[1]].isClickable = true;
    });
    setActivePiece(`${r}${c}`);
    setBoard(board);
  }

  function deActivatePiece(board) {
    if (!activePiece) {
      return;
    }

    let activeTiles = calcHighlights(activePiece.split('')[0], activePiece.split('')[1], board).map(t => t.split(''));
    activeTiles.forEach(t => {
      board[t[0]][t[1]].isHighlighted = false;
      board[t[0]][t[1]].isClickable = false;
    });
    setActivePiece('');
    setBoard(board);
  }

  function handlePromotion(piece) {
    const [promRow, promCol] = promoteSquare.split('');
    let newBoard = deepCopy(board);
    
    newBoard[promRow][promCol].piece.type = piece;
    console.log('Promotion');
    if ([...calcAttackedTiles(newBoard, newBoard[promRow][promCol].piece.color)].filter(t => newBoard[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
      setKingInCheck(true);
    } else {
      setKingInCheck(false);
    }

    setBoard(newBoard);
    setShowPromoteSelect(false);
    return;
  }

  function moveThePiece(r, c, board) { // this modifies the board input
    const aRow = activePiece.split('')[0];
    const aCol = activePiece.split('')[1];

    if (board[aRow][aCol].piece.type === 'Pawn' && Math.abs(aRow - r) > 1) {
      board[r][c].piece.enPassant = true;
      setEnPasPawn([r, c]);
    }



    board[r][c].piece.type = board[aRow][aCol].piece.type;
    board[r][c].piece.color = board[aRow][aCol].piece.color;
    board[aRow][aCol].piece.type = '';
    board[aRow][aCol].piece.color = '';
    board.forEach(r => r.forEach(c => c.isHighlighted = false));
  }

  function execEnPassant(r, c, board) {
    const aRow = activePiece.split('')[0];
    const aCol = activePiece.split('')[1];
    const enPassantRow = board[aRow][aCol].piece.color === 'light' ? 3 : 4;

    moveThePiece(r, c, board);

    board[enPassantRow][c].piece.type = '';
    board[enPassantRow][c].piece.color = '';

    delete board[enPassantRow][c].piece.enPassant;
    board.forEach(r => r.forEach(c => c.isHighlighted = false));
  }

  function execCastleToRight(r, c, board) {
    moveThePiece(r, c, board);
    board[r][5].piece = deepCopy(board[r][7].piece);
    board[r][5].piece.hasItMoved = true;
    board[r][7].piece = {
      type: '',
      color: '',
    };
    board.forEach(r => r.forEach(c => c.isHighlighted = false));
  }

  function execCastleToLeft(r, c, board) {
    moveThePiece(r, c, board);
    board[r][3].piece = deepCopy(board[r][0].piece);
    board[r][3].piece.hasItMoved = true;
    board[r][0].piece = {
      type: '',
      color: '',
    };
    board.forEach(r => r.forEach(c => c.isHighlighted = false));
  }

  function checkCheck(r, c, board, move) {
    let checkBoard = deepCopy(board);
    const aRow = activePiece.split('')[0];
    const aCol = activePiece.split('')[1];
    const actPieceColor = checkBoard[aRow][aCol].piece.color;
    let successfulMove = false;

    if (checkBoard[aRow][aCol].piece.isInitPawn === true) {
      checkBoard[aRow][aCol].piece.isInitPawn = false;
    }

    move(r, c, checkBoard);

    const oppPieces = checkBoard.flat(2).filter(t => t.piece.color !== actPieceColor && t.piece.color !== '');
    let attTiles = new Set();

    oppPieces.flat(2).forEach(t => attackedTiles(t.row, t.col, checkBoard).forEach(attT => attTiles.add(attT)));
    if ([...attTiles].filter(t => checkBoard[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
      successfulMove = false;
    } else {
      successfulMove = true;
    }

    return successfulMove;
  }

  return (
    <div className='box'>
      <div className='board'>
          {board.map((row, rowIndex) => (
            row.map((tile, colIndex) => (
              <Tile
                key={`${tile.row}${tile.col}`}
                piece={tile.piece.type}
                color={tile.piece.color}
                active={tile.isHighlighted}
                isLight={tile.isLight}
                clickHandler={tile.isClickable ? () => handleClick(rowIndex, colIndex) : () => deActivatePiece(board)}
                kingCheck={kingInCheck && tile.piece.type === 'King' && tile.piece.color === (!turn ? 'light' : 'dark')}
              />
            ))
          ))}
          {showPromoteSelect && <PromotionPopup onSelectPromotion={handlePromotion} color={board[promRow][promCol].piece.color}/>}
      </div>
      <div className='turn' style={{backgroundColor: !turn ? 'white' : 'grey'}}>{!turn ? "White's turn" : "Black's turn"}</div>
    </div>
  )
}

function deepCopy(arr) {
  return JSON.parse(JSON.stringify(arr));
}

function App() {
  return (
    <Chessboard />
  );
}

export default App;