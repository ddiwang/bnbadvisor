import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Review from '../models/Review.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/bnbadvisor';

const seed = async () => {
  try {
    console.log('=== Running seed.js ===');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    console.log('Old data cleared');

    const passwordHash = await bcrypt.hash('123456', 12);

    const managers = await User.insertMany([
      { firstName: 'Alice', lastName: 'Manager', email: 'alice.manager@example.com', password: passwordHash, role: 'manager' },
      { firstName: 'Bob', lastName: 'Manager', email: 'bob.manager@example.com', password: passwordHash, role: 'manager' },
    ]);

    const guests = await User.insertMany([
      { firstName: 'Charlie', lastName: 'Guest', email: 'charlie.guest@example.com', password: passwordHash, role: 'user' },
      { firstName: 'Daisy', lastName: 'Guest', email: 'daisy.guest@example.com', password: passwordHash, role: 'user' },
      { firstName: 'Eve', lastName: 'Guest', email: 'eve.guest@example.com', password: passwordHash, role: 'user' },
      { firstName: 'Frank', lastName: 'Guest', email: 'frank.guest@example.com', password: passwordHash, role: 'user' },
      { firstName: 'Grace', lastName: 'Guest', email: 'grace.guest@example.com', password: passwordHash, role: 'user' },
    ]);

    console.log('Users created');

    const propertyData = [
  {
    title: 'Cozy Countryside Cottage',
    description: 'A quiet place with fresh air, perfect for a weekend getaway.',
    type: 'house',
    city: 'Beijing',
    pricePerNight: 80,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Kitchen', 'Heating'],
    houseRules: ['No smoking', 'No pets']
  },
  {
    title: 'Luxury Downtown Condo',
    description: 'Right in the heart of the city with stunning skyline views.',
    type: 'condo',
    city: 'Los Angeles',
    pricePerNight: 200,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Air Conditioning', 'Pool', 'Gym'],
    houseRules: ['No smoking', 'No loud parties']
  },
  {
    title: 'Mountain Cabin Retreat',
    description: 'Perfect for nature lovers, surrounded by forests and trails.',
    type: 'cabin',
    city: 'Beijing',
    pricePerNight: 120,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Fireplace', 'Kitchen', 'Parking'],
    houseRules: ['No smoking', 'Pets allowed']
  },
  {
    title: 'Sunny Beach House',
    description: 'Enjoy the sunshine and ocean right at your doorstep.',
    type: 'villa',
    city: 'Los Angeles',
    pricePerNight: 250,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ['WiFi', 'BBQ Grill', 'Private Beach', 'Air Conditioning'],
    houseRules: ['No smoking']
  },
  {
    title: 'Modern City Apartment',
    description: 'Stylish and convenient apartment in the city center.',
    type: 'apartment',
    city: 'Beijing',
    pricePerNight: 150,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Kitchen', 'Washing Machine'],
    houseRules: ['No pets', 'No smoking']
  },
  {
    title: 'Traditional Ryokan',
    description: 'Experience authentic Japanese culture with tatami rooms.',
    type: 'house',
    city: 'Tokyo',
    pricePerNight: 180,
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Onsen', 'WiFi', 'Traditional Meals'],
    houseRules: ['No shoes inside', 'Quiet after 10pm']
  },
  {
    title: 'Shinjuku Loft',
    description: 'Modern loft close to all attractions and nightlife.',
    type: 'loft',
    city: 'Tokyo',
    pricePerNight: 170,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning'],
    houseRules: ['No smoking', 'No pets']
  },
  {
    title: 'Central Park View',
    description: 'Amazing park views from a stylish city apartment.',
    type: 'apartment',
    city: 'New York',
    pricePerNight: 300,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['WiFi', 'Elevator', 'Doorman'],
    houseRules: ['No smoking']
  },
  {
    title: 'Historic Brownstone',
    description: 'Classic charm with modern amenities in a historic building.',
    type: 'house',
    city: 'New York',
    pricePerNight: 280,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Kitchen', 'Backyard'],
    houseRules: ['No smoking', 'No loud parties']
  },
  {
    title: 'Times Square Studio',
    description: 'Right in the action with easy access to theaters and dining.',
    type: 'apartment',
    city: 'New York',
    pricePerNight: 220,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Air Conditioning', 'Heating'],
    houseRules: ['No smoking', 'No pets']
  }
];


    const properties = await Property.insertMany(
      propertyData.map((p, idx) => ({
        ...p,
        owner: managers[idx % managers.length]._id,
      }))
    );

    console.log('Properties created');

    const reviewTexts = [
      'Amazing place, would visit again!',
      'Very comfortable and well located.',
      'Clean and cozy, highly recommended.',
      'Great host, smooth check-in.',
      'Wonderful views and quiet neighborhood.',
      'Perfect for a weekend getaway.',
      'Stylish interior and very spacious.',
      'Close to shops and restaurants.',
      'Good value for the price.',
      'Excellent amenities and service.',
    ];

    const reviews = [];
    let reviewCount = 0;
    for (let i = 0; i < properties.length && reviewCount < 20; i++) {
      const numReviews = Math.floor(Math.random() * 4) + 1;
      const shuffledGuests = guests.sort(() => 0.5 - Math.random());

      for (let j = 0; j < numReviews && reviewCount < 20; j++) {
        reviews.push({
          property: properties[i]._id,
          user: shuffledGuests[j % guests.length]._id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          likes: Math.floor(Math.random() * 21)
        });
        reviewCount++;
      }
    }

    await Review.insertMany(reviews);
    console.log('Reviews created');

    for (const property of properties) {
      const propertyReviews = reviews.filter(r => r.property.toString() === property._id.toString());
      if (propertyReviews.length > 0) {
        const avg = propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length;
        property.rating = Number(avg.toFixed(1));
      } else {
        property.rating = 0;
      }
      await property.save();
    }

    console.log('=== Seed completed successfully ===');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting seed data:', err);
    process.exit(1);
  }
};

seed();