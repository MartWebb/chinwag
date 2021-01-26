const socket = io("/");
const { handleParticipants, handleMessages, handleMicrophone, handleVideo, handleSidebar } = require('./utils/controls');

// Peerjs setup for local and deployment
let portVal = '3001';
let secureVal = false;
let hostVal = '/';

if (location.port !== "3000") {
    hostVal = 'peerjs-server.herokuapp.com'
    secureVal = true;
    portVal = '443'
}

const myPeer = new Peer(undefined, {
    host: hostVal, 
    secure: secureVal,
    port: portVal
});

// HTML Elements
const $messageInput = document.querySelector('#chat-message');
const $submitBtn = document.querySelector('#send-btn'); 
const $messages = document.querySelector('#messages'); 
const $muteBtn = document.querySelector(".mute-btn");
const $videoBtn = document.querySelector(".video-btn");

// Query options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Video HTML elements
const $videoGrid = document.getElementById('video-grid');
const $myVideo = document.createElement('video');
$myVideo.muted = true;

// const autoscroll = () => {
//     // New message element
//     const $newMessage = $messages.lastElementChild

//     // Height of the new message
//     const newMessageStyles = getComputedStyle($newMessage)
//     const newMessageHeight = $newMessage.offsetHeight

//     console.log(newMessageStyles)
// }

// Variables
const peers = {};
let myID = "";
let myVideoStream;

// Video call code

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream($myVideo, stream);
    myVideoStream = stream;

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', peerId => {
        connectToNewUser(peerId, stream);
    });
});

socket.on('user-disconnected', peerId => {
    if (peers[peerId]) peers[peerId].close();
});

myPeer.on('open', peerId => {
    socket.emit('join', { username, room, peerId }, (error) => {
        if (error) {
            alert(error);
            location.href = '/';
        }
    });
    myID = peerId;
});

const connectToNewUser = (peerId, stream) => {
    const call = myPeer.call(peerId, stream);
    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
      video.remove();
    });
  
    peers[peerId] = call;
  }

const addVideoStream = (video, stream) => {    
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    $videoGrid.append(video);
}

document.querySelector(".leave-btn").addEventListener("click", endCall);

function endCall() {
    window.location.href = "/";
}

// Below is sending messages code

// Send message to server
const sendMessage = (message) => {
    socket.emit('sendMessage', message, (error) => {
        $submitBtn.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log('message delivered.');
    });
};

// Receive sanitized message and display
socket.on('message', (message) => {
    handleMessages(message, myID, $messages);
})

// Receive list of partisipants
socket.on("participants", ({room, users}) => {
    const userId = socket.id;
    handleParticipants(room, users, userId);
});

// Listening for the controls code

// Listen for message sent 
$messageInput.addEventListener('keypress', (event) => {
    if (event.key == "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage($messageInput.value);
    }
});

// Listen for message sent button
$submitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    // $submitBtn.setAttribute('disabled', 'disabled');
    // const message = event.target.elements.message.value;
    sendMessage($messageInput.value);
});

// Listen for mute btn
$muteBtn.addEventListener('click', () =>  {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        socket.emit("mute-mic");
        handleMicrophone(enabled, myVideoStream, $muteBtn);
    } else {
        socket.emit("unmute-mic");
        handleMicrophone(enabled, myVideoStream, $muteBtn);
    }
});

// Listen for video btn
$videoBtn.addEventListener('click', () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        socket.emit("stop-video");
        handleVideo(enabled, myVideoStream, $videoBtn);
    } else {
        socket.emit("play-video");
        handleVideo(enabled, myVideoStream, $videoBtn)
    }
})

// Toggle different buttons for the sidebar
document.querySelectorAll('[data-toggle-sidebar]').forEach(toggle => {
    handleSidebar(toggle);  
});
 


