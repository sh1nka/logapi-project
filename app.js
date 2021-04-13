const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Session Settings

app.use(session(
    {
        secret: 'something.',
        resave: false,
        saveUninitialized: false
    }
));

app.use(passport.initialize());
app.use(passport.session());

// Database Settings

mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes Settings

app.route('/')

.get(function(req, res)
{
    res.render('home');
});

app.route('/register')

.get(function(req, res)
{
    res.render('register')
})

.post(function(req, res)
{
    User.register({ username: req.body.username}, req.body.password, function(err, user)
    {
        if(err)
        {
            console.log(err)
        }
        else
        {
            passport.authenticate('local')(req, res, function()
            {
                res.redirect('/info');
            });
        }
    });
});

app.route('/login')

.get(function(req, res)
{
    res.render('login');
})

.post(function(req, res)
{
    const user = new User(
        {
            username: req.body.username,
            password: req.body.password
        });

    req.login(user, function(err)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            passport.authenticate('local')(req, res, function()
            {
                res.redirect('/info');
            });
        }
    });
});

app.route('/info')

.get(function(req, res)
{
    if(req.isAuthenticated())
    {
        res.render('info');
    }
    else
    {
        res.redirect('/login');
    }
});

app.route('/logout')

.get(function(req, res)
{
    req.logout();
    res.redirect('/');
});

// Server management

app.listen(3000, function()
{
    console.log('Server running - port 3000');
});