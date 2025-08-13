import mongoose from 'mongoose';
import Property from '../models/Property.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bnbadvisor';

const sampleProperties = [
  {
    title: "Cozy Downtown Apartment",
    city: "New York",
    description: "A beautiful 2-bedroom apartment in the heart of Manhattan with amazing city views.",
    type: "apartment",
    address: "123 5th Avenue, New York, NY",
    pricePerNight: 150,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    images: ["https://example.com/image1.jpg"],
    amenities: ["WiFi", "Kitchen", "Air Conditioning", "Heating"],
    houseRules: "No smoking, No pets",
    rating: 4.5
  },
  {
    title: "Beach House Villa",
    city: "Miami",
    description: "Stunning oceanfront villa with private beach access and pool.",
    type: "villa", 
    address: "456 Ocean Drive, Miami, FL",
    pricePerNight: 300,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    images: ["https://example.com/image2.jpg"],
    amenities: ["Pool", "Beach Access", "WiFi", "Kitchen", "Parking"],
    houseRules: "No parties, Check-in after 3pm",
    rating: 4.8
  },
  {
    title: "Mountain Cabin Retreat",
    city: "Denver",
    description: "Peaceful cabin in the Rocky Mountains, perfect for hiking and relaxation.",
    type: "cabin",
    address: "789 Mountain View Rd, Denver, CO", 
    pricePerNight: 120,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: ["https://example.com/image3.jpg"],
    amenities: ["Fireplace", "Mountain View", "WiFi", "Kitchen", "Hiking Trails"],
    houseRules: "Quiet hours after 10pm",
    rating: 4.7
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing properties
    await Property.deleteMany({});
    console.log('Cleared existing properties');

    // Insert sample properties
    const insertedProperties = await Property.insertMany(sampleProperties);
    console.log(`Inserted ${insertedProperties.length} sample properties`);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
