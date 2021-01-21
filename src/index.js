const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');


const app = express();

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    
    socket.on('join', ({ username, room, peerId }, callback) => {
        
        const { error, user } = addUser({ id: socket.id, username, room, peerId, video: true, audio: true });

        if (error) {
           return callback(error);
        }

        socket.join(user.room);

        socket.to(user.room).broadcast.emit('user-connected', user.peerId);

        socket.emit('message', generateMessage('Admin', 'Welcome!', user.peerId));

        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined.`, user.peerId));

        io.to(user.room).emit('participants', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();

        socket.on("mute-mic", () => {
            getUsersInRoom(user.room).forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.audio = false);
            });
            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        });

        socket.on("unmute-mic", () => {
            getUsersInRoom(user.room).forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.audio = true);
            });
            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        });

        socket.on("stop-video", () => {
            getUsersInRoom(user.room).forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.video = false);
            });
            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        });

        socket.on("play-video", () => {
            getUsersInRoom(user.room).forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.video = true);
            });
            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
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