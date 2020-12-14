const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)

const {v4 : uuidv4} = require('uuid');
const {ExpressPeerServer} = require('peer');

const peerServer = ExpressPeerServer(server, {
    debug : true
})

//we dont need ot import the ejs files
app.set('view engine','ejs');
app.use(express.static('public'));

app.use('/peerjs',peerServer);
app.get('/',(req,res) => { //so when we goto root api, it automatically generates a uuid and redirects
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room',(req,res) => {
    res.render('room',{roomId: req.params.room});
});

io.on('connection',socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId); //when someone joins, we have to tell it to everyone abt certain user connecting

        socket.on('message', message =>{
            io.to(roomId).emit('createMessage',message)
        })
    })
})




server.listen(process.env.PORT || 3030);




