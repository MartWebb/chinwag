const generateMessage = (username, text, peerId) => {
    return {
        username,
        text,
        peerId,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage
}