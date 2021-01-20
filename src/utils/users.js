const users = [];

const addUser = ({ id, username, room, peerId }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // const user = { id, username, room, peerId, video: true, audio: true };
    const user = { id, username, room, peerId };
    users.push(user);
    users.forEach((user, index) => {
        console.log('all users ' + user.id + " index " + index)
    })
    
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    console.log(index + "user index to remove")
    if (index !== -1) {
        console.log('found user to  delete')
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}