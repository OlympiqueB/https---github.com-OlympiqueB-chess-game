import './App.css';
import { useState } from 'react';
import DefaultBoard from './components/DefaultBoard.js';
import attackedTiles from './core/CalculateAttackedTiles.js'; 
import { Tile } from './components/Tile.js';
import { StalemateScreen, MateScreen } from './components/EndgameScreens.js';
import { PawnPromotionSelect } from './components/PawnPromotionSelect.js';
import hightlightPossibleMoves from './core/HighlightPossibleMoves.js';

function Chessboard() {
  const [board, setBoard] = useState(DefaultBoard());
  const [activePiece, setActivePiece] = useState('');
  const [turn, setTurn] = useState(false);

  const [showPromoteSelect, setShowPromoteSelect] = useState(false);
  const [promoteSquare, setPromoteSquare] = useState('');

  const [kingInCheck, setKingInCheck] = useState(false);

  const [enPasPawn, setEnPasPawn] = useState([]);

  const [stalemate, setStalemate] = useState(false);
  const [mate, setMate] = useState(false);

  const [promRow, promCol] = promoteSquare.split('');


  // checks the number of viable moves of the current player. if the number is 0, the game ended (stalemate / checkmate)
  function doesPossibleMoveExist(board, turn) {
    const color = turn ? 'light' : 'dark';
    const selectedPieces = board.flat(2).filter(t => t.piece.color === color);
    let possibleMoves = new Set();
    selectedPieces.flat(2).forEach(t => hightlightPossibleMoves(t.row, t.col, board).forEach(attT => possibleMoves.add(attT)));
    return possibleMoves.size !== 0;
  }

  function calcAttackedTiles(board, turn) {
    const color = turn ? 'light' : 'dark';
    const selectedPieces = board.flat(2).filter(t => t.piece.color === color);
    let attTiles = new Set();
    selectedPieces.flat(2).forEach(t => attackedTiles(t.row, t.col, board).forEach(attT => attTiles.add(attT)));
    return attTiles;
  }

  function handleClick(clickedRow, clickedCol) {
    const [activeRow, activeCol] = activePiece.split('');
    let newBoard = deepCopy(board);

    if (activePiece) {
      const possibleMoves = hightlightPossibleMoves(activeRow, activeCol, newBoard);

      // en passant can only be done in next turn (right after the initial pawn move), so 
      // this removes the en passant property, if en passant was not played
      if (enPasPawn.length !== 0 && clickedRow != enPasPawn[0] && clickedCol != enPasPawn[1]) { 
        delete newBoard[enPasPawn[0]][enPasPawn[1]].piece.enPassant;
        setEnPasPawn([]);
      }

      // if you click the same piece --> deactivate it
      if (activePiece === `${clickedRow}${clickedCol}`) { 
        deActivatePiece(newBoard);
        return;
      }

      // check if it's a pawn about to be promoted
      if (newBoard[activeRow][activeCol].piece.type === 'Pawn' && (clickedRow == (turn ? 7 : 0))) { 
        setPromoteSquare(`${clickedRow}${clickedCol}`);
        setShowPromoteSelect(true);
      }

      // castle to right
      if (possibleMoves.includes(`${clickedRow}${clickedCol}r`)) { 
        execCastleToRight(clickedRow, clickedCol, newBoard);
        checkCheck(clickedRow, clickedCol, newBoard);
        setBoard(newBoard);
        newTurn(newBoard);
        return;
      }

      // castle to left
      if (possibleMoves.includes(`${clickedRow}${clickedCol}l`)) { 
        execCastleToLeft(clickedRow, clickedCol, newBoard);
        checkCheck(clickedRow, clickedCol, newBoard);
        setBoard(newBoard);
        newTurn(newBoard);
        return;
      }

      // en passant
      if (newBoard[activeRow][activeCol].piece.type === 'Pawn' && activeCol != clickedCol && newBoard[clickedRow][clickedCol].piece.type === '') { 
        execEnPassant(clickedRow, clickedCol, newBoard);
        checkCheck(clickedRow, clickedCol, newBoard);
        setBoard(newBoard);
        newTurn(newBoard);
        return;
      }

      // if you click a viable tile -> 'regular move' (not en passant, castle or promotion)
      if (possibleMoves.includes(`${clickedRow}${clickedCol}`)) { 
        moveThePiece(clickedRow, clickedCol, newBoard);
        checkCheck(clickedRow, clickedCol, newBoard);
        setBoard(newBoard);

        //stalemate
        if (!doesPossibleMoveExist(newBoard, turn) && !checkCheck(clickedRow, clickedCol, newBoard)) {
          setStalemate(true);
          newBoard.forEach(r => r.forEach(c => c.isClickable = false));
          setBoard(newBoard);
          newTurn(newBoard);
          return;
        }

        //checkmate
        if (!doesPossibleMoveExist(newBoard, turn) && checkCheck(clickedRow, clickedCol, newBoard)) {
          setMate(true);
          newBoard.forEach(r => r.forEach(c => c.isClickable = false));
          setBoard(newBoard);
          newTurn(newBoard);
          return;
        }
        newTurn(newBoard);
        return;
      }
    }
    
    deActivatePiece(newBoard);
    if (newBoard[clickedRow][clickedCol].piece.color === (!turn ? 'light' : 'dark')) {
      activatePiece(clickedRow, clickedCol, newBoard);
    }
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
    setActivePiece('');
    setBoard(board);
  }

  function activatePiece(r, c, board) {
    if (board[r][c].piece.type === '') {
      return;
    }

    let activeTiles = hightlightPossibleMoves(r, c, board).map(t => t.split(''));
    
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

    let activeTiles = hightlightPossibleMoves(activePiece.split('')[0], activePiece.split('')[1], board).map(t => t.split(''));
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
  
    if ([...calcAttackedTiles(newBoard, turn)].filter(t => newBoard[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
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
      board[aRow][aCol].piece.enPassant = true;
      setEnPasPawn([r, c]);
    }

    if (board[aRow][aCol].piece.hasItMoved === false) {
      board[aRow][aCol].piece.hasItMoved = true;
    }

    board[r][c].piece = deepCopy(board[aRow][aCol].piece);
    board[aRow][aCol].piece = {
      type: '',
      color: '',
    };

    if (board[r][c].piece.isInitPawn === true) {
      board[r][c].piece.isInitPawn = false;
    }

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

  function checkCheck(r, c, board) {
    const movedPieceColor = board[r][c].piece.color;
    const playerPieces = board.flat(2).filter(t => t.piece.color === movedPieceColor && t.piece.color !== '');

    let attTiles = new Set();
    playerPieces.forEach(t => attackedTiles(t.row, t.col, board).forEach(attT => attTiles.add(attT)));

    if ([...attTiles].filter(t => board[t.split('')[0]][t.split('')[1]].piece.type === 'King').length > 0) {
      setKingInCheck(true);
      return true;
    } else {
      setKingInCheck(false);
      return false;
    }
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
          {showPromoteSelect && <PawnPromotionSelect onSelectPromotion={handlePromotion} color={board[promRow][promCol].piece.color}/>}
          {stalemate && <StalemateScreen />}
          {mate && <MateScreen turn={turn}/>}
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