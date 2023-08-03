import './App.css';
import { useState } from 'react';
import DefaultBoard from './defBoard.js';
import calcHighlights from './pieceMoves.js';

function Tile({ piece, color, active, isLight, clickHandler }) {
  return (
    <div
      className={active ? (isLight ? 'highlightedLightTile' : 'highlightedDarkTile') : (isLight ? 'lightTile' : 'darkTile')}
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
      <img width="170" height="170" src={process.env.PUBLIC_URL + `${color}Queen.png`} onClick={() => onSelectPromotion('Queen')}></img>
      <img width="170" height="170" src={process.env.PUBLIC_URL + `${color}Rook.png`} onClick={() => onSelectPromotion('Rook')}></img>
      <img width="170" height="170" src={process.env.PUBLIC_URL + `${color}Knight.png`} onClick={() => onSelectPromotion('Knight')}></img>
      <img width="170" height="170" src={process.env.PUBLIC_URL + `${color}Bishop.png`} onClick={() => onSelectPromotion('Bishop')}></img>
    </div>
  );
}

function Chessboard() {
  const [board, setBoard] = useState(DefaultBoard());
  const [activePiece, setActivePiece] = useState('');
  const [turn, setTurn] = useState(false);
  const [showPromoteSelect, setShowPromoteSelect] = useState(false);
  const [promoteTile, setPromoteTile] = useState('');

  const [promRow, promCol] = promoteTile.split('');

  function handleClick(r, c) {
    const [aRow, aCol] = activePiece.split('');

    if (activePiece) {
      if (activePiece === `${r}${c}`) { // if you click the same piece --> deactivate it
        deActivatePiece(r, c);
        return;
      }
      if (calcHighlights(aRow, aCol, board).includes(`${r}${c}`)) { // if you click a viable tile --> move the piece
        if (board[aRow][aCol].piece.type === 'Pawn' && (r === 7 || r === 0)) { // check if it's a pawn about to be promoted
          setPromoteTile(`${r}${c}`);
          setShowPromoteSelect(true);
          setTurn(!turn);
        }
        movePiece(r, c);
        return;
      }
      
    } else {
    }

    deActivatePiece(aRow, aCol);
    activatePiece(r, c);
    return;
  }

  function movePiece(targetRow, targetCol) {
    let newBoard = deHighlightAll([...board]);
    const r = activePiece.split('')[0];
    const c = activePiece.split('')[1];
    if (newBoard[r][c].piece.isInitPawn === true) {
      newBoard[r][c].piece.isInitPawn = false;
    }

    newBoard[targetRow][targetCol].piece.type = newBoard[r][c].piece.type;
    newBoard[targetRow][targetCol].piece.color = newBoard[r][c].piece.color;
    newBoard[r][c].piece.type = '';
    newBoard[r][c].piece.color = '';
    setActivePiece('');
    setBoard(newTurn());
    return;
  }

  function deHighlightAll(board) {
    let newBoard = board;
    newBoard.forEach(r => r.forEach(c => c.isHighlighted = false));
    return newBoard;
  }

  function newTurn() {
    let boardCopy = [...board];
    setTurn(!turn);
    boardCopy.forEach(r => r.forEach(c => {
      if (turn) {
        if (c.piece.color === 'light') {
          c.isClickable = true;
        } else {
          c.isClickable = false;
        }
      } else {
        if (c.piece.color === 'light') {
          c.isClickable = false;
        } else {
          c.isClickable = true;
        }
    }}));
    
    return boardCopy;
  }

  function activatePiece(r, c) {
    if (board[r][c].piece.type === '') return;

    let newBoard = [...board];
    let activeTiles = calcHighlights(r, c, newBoard).map(t => t.split(''));
    
    activeTiles.forEach(t => {
      newBoard[t[0]][t[1]].isHighlighted = true;
      newBoard[t[0]][t[1]].isClickable = true;
    });
    setActivePiece(`${r}${c}`);
    setBoard(newBoard);
    return;
  }

  function deActivatePiece(r, c) {
    if (!activePiece) return;

    let newBoard = [...board];
    let activeTiles = calcHighlights(activePiece.split('')[0], activePiece.split('')[1], newBoard).map(t => t.split(''));

    activeTiles.forEach(t => {
      newBoard[t[0]][t[1]].isHighlighted = false;
      newBoard[t[0]][t[1]].isClickable = false;
    });
    setActivePiece(``);
    setBoard(newBoard);
    return;
  }

  function handlePromotion(piece) {
    const [promRow, promCol] = promoteTile.split('');
    //movePiece(promRow, promCol);
    let newBoard = [...board];
    
    newBoard[promRow][promCol].piece.type = piece;
    setBoard(newBoard);
    setShowPromoteSelect(false);
    return;
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
                clickHandler={tile.isClickable ? () => handleClick(rowIndex, colIndex) : () => deActivatePiece(rowIndex, colIndex)}
              />
            ))
          ))}
          {showPromoteSelect && <PromotionPopup onSelectPromotion={handlePromotion} color={board[promRow][promCol].piece.color}/>}
      </div>
    </div>
  )
}

function App() {
  return (
    <Chessboard />
  );
}

export default App;