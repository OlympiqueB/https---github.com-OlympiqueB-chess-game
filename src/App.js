import './App.css';
import { useState, useEffect, useDebugValue  } from 'react';
import DefaultBoard from './defBoard.js';
import calcHighlights from './pieceMoves.js';

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
  const [promoteTile, setPromoteTile] = useState('');
  const [kingInCheck, setKingInCheck] = useState(false);

  const [promRow, promCol] = promoteTile.split('');

  function handleClick(r, c) {
    const [aRow, aCol] = activePiece.split('');
    let newBoard = deepCopy(board);

    console.log('Click event triggered:', r, c);

    if (activePiece) {
      if (activePiece === `${r}${c}`) { // if you click the same piece --> deactivate it
        deActivatePiece(newBoard);
        return;
      }
      if (calcHighlights(aRow, aCol, newBoard).includes(`${r}${c}`)) { // if you click a viable tile
        if (checkIfCheck(r, c, newBoard)) {
          return;
        }
        
        /*if (newBoard[aRow][aCol].piece.type === 'Pawn' && (r === 7 || r === 0)) { // check if it's a pawn about to be promoted
          console.log(`Player ${turn ? 'black' : 'white'} promoted a pawn on row${r}|col${c}`);
          setPromoteTile(`${r}${c}`);
          setShowPromoteSelect(true);
          setTurn(!turn);
          return;
        }*/
        //movePiece(r, c, newBoard);
        //newTurn(newBoard);
      }
    }

    deActivatePiece(newBoard);
    activatePiece(r, c, newBoard);
  }

  function movePiece(targetRow, targetCol, board) {
    board.forEach(r => r.forEach(c => c.isHighlighted = false));
    const actRow = activePiece.split('')[0];
    const actCol = activePiece.split('')[1];

    if (board[actRow][actCol].piece.isInitPawn === true) {
      board[actRow][actCol].piece.isInitPawn = false;
    }
    
    board[targetRow][targetCol].piece.type = board[actRow][actCol].piece.type;
    board[targetRow][targetCol].piece.color = board[actRow][actCol].piece.color;
    board[actRow][actCol].piece.type = '';
    board[actRow][actCol].piece.color = '';

    console.log(`Player ${turn ? 'black' : 'white'} moved a piece to row${targetRow}|col${targetCol}`);

    if (calcHighlights(targetRow, targetCol, board, true).filter(t => board[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
      setKingInCheck(true);
      console.log(`${turn ? 'white' : 'black'} king is now in check`);
    } else {
      setKingInCheck(false);
      //console.log(`${turn ? 'white' : 'black'} king is no longer in check`);
    }
    setActivePiece('');
    setBoard(board);
    return;
  }

  function deHighlightAll(board) {
    let newBoard2 = deepCopy(board);
    newBoard2.forEach(r => r.forEach(c => c.isHighlighted = false));
    return newBoard2;
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
    console.log(`${turn ? 'white' : 'black'} is now on turn`);
    setBoard(board);
  }

  function activatePiece(r, c, board) {
    if (board[r][c].piece.type === '') {
      console.log(`${turn ? 'black' : 'white'} deactivated his piece`);
      return;
    }

    let activeTiles = calcHighlights(r, c, board).map(t => t.split(''));
    
    activeTiles.forEach(t => {
      board[t[0]][t[1]].isHighlighted = true;
      board[t[0]][t[1]].isClickable = true;
    });
    console.log(`${turn ? 'black' : 'white'} activated his piece at ${r}-${c}`);
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
    console.log(`${turn ? 'black' : 'white'} deactivated his piece at ${activePiece.split('')[0]}-${activePiece.split('')[1]}`);
    setActivePiece('');
    setBoard(board);
  }

  function handlePromotion(piece) {
    const [promRow, promCol] = promoteTile.split('');
    let newBoard = deepCopy(board);
    
    newBoard[promRow][promCol].piece.type = piece;

    if (calcHighlights(promRow, promCol, newBoard, true).filter(t => newBoard[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
      setKingInCheck(true);
      console.log(`${turn ? 'white' : 'black'} king is now in check`);
    } else {
      setKingInCheck(false);
      //console.log(`${turn ? 'white' : 'black'} king is no longer in check`);
    }

    setBoard(newBoard);
    setShowPromoteSelect(false);
    return;
  }

  function checkIfCheck(r, c, board) {
    let checkBoard = deepCopy(board);
    const [aRow, aCol] = activePiece.split('');
    const actPieceColor = checkBoard[aRow][aCol].piece.color;
    let successfulMove = false;

    if (checkBoard[aRow][aCol].piece.isInitPawn === true) {
      checkBoard[aRow][aCol].piece.isInitPawn = false;
    }

    if (checkBoard[aRow][aCol].piece.type === 'Pawn' && (r === 7 || r === 0)) { // check if it's a pawn about to be promoted
      console.log(`Player ${turn ? 'black' : 'white'} promoted a pawn on row${r}|col${c}`);
      setPromoteTile(`${r}${c}`);
      setShowPromoteSelect(true);
    }

    checkBoard[r][c].piece.type = checkBoard[aRow][aCol].piece.type;
    checkBoard[r][c].piece.color = checkBoard[aRow][aCol].piece.color;
    checkBoard[aRow][aCol].piece.type = '';
    checkBoard[aRow][aCol].piece.color = '';

    const oppPieces = checkBoard.flat(2).filter(t => t.piece.color !== actPieceColor && t.piece.color !== '');
    let attackedTiles = new Set();

    oppPieces.flat(2).forEach(t => calcHighlights(t.row, t.col, checkBoard, true).forEach(calcT => attackedTiles.add(calcT)));
    if ([...attackedTiles].filter(t => checkBoard[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
      deActivatePiece(board);
      alert(kingInCheck ? "King is still in check, invalid move" : "That is pinned.");
      successfulMove = false;
    } else {
      movePiece(r, c, board);
      newTurn(board);
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