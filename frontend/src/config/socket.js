import socket from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId)=>{
    socketInstance = socket(import.meta.env.VITE_API_URL,{
        auth: {
            token: localStorage.getItem('token')
        },
        query:{
            projectId
        }
    });
    return socketInstance;
}

export const receiveMessage = (eventName, cd)=>{
    socketInstance.on(eventName,cd);
}

export const sendMessage = (eventName, cd)=>{
    socketInstance.emit(eventName,cd);
}