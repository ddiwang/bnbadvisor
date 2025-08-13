import Property from '../models/Property.js';
import Review from '../models/Review.js';
import { sanitizeInput } from '../middleware/xss.js';

// Host Management Routes
export const getManageProperties = async (req, res) => {
    try {
        // Check user
        if (!req.session.user) {
            return res.redirect('/users/login');
        }
        
        if (req.session.user.role !== 'manager') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'Only hosts can manage properties',
                isNotFound: false
            });
        }

        // Get properties
        const properties = await Property.find({ owner: req.session.user._id })
            .sort({ createdAt: -1 });

        res.render('properties/manage', {
            title: 'Manage Properties - BNB Advisor',
            properties,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading property management:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load property management',
            isNotFound: false
        });
    }
};

export const createPropertyFromForm = async (req, res) => {
    const { title, description, type, city, pricePerNight, maxGuests, bedrooms, bathrooms, amenities } = req.body;
    const userId = req.session.user?._id;
    
    try {
        // Check authentication and role
        if (!userId) {
            return res.redirect('/users/login');
        }
        
        if (req.session.user.role !== 'manager') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'Only hosts can create properties',
                isNotFound: false
            });
        }

        const amenitiesArray = amenities 
            ? amenities.split(',').map(a => a.trim()).filter(a => a.length > 0)
            : [];
        let images = [];
        if (req.files && req.files.length > 0) {
              images = req.files.map(file => file.path);
        }
        // property.images = images; // 保存到你的 model 里

        const newProperty = new Property({ 
            title: title.trim(), 
            description: description.trim(), 
            type, 
            city: city.trim(), 
            pricePerNight: Number(pricePerNight), 
            maxGuests: Number(maxGuests), 
            bedrooms: Number(bedrooms) || 0, 
            bathrooms: Number(bathrooms) || 0, 
            amenities: amenitiesArray,
            owner: userId,
            images: images
        });
        
        await newProperty.save();
        
        res.redirect('/properties/manage?success=Property created successfully!');
    } catch (error) {
        console.error('Property creation error:', error);
        
        const properties = await Property.find({ owner: userId }).sort({ createdAt: -1 });
        
        let errorMessage = 'Failed to create property. Please try again.';
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            errorMessage = errors.join(', ');
        }
        
        res.render('properties/manage', {
            title: 'Manage Properties - BNB Advisor',
            properties,
            user: req.session.user,
            error: errorMessage
        });
    }
};

export const getEditProperty = async (req, res) => {
    const userId = req.session.user?._id;
    const propertyId = req.params.id;
    
    try {
        // Check authentication and role
        if (!userId) {
            return res.redirect('/users/login');
        }
        
        if (req.session.user.role !== 'manager') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'Only hosts can edit properties',
                isNotFound: false
            });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.redirect('/properties/manage?error=Property not found');
        }
        
        // Check ownership
        if (property.owner.toString() !== userId) {
            return res.redirect('/properties/manage?error=You can only edit your own properties');
        }

        res.render('properties/edit', {
            title: 'Edit Property - BNB Advisor',
            property,
            user: req.session.user
        });
    } catch (error) {
        console.error('Property edit load error:', error);
        res.redirect('/properties/manage?error=Failed to load property for editing');
    }
};

export const updatePropertyFromForm = async (req, res) => {

    const userId = req.session.user?._id;
    const propertyId = req.params.id;
    const { title, description, type, city, pricePerNight, maxGuests, bedrooms, bathrooms, amenities } = req.body;
    
    try {
        // Check again
        if (!userId) {
            return res.redirect('/users/login');
        }
        
        if (req.session.user.role !== 'manager') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'Only hosts can edit properties',
                isNotFound: false
            });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.redirect('/properties/manage?error=Property not found');
        }
        
        // Check ownership
        if (property.owner.toString() !== userId) {
            return res.redirect('/properties/manage?error=You can only edit your own properties');
        }

        const amenitiesArray = amenities 
            ? amenities.split(',').map(a => a.trim()).filter(a => a.length > 0)
            : [];

        // 处理图片
        let images = property.images || [];
            if (req.files && req.files.length > 0) {
            // 拼接图片的服务器URL
            const newImgs = req.files.map(f => '/uploads/' + f.filename);
            images = images.concat(newImgs); // 可保留历史图片或覆盖，按需
        }


        // Update the property
        const updatedProperty = await Property.findByIdAndUpdate(
            propertyId,
            {
                title: title.trim(),
                description: description.trim(),
                type,
                city: city.trim(),
                pricePerNight: Number(pricePerNight),
                maxGuests: Number(maxGuests),
                bedrooms: Number(bedrooms) || 0,
                bathrooms: Number(bathrooms) || 0,
                amenities: amenitiesArray,
                images: images
            },
            { new: true, runValidators: true }
        );
        
        res.redirect('/properties/manage?success=Property updated successfully!');
    } catch (error) {
        console.error('Property update error:', error);
        
        try {
            const property = await Property.findById(propertyId);
            let errorMessage = 'Failed to update property. Please try again.';
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                errorMessage = errors.join(', ');
            }
            
            res.render('properties/edit', {
                title: 'Edit Property - BNB Advisor',
                property,
                user: req.session.user,
                error: errorMessage
            });
        } catch (fetchError) {
            console.error('Error re-fetching property for edit:', fetchError);
            res.redirect('/properties/manage?error=Failed to update property');
        }
    }
};

export const deletePropertyFromForm = async (req, res) => {
    const userId = req.session.user?._id;
    const propertyId = req.params.id;
    
    try {
        if (!userId) {
            return res.redirect('/users/login');
        }
        
        if (req.session.user.role !== 'manager') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'Only hosts can delete properties',
                isNotFound: false
            });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.redirect('/properties/manage?error=Property not found');
        }
        
        if (property.owner.toString() !== userId) {
            return res.redirect('/properties/manage?error=You can only delete your own properties');
        }
        
        await Review.deleteMany({ property: propertyId });
        
        // Delete the property
        await Property.findByIdAndDelete(propertyId);
        
        res.redirect('/properties/manage?success=Property deleted successfully!');
    } catch (error) {
        console.error('Property deletion error:', error);
        res.redirect('/properties/manage?error=Failed to delete property. Please try again.');
    }
};

export const createProperty = async (req, res) => {
    const { title, description, type, address, city, pricePerNight, maxGuests, bedrooms, bathrooms, images, amenities, houseRules } = req.body;
    const user = req.session.user?._id;
    
    try {
        if (!user) {
            return res.status(401).json({ message: 'Please log in to create a property' });
        }

        const newProperty = new Property({ 
            title, 
            description, 
            type, 
            address, 
            city, 
            pricePerNight, 
            maxGuests, 
            bedrooms, 
            bathrooms, 
            images, 
            amenities, 
            houseRules,
            owner: user
        });
        
        const property = await newProperty.save();
        res.status(201).json({ message: 'Property created successfully', property });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProperty = async (req, res) => {
    const { id } = req.params;
    const { title, description, type, address, city, pricePerNight, maxGuests, bedrooms, bathrooms, images, amenities, houseRules } = req.body;
    const user = req.session.user?._id;
    
    try {
        if (!user) {
            return res.status(401).json({ message: 'Please log in to update a property' });
        }

        let property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Check if user owns this property
        if (property.owner && property.owner.toString() !== user.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }
        
        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            { title, description, type, address, city, pricePerNight, maxGuests, bedrooms, bathrooms, images, amenities, houseRules },
            { new: true }
        );
        
        res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteProperty = async (req, res) => {
    const user = req.session.user?._id;
    
    try {
        if (!user) {
            return res.status(401).json({ message: 'Please log in to delete a property' });
        }

        let property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Check if user owns this property 
        if (property.owner && property.owner.toString() !== user.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }
        
        await Property.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.status(200).json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find();
        res.status(200).json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
