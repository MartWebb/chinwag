const autoscroll = require('./autoscroll')
// HTML elements
const $chatScreen = document.getElementById("chat-side-bar");
const $usersScreen = document.getElementById("room-users-side-bar");

const handleSidebar = (toggle) => {
    toggle.addEventListener('click', e => {
        if (toggle.classList.contains('chat-btn')) {
            cleanUp();
            $chatScreen.classList.remove("screen-hide");
            $usersScreen.classList.add("screen-hide");
        } else {
            cleanUp();
            $usersScreen.classList.remove("screen-hide");
            $chatScreen.classList.add("screen-hide");
        }
        // get the sidebar ID from the current element data attribute
        const sidebarID = toggle.dataset.toggleSidebar;
        
        // check if there is an element on the doc with the id
        const sidebarElement = sidebarID ? document.getElementById(sidebarID) : undefined;
        // if there is a sidebar with the passed id (data-toggle-sidebar)
        if (sidebarElement) {
            // toggle the aria-hidden state of the given sidebar
            let sidebarState = sidebarElement.getAttribute('aria-hidden');
            sidebarElement.setAttribute('aria-hidden', sidebarState == 'true' ? false : true); 
        }
    });
};

const cleanUp = () => {
    $chatScreen.classList.remove("screen-hide");
    $usersScreen.classList.remove("screen-hide");
};

const handleParticipants = (room, users, userId) => {
    const $container = document.querySelector(".room-users-box");
    
    const $lists = document.getElementById("users");
    $lists.innerHTML = "";
    $lists.textContent = "";
    users.forEach((user) => {
        
        const $list = document.createElement("li");
        $list.className = "user";
        $list.innerHTML = `
            <div class="user-avatar">${user.username[0].toUpperCase()}</div>
            <span class="user-name">${user.username}${user.id == userId ? " (You)" : ""}</span>
            <div class="user-media">
                <i class="fas fa-microphone${user.audio === false ? "-slash" : ""}"></i>
                <i class="fas fa-video${user.video === false ? "-slash" : ""}"></i>
            </div>
        `;

        $lists.append($list);
        $container.scrollTop = $container.scrollHeight;
    });    
};

const handleMessages = (message, myID, $messages) => {
    const $list = document.createElement("li");
    $list.className = message.peerId === myID ? "message-right" : "message-left";
    
    $list.innerHTML = `
        ${message.peerId !== myID ? 
            "<div class='message-avatar'>" 
            + message.username[0].toUpperCase() 
            + "</div>" : ''}
        <div class="message-content">
            ${message.peerId !== myID ? "<span>" + message.username + "</span>" : ""}
            <div class="message-text"><span>${message.text}<span></div>
        </div>`;
    $messages.append($list);
    autoscroll();
};

const handleMicrophone = (enabled, myVideoStream, node) => {
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;

        node.children[0].classList.remove("fa-microphone");
        node.children[0].classList.add("fa-microphone-slash");
        node.children[1].innerHTML = "Unmute";
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;

        node.children[0].classList.remove("fa-microphone-slash");
        node.children[0].classList.add("fa-microphone");
        node.children[1].innerHTML = "Mute";
    }
};

const handleVideo = (enabled, myVideoStream, node) => {
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
    
        node.children[0].classList.remove("fa-video");
        node.children[0].classList.add("fa-video-slash");
        node.children[1].innerHTML = "Play Video";
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
    
        node.children[0].classList.remove("fa-video-slash");
        node.children[0].classList.add("fa-video");
        node.children[1].innerHTML = "Stop Video";
    }
};

module.exports = {
    handleParticipants,
    handleMicrophone,
    handleVideo,
    handleMessages,
    handleSidebar
};