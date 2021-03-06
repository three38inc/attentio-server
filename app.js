// Express - app JS
// Attentio - Chrome Extension to Grab your team-mate's attention
// Author - Jobith <jobithmbasheer@gmail.com>

var express = require('express')
var http = require("http")
var app = express()
var cors = require('cors')

// data
var users = require('./data/users.json')
var connected = [];

// enable cors
app.use(cors())

// Socket connection
/* Creates new HTTP server for socket */
var socketServer = http.createServer(app)
var io = require('socket.io')(socketServer)

/* Listen for socket connection on port 3002 */
socketServer.listen(3002, function(){
    console.log('Socket server listening on : 3002')
});

/* This event will emit when client connects to the socket server */
io.on('connection', function(socket){

    if(socket.handshake.query['username']){
        var name = socket.handshake.query['username'];
        // if(connected.indexOf(name) < 0)
        //     connected.push(name)
        socket.on('set-name', function(_name) {
            name = _name;
        });
    }
        
    console.log(`${name} connected  ✅`)
    // console.log(`Online Users: ${connected.join(', ').trimRight(', ')}`);


    // Receive ping event with data:
    socket.on('pingUser', function(data) {
        let sender = users.find((user) => user.username == data.sender)
        let receiver = users.find((user) => user.username == data.receiver)

        console.log(`${data.sender} wants to ping ${data.receiver} - online`)
        io.emit('pingUser', {
            sender,
            receiver,
            message : `${sender.name} wishes to grab your attention!`
        });

        // if(connected.indexOf(receiver.username) >= 0){
        //     console.log(`${data.sender} wants to ping ${data.receiver} - online`)
        //     io.emit('pingUser', {
        //         sender,
        //         receiver,
        //         message : `${sender.name} wishes to grab your attention!`
        //     });
        // }
        // else{
        //     console.log(`${data.sender} wants to ping ${data.receiver} - offline`)
        //     io.emit('pingUser', {
        //         sender: receiver,
        //         receiver: sender,
        //         message : `Sorry, ${receiver.name} is Offline!`
        //     });
        // }
        
    })
    

    socket.on('disconnect', function(socket){
        console.log(`${name} disconnected ❌`)
        // connected.splice(connected.indexOf(name), 1)
    })
})


/* Create HTTP server for node application */

var server = http.createServer(app)
app.use('/static', express.static('public'))

app.get('/', (req, res) => {
    res.json(`${req.protocol}://${req.headers.host}`)
})

// GET request for all users
app.get('/users', (req, res) => {
    users.forEach((user) => {
        user.profile_picture = `${req.protocol}://${req.headers.host}/static/images/${user.image}`
        // user.status = (connected.indexOf(user.username) >= 0) ? 'online' : 'offline'
    })

    // res.json({users, connected});
    res.json({users});
})


/* Node application will be running on 3000 port */
server.listen(3000)