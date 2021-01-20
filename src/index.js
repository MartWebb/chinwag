const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');


const app = express();
// create the raw http server that express 
// normally does behind the scences and pass it to io
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

const roomUsers = {}
// socket is an object with info about new connection
// connection is  built in event
io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    
    socket.on('join', ({ username, room, peerId }, callback) => {
        
        const { error, user } = addUser({ id: socket.id, username, room, peerId });

        if (roomUsers[user.room]) roomUsers[user.room].push({ id: user.id, name: user.username, video: true, audio: true });
        else roomUsers[user.room] = [{ id: user.id, name: user.username, video: true, audio: true }];

        if (error) {
           return callback(error);
        }

        socket.join(user.room);

        socket.to(user.room).broadcast.emit('user-connected', user.peerId);

        socket.emit('message', generateMessage('Admin', 'Welcome!', user.peerId));

        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined.`, user.peerId));

        io.in(room).emit("participants", roomUsers[user.room]);

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        callback();

        socket.on("mute-mic", () => {
            roomUsers[user.room].forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.audio = false);
            });
            io.in(user.room).emit("participants", roomUsers[user.room]);
        });

        socket.on("unmute-mic", () => {
            roomUsers[user.room].forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.audio = true);
            });
            io.in(user.room).emit("participants", roomUsers[user.room]);
        });

        socket.on("stop-video", () => {
            const buttonUser = getUser(socket.id);
            roomUsers[user.room].forEach((roomUser) => {
                if (roomUser.id === buttonUser.id) return (roomUser.video = false);
            });
            io.in(user.room).emit("participants", roomUsers[user.room]);
        });

        socket.on("play-video", () => {
            const buttonUser = getUser(socket.id);
            roomUsers[user.room].forEach((roomUser) => {
                if (roomUser.id === buttonUser.id) return (roomUser.video = true);
            });
            io.in(user.room).emit("participants", roomUsers[user.room]);
        });
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message, user.peerId));
        callback();
    })

    socket.on('disconnect', () => { 
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`, user.peerId));
            socket.to(user.room).broadcast.emit('user-disconnected', user.peerId)
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        } 
    })
})



server.listen(port, () => {
    console.log(`Server is  up on port ${port}.`);
})