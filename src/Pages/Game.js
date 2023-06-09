import React from "react";
import { Chess } from "chess.js";
import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import socket, { user } from "../Services/Service";
import '../Styles/App.css';
import PersonIcon from '@mui/icons-material/Person';
import Switch from '@mui/material/Switch';
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';



function Game ({ timer }) {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [darkcolor, setDarkColor] = useState('#779952');
    const [lightcolor, setLightColor] = useState('#edeed1');
    const [currentColor, setCurrentColor] = useState('white');
    const [moveFrom, setMoveFrom] = useState("");
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const t = timer*60;
    const isTimer = timer!=='0';
    const [timerWhite, setTimerWhite] = useState(t);
    const [isRunningWhite, setIsRunningWhite] = useState(true);
    const [timerBlack, setTimerBlack] = useState(t);
    const [isRunningBlack, setIsRunningBlack] = useState(false);
    const [oppUsername, setOppName] = useState('');
    const [isColorToggled, setIsColorToggled] = useState(false);
    const [open, setOpen] = useState(false);
    const [showHeading, setShowHeading] = useState(false);
    const [winner, setWinner] = useState('');

    useEffect(() => {
      let timeout;
      if (open) {
        setShowHeading(true);
        timeout = setTimeout(() => {
          setShowHeading(false);
          setOpen(false);
        }, 5000);
      }
      return () => clearTimeout(timeout);
    }, [open]);
    
    useEffect(() => {
      socket.emit('getOpp');
      socket.on('gotOpp', (oppName) => {
        setOppName(oppName);
      });

      socket.on('move', (move) => {
        safeGameMutate((game) => {
          game.move(move);
        });
      });

      socket.on('updateFEN', (data) => {
        setFen(data.newFen);
        setCurrentColor(data.currentColor);
        if(data.currentColor === 'black') {
          setIsRunningBlack(true);
          setIsRunningWhite(false);
        } else {
          setIsRunningBlack(false);
          setIsRunningWhite(true);
        }
        setGame(new Chess(data.newFen));
      });

      socket.on('gameover', Winner => {
        setIsRunningWhite(false);
        setIsRunningBlack(false);
        setOpen(true);
        setShowHeading(true);
        setWinner(Winner);
      });

      socket.on('draw', () => {
        setIsRunningWhite(false);
        setIsRunningBlack(false);
        setOpen(true);
        setShowHeading(true);
        setWinner('NA');
      });

      if(open) {
        setTimeout(() => {
          setOpen(false);
        }, 5000);
      }

      return () => {
        socket.off('move');
        socket.off('updateFEN');
        socket.off('getOpp');
      };
    }, [game, currentColor, open]);

    useEffect(() => {
      if(timerWhite===0 && isTimer) {
        setIsRunningWhite(false);
        setIsRunningBlack(false);
        setOpen(true);
        setShowHeading(true);
        setWinner('Black');
      }
      if(timerBlack===0 && isTimer) {
        setIsRunningWhite(false);
        setIsRunningBlack(false);
        setOpen(true);
        setShowHeading(true);
        setWinner('White');
      }

      let intervalId;
      if (isRunningWhite) {
        intervalId = setInterval(() => {
          setTimerWhite((prevTime) => {
            if (prevTime <= 0) {
              clearInterval(intervalId);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }

      if (isRunningBlack) {
        intervalId = setInterval(() => {
          setTimerBlack((prevTime) => {
            if (prevTime <= 0) {
              clearInterval(intervalId);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }

      return () => {
        clearInterval(intervalId);
      }
    }, [isRunningWhite, isRunningBlack, timerWhite, timerBlack, isTimer]);
  
    function safeGameMutate(modify) {
      setGame((g) => {
        const update = { ...g };
        modify(update);
        return update;
      });
    }
  
    function getMoveOptions(square) {
      const moves = game.moves({
        square,
        verbose: true,
      });
      if (moves.length === 0) {
        return false;
      }
  
      const newSquares = {};
      moves.map((move) => {
        newSquares[move.to] = {
          background:
            game.get(move.to) && game.get(move.to).color !== game.get(square).color
              ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
              : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
          borderRadius: "50%",
        };
        return move;
      });
      newSquares[square] = {
        background: "rgba(255, 255, 0, 0.4)",
      };
      setOptionSquares(newSquares);
      return true;
    }
  
    function onSquareClick(square) {
        if(user && square && currentColor===user.color) {
            setRightClickedSquares({});
        
            function resetFirstMove(square) {
                const hasOptions = getMoveOptions(square);
                if (hasOptions) setMoveFrom(square);
            }
            if (!moveFrom) {
                resetFirstMove(square);
                return;
            }
            const gameCopy = { ...game };
            const move = gameCopy.move({
                from: moveFrom,
                to: square,
                promotion: "q",
            });
            if(move) {
              setGame(gameCopy);
              const newFen = gameCopy.fen();
              const data = {newFen, currentColor};
              socket.emit('updateFEN', data);
              if (game.game_over()) {
                socket.emit('gameover', game.turn());
              } else if (game.in_draw() || game.moves().length === 0) {
                socket.emit('draw');
              }
            }
            
            if (move === null) {
                resetFirstMove(square);
                return;
            }
            setMoveFrom("");
            setOptionSquares({});
        }
    }
  
    function onSquareRightClick(square) {
      const colour = "rgba(0, 0, 255, 0.4)";
      setRightClickedSquares({
        ...rightClickedSquares,
        [square]:
          rightClickedSquares[square] &&
          rightClickedSquares[square].backgroundColor === colour
            ? undefined
            : { backgroundColor: colour },
      });
    }

    function toggleColor() {
      setLightColor((prev) => {
        return prev === '#f0d9b5' ? '#edeed1' : '#f0d9b5';
      });
      setDarkColor((prev) => {
        return prev === '#779952'? '#b58862' : '#779952';
      });
      setIsColorToggled((prev) => !prev);
    }

    const formatTime = (totalSeconds) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    };
  
    return (
      <div>
      <div className="grid-box">
        <div className='board'>
        <motion.div className='container'>
          <motion.h1 className='centered title'
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9, rotate: 0}}
            >
            ćhesscape ♟️
          </motion.h1>
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon />
            <h4 style={{ marginLeft: '8px' }}>{oppUsername}</h4>
          </div>
          {isTimer && (
          <div style={{ marginLeft: 'auto', marginRight: '8px' }}>
            {user.color === 'white' ? (
              <h3>{formatTime(timerBlack)}</h3>
            ) : (
              <h3>{formatTime(timerWhite)}</h3>
            )}
          </div>
          )}
        </div>
          <Chessboard
            theme = 'classic'
            id="ClickToMove"
            position={game.fen()}
            boardOrientation = {user.color}
            onPieceDrop={onSquareClick}
            animationDuration={200}
            arePiecesDraggable={false}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)", 
            }}
            customDarkSquareStyle={{ backgroundColor: darkcolor }} //#b58862 779952
            customLightSquareStyle={{ backgroundColor: lightcolor }} //#f0d9b5 edeed1
            customSquareStyles={{
              ...moveSquares,
              ...optionSquares,
              ...rightClickedSquares,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon />
              <h4 style={{ marginLeft: '8px' }}>You</h4>
            </div>
            {isTimer && (
            <div style={{ marginLeft: 'auto', marginRight: '8px' }}>
            {user.color === 'white' ? (
              <h3>{formatTime(timerWhite)}</h3>
            ) : (
              <h3>{formatTime(timerBlack)}</h3>
            )}
            </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
            <h4 style={{ marginRight: '8px' }}>Green Theme</h4>
            <Switch
              checked={isColorToggled}
              onChange={toggleColor}
              color="default"
              size="small"
            />
            <h4 style={{ marginLeft: '8px' }}>Wood Theme</h4>
          </div>
        </div>
      </div>
      <AnimatePresence>
          { showHeading && 
              <motion.h1 drag dragConstraints={{
                top: -100,
                left: -100,
                right: -100,
                bottom: -100,
              }} style={{
                color: '#fff',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
              }}> {
                winner === 'NA' ? (
                  <h1>Its a Draw!</h1>
                ) : (
                  <h1>{winner} wins!</h1>
                )
              } </motion.h1>
          }
        </AnimatePresence>
        {showHeading && <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />}
      </div>
    );
}

export default Game;