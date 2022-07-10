const express = require('express');
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*', } });
const path = require('path');
const ConnectToMongo = require('./db');
const fetchUser = require('./middleware/fetchuser');
const Users = require('./models/User')
require('dotenv').config();
const { router } = require('./routes/endpoints')
const { publicRooms } = require('./routes/endpoints')
const { privateRooms } = require('./routes/endpoints')
ConnectToMongo();


const authors = ['leetfeetchat']
const privateRoomsAuthors = []

// express specific stuff
app.use('/static', express.static('static'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'))
app.use('/', router)

// Ejs Specific Stuff
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views')); // Set The Views Directory


// socket.io Specific Stuff

app.post('/api/createpublicroom', fetchUser, async (req, res) => {
  if (publicRooms[req.body.room] != null) {
    return res.status(400).json({ error: "Room Name Already Exist" })
  }

  try {
    const user = await Users.findById(req.user.id)
    if(!user){
      return res.json({error: "Internal Server Error"})
    }
  
    let filteredAuthors = authors.filter(myarr => myarr === user.username)
  
    if (filteredAuthors.length > 4) {
      return res.json({ error: "You Already Created 5 Rooms Delete Them First Or Upgrade You Tier" })
    }
  
    authors.push(user.username.trim())
  
    console.log(filteredAuthors)
  
    console.log(authors)
  
    publicRooms[req.body.room] = { users: {} }
    publicRooms[req.body.room].name = req.body.name.trim()
    publicRooms[req.body.room].author = user.username.trim()
    
    res.status(200).json({ success: "Room Has Been Created" })
    io.emit('room-created', req.body.name.trim(), user.username.trim())
    
  } catch (error) {
    console.log(error.message)
    return res.json( {error: "Internal Server Error"} )
  }
})

app.post('/api/deletepublicroom', (req, res)=>{
  delete publicRooms[req.body.room]
  res.json( { success: "Room Has Benn Deleted"} )
  io.emit('room-deleted', req.body.room.toLowerCase().trim().replace(/\s+/g, '-'))
})

app.post('/api/deleteprivateroom', (req, res)=>{
  let room = req.body.room.toLowerCase().trim().replace(/\s+/g, '-')
  delete privateRooms[req.body.room]
  res.json( { success: "Room Has Benn Deleted"} )
  io.to(room).emit('room-deleted', room)
})


app.post('/api/createprivateroom', fetchUser, async (req, res)=>{
  console.log(req.body.name)
  console.log(req.body.password)

  let user = await Users.findById(req.user.id)
  if(!user){
    return res.json({error: "Internal Server Error"})
  }

  let filteredAuthors = privateRoomsAuthors.filter(myarr => myarr === user.username)
  
  if (filteredAuthors.length > 4) {
    return res.json({ error: "You Already Created 5 Rooms Delete Them First Or Upgrade You Tier" })
  }

  privateRoomsAuthors.push(user.username.trim())

  let roomId; 
  let roomNameArray = Object.keys(privateRooms)

  console.log(user)

  do{
      roomId = 'e' + Math.floor(Math.random() * 1000000000000000);
    } while (roomNameArray.includes(roomId))

  privateRooms[roomId] = { users: {} }
  privateRooms[roomId].name = req.body.name
  privateRooms[roomId].password = req.body.password
  privateRooms[roomId].author = user.username
  privateRooms[roomId].roomId = roomId

  console.log(privateRooms)

  res.json({roomId: roomId, password: req.body.password})
})

io.on('connection', socket => {

  socket.on('new-user-joined', (room, name) => {
    socket.join(room)
    publicRooms[room].users[socket.id] = name
    socket.to(room).emit('user-joined', name)
    console.log(publicRooms)
  })

  socket.on('new-user-joined-privateRoom', (room, name) =>{
    socket.join(room)
    privateRooms[room].users[socket.id] = name
    socket.to(room).emit('user-joined', name)
  })

  socket.on('send', (room, message) => {
    socket.to(room).emit('receive', { message: message, name: publicRooms[room].users[socket.id] })
  })

  socket.on('send-privateRoom', (room, message) => {
    socket.to(room).emit('receive', { message: message, name: privateRooms[room].users[socket.id] })
  })

  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {

      socket.to(room).emit('user-disconnected', publicRooms[room].users[socket.id])
      delete publicRooms[room].users[socket.id]
    })
  })
});

function getUserRooms(socket) {
  return Object.entries(publicRooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

server.listen(process.env.PORT || 80, () => {
  console.log("Server Is Listening On http://Localhost")
})