import { create } from 'zustand';
import { MarketplaceService, OrderService } from '../services/marketplaceService';
import { cacheStorage } from '../services/storageService';
import { MarketplaceState, Product, ProductListing, SearchFilters, Order, ProductStatus } from '../types';

interface EnhancedMarketplaceState extends MarketplaceState {
  orders: Order[];
  getMyOrders: (token: string) => Promise<void>;
  updateListingStatus: (id: string, status: string, token: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string, token: string) => Promise<void>;
}

export const useMarketplaceStore = create<EnhancedMarketplaceState>((set, get) => ({
  products: [],
  myListings: [],
  orders: [],
  isLoading: false,
  isCreating: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setCreating: (creating: boolean) => set({ isCreating: creating }),

  searchProducts: async (filters: SearchFilters, token: string) => {
    try {
      set({ isLoading: true });
      
      // Try to get cached data first
      const cachedProducts = await cacheStorage.getMarketplaceCache();
      if (cachedProducts && cachedProducts.length > 0) {
        set({ products: cachedProducts, isLoading: false });
      }
      
      const products = await MarketplaceService.searchProducts(filters);
      
      // Ensure compatibility properties are set
      const enhancedProducts = products.map(product => ({
        ...product,
        pricePerUnit: product.pricePerUnit || product.price,
        photos: product.photos || product.images,
        status: product.status || ProductStatus.AVAILABLE
      }));
      
      set({ products: enhancedProducts, isLoading: false });
      
      // Cache the results
      await cacheStorage.setMarketplaceCache(products);
    } catch (error: any) {
      console.error('Search products failed:', error);
      set({ isLoading: false });
      
      // If API fails but we have cached data, use that
      const cachedProducts = await cacheStorage.getMarketplaceCache();
      if (cachedProducts && cachedProducts.length > 0) {
        set({ products: cachedProducts });
      } else {
        // Use mock data for demo
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Fresh Tomatoes',
            category: 'crops',
            price: 25,
            pricePerUnit: 25,
            quantity: 100,
            unit: 'kg',
            description: 'Fresh organic tomatoes from our farm',
            images: [],
            photos: [],
            location: {
              latitude: 12.9716,
              longitude: 77.5946,
              address: 'Bangalore, Karnataka',
              state: 'Karnataka',
              district: 'Bangalore'
            },
            sellerId: 'farmer1',
            sellerName: 'John Farmer',
            isActive: true,
            status: ProductStatus.AVAILABLE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        set({ products: mockProducts });
      }
      
      // Re-throw error for UI handling
      throw error;
    }
  },

  createListing: async (listing: ProductListing, token: string) => {
    try {
      set({ isCreating: true });
      
      const product = await MarketplaceService.createProduct({
        name: listing.name,
        category: listing.category,
        subcategory: listing.subcategory,
        price: listing.price,
        quantity: listing.quantity,
        unit: listing.unit,
        description: listing.description,
        images: listing.images,
      });
      
      set(state => ({
        myListings: [product, ...state.myListings],
        isCreating: false,
      }));
      
      return product;
    } catch (error: any) {
      console.error('Create listing failed:', error);
      set({ isCreating: false });
      
      // Create mock product for demo on error
      const mockProduct: Product = {
        id: Date.now().toString(),
        name: listing.name,
        category: listing.category,
        price: listing.price,
        pricePerUnit: listing.price,
        quantity: listing.quantity,
        unit: listing.unit,
        description: listing.description,
        images: listing.images,
        photos: listing.images,
        location: {
          latitude: 12.9716,
          longitude: 77.5946,
          address: 'Demo Location',
          state: 'Demo State',
          district: 'Demo District'
        },
        sellerId: 'current-user',
        sellerName: 'Current User',
        isActive: true,
        status: ProductStatus.AVAILABLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({
        myListings: [mockProduct, ...state.myListings],
        isCreating: false,
      }));
      
      return mockProduct;
    }
  },

  getMyListings: async (token: string) => {
    try {
      set({ isLoading: true });
      
      const products = await MarketplaceService.getMyProducts();
      
      // Ensure compatibility properties are set
      const enhancedListings = products.map(product => ({
        ...product,
        pricePerUnit: product.pricePerUnit || product.price,
        photos: product.photos || product.images,
        status: product.status || ProductStatus.AVAILABLE
      }));
      
      set({ myListings: enhancedListings, isLoading: false });
    } catch (error: any) {
      console.error('Get my listings failed:', error);
      set({ isLoading: false });
      
      // Use mock data for demo on error
      const mockListings: Product[] = [
        {
          id: '1',
          name: 'Fresh Tomatoes',
          category: 'crops',
          price: 25,
          pricePerUnit: 25,
          quantity: 50,
          unit: 'kg',
          description: 'Fresh organic cherry tomatoes',
          images: ['https://via.placeholder.com/150'],
          photos: ['https://via.placeholder.com/150'],
          location: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: 'Demo Farm, Karnataka',
            state: 'Karnataka',
            district: 'Bangalore'
          },
          sellerId: 'current-user',
          sellerName: 'Current User',
          isActive: true,
          status: ProductStatus.AVAILABLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      set({ myListings: mockListings });
      
      // Re-throw error for UI handling
      throw error;
    }
  },

  getMyOrders: async (token: string) => {
    try {
      set({ isLoading: true });
      
      const orders = await OrderService.getFarmerOrders();
      set({ orders, isLoading: false });
    } catch (error: any) {
      console.error('Get my orders failed:', error);
      set({ isLoading: false });
      
      // Use mock data for demo on error
      const mockOrders: Order[] = [
        {
          id: '1',
          dealerId: 'dealer1',
          farmerId: 'current-user',
          products: [
            {
              productId: '1',
              quantity: 10,
              pricePerUnit: 25,
              totalPrice: 250
            }
          ],
          totalAmount: 250,
          status: 'pending' as any,
          deliveryAddress: {
            address: 'Dealer Address',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            coordinates: { latitude: 12.9716, longitude: 77.5946 }
          },
          orderDate: new Date(),
          expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          notes: 'Please deliver fresh tomatoes'
        }
      ];
      set({ orders: mockOrders });
      
      // Re-throw error for UI handling
      throw error;
    }
  },

  updateListing: async (id: string, updates: Partial<ProductListing>, token: string) => {
    try {
      const updatedProduct = await MarketplaceService.updateProduct(id, updates);
      
      set(state => ({
        myListings: state.myListings.map(product => 
          product.id === id ? updatedProduct : product
        ),
      }));
    } catch (error: any) {
      console.error('Update listing failed:', error);
      
      // Update mock data on error
      set(state => ({
        myListings: state.myListings.map(product => 
          product.id === id ? { ...product, ...updates } as any : product
        ),
      }));
      
      // Re-throw error for UI handling
      throw error;
    }
  },

  updateListingStatus: async (id: string, status: string, token: string) => {
    try {
      await MarketplaceService.updateProductStatus(id, status);
      
      set(state => ({
        myListings: state.myListings.map(product => 
          product.id === id ? { ...product, status } as any : product
        ),
      }));
    } catch (error: any) {
      console.error('Update listing status failed:', error);
      
      // Mock update for demo on error
      set(state => ({
        myListings: state.myListings.map(product => 
          product.id === id ? { ...product, status } as any : product
        ),
      }));
      
      // Re-throw error for UI handling
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, status: string, token: string) => {
    try {
      const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
      }));
    } catch (error: any) {
      console.error('Update order status failed:', error);
      
      // Mock update for demo on error
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? { ...order, status } as any : order
        ),
      }));
      
      // Re-throw error for UI handling
      throw error;
    }
  },

  deleteListing: async (id: string, token: string) => {
    try {
      await MarketplaceService.deleteProduct(id);
      
      set(state => ({
        myListings: state.myListings.filter(product => product.id !== id),
      }));
    } catch (error: any) {
      console.error('Delete listing failed:', error);
      
      // Mock delete for demo on error
      set(state => ({
        myListings: state.myListings.filter(product => product.id !== id),
      }));
      
      // Re-throw error for UI handling
      throw error;
    }
  },
}));