import React, { useState} from 'react';
import '../Styles/App.css';
import Button from '@mui/material/Button';
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../Utils/Modal";

function App() {
  const [tag, setTag] = useState('');
  const [modalOpen, setModelOpen] = useState(false);
  const open = () => setModelOpen(true);
  const close = () => setModelOpen(false);

  function handleCreateClick() {
    (modalOpen ? close() : open());
    setTag('create');
  }

  return (
    <motion.div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <motion.div className='container'>
        <motion.h1 className='centered title'
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9, rotate: 0}}
          style={{marginBottom: '50px', fontSize: '60px'}}
          >
          ćhesscape ♘
        </motion.h1>
      </motion.div>

      <motion.div className='about-container'>
          <motion.h2 className='centered'>
            About the Game
          </motion.h2>
          <motion.p className='centered' style={{ lineHeight: '1.2' }}>
            Escape from reality with Chesscape! This is a multiplayer Chess game, where you can play with your friends online.
            Create a new game by creating room below and share your room link with your friend to let them join the game.
          </motion.p>
      </motion.div>

      <motion.div className='option-container centered'>
        <motion.div className='bttn'
          whileTap={{ scale: 0.9 }} 
          whileHover={{ scale: 1.1 }}
          onClick={handleCreateClick}
          >
          <Button variant="outlined" style={{
                    margin: '30px',
                    // backgroundColor: '#443C68',
                    color: '#443C68',
                    fontWeight: 'bold',
                    boxShadow: '0 0 3px #443C68',
                }} className='bttn' >Create room</Button>
        </motion.div>
        <AnimatePresence>
          { modalOpen && <Modal modalOpen={modalOpen} handleClose={close} tag={tag} data={{timer:0, roomid:0}}/> }
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
  }

export default App;