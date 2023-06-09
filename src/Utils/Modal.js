import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion'
import Backdrop  from './Backdrop';
import { useNavigate } from "react-router-dom";
import '../Styles/App.css';
import socket, { user } from "../Services/Service";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const zoomIn = {
    hidden:{ scale: 0.8, opacity: 0 },
    visible:{ opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring', stiffness: 500, damping: 25 } },
    exit:{ scale: 0.8, opacity: 0 }
}

const Modal = ({ handleClose, tag, data}) => {
    const navigate = useNavigate();
    const [selectedButton, setSelectedButton] = useState('0');
    const timer = data.timer;
    const roomid = data.roomid;
    const [text, setText] = useState('');
  
    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const isButtonDisabled = text === '';

    useEffect(() => {
        socket.on('roomfull', () => {
            toast.error('Room is full :(', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                });
        });

        socket.on('noroom', () => {
            toast.warning('Error in finding Room', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                });
        });
    
        return () => {
          socket.off('roomfull');
          socket.off('noroom');
        };
      }, [socket]);

    function createRoom() {
        socket.emit('createRoom', text);
        user.name = text;
        user.color = 'white';
        socket.on('roomCreated', (roomId) => {
          const timerc = selectedButton;
          user.timer = timerc;
          navigate(`/${roomId}?t=${timerc}`,{
            state: {
              roomId: roomId
            }
          });
        });
      }

      function joinRoom() {
        user.name = text;
        const data = {roomid, text}
        socket.emit('joinRoom', data);
        user.color = 'black';
        user.timer = timer;
        socket.on('roomJoined', (roomId) => {
            navigate(`/${roomid}?t=${timer}`, {
            state: {
                roomId: roomId,
            },
            });
        });
      }

    const handleToggleButtonChange = (event, newSelectedButton) => {
        setSelectedButton(newSelectedButton);
    };

    return (
        <Backdrop onClick={handleClose} >
            <motion.div 
                drag
                dragConstraints={{
                    top: -100,
                    left: -100,
                    right: 100,
                    bottom: 100,
                    }}
                onClick={(e) => e.stopPropagation()}
                className='modal'
                variants={zoomIn}
                initial='hidden'
                animate='visible'
                exit='exit'
            >
            { tag==='create' &&
            <div>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom:'20px' }}>
                <PersonPinCircleIcon fontSize="large" />
                <TextField label="Username" variant="standard" value={text} onChange={handleTextChange}/>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin:'20px'}}>
            <Typography variant="subtitle1" font-weight="bold" marginRight={2}>Timer (minutes) </Typography>
            <ToggleButtonGroup
                value={selectedButton}
                exclusive
                onChange={handleToggleButtonChange}
                className="toggle-button-group"
                >
                <ToggleButton value="0">
                    <DoNotDisturbIcon />
                </ToggleButton>
                <ToggleButton value="5">
                    5 
                </ToggleButton>
                <ToggleButton value="10">
                    10
                </ToggleButton>
            </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom:'20px', justifyContent: 'center'}}>
                <motion.div whileTap={isButtonDisabled ? { scale: 0.9 } : {}}>
                    <Button variant="contained" style={{
                    backgroundColor: isButtonDisabled ? '#888888' : '#36454F',
                    color: '#ffffff'
                }} onClick={createRoom} disabled={isButtonDisabled}>Create Room</Button>
                </motion.div>
            </Box>
            </div> }
            { tag==='join' &&
            <div>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom:'25px' }}>
                    <PersonPinCircleIcon fontSize="large"/>
                    <TextField label="Username" variant="standard" onChange={handleTextChange}/>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Button variant="contained" style={{
                    backgroundColor: isButtonDisabled ? '#888888' : '#36454F',
                    color: '#ffffff'
                }} onClick={joinRoom} disabled={isButtonDisabled}>Join Room</Button>
                </Box>
                <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    limit={1}
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
            }
            
            </motion.div>
        </Backdrop>
    )
}

export default Modal;