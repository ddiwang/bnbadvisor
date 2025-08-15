import express from 'express';
import exphbs from 'express-handlebars';
import Handlebars from 'handlebars';
import session from 'express-session';
import landingRoutes from './routes/landing.js';
import userRoutes from './routes/users.js';
import reviewRoutes from './routes/reviews.js';
import propertyRoutes from './routes/properties.js';
import apiRoutes from './routes/api.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';


const app = express();


// Handlebars helpers
const eqHelper = (a, b) => {
  return a === b;
};

const formatDateHelper = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const joinHelper = (array, separator = ', ') => {
  if (!array || !Array.isArray(array)) return '';
  return array.join(separator);
};

const timesHelper = function(n, block) {
  let accum = '';
  for(let i = 0; i < n; ++i)
    accum += '⭐';
  return accum;
};

const substringHelper = (str, start, length) => {
  if (!str || typeof str !== 'string') return '';
  return str.substring(start, length);
};

Handlebars.registerHelper('eq', eqHelper);
Handlebars.registerHelper('formatDate', formatDateHelper);
Handlebars.registerHelper('join', joinHelper);
Handlebars.registerHelper('times', timesHelper);
Handlebars.registerHelper('substring', substringHelper);

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    eq: eqHelper,
    formatDate: formatDateHelper,
    join: joinHelper,
    times: timesHelper,
    substring: substringHelper
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
app.use('/reviews', reviewRoutes);
app.use('/properties', propertyRoutes);
app.use('/api', apiRoutes);

app.use((req, res, next) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: "The page you are looking for does not exist.",
    isNotFound: true
  });
});

export default app;