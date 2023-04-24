const express = require('express');
const router =  express.Router();
const Users = require('../models/User')
const publicRooms = {'official-room': { users: {}, name: 'official Room', author: 'leetfeetchat' }}
const privateRooms = {}
const fetchUser = require('../middleware/fetchuser');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/uploadImg')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const path = require('path')

// Render
router.get("/", async (req, res)=>{
    try {
        res.status(200).render("index", {publicRooms: JSON.stringify(publicRooms)})
    } catch (error) {
        console.log(error.message)
        res.send("Internal Server Error")
    }
})

router.get('/chat', (req, res)=>{
    res.clearCookie('io')
    res.status(200).render("chat")
})
  
router.get("/login", (req, res)=>{
    res.clearCookie('io')
    res.status(200).render("login-signup")
})

router.get("/signup", (req, res)=>{
    res.render("signup")
})


router.get('/account', async (req, res)=>{
    try {
        res.render("account")
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal Server Error")
    }
})

router.post('/api/change-account-details', fetchUser, upload.single('image'), async (req, res)=>{

    let user = await Users.findById(req.user.id)
    console.log(user)
    if(!user){
        return res.json( {error: 'Internal Server Error'} )
    }

    let conditionsArray = [
        req.body.username.trim().replace(/\s+/g, '') < 3, 
        req.body.name.trim() < 5
    ]

    if(conditionsArray.includes(true)){
        return res.json( {error: "Name Must Be 5 And Username Must Be 3 Characters Long"} )
    }

    if(req.body.username.trim() != user.username){
        let enteredUsername = await Users.findOne({ username: req.body.username.trim() })

        if(enteredUsername){
            return res.json( {error: "Username Already Exists"} )
        }
    }

    let userUpdateObject = { username: req.body.username.trim().replace(/\s+/g, ''), name: req.body.name.trim() }

    if(req.body.imageUrl){
        userUpdateObject.imageUrl = `/static/user-img/${req.fileName}`
        fs.unlinkSync(path.join(__dirname, '..'+ req.body.imageUrl))
    }

    let userUpdate = await Users.updateMany({_id: req.user.id}, userUpdateObject )
    console.log(req.body.imageUrl)
    console.log(user.imageUrl)

    // if(req.body.imageUrl == user.imageUrl){
    //     console.log("it's Inside if statement")
    //     let imageUpdate = await Users.updateMany({_id: req.user.id}, {imageUrl: `/static/user-img/${req.fileName}`})
    //     console.log(imageUpdate)
    //     fs.unlinkSync(path.join(__dirname, '..'+ req.body.imageUrl))
    // }

    console.log(userUpdate)
    res.json( {success: "Successfully Changed Account Details"} )
})

// Render My Rooms
router.get('/my-rooms', async (req, res)=>{
    res.status(200).render("my-rooms")
})

// Get Rooms of user
router.post('/api/get-my-rooms', fetchUser, async (req, res)=>{

    let user = await Users.findById(req.user.id);
    if(!user){
        return res.json({error: "Internal Server Error"})
    }
    
    let arrayRooms = Object.values(publicRooms)
    let myRooms = [];
    arrayRooms.forEach(element => {
        if(element.author == user.username){
            myRooms.push(element)
        }
    });

    console.log(myRooms)
    console.log(user.username)

    res.json({rooms: myRooms})
})

// Render Public Room
router.get('/public-rooms/:room', async (req, res) => {
    if (publicRooms[req.params.room] == null) {
      return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room })
})

// Render Private Room
router.get('/private-rooms/:room', async (req, res) => {
    if (privateRooms[req.params.room] == null) {
      return res.redirect('/')
    }

    console.log(req.params.room)
    console.log('pwd')
    console.log(privateRooms[req.params.room].password)

    if(privateRooms[req.params.room].password != req.query.pwd){
        return res.json( {error: "Incorrect Password"} )
    }
    
    res.render('private-room', { roomName: req.params.room })
})

// Get Private Rooms of User
router.post('/api/get-my-private-rooms', fetchUser, async (req, res)=>{

    let user = await Users.findById(req.user.id);
    if(!user){
        return res.json({error: "Internal Server Error"})
    }

    let arrayRooms = Object.values(privateRooms)
    let myRooms = [];
    arrayRooms.forEach(element => {
        if(element.author == user.username){
            myRooms.push(element)
        }
    });

    console.log(myRooms)
    console.log(user.username)

    res.json({rooms: myRooms})
})

// Verify Password
router.post('/api/verify-password', fetchUser, async (req, res)=>{
    try {
        let userId = req.user.id;
        let user = await Users.findById(userId);

        if(!user){
            return res.status(401).json({error: "You Need To Login For Using This Service"})
        }

        const passwordCompare = await bcrypt.compare(req.body.password, user.password);

        if(!passwordCompare){
            return res.status(400).json({error: "Your Entered Password Is Incorrect"});
        }

        res.status(200).json({success: "Your Entered Password Is Correct"})
    } catch (error) {
        console.log(error.message)
        res.status(501).json({error: "Internal Server Error"})
    }
})

// Change Password
router.post('/api/change-password', fetchUser, async (req, res)=>{
    let userId = req.user.id;
    let user = await Users.findById(userId);

    if(!user){
        return res.status(401).json({error: "You Need To Login For Using This Service"})
    }

    if(!req.body.password){
        return res.status(401).json({error: "Password Should Not Be Empty"})
    }

    const salt = await bcrypt.genSalt(10);
    let secPass = await bcrypt.hash(req.body.password, salt);

    await Users.updateOne({password: user.password}, {password: secPass})
    res.status(200).json({success: "Account Password Has Been Changed"})
})

// Verify Account
router.get('/verify-account/:id', async (req, res)=>{
    let user = await Users.findOne({userAuthId: req.params.id})
    if(!user){
        return res.redirect('/')
    }

    const data = {
        user: {
          id: user.id
        }
      }
  
    await Users.updateOne({userAuthId: req.params.id}, {verified: true})

    const authToken = jwt.sign(data, process.env.JWT_SECRET)
    res.cookie("auth-token", authToken, { httpOnly: true, maxAge: 2629800000 })
    res.redirect('/')
})

module.exports = {router: router, publicRooms: publicRooms, privateRooms: privateRooms}