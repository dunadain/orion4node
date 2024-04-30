const WebSocket = require('ws');
let socket = new WebSocket('ws://localhost:9001');
socket.onopen = () => {};

socket.onmessage = (e) => {
    console.log(e);
};

socket.onclose = () => {
    console.log('We did not expect any client to disconnect, exiting!');
    process.exit();
};
