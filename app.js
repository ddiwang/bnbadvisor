import express from 'express';
import exphbs from 'express-handlebars';
import Handlebars from 'handlebars';
import bodyParser from 'body-parser';
import landingRoutes from './routes/landing.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';

import  connectDB  from './config/db.js';
import { seedDatabase, shouldSeedDatabase } from './tasks/seed.js';
import dotenv from 'dotenv';

const app = express();

//app.engine('handlebars', exphbsengine({defaultLayout: 'landing'}));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(Handlebars) 
}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', landingRoutes);

app.use((req, res, next) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: "The page you are looking for does not exist.",
    isNotFound: true
  });

});


dotenv.config();

const port = process.env.PORT

connectDB().then(async () => {
  console.log('MongoDB connected');
  

  if (process.env.NODE_ENV === 'development' || process.env.SEED_DATABASE === 'true') {
    try {
      const needsSeeding = await shouldSeedDatabase();
      
      if (needsSeeding) {
        console.log('Database is empty. Starting seeding process...');
        const seedResult = await seedDatabase();
        console.log(`Database seeded successfully. Inserted: 
          ${seedResult.users.length} users, 
          ${seedResult.properties.length} properties, 
          ${seedResult.reviews} reviews`);
      } else {
        console.log('Database already has data. Skipping seeding.');
      }
    } catch (error) {
      console.error('Database seeding process failed:', error);
    }
  } else {
    console.log('Skipping seeding in production mode');
  }
  
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Database connection failed', err);
  process.exit(1);
});

export default app;