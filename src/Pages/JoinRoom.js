import React from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Modal from "../Utils/Modal";

function JoinRoom () {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const roomid = location.pathname.split('/')[2];
    const timer = searchParams.get('t');

    return (
            <div>
            <AnimatePresence>
                <Modal tag='join' data={{roomid:roomid, timer:timer}}/>
            </AnimatePresence>
            </div>
    );
}

export default JoinRoom;