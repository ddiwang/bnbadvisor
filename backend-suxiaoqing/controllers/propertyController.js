const Property = require('../models/Property');

const createProperty = async (req, res) => {
    const { title, description, type, address, city, pricePerNight, maxGuests, bedrooms, bathrooms, images, amenities, houseRules } = req.body;
    try {
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
            owner: req.user.id
        });
        const property = await newProperty.save();
        res.status(201).json({ message: 'Property created successfully', property });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProperty = async (req, res) => {
    const { id } = req.params;
    const { title, description, type, address, city, pricePerNight, maxGuests, bedrooms, bathrooms, images, amenities, houseRules } = req.body;
    try {
        let property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
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

const deleteProperty = async (req, res) => {
   try {
    let property = await Property.findById(req.params.id);
    if (!property) {
        return res.status(404).json({ message: 'Property not found' });
    }
    await property.deleteOne();
    res.status(200).json({ message: 'Property deleted successfully' });
   } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
   }
};

const getPropertyById = async (req, res) => {
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

const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find();
        res.status(200).json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const uploadImages = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const imageUrls = req.files.map(file => file.path);
        
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Add new images to existing images array
        property.images = [...(property.images || []), ...imageUrls];
        await property.save();
        
        res.json({
            message: 'Images uploaded successfully',
            imageUrls: imageUrls,
            property: property
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
};

module.exports = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    uploadImages,
};