const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');

const app = express();
// create the raw http server that express 
// normally does behind the scences and pass it to io
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


// socket is an object with info about new connection
// connection is  built in event
io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    
    socket.emit('message', generateMessage('Welcome!'));
    socket.broadcast.emit('message', generateMessage('A new user has joined.'))

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.emit('message', generateMessage(message));
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left.'))
    })
})



server.listen(port, () => {
    console.log(`Server is  up on port ${port}.`);
})