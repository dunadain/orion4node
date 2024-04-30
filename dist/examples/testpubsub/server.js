"use strict";
/* Simplified stock exchange made with uWebSockets.js pub/sub */
const uWS = require('uWebSockets.js');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
/* We measure transactions per second server side */
let transactionsPerSecond = 0;
/* Share valuations */
let shares = {
    NFLX: 280.48,
    TSLA: 244.74,
    AMZN: 1720.26,
    GOOG: 1208.67,
    NVDA: 183.03,
};
const map = new Map();
uWS.App()
    .ws('/*', {
    maxBackpressure: 10,
    open(ws) {
        map.set(ws, true);
    },
    message: (ws, message, isBinary) => {
        if (!map.has(ws)) {
            console.log('not have');
        }
        /* Parse JSON and perform the action */
        let json = JSON.parse(decoder.write(Buffer.from(message)));
        switch (json.action) {
            case 'sub': {
                /* Subscribe to the share's value stream */
                ws.subscribe('shares/' + json.share + '/value');
                break;
            }
            case 'buy': {
                transactionsPerSecond++;
                /* For simplicity, shares increase 0.1% with every buy */
                shares[json.share] *= 1.001;
                /* Value of share has changed, update subscribers */
                ws.publish('shares/' + json.share + '/value', JSON.stringify({ [json.share]: shares[json.share] }));
                break;
            }
            case 'sell': {
                transactionsPerSecond++;
                /* For simplicity, shares decrease 0.1% with every sale */
                shares[json.share] *= 0.999;
                console.log(`buffered ${ws.getBufferedAmount()}`);
                ws.publish('shares/' + json.share + '/value', JSON.stringify({ [json.share]: shares[json.share] }));
                break;
            }
        }
    },
})
    .listen('localhost', 9001, (listenSocket) => {
    if (listenSocket) {
        console.log('Listening to port 9001');
    }
});
/* Print transactions per second */
let last = Date.now();
setInterval(() => {
    transactionsPerSecond /= (Date.now() - last) * 0.001;
    console.log('Transactions per second: ' +
        transactionsPerSecond +
        ', here are the curret shares:');
    console.log(shares);
    console.log('');
    transactionsPerSecond = 0;
    last = Date.now();
}, 1000);
function exitHandler(options, exitCode) {
    if (options.cleanup)
        console.log('clean');
    if (exitCode || exitCode === 0)
        console.log(exitCode);
    // if (options.exit) process.exit();
}
// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));
// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: false }));
