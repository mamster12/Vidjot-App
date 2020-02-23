const express           = require('express');
const exphbs            = require('express-handlebars');
const bodyParser        = require('body-parser');
const path              = require('path');
const methodOverride    = require('method-override');
const session           = require('express-session');
const passport          = require('passport');
const flash             = require('connect-flash');
const mongoose          = require('mongoose');


const app               = express();

//load routes
const ideas             = require('./routes/ideas');
const users             = require('./routes/users');

//Load passport config
require('./config/passport')(passport);


//connect to mongodb locally
mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to DB..')
}).catch(err => {
    console.log(err.message);
});


//handleBars Middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// override with POST having ?_method=DELETE - middleware
app.use(methodOverride('_method'));

//express-session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

//passport middelware
app.use(passport.initialize());
app.use(passport.session());

//middleware for connect-flash
app.use(flash());

//global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.user = req.user;
    next();
});


//Use routes
app.use('/ideas', ideas);
app.use('/users', users);

//index route
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    const title = 'About';
    res.render('about', { title: title });
});


const port = process.env.PORT || 3000;

app.listen(port, (req, res) => {
    console.log(`server is running at port ${port}`);
});