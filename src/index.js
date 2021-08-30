const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// Initiliazations
const app = express();
require('./database');
require('./config/passport');

// Settings
// seteo puerto y vistas
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
}));
//indico el motor de vistas
app.set('view engine', '.hbs');

// Middlewares
app.use (express.urlencoded({extended: false}));
app.use(methodOverride('_method')); //permite que se reciban solicitudes put o delete
app.use(session({
    secret: 'claveoculta', //clave secreta
    resave: true,
    saveUninitialized: true
})); //configuración basica para el modulo de sesiones
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// GLobal Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user? (req.user).toObject() : null;
    next();
})

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Server is listenning
app.listen(app.get('port'), () => {
    console.log('Server on post', app.get('port'));
});