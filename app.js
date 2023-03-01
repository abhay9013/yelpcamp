if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsmate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const { campgroundSchema, reviewSchema } = require('./schemas');
const methodOverride = require('method-override')
const Campground = require('./models/campground');
const Review = require('./models/review')
const User = require('./models/user');
const req = require('express/lib/request');
const passport = require('passport');
const LocalStartegy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');

const MongoDBStore = require("connect-mongo");


const campgroundRoute = require('./routes/campgrounds');
const reviewRoute = require('./routes/reviews');
const userRoute = require('./routes/user');

const dburl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

//const dburl = 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dburl)
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!!!")
        console.log(err);
    })

const app = express();


app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());


const secret = process.env.SECRET || 'bettersecret';

const store = MongoDBStore.create({
    mongoUrl: dburl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    name: 'blah',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + (100 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash())



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStartegy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    //console.log(req.session)
    //console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})


app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewRoute)
app.use('/', userRoute)



app.get('/', (req, res) => {
    res.render('home')
})

app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: 'abc@gmail.com', username: 'abc' });
    const newuser = await User.register(user, 'abc1234')
    res.send(newuser);
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went Wrong!'
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})