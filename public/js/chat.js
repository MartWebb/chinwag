const socket = io("/");

const myPeer = new Peer(undefined, {
    host: 'peerjs-server.herokuapp.com', 
    secure: true, 
    port: 443
})

// HTML Elements
const $messageInput = document.querySelector('#chat-message'); ///(msg) - (chat-message)
const $submitBtn = document.querySelector('#send-btn'); //(btn) - send-btn
const $messages = document.querySelector('#messages'); 

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Video
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

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
let activeSreen = "";
let bigUsername = '';
let useUsername = '';

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    myVideoStream = stream;

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', peerId => {
        console.log("peer " + peerId)
        connectToNewUser(peerId, stream);
    })
})

socket.on('user-disconnected', peerId => {
    if (peers[peerId]) peers[peerId].close();
})

myPeer.on('open', peerId => {
    socket.emit('join', { username, room, peerId }, (error) => {
        if (error) {
            alert(error);
            location.href = '/';
        }
    
    });
    myID = peerId;
})

function connectToNewUser(peerId, stream) {
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



function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    videoGrid.append(video);
}

// Message code below

const sendMessage = (message) => {
    socket.emit('sendMessage', message, (error) => {
        $submitBtn.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log('message delivered.');
    })
};

$messageInput.addEventListener('keypress', (event) => {
    if (event.key == "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage($messageInput.value);
    }

    // $submitBtn.setAttribute('disabled', 'disabled');
    // const message = event.target.elements.message.value;

    
})

$submitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    sendMessage($messageInput.value);
});


socket.on('message', (message) => {
    const container = document.querySelector(".main-chat-box");
    const list = document.createElement("li");
    list.className = message.peerId === myID ? "message-right" : "message-left";
    
    list.innerHTML = `
        ${message.peerId !== myID ? "<div class='message-avatar'>" + message.username[0].toUpperCase() + "</div>" : ""}
        <div class="message-content">
            ${message.peerId !== myID ? "<span>" + message.username + "</span>" : ""}
            <div class="message-text"><span>${message.text}<span></div>
        </div>`;
    $messages.append(list);
    container.scrollTop = container.scrollHeight;
})

socket.on("participants", (users) => {
    const container = document.querySelector(".room-users-box");
    const userId =  socket.id;
    const lists = document.getElementById("users");
    lists.innerHTML = "";
    lists.textContent = "";

    users.forEach((user) => {
        const list = document.createElement("li");
        list.className = "user";
        list.innerHTML = `
            <div class="user-avatar">${user.name[0].toUpperCase()}</div>
            <span class="user-name">${user.name}${user.id == userId ? " (You)" : ""}</span>
            <div class="user-media">
                <i class="fas fa-microphone${user.audio === false ? "-slash" : ""}"></i>
                <i class="fas fa-video${user.video === false ? "-slash" : ""}"></i>
            </div>
        `;

        lists.append(list);
        container.scrollTop = container.scrollHeight;
    });
});

const handleMicrophone = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    const node = document.querySelector(".mute-btn");

    if (enabled) {
        socket.emit("mute-mic");
        myVideoStream.getAudioTracks()[0].enabled = false;

        node.children[0].classList.remove("fa-microphone");
        node.children[0].classList.add("fa-microphone-slash");
        node.children[1].innerHTML = "Unmute";
    } else {
        socket.emit("unmute-mic");
        myVideoStream.getAudioTracks()[0].enabled = true;

        node.children[0].classList.remove("fa-microphone-slash");
        node.children[0].classList.add("fa-microphone");
        node.children[1].innerHTML = "Mute";
    }
};

const handleVideo = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    const node = document.querySelector(".video-btn");

    if (enabled) {
        socket.emit("stop-video");
        myVideoStream.getVideoTracks()[0].enabled = false;

        node.children[0].classList.remove("fa-video");
        node.children[0].classList.add("fa-video-slash");
        node.children[1].innerHTML = "Play Video";
    } else {
        socket.emit("play-video");
        myVideoStream.getVideoTracks()[0].enabled = true;

        node.children[0].classList.remove("fa-video-slash");
        node.children[0].classList.add("fa-video");
        node.children[1].innerHTML = "Stop Video";
    }
};

const isHidden = (screen) => screen.classList.contains("screen-hide");

const handleScreen = (screen) => {
    const left_container = document.querySelector(".chinwag-container");
    const right_container = document.querySelector(".side-bar");
    const chatScreen = document.getElementById("chat-side-bar");
    const usersScreen = document.getElementById("room-users-side-bar");

    if (screen.id === "chats") {
        handleActive("chat-btn");
        if (activeSreen === "") {
            chatScreen.classList.remove("screen-hide");
            activeSreen = "chats";
        } else if (activeSreen === "chats") {
            chatScreen.classList.add("screen-hide");
            activeSreen = "";
        } else {
            chatScreen.classList.remove("screen-hide");
            usersScreen.classList.add("screen-hide");
            activeSreen = "chats";
            handleActive("users-btn");
        }
    } else {
        handleActive("users-btn");
        if (activeSreen === "") {
            usersScreen.classList.remove("screen-hide");
            activeSreen = "users";
        } else if (activeSreen === "users") {
            usersScreen.classList.add("screen-hide");
            activeSreen = "";
        } else {
            usersScreen.classList.remove("screen-hide");
            chatScreen.classList.add("screen-hide");
            activeSreen = "users";
            handleActive("chat-btn");
        }
    }

    if (isHidden(right_container)) {
        right_container.classList.remove("screen-hide");
        left_container.classList.remove("screen-full");
    } else if (activeSreen === "") {
        right_container.classList.add("screen-hide");
        left_container.classList.add("screen-full");
    }
};

const handleActive = (buttonClass) => {
    const button = document.querySelector(`.${buttonClass}`);
    const active = button.classList.contains("active-btn");

    if (active) button.classList.remove("active-btn");
    else button.classList.add("active-btn");
};

document.querySelector(".leave-btn").addEventListener("click", endCall);

function endCall() {
    window.location.href = "/";
}


