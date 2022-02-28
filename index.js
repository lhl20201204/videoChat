// 本项目需要在本地起个 https, ip地址为局域网内的IP，之后可以同一个局域网内视频聊天
// 源码是在youtube上的教程视频，稍作修改。
// https://www.youtube.com/watch?v=DvlyzDZDEq4
const express = require('express')
const app = express()
const fs = require('fs');
// Mac 电脑里如何安装
// brew install mkcert
// mkcert -install
// mkcert localhost
// mkcert 主机名（linHaoLiang-mbp）
const options = {
  key: fs.readFileSync('./linHaoLiang-mbp-key.pem'),
  cert: fs.readFileSync('./linHaoLiang-mbp.pem'),
};
const  server = require('https').createServer(options, app)
const { Server } = require("socket.io");
const io = new Server(server);
const { v4: uuidV4 } = require('uuid')


app.set('view engine', 'ejs')

app.use(express.static('public'))
app.get('/', (req,res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req,res) => {
  res.render('room', { roomId: req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room', (roomId , userId) =>{
        socket.join(roomId)
        io.sockets.in(roomId).emit('user-connected', userId)
        
        socket.on('disconnect', () => {
            io.sockets.in(roomId).emit('user-disconnected', userId)
        })
    })
})


server.listen(4000)