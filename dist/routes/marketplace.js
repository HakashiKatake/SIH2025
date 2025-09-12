"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const marketplaceService_1 = require("../services/marketplaceService");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const router = express_1.default.Router();
// Validation functions
const validateProductListing = (data) => {
    const errors = [];
    // Name validation
    if (!data.name || typeof data.name !== 'string') {
        errors.push({ field: 'name', message: 'Product name is required and must be a string' });
    }
    else if (data.name.trim().length < 2 || data.name.trim().length > 100) {
        errors.push({ field: 'name', message: 'Product name must be between 2 and 100 characters' });
    }
    // Category validation
    const validCategories = ['crops', 'seeds', 'tools', 'fertilizers'];
    if (!data.category || !validCategories.includes(data.category)) {
        errors.push({ field: 'category', message: 'Category must be one of: crops, seeds, tools, fertilizers' });
    }
    // Subcategory validation (optional)
    if (data.subcategory && (typeof data.subcategory !== 'string' || data.subcategory.trim().length > 50)) {
        errors.push({ field: 'subcategory', message: 'Subcategory cannot exceed 50 characters' });
    }
    // Price validation
    if (typeof data.price !== 'number' || data.price < 0) {
        errors.push({ field: 'price', message: 'Price must be a positive number' });
    }
    // Quantity validation
    if (typeof data.quantity !== 'number' || data.quantity < 0) {
        errors.push({ field: 'quantity', message: 'Quantity must be a positive number' });
    }
    // Unit validation
    const validUnits = ['kg', 'quintal', 'ton', 'piece', 'liter', 'bag', 'packet'];
    if (!data.unit || !validUnits.includes(data.unit)) {
        errors.push({ field: 'unit', message: 'Unit must be one of: kg, quintal, ton, piece, liter, bag, packet' });
    }
    // Description validation
    if (!data.description || typeof data.description !== 'string') {
        errors.push({ field: 'description', message: 'Description is required and must be a string' });
    }
    else if (data.description.trim().length < 10 || data.description.trim().length > 1000) {
        errors.push({ field: 'description', message: 'Description must be between 10 and 1000 characters' });
    }
    // Images validation
    if (!Array.isArray(data.images) || data.images.length === 0) {
        errors.push({ field: 'images', message: 'At least one image is required' });
    }
    else {
        data.images.forEach((image, index) => {
            if (typeof image !== 'string' || !image.startsWith('http')) {
                errors.push({ field: `images[${index}]`, message: 'Each image must be a valid URL' });
            }
        });
    }
    // Location validation
    if (!data.location || typeof data.location !== 'object') {
        errors.push({ field: 'location', message: 'Location is required and must be an object' });
    }
    else {
        const { latitude, longitude, address, state, district } = data.location;
        if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
            errors.push({ field: 'location.latitude', message: 'Latitude must be between -90 and 90' });
        }
        if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
            errors.push({ field: 'location.longitude', message: 'Longitude must be between -180 and 180' });
        }
        if (!address || typeof address !== 'string' || address.trim().length === 0) {
            errors.push({ field: 'location.address', message: 'Address is required' });
        }
        else if (address.trim().length > 200) {
            errors.push({ field: 'location.address', message: 'Address cannot exceed 200 characters' });
        }
        if (!state || typeof state !== 'string' || state.trim().length === 0) {
            errors.push({ field: 'location.state', message: 'State is required' });
        }
        else if (state.trim().length > 50) {
            errors.push({ field: 'location.state', message: 'State cannot exceed 50 characters' });
        }
        if (!district || typeof district !== 'string' || district.trim().length === 0) {
            errors.push({ field: 'location.district', message: 'District is required' });
        }
        else if (district.trim().length > 50) {
            errors.push({ field: 'location.district', message: 'District cannot exceed 50 characters' });
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
const validateProductUpdate = (data) => {
    const errors = [];
    // Name validation (optional)
    if (data.name !== undefined) {
        if (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 100) {
            errors.push({ field: 'name', message: 'Product name must be between 2 and 100 characters' });
        }
    }
    // Category validation (optional)
    if (data.category !== undefined) {
        const validCategories = ['crops', 'seeds', 'tools', 'fertilizers'];
        if (!validCategories.includes(data.category)) {
            errors.push({ field: 'category', message: 'Category must be one of: crops, seeds, tools, fertilizers' });
        }
    }
    // Price validation (optional)
    if (data.price !== undefined) {
        if (typeof data.price !== 'number' || data.price < 0) {
            errors.push({ field: 'price', message: 'Price must be a positive number' });
        }
    }
    // Quantity validation (optional)
    if (data.quantity !== undefined) {
        if (typeof data.quantity !== 'number' || data.quantity < 0) {
            errors.push({ field: 'quantity', message: 'Quantity must be a positive number' });
        }
    }
    // Unit validation (optional)
    if (data.unit !== undefined) {
        const validUnits = ['kg', 'quintal', 'ton', 'piece', 'liter', 'bag', 'packet'];
        if (!validUnits.includes(data.unit)) {
            errors.push({ field: 'unit', message: 'Unit must be one of: kg, quintal, ton, piece, liter, bag, packet' });
        }
    }
    // Description validation (optional)
    if (data.description !== undefined) {
        if (typeof data.description !== 'string' || data.description.trim().length < 10 || data.description.trim().length > 1000) {
            errors.push({ field: 'description', message: 'Description must be between 10 and 1000 characters' });
        }
    }
    // Images validation (optional)
    if (data.images !== undefined) {
        if (!Array.isArray(data.images) || data.images.length === 0) {
            errors.push({ field: 'images', message: 'At least one image is required' });
        }
        else {
            data.images.forEach((image, index) => {
                if (typeof image !== 'string' || !image.startsWith('http')) {
                    errors.push({ field: `images[${index}]`, message: 'Each image must be a valid URL' });
                }
            });
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
const validateSearchFilters = (data) => {
    const errors = [];
    // Note: For query parameters, we'll validate in the route handler
    // This is a placeholder for consistency
    return {
        isValid: true,
        errors
    };
};
const validateProductId = (id) => {
    const errors = [];
    if (!id || typeof id !== 'string') {
        errors.push({ field: 'id', message: 'Product ID is required' });
    }
    else if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        errors.push({ field: 'id', message: 'Invalid product ID format' });
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
/**
 * POST /api/marketplace/products
 * Create a new product listing
 */
router.post('/products', auth_1.authenticateToken, (0, validation_1.validateRequest)(validateProductListing), async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found in request'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const productData = req.body;
        const userId = req.user._id.toString();
        const product = await marketplaceService_1.MarketplaceService.createListing(productData, userId);
        res.status(201).json({
            success: true,
            data: {
                product
            },
            message: 'Product listing created successfully'
        });
    }
    catch (error) {
        console.error('Product creation error:', error);
        if (error instanceof Error && error.message === 'User not found or inactive') {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found or inactive'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'PRODUCT_CREATION_FAILED',
                message: 'Failed to create product listing'
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
});
/**
 * GET /api/marketplace/products
 * Search products with filters
 */
router.get('/products', async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            subcategory: req.query.subcategory,
            state: req.query.state,
            district: req.query.district,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
            searchTerm: req.query.search,
            sortBy: req.query.sortBy || 'date',
            sortOrder: req.query.sortOrder || 'desc',
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 20
        };
        const result = await marketplaceService_1.MarketplaceService.searchProducts(filters);
        res.json({
            success: true,
            data: result,
            message: 'Products retrieved successfully'
        });
    }
    catch (error) {
        console.error('Product search error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PRODUCT_SEARCH_FAILED',
                message: 'Failed to search products'
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
});
/**
 * GET /api/marketplace/products/:id
 * Get product details by ID
 */
router.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        // Validate product ID
        const idValidation = validateProductId(productId);
        if (!idValidation.isValid) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PRODUCT_ID',
                    message: 'Invalid product ID format',
                    details: idValidation.errors
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const product = await marketplaceService_1.MarketplaceService.getProductDetails(productId);
        if (!product) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'PRODUCT_NOT_FOUND',
                    message: 'Product not found'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        res.json({
            success: true,
            data: {
                product
            },
            message: 'Product details retrieved successfully'
        });
    }
    catch (error) {
        console.error('Product details error:', error);
        if (error instanceof Error && error.message === 'Invalid product ID') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PRODUCT_ID',
                    message: 'Invalid product ID format'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'PRODUCT_DETAILS_FAILED',
                message: 'Failed to retrieve product details'
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
});
/**
 * PUT /api/marketplace/products/:id
 * Update product listing
 */
router.put('/products/:id', auth_1.authenticateToken, (0, validation_1.validateRequest)(validateProductUpdate), async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found in request'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const productId = req.params.id;
        // Validate product ID
        const idValidation = validateProductId(productId);
        if (!idValidation.isValid) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PRODUCT_ID',
                    message: 'Invalid product ID format',
                    details: idValidation.errors
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const updates = req.body;
        const userId = req.user._id.toString();
        const product = await marketplaceService_1.MarketplaceService.updateListing(productId, updates, userId);
        if (!product) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'PRODUCT_NOT_FOUND',
                    message: 'Product not found or you do not have permission to update it'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        res.json({
            success: true,
            data: {
                product
            },
            message: 'Product listing updated successfully'
        });
    }
    catch (error) {
        console.error('Product update error:', error);
        if (error instanceof Error && error.message.includes('not found or you do not have permission')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'PERMISSION_DENIED',
                    message: 'You do not have permission to update this product'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'PRODUCT_UPDATE_FAILED',
                message: 'Failed to update product listing'
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
});
/**
 * DELETE /api/marketplace/products/:id
 * Delete product listing (soft delete)
 */
router.delete('/products/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found in request'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const productId = req.params.id;
        // Validate product ID
        const idValidation = validateProductId(productId);
        if (!idValidation.isValid) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PRODUCT_ID',
                    message: 'Invalid product ID format',
                    details: idValidation.errors
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const userId = req.user._id.toString();
        const deleted = await marketplaceService_1.MarketplaceService.deleteListing(productId, userId);
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'PRODUCT_NOT_FOUND',
                    message: 'Product not found or you do not have permission to delete it'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        res.json({
            success: true,
            data: null,
            message: 'Product listing deleted successfully'
        });
    }
    catch (error) {
        console.error('Product deletion error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PRODUCT_DELETION_FAILED',
                message: 'Failed to delete product listing'
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
});
/**
 * GET /api/marketplace/my-products
 * Get current user's product listings
 */
router.get('/my-products', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found in request'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const userId = req.user._id.toString();
        const includeInactive = req.query.includeInactive === 'true';
        const products = await marketplaceService_1.MarketplaceService.getUserListings(userId, includeInactive);
        res.json({
            success: true,
            data: {
                products,
                count: products.length
            },
            message: 'User products retrieved successfully'
        });
    }
    catch (error) {
        console.error('User products error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'USER_PRODUCTS_FAILED',
                message: 'Failed to retrieve user products'
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
});
/**
 * GET /api/marketplace/categories/:category
 * Get products by category
 */
router.get('/categories/:category', async (req, res) => {
    try {
        const category = req.params.category;
        // Validate category
        const validCategories = ['crops', 'seeds', 'tools', 'fertilizers'];
        if (!validCategories.includes(category)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CATEGORY',
                    message: 'Category must be one of: crops, seeds, tools, fertilizers'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const products = await marketplaceService_1.MarketplaceService.getProductsByCategory(category, limit);
        res.json({
            success: true,
            data: {
                products,
                category,
                count: products.length
            },
            message: `Products in ${category} category retrieved successfully`
        });
    }
    catch (error) {
        console.error('Category products error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CATEGORY_PRODUCTS_FAILED',
                message: 'Failed to retrieve products by category'
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
});
/**
 * GET /api/marketplace/nearby
 * Get nearby products based on location
 */
router.get('/nearby', async (req, res) => {
    try {
        const latitude = parseFloat(req.query.latitude);
        const longitude = parseFloat(req.query.longitude);
        const radius = req.query.radius ? parseFloat(req.query.radius) : 50;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        // Validate coordinates
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_LATITUDE',
                    message: 'Valid latitude is required (between -90 and 90)'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_LONGITUDE',
                    message: 'Valid longitude is required (between -180 and 180)'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        const products = await marketplaceService_1.MarketplaceService.getNearbyProducts(latitude, longitude, radius, limit);
        res.json({
            success: true,
            data: {
                products,
                location: { latitude, longitude },
                radius,
                count: products.length
            },
            message: 'Nearby products retrieved successfully'
        });
    }
    catch (error) {
        console.error('Nearby products error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'NEARBY_PRODUCTS_FAILED',
                message: 'Failed to retrieve nearby products'
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
});
exports.default = router;
//# sourceMappingURL=marketplace.js.map