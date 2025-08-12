import express from 'express';
import exphbs from 'express-handlebars';
import Handlebars from 'handlebars';
import session from 'express-session';
import landingRoutes from './routes/landing.js';
import userRoutes from './routes/users.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';

import propertyRoutes from './routes/propertyRoutes.js';
import reviewRoutes from './routes/reviews.js';

import { getAverageRating } from './controllers/propertyController.js';


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


const eqHelper = (a, b) => {
  return a === b;
};


Handlebars.registerHelper('eq', eqHelper);

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
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

app.use('/properties', propertyRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/reviews', reviewRoutes);

app.get('/property/averageRating', getAverageRating);




app.use((req, res, next) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: "The page you are looking for does not exist.",
    isNotFound: true
  });
});

export default app;