const express = require('express');
const Users = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fetchUser = require('../middleware/fetchuser');
const upload = require('../middleware/uploadImg')
const nodemailer = require('nodemailer');

// Function To Create Random String For User Authentication
const makeid = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}


// Signup To User
router.post('/signup', upload.single('image'), async (req, res) => {

  try {
    if (req.body.name.trim().length < 5 && req.body.username.length < 3) {
      return res.status(400).json({ error: "Please Fill Up Correct Details" });
    }

    let enteredEmail = await Users.findOne({ email: req.body.email })
    let enteredUsername = await Users.findOne({ username: req.body.username })

    if (enteredUsername) {
      return res.status(400).json({ error: "Sorry This Username Is Already Taken" });
    }

    if (enteredEmail) {
      return res.status(400).json({ error: "Sorry This Email Is Already Exists" })
    }

    const salt = await bcrypt.genSalt(10);
    let secPass = await bcrypt.hash(req.body.password, salt);

    let username = req.body.username.toLowerCase()

    let userAuthId =  makeid(15)
    console.log(userAuthId)
    let userSave;

    if (req.fileName == undefined || null) {
      userSave = await Users.create({
        name: req.body.name,
        username: username,
        email: req.body.email,
        password: secPass,
        imageUrl: `/static/Images/upload-img.png`,
        userAuthId: userAuthId,
        verified: false
      })
    }
    else {
      userSave = await Users.create({
        name: req.body.name,
        username: username,
        email: req.body.email,
        password: secPass,
        imageUrl: `/static/user-img/${req.fileName}`,
        userAuthId: userAuthId,
        verified: false
      })
    }

    // For Sending Email : Start
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD
      },
    });

    let mailOptions = {
      from: 'leetfeetchat@gmail.com',
      to: req.body.email,
      subject: 'Verification Link For LeetFeetChat',
      text: `Link For Validating You Account Is ${'http://leetfeetchat.herokuapp.com/verify-account/' + userAuthId}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    // For Sending Email : End


    console.log(req.fileName)
    const data = {
      user: {
        id: userSave.id
      }
    }

    const authToken = jwt.sign(data, process.env.JWT_SECRET)
    console.log(authToken)
    res.json({ authToken })

  }
  catch (error) {
    console.log(error)
    res.status(500).send("Internal Server Error")
  }
})


// Login To User
router.post('/login', [
  body('email').isEmail(),
  body('password', "Password Must Not Be blank").exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: "Please Use Correct Email Address" });
  }

  const { email, password } = req.body;
  try {

    let user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Please Try To Login With Right Credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please Try To Login With Right Credentials" });
    }

    if(user.verified == false){
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD
        },
      });
  
      let mailOptions = {
        from: 'leetfeetchat@gmail.com',
        to: req.body.email,
        subject: 'Verification Link For LeetFeetChat',
        text: `Link For Validating You Account Is ${'http://leetfeetchat.herokuapp.com/verify-account/' + user.userAuthId}`
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error.message);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.status(400).json({ error: "Verication Link Has Been Sent To Email, Please Verify Account And Try Again" });
      return
    }

    const data = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(data, process.env.JWT_SECRET)

    // app.set('auth-token', authToken)
    res.cookie("auth-token", authToken, { httpOnly: true, maxAge: 2629800000 })
    res.json(user)


  } catch (error) {
    console.log(error)
    res.status(500).send("Internal Server Error")
  }


})


router.post("/getuser", fetchUser, async (req, res) => {
  try {
    let userId = req.user.id;
    let user = await Users.findById(userId).select("-password").select("-_id");
    res.json({ user })
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error")
  }
})

router.post("/username", async (req, res) => {
  let username = await Users.findOne({ username: req.body.username });

  try {
    if (username) {
      return res.json({ error: "username is Not Available" })
    }
    res.json({ username });
  } catch (error) {
    console.log(error.message)
  }

})

router.get("/logout", (req, res) => {
  res.clearCookie('auth-token')
  res.redirect('/')
})

module.exports = router