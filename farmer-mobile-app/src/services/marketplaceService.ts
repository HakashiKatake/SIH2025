import { api } from './apiClient';
import { Product, ProductListing, SearchFilters, Order, OrderItem } from '../types';

export interface CreateProductRequest {
  name: string;
  category: 'crops' | 'seeds' | 'tools' | 'fertilizers';
  subcategory?: string;
  price: number;
  quantity: number;
  unit: string;
  description: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
}

export interface CreateOrderRequest {
  farmerId: string;
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  notes?: string;
  paymentMethod?: string;
}

export interface OrderResponse {
  order: Order;
}

export class MarketplaceService {
  /**
   * Search and filter products
   */
  static async searchProducts(filters: SearchFilters): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.subcategory) queryParams.append('subcategory', filters.subcategory);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      
      if (filters.location) {
        queryParams.append('lat', filters.location.latitude.toString());
        queryParams.append('lon', filters.location.longitude.toString());
        queryParams.append('radius', filters.location.radius.toString());
      }

      const response = await api.get<Product[]>(`/marketplace/products?${queryParams}`);
      
      // Ensure compatibility properties are set
      return response.map(product => ({
        ...product,
        pricePerUnit: product.pricePerUnit || product.price,
        photos: product.photos || product.images,
      }));
    } catch (error: any) {
      console.error('Search products error:', error);
      
      if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to search products.');
      }
    }
  }

  /**
   * Get product by ID
   */
  static async getProduct(productId: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`/marketplace/products/${productId}`);
      
      return {
        ...response,
        pricePerUnit: response.pricePerUnit || response.price,
        photos: response.photos || response.images,
      };
    } catch (error: any) {
      console.error('Get product error:', error);
      
      if (error.status === 404) {
        throw new Error('Product not found.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load product.');
      }
    }
  }

  /**
   * Create new product listing (for farmers)
   */
  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const response = await api.post<Product>('/marketplace/products', productData);
      
      return {
        ...response,
        pricePerUnit: response.pricePerUnit || response.price,
        photos: response.photos || response.images,
      };
    } catch (error: any) {
      console.error('Create product error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid product data. Please check all fields and try again.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to create product listing.');
      }
    }
  }

  /**
   * Get farmer's own product listings
   */
  static async getMyProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/marketplace/my-products');
      
      return response.map(product => ({
        ...product,
        pricePerUnit: product.pricePerUnit || product.price,
        photos: product.photos || product.images,
      }));
    } catch (error: any) {
      console.error('Get my products error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load your products.');
      }
    }
  }

  /**
   * Update product listing
   */
  static async updateProduct(productId: string, updates: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const response = await api.put<Product>(`/marketplace/products/${productId}`, updates);
      
      return {
        ...response,
        pricePerUnit: response.pricePerUnit || response.price,
        photos: response.photos || response.images,
      };
    } catch (error: any) {
      console.error('Update product error:', error);
      
      if (error.status === 404) {
        throw new Error('Product not found.');
      } else if (error.status === 403) {
        throw new Error('You can only update your own products.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update product.');
      }
    }
  }

  /**
   * Delete product listing
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      await api.delete(`/marketplace/products/${productId}`);
    } catch (error: any) {
      console.error('Delete product error:', error);
      
      if (error.status === 404) {
        throw new Error('Product not found.');
      } else if (error.status === 403) {
        throw new Error('You can only delete your own products.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to delete product.');
      }
    }
  }

  /**
   * Update product status
   */
  static async updateProductStatus(productId: string, status: string): Promise<void> {
    try {
      await api.patch(`/marketplace/products/${productId}/status`, { status });
    } catch (error: any) {
      console.error('Update product status error:', error);
      
      if (error.status === 404) {
        throw new Error('Product not found.');
      } else if (error.status === 403) {
        throw new Error('You can only update your own products.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update product status.');
      }
    }
  }
}

export class OrderService {
  /**
   * Create new order (for dealers)
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await api.post<OrderResponse>('/orders', orderData);
      return response.order;
    } catch (error: any) {
      console.error('Create order error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid order data. Please check all fields and try again.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.status === 409) {
        throw new Error('Some products are no longer available in requested quantities.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to create order.');
      }
    }
  }

  /**
   * Get dealer's orders
   */
  static async getDealerOrders(): Promise<Order[]> {
    try {
      const response = await api.get<{ orders: Order[] }>('/orders/dealer/my-orders');
      return response.orders;
    } catch (error: any) {
      console.error('Get dealer orders error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load orders.');
      }
    }
  }

  /**
   * Get farmer's orders (orders for their products)
   */
  static async getFarmerOrders(): Promise<Order[]> {
    try {
      const response = await api.get<{ orders: Order[] }>('/orders/farmer/my-orders');
      return response.orders;
    } catch (error: any) {
      console.error('Get farmer orders error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load orders.');
      }
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await api.get<{ order: Order }>(`/orders/${orderId}`);
      return response.order;
    } catch (error: any) {
      console.error('Get order error:', error);
      
      if (error.status === 404) {
        throw new Error('Order not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load order.');
      }
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<Order> {
    try {
      const response = await api.patch<{ order: Order }>(`/orders/${orderId}/status`, { 
        status, 
        notes 
      });
      return response.order;
    } catch (error: any) {
      console.error('Update order status error:', error);
      
      if (error.status === 404) {
        throw new Error('Order not found.');
      } else if (error.status === 403) {
        throw new Error('You are not authorized to update this order.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update order status.');
      }
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await api.patch<{ order: Order }>(`/orders/${orderId}/cancel`, { 
        reason 
      });
      return response.order;
    } catch (error: any) {
      console.error('Cancel order error:', error);
      
      if (error.status === 404) {
        throw new Error('Order not found.');
      } else if (error.status === 403) {
        throw new Error('You are not authorized to cancel this order.');
      } else if (error.status === 400) {
        throw new Error('Order cannot be cancelled at this stage.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to cancel order.');
      }
    }
  }
}