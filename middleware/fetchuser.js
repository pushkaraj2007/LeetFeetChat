const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));

// Fetch User
const fetchUser = async (req, res, next)=>{
    let token = req.headers.cookie
    if(!token){
        res.status(401).json({error: "You Need To Login For Getting Details"})
        // use req.user to send this data
    }
    else{
        try {
            token = token.split('=').filter(mycookie => mycookie.length > 100)[0]     
            const data = jwt.verify(token, process.env.JWT_SECRET)
            req.user = data.user
            next();
        } catch (error) {
            res.status(401).send({error: error});
        }
    }   
}

module.exports = fetchUser