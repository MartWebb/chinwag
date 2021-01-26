const $container = document.querySelector(".main-chat-box");
const autoscroll = () => {
    // New message element
    const $newMessage = $container.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $container.offsetHeight

    // Height of messages container
    const containerHeight = $container.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $container.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $container.scrollTop = $container.scrollHeight
    }
}

module.exports = autoscroll;