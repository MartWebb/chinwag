const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageInput = document.querySelector('.message-input');
const $submitBtn = document.querySelector('.submit-btn');
const $messages = document.querySelector('#messages');

// MustacheTemplates
const messageTemplate = document.querySelector('#message-template').innerHTML;



socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    $submitBtn.setAttribute('disabled', 'disabled');
    const message = event.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $submitBtn.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log('message delivered.');
    })
})