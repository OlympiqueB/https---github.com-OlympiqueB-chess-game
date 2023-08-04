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
  const [promoteTile, setPromoteTile] = useState('');
  const [kingInCheck, setKingInCheck] = useState(false);

  const [promRow, promCol] = promoteTile.split('');

  function handleClick(r, c) {
    const [aRow, aCol] = activePiece.split('');
    let newBoard = [...board];
    console.log(newBoard);

    console.log('Click event triggered:', r, c);

    if (activePiece) {
      if (activePiece === `${r}${c}`) { // if you click the same piece --> deactivate it
        deActivatePiece();
        setBoard(newBoard);
        return;
      }
      if (calcHighlights(aRow, aCol, newBoard).includes(`${r}${c}`)) { // if you click a viable tile
        if (newBoard[aRow][aCol].piece.type === 'Pawn' && (r === 7 || r === 0)) { // check if it's a pawn about to be promoted
          console.log(`Player ${turn ? 'black' : 'white'} promoted a pawn on row${r}|col${c}`);
          setPromoteTile(`${r}${c}`);
          setShowPromoteSelect(true);
          setTurn(!turn);
          return;
        }
        if (kingInCheck) {
          const actPieceColor = newBoard[aRow][aCol].piece.color;

          /*if (boardCopy[row][col].piece.isInitPawn === true) {
            boardCopy[row][col].piece.isInitPawn = false;
          }*/

          newBoard[r][c].piece.type = newBoard[aRow][aCol].piece.type;
          newBoard[r][c].piece.color = newBoard[aRow][aCol].piece.color;
          newBoard[aRow][aCol].piece.type = '';
          newBoard[aRow][aCol].piece.color = '';

          const oppPieces = newBoard.flat(2).filter(t => t.piece.color !== actPieceColor && t.piece.color !== '');
          let attackedTiles = new Set();

          oppPieces.flat(2).forEach(t => calcHighlights(t.row, t.col, newBoard, true).forEach(calcT => attackedTiles.add(calcT)));
          if ([...attackedTiles].filter(t => newBoard[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
            deActivatePiece();
            console.log("King is still in check, invalid move");
            return;
          } else {
            movePiece(r, c);
            newTurn();
            return;
          }
        }

        movePiece(r, c);
        newTurn();
        return;
      }
    } else {
    }

    deActivatePiece();
    activatePiece(r, c);
  }

  function movePiece(targetRow, targetCol) {
    let newBoard = [...board];
    newBoard.forEach(r => r.forEach(c => c.isHighlighted = false));
    const actRow = activePiece.split('')[0];
    const actCol = activePiece.split('')[1];

    console.log(actRow, actCol);
    if (newBoard[actRow][actCol].piece.isInitPawn === true) {
      newBoard[actRow][actCol].piece.isInitPawn = false;
    }
    
    console.log(newBoard[actRow][actCol].piece.type, newBoard[actRow][actCol].piece.color)
    newBoard[targetRow][targetCol].piece.type = newBoard[actRow][actCol].piece.type;
    newBoard[targetRow][targetCol].piece.color = newBoard[actRow][actCol].piece.color;
    newBoard[actRow][actCol].piece.type = '';
    newBoard[actRow][actCol].piece.color = '';

    console.log(`Player ${turn ? 'black' : 'white'} moved a piece to row${targetRow}|col${targetCol}`);

    if (calcHighlights(targetRow, targetCol, newBoard, true).filter(t => newBoard[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
      setKingInCheck(true);
      console.log(`${turn ? 'white' : 'black'} king is now in check`);
    } else {
      setKingInCheck(false);
      //console.log(`${turn ? 'white' : 'black'} king is no longer in check`);
    }
    setActivePiece('');
    setBoard(newBoard);
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
        if (c.piece.color === 'dark') {
          c.isClickable = true;
        } else {
          c.isClickable =  false;
        }
      }
    }));
    console.log(`${turn ? 'white' : 'black'} is now on turn`);
    setBoard(boardCopy);
  }

  function activatePiece(r, c) {
    if (board[r][c].piece.type === '') {
      console.log(`${turn ? 'black' : 'white'} deactivated his piece`);
      return;
    }

    let boardCopy = [...board];
    let activeTiles = calcHighlights(r, c, boardCopy).map(t => t.split(''));
    
    activeTiles.forEach(t => {
      boardCopy[t[0]][t[1]].isHighlighted = true;
      boardCopy[t[0]][t[1]].isClickable = true;
    });
    console.log(`${turn ? 'black' : 'white'} activated his piece at ${r}-${c}`);
    setActivePiece(`${r}${c}`);
    setBoard(boardCopy);
  }

  function deActivatePiece() {
    if (!activePiece) {
      return;
    }

    let boardCopy = [...board];

    let activeTiles = calcHighlights(activePiece.split('')[0], activePiece.split('')[1], boardCopy).map(t => t.split(''));
    activeTiles.forEach(t => {
      boardCopy[t[0]][t[1]].isHighlighted = false;
      boardCopy[t[0]][t[1]].isClickable = false;
    });
    console.log(`${turn ? 'black' : 'white'} deactivated his piece at ${activePiece.split('')[0]}-${activePiece.split('')[1]}`);
    setActivePiece('');
    setBoard(boardCopy);
  }

  function handlePromotion(piece) {
    const [promRow, promCol] = promoteTile.split('');
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
                clickHandler={tile.isClickable ? () => handleClick(rowIndex, colIndex) : () => deActivatePiece()}
              />
            ))
          ))}
          {showPromoteSelect && <PromotionPopup onSelectPromotion={handlePromotion} color={board[promRow][promCol].piece.color}/>}
      </div>
      <div className='turn' style={{backgroundColor: !turn ? 'white' : 'grey'}}>{!turn ? "White's turn" : "Black's turn"}</div>
    </div>
  )
}

function App() {
  return (
    <Chessboard />
  );
}

export default App;