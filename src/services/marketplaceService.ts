import { Product, IProduct } from '../models/Product';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Interface for product search filters
export interface SearchFilters {
  category?: string;
  subcategory?: string;
  state?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  sortBy?: 'price' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Interface for product listing creation
export interface ProductListing {
  name: string;
  category: 'crops' | 'seeds' | 'tools' | 'fertilizers';
  subcategory?: string;
  price: number;
  quantity: number;
  unit: string;
  description: string;
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
}

export class MarketplaceService {
  /**
   * Create a new product listing
   */
  static async createListing(productData: ProductListing, userId: string): Promise<IProduct> {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Create product
      const product = new Product({
        ...productData,
        sellerId: userId
      });

      await product.save();
      
      // Populate seller information
      await product.populate('seller', 'name phone location.state location.district');
      
      return product;
    } catch (error) {
      console.error('Error creating product listing:', error);
      throw error;
    }
  }

  /**
   * Search products with filters
   */
  static async searchProducts(filters: SearchFilters): Promise<{
    products: IProduct[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const {
        category,
        subcategory,
        state,
        district,
        minPrice,
        maxPrice,
        searchTerm,
        sortBy = 'date',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = filters;

      // Build query
      const query: any = { isActive: true };

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
      let sortCriteria: any = {};
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
        Product.find(query)
          .populate('seller', 'name phone location.state location.district')
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        products: products as IProduct[],
        totalCount,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get product details by ID
   */
  static async getProductDetails(productId: string): Promise<IProduct | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
      }

      const product = await Product.findOne({ 
        _id: productId, 
        isActive: true 
      }).populate('seller', 'name phone location.state location.district');

      return product;
    } catch (error) {
      console.error('Error getting product details:', error);
      throw error;
    }
  }

  /**
   * Update product listing
   */
  static async updateListing(
    productId: string, 
    updates: Partial<ProductListing>, 
    userId: string
  ): Promise<IProduct | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
      }

      // Find product and verify ownership
      const product = await Product.findOne({ 
        _id: productId, 
        sellerId: userId, 
        isActive: true 
      });

      if (!product) {
        throw new Error('Product not found or you do not have permission to update it');
      }

      // Apply updates
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof ProductListing] !== undefined) {
          (product as any)[key] = updates[key as keyof ProductListing];
        }
      });

      await product.save();
      
      // Populate seller information
      await product.populate('seller', 'name phone location.state location.district');
      
      return product;
    } catch (error) {
      console.error('Error updating product listing:', error);
      throw error;
    }
  }

  /**
   * Delete product listing (soft delete)
   */
  static async deleteListing(productId: string, userId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
      }

      const result = await Product.updateOne(
        { _id: productId, sellerId: userId, isActive: true },
        { isActive: false }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error deleting product listing:', error);
      throw error;
    }
  }

  /**
   * Get user's product listings
   */
  static async getUserListings(
    userId: string, 
    includeInactive: boolean = false
  ): Promise<IProduct[]> {
    try {
      const query: any = { sellerId: userId };
      
      if (!includeInactive) {
        query.isActive = true;
      }

      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return products as IProduct[];
    } catch (error) {
      console.error('Error getting user listings:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    category: string, 
    limit: number = 20
  ): Promise<IProduct[]> {
    try {
      const products = await Product.find({ 
        category, 
        isActive: true 
      })
        .populate('seller', 'name location.state location.district')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return products as IProduct[];
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  /**
   * Get nearby products based on location
   */
  static async getNearbyProducts(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    limit: number = 20
  ): Promise<IProduct[]> {
    try {
      // Simple distance calculation using MongoDB aggregation
      // For production, consider using MongoDB's geospatial queries
      const products = await Product.find({ isActive: true })
        .populate('seller', 'name location.state location.district')
        .sort({ createdAt: -1 })
        .limit(limit * 2) // Get more to filter by distance
        .lean();

      // Filter by approximate distance (simple calculation)
      const nearbyProducts = products.filter(product => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          product.location.latitude,
          product.location.longitude
        );
        return distance <= radiusKm;
      });

      return nearbyProducts.slice(0, limit) as IProduct[];
    } catch (error) {
      console.error('Error getting nearby products:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}