import Property from '../models/Property.js';
import Reviews from '../models/Reviews.js';

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const bnb = await Property.findById(id);

    if (!bnb) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Property not found',
        isNotFound: true
      });
    }

    const reviews = await Reviews.find({ listingId: id }).sort({ createdAt: -1 });
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'No ratings yet';

    res.render('property/detail', {
      title: bnb.title,
      bnb,
      reviews,
      avgRating
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Failed to load property details',
      isNotFound: false
    });
  }
};

export const getAverageRating = async (req, res) => {
  try {
    const propertyId = req.params.id; // 如果需要传递特定的 propertyId
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.json({ averageRating: property.averageRating });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching average rating' });
  }
};