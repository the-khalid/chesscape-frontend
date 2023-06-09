import React, { useState, useEffect } from 'react';
import socket from "../Services/Service";
import { useLocation } from 'react-router-dom';
import Game from './Game';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';


function Room( {roomId} ) {
  const location = useLocation();
  const [numPlayers, setNumPlayers] = useState(1);
  const searchParams = new URLSearchParams(location.search);
  const timer = searchParams.get('t');
  const link = 'localhost:3000/joinroom' + location.pathname + '?t=' + timer;

  function handleCopy() {
    toast.success('Link copied', {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      });
  }

  useEffect(() => {
    socket.on('playerJoined', (players) => {
      setNumPlayers(players);
    });

    socket.on('startGame', () => {
        setNumPlayers(2);
    });

    return () => {
      socket.off('playerJoined');
    };
  }, [numPlayers]);

  useEffect(() => {
    socket.emit('roomStatus', location.state.roomId);

    socket.on('roomStatus', (people) => {
      setNumPlayers(people);
    });

    socket.on('playerJoined', (people) => {
      setNumPlayers(people);
    });

    socket.on('playerLeft', (peeps) => {
      setNumPlayers(peeps);
    });

    socket.emit('roomStatus', location.state.roomId);

    return () => {
      socket.off('playerJoined');
      socket.off('playerLeft');
    };
  }, [numPlayers, location.state.roomId]);

  return (
    <div>
      {numPlayers === 2 ? (
        <Game timer={timer}/>
      ) : (
        <div className='room-container'>
        <div className='container'>
        <div className='div1'>
          <h1 class="animated-gradient">Waiting for other player...</h1>
        </div>
        <div className='div3'>
          <h5>Share this link to your friends to let them join!</h5>
        </div>
        <div className='div2'>
          <CopyToClipboard text={link} onCopy={handleCopy}>
          <Box sx={{ display: 'flex', alignItems: 'center', margin:'20px'}}>
                <motion.div whileTap={{ scale: 0.9 }}>
                    <Button variant="contained" style={{
                    backgroundColor: '#393646',
                    color: '#F4EEE0'
                }}>Copy Link</Button>
                </motion.div>
            </Box>
          </CopyToClipboard>
        </div>
        </div>
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        />
    </div>
    
  );
}

export default Room;
