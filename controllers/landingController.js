import Property from '../models/Property.js';
import Review from '../models/Review.js';
import xss from 'xss';

export const getLandingPage = async (req, res) => {
  try {
    const featured = await Property.find().sort({ rating: -1 }).limit(5).lean();
    //dynamic city list
    const cities = await Property.distinct("city");

    return res.render('landing', { featured, title: 'BNB Advisor', cityList: cities });
  } catch (err) {
    return res.status(500).render("error", {
      title: "Error",
      message: "Something went wrong. Please try again later.",
      isNotFound: false
    });
  }
};

export const getListings = async (req, res) => {
  try {
    const keyword = xss(req.query.keyword || '').trim();
    const city = xss(req.query.city || '').trim();


    //no null validation
    if (!keyword && !city) {
      return res.status(400).render('error', {
        title: 'Invalid Input',
        message: 'Please enter a search keyword or select a city.',
        isNotFound: false
      });
    }

    //keyword no all digital validation
    if (keyword && /^\d+$/.test(keyword)) {
      return res.status(400).render('error', {
        title: 'Invalid Keyword',
        message: 'Keyword cannot be only numbers.',
        isNotFound: false
      });
    }

    const filter = {};
    if (keyword) {
      filter.title = { $regex: keyword, $options: 'i' };
    }
    if (city) {
      filter.city = city;
    }


    const results = await Property.find(filter);


    if (results.length === 0) {
      return res.status(404).render('error', {
        title: 'No BNBs Found',
        message: 'Sorry, no BNB matched your search.',
        isNotFound: true
      });
    }


    return res.render('listings', {
      results,
      title: 'Search Result'
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Server Error',
      message: 'Something went wrong. Please try again later.',
      isNotFound: false
    });
  }
};

//Get property details page
export const getPropertyDetails = async (req, res) => {
  try {
    console.log('getPropertyDetails called with ID:', req.params.id);
    const { id } = req.params;
    

    const property = await Property.findById(id);
    console.log('Found property:', property ? property.title : 'Not found');
    
    if (!property) {
      return res.status(404).render('error', {
        title: 'Property Not Found',
        message: 'The property you are looking for does not exist.',
        isNotFound: true
      });
    }
    
    // check if current user is the owner of the property
    const isOwner = req.session.user && property.owner && 
                   property.owner.toString() === req.session.user._id.toString();
    
   
    const reviews = await Review.find({ property: property._id })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);
    
    console.log('Found reviews:', reviews.length);
    
    // calculate average rating and update property's rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
      
      // update property's rating 
      await Property.findByIdAndUpdate(id, { 
        rating: parseFloat(averageRating.toFixed(1)) 
      });
      
      property.rating = parseFloat(averageRating.toFixed(1));
    }

    console.log('Rendering property-details with data:', {
      title: property.title,
      reviewCount: reviews.length
    });

    res.render('property-details', {
      title: property.title,
      property,
      reviews,
      reviewCount: reviews.length,
      user: req.session.user || null,
      isPropertyOwner: isOwner,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Property details error:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Failed to load property details',
      isNotFound: false
    });
  }
};