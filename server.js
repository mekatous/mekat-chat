const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, currentUser, roomUsers, userLeave} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));
const chatBot = 'ChatBot';

io.on('connection',socket=>{

    socket.on('joinRoom',({username, room})=>{
        const user = userJoin(socket.id, username, room);
        
        socket.join(user.room);

        socket.emit('message',formatMessage(chatBot,'Welcom to ChatBot'));

        socket.broadcast.to(user.room).emit('message',formatMessage(chatBot,`${user.username} has joined ChatBot`));
        
        //send room and users
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users: roomUsers(user.room)
        })
    })
    

    socket.on('chatMessage',(message)=>{
        const user = currentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username,message));
    })

    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(chatBot,`${user.username}has left ChatBot`));
            //send room and users
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users: roomUsers(user.room)
        })
        }
       
    })
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`);
})