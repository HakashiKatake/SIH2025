"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceService = void 0;
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
class MarketplaceService {
    /**
     * Create a new product listing
     */
    static async createListing(productData, userId) {
        try {
            // Verify user exists
            const user = await User_1.User.findById(userId);
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }
            // Create product
            const product = new Product_1.Product({
                ...productData,
                sellerId: userId
            });
            await product.save();
            // Populate seller information
            await product.populate('seller', 'name phone location.state location.district');
            return product;
        }
        catch (error) {
            console.error('Error creating product listing:', error);
            throw error;
        }
    }
    /**
     * Search products with filters
     */
    static async searchProducts(filters) {
        try {
            const { category, subcategory, state, district, minPrice, maxPrice, searchTerm, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 20 } = filters;
            // Build query
            const query = { isActive: true };
            if (category) {
                query.category = category;
            }
            if (subcategory) {
                query.subcategory = subcategory;
            }
            if (state) {
                query['location.state'] = state;
            }
            if (district) {
                query['location.district'] = district;
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                query.price = {};
                if (minPrice !== undefined) {
                    query.price.$gte = minPrice;
                }
                if (maxPrice !== undefined) {
                    query.price.$lte = maxPrice;
                }
            }
            // Handle text search
            if (searchTerm) {
                query.$text = { $search: searchTerm };
            }
            // Build sort criteria
            let sortCriteria = {};
            switch (sortBy) {
                case 'price':
                    sortCriteria.price = sortOrder === 'asc' ? 1 : -1;
                    break;
                case 'name':
                    sortCriteria.name = sortOrder === 'asc' ? 1 : -1;
                    break;
                case 'date':
                default:
                    sortCriteria.createdAt = sortOrder === 'asc' ? 1 : -1;
                    break;
            }
            // Add text search score sorting if search term is provided
            if (searchTerm) {
                sortCriteria.score = { $meta: 'textScore' };
            }
            // Calculate pagination
            const skip = (page - 1) * limit;
            // Execute query with pagination
            const [products, totalCount] = await Promise.all([
                Product_1.Product.find(query)
                    .populate('seller', 'name phone location.state location.district')
                    .sort(sortCriteria)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Product_1.Product.countDocuments(query)
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                products: products,
                totalCount,
                currentPage: page,
                totalPages
            };
        }
        catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }
    /**
     * Get product details by ID
     */
    static async getProductDetails(productId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
                throw new Error('Invalid product ID');
            }
            const product = await Product_1.Product.findOne({
                _id: productId,
                isActive: true
            }).populate('seller', 'name phone location.state location.district');
            return product;
        }
        catch (error) {
            console.error('Error getting product details:', error);
            throw error;
        }
    }
    /**
     * Update product listing
     */
    static async updateListing(productId, updates, userId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
                throw new Error('Invalid product ID');
            }
            // Find product and verify ownership
            const product = await Product_1.Product.findOne({
                _id: productId,
                sellerId: userId,
                isActive: true
            });
            if (!product) {
                throw new Error('Product not found or you do not have permission to update it');
            }
            // Apply updates
            Object.keys(updates).forEach(key => {
                if (updates[key] !== undefined) {
                    product[key] = updates[key];
                }
            });
            await product.save();
            // Populate seller information
            await product.populate('seller', 'name phone location.state location.district');
            return product;
        }
        catch (error) {
            console.error('Error updating product listing:', error);
            throw error;
        }
    }
    /**
     * Delete product listing (soft delete)
     */
    static async deleteListing(productId, userId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
                throw new Error('Invalid product ID');
            }
            const result = await Product_1.Product.updateOne({ _id: productId, sellerId: userId, isActive: true }, { isActive: false });
            return result.modifiedCount > 0;
        }
        catch (error) {
            console.error('Error deleting product listing:', error);
            throw error;
        }
    }
    /**
     * Get user's product listings
     */
    static async getUserListings(userId, includeInactive = false) {
        try {
            const query = { sellerId: userId };
            if (!includeInactive) {
                query.isActive = true;
            }
            const products = await Product_1.Product.find(query)
                .sort({ createdAt: -1 })
                .lean();
            return products;
        }
        catch (error) {
            console.error('Error getting user listings:', error);
            throw error;
        }
    }
    /**
     * Get products by category
     */
    static async getProductsByCategory(category, limit = 20) {
        try {
            const products = await Product_1.Product.find({
                category,
                isActive: true
            })
                .populate('seller', 'name location.state location.district')
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            return products;
        }
        catch (error) {
            console.error('Error getting products by category:', error);
            throw error;
        }
    }
    /**
     * Get nearby products based on location
     */
    static async getNearbyProducts(latitude, longitude, radiusKm = 50, limit = 20) {
        try {
            // Simple distance calculation using MongoDB aggregation
            // For production, consider using MongoDB's geospatial queries
            const products = await Product_1.Product.find({ isActive: true })
                .populate('seller', 'name location.state location.district')
                .sort({ createdAt: -1 })
                .limit(limit * 2) // Get more to filter by distance
                .lean();
            // Filter by approximate distance (simple calculation)
            const nearbyProducts = products.filter(product => {
                const distance = this.calculateDistance(latitude, longitude, product.location.latitude, product.location.longitude);
                return distance <= radiusKm;
            });
            return nearbyProducts.slice(0, limit);
        }
        catch (error) {
            console.error('Error getting nearby products:', error);
            throw error;
        }
    }
    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    /**
     * Convert degrees to radians
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}
exports.MarketplaceService = MarketplaceService;
//# sourceMappingURL=marketplaceService.js.map