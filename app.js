var express = require('express');
var path = require('path');
var fs = require('fs')
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var compression = require('compression')
var mongoose = require('mongoose');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth')

const pre_populate = require('./dummy-data/pre_populate')
mongoose
    .connect(process.env.MONGO_URL || 'mongodb://localhost/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('connected to database!', 'pre_populating now...');
        pre_populate();
    })
    .catch(err => {
        console.log('error starting database');
    })

var app = express();
const passport = require('./passport')
//app.set('trust proxy', 1) // trust first proxy, when node is behind proxy server
app.use(session({
    secret: 'my shitty session secret',
    name: 'tclone',
    resave: false,
    saveUninitialized: true,
    // store: new MongoStore({
    //     mongooseConnection: mongoose.connection,
    //     //secret: 'this will encrypt my sessions'
    // }),
    cookie: {
        //secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 //30 days
    }
}))

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRouter);
app.use('/auth', authRouter);

module.exports = app;
