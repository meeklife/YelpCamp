if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
// const dbUrl = process.env.DB_Url
const dbUrl = 'mongodb://localhost:27017/yelp-camp'

const app = express();

//routes & models
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users')

const User = require('./models/user');

//error handlers
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

//DB connection

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

//parse our form body
app.use(express.urlencoded({ extended: true }));

//method to use PUT, PATCH AND DELETE
app.use(methodOverride('_method'));

// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//mongo Sanitizer
app.use(mongoSanitize());

//helmet
app.use(helmet({contentSecurityPolicy: false})) 

//Mongo Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisismysecret'
    }
});
store.on("error", function(e){
    console.log('Session Store Error: ', e)
})

//session configuration 
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisismysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

//flash session
app.use(flash())

//Passport config
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//locals 
app.use((req, res, next)=>{
    if(!['/login', '/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    // console.log("req.session....", req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', usersRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/', reviewRoutes)

//show homepage
app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})