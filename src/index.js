const path = require('path');
const express = require('express');

const app = express();
// create the raw http server that express 
// normally does behind the scences and pass it to io

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


// socket is an object with info about new connection
// connection is  built in event

app.listen(port, () => {
    console.log(`Server is  up on port ${port}.`);
})