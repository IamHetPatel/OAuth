
const path = require("path")
const https = require('https');
const express = require("express")
const helmet= require("helmet")

const passport = require('passport')
const { Strategy} = require('passport-google-oauth20')

const fs = require("fs");
const { log } = require("console");

const PORT = 3000; 
require('dotenv').config();

const AUTH_OPTIONS = {
    callbackURL:'/auth/google/callback',
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET
};

function verifyCallback(accessToken,refreshToken,profile,done){
    console.log("google profile",profile)
    done(null,profile);
}

passport.use(new Strategy(AUTH_OPTIONS,verifyCallback))
const app = express();

const config = {
    CLIENT_ID:process.env.CLIENT_ID,
    CLIENT_SECRET:process.env.CLIENT_SECRET
}

app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req,res,next){
    const isLoggedIn = true;
    if(!isLoggedIn){
        return res.status(401).json({
            error: 'Not logged in'
        })
    }
    next();
}

app.get('/auth/google',passport.authenticate('google',{
    scope : ['email']
}));

app.get('/auth/google/callback',passport.authenticate('google',{
    failureRedirect:'/failure',
    successRedirect:'/',
    session: false
}), (req,res)=>{
    console.log("Google calls us back")
})

app.get('/auth/logout',(req,res)=>{});

app.get('/failure', (req, res) => {
    return res.send('failed to log in');
});

app.get('/secret',checkLoggedIn, (req, res) => {
    return res.send('your secret value is 69');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'))
});

https.createServer({
    key:fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(PORT, () => {
    console.log(`Listening to the port ${PORT}`)
})