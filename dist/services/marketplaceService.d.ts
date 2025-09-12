import { IProduct } from '../models/Product';
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
export declare class MarketplaceService {
    /**
     * Create a new product listing
     */
    static createListing(productData: ProductListing, userId: string): Promise<IProduct>;
    /**
     * Search products with filters
     */
    static searchProducts(filters: SearchFilters): Promise<{
        products: IProduct[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
    }>;
    /**
     * Get product details by ID
     */
    static getProductDetails(productId: string): Promise<IProduct | null>;
    /**
     * Update product listing
     */
    static updateListing(productId: string, updates: Partial<ProductListing>, userId: string): Promise<IProduct | null>;
    /**
     * Delete product listing (soft delete)
     */
    static deleteListing(productId: string, userId: string): Promise<boolean>;
    /**
     * Get user's product listings
     */
    static getUserListings(userId: string, includeInactive?: boolean): Promise<IProduct[]>;
    /**
     * Get products by category
     */
    static getProductsByCategory(category: string, limit?: number): Promise<IProduct[]>;
    /**
     * Get nearby products based on location
     */
    static getNearbyProducts(latitude: number, longitude: number, radiusKm?: number, limit?: number): Promise<IProduct[]>;
    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    private static calculateDistance;
    /**
     * Convert degrees to radians
     */
    private static toRadians;
}
//# sourceMappingURL=marketplaceService.d.ts.map