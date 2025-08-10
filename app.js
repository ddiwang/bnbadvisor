import express from 'express';
import exphbs from 'express-handlebars';
import Handlebars from 'handlebars';
import session from 'express-session';
import landingRoutes from './routes/landing.js';
import userRoutes from './routes/users.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';


const app = express();


const formatDateHelper = function(date, format) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  if (format === 'YYYY-MM-DD') {
    return d.toISOString().split('T')[0];
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const eqHelper = (a, b) => {
  return a === b;
};


Handlebars.registerHelper('formatDate', formatDateHelper);
Handlebars.registerHelper('eq', eqHelper);

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    formatDate: formatDateHelper,
    eq: eqHelper
  }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Session configuration
app.use(session({
  name: 'AuthCookie',
  secret: 'bnb-advisor-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', landingRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: "The page you are looking for does not exist.",
    isNotFound: true
  });
});

export default app;