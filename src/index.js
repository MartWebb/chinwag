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

// server listening for a connection
io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    
    // Listening for a user to join
    socket.on('join', ({ username, room, peerId }, callback) => {
        // Add user and sanitize the information
        const { error, user } = addUser({ id: socket.id, username, room, peerId, video: true, audio: true });

        // send possible errors to client
        if (error) {
           return callback(error);
        }

        // Add the new user to the room
        socket.join(user.room);

        // Pass the new user to the client to be addedto videoStream
        socket.to(user.room).broadcast.emit('user-connected', user.peerId);

        // Send welcome message to client
        socket.emit('message', generateMessage('Admin', 'Welcome!', user.peerId));

        // Tell client who has joined
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined.`, user.peerId));

        // Add user to participant list
        io.to(user.room).emit('participants', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();

        // Listen for mic being muted
        socket.on("mute-mic", () => {
            getUsersInRoom(user.room).forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.audio = false);
            });

            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        });

        // Listen for mic being unmuted
        socket.on("unmute-mic", () => {
            getUsersInRoom(user.room).forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.audio = true);
            });

            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        });

        // Listen for video being stopped
        socket.on("stop-video", () => {
            getUsersInRoom(user.room).forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.video = false);
            });

            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        });

        // Listen for mic being started
        socket.on("play-video", () => {
            getUsersInRoom(user.room).forEach((roomUser) => {
                if (roomUser.id === user.id) return (roomUser.video = true);
            });
            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        });
    });

    // Listen for message and check for profanity
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            socket.emit('message',generateMessage('Admin', `HEY! ${user.username} keep it clean`));
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message, user.peerId));
        callback();
    })

    // Disconect a user
    socket.on('disconnect', () => { 
        const user = removeUser(socket.id);
        
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`, user.peerId));
            socket.to(user.room).broadcast.emit('user-disconnected', user.peerId);
            io.to(user.room).emit('participants', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        } 
    })
})

// Listen for port
server.listen(port, () => {
    console.log(`Server is  up on port ${port}.`);
})