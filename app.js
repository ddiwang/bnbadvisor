import express from 'express';
import mongoose from 'mongoose';
import exphbs from 'express-handlebars';
import Handlebars from 'handlebars';
import bodyParser from 'body-parser';
import landingRoutes from './routes/landing.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';

import propertyRoutes from './routes/propertyRoutes.js';
import reviewRoutes from './routes/reviews.js';

import { getAverageRating } from './controllers/propertyController.js';


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//app.engine('handlebars', exphbsengine({defaultLayout: 'landing'}));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(Handlebars) 
}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', landingRoutes);

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