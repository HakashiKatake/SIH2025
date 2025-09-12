import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderService } from '../services/marketplaceService';
import { Product, Order, OrderItem, OrderStatus } from '../types';

interface CartItem extends OrderItem {
  product: Product;
}

interface CartState {
  items: CartItem[];
  orders: Order[];
  isLoading: boolean;
  
  // Cart management
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  
  // Order management
  createOrder: (deliveryAddress: any, notes?: string, token?: string) => Promise<Order>;
  getOrders: (token: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, token?: string) => Promise<void>;
  
  // Cart persistence and validation
  saveCartToStorage: () => Promise<void>;
  loadCartFromStorage: () => Promise<void>;
  validateCartItems: (token?: string) => Promise<void>;
  
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orders: [],
  isLoading: false,

  addToCart: (product: Product, quantity: number) => {
    const { items } = get();
    
    // Validate quantity
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    
    // Check if product is available
    if (!product.isActive || product.quantity < quantity) {
      throw new Error('Product is not available in requested quantity');
    }
    
    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // Check if total quantity exceeds available stock
      if (newQuantity > product.quantity) {
        throw new Error(`Only ${product.quantity} units available`);
      }
      
      // Update quantity if item already exists
      set({
        items: items.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * item.pricePerUnit
              }
            : item
        )
      });
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: product.id,
        quantity,
        pricePerUnit: product.pricePerUnit || product.price,
        totalPrice: quantity * (product.pricePerUnit || product.price),
        product: {
          ...product,
          category: product.category,
          unit: product.unit,
          images: product.images || product.photos || []
        }
      };
      
      set({ items: [...items, newItem] });
    }
    
    // Auto-save to storage
    get().saveCartToStorage();
  },

  removeFromCart: (productId: string) => {
    const { items } = get();
    set({ items: items.filter(item => item.productId !== productId) });
    
    // Auto-save to storage
    get().saveCartToStorage();
  },

  updateQuantity: (productId: string, quantity: number) => {
    const { items } = get();
    
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    set({
      items: items.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              totalPrice: quantity * item.pricePerUnit
            }
          : item
      )
    });
    
    // Auto-save to storage
    get().saveCartToStorage();
  },

  clearCart: () => {
    set({ items: [] });
    
    // Auto-save to storage
    get().saveCartToStorage();
  },

  getTotalAmount: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.totalPrice, 0);
  },

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  createOrder: async (deliveryAddress: any, notes?: string, token?: string) => {
    const { items } = get();
    
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    set({ isLoading: true });

    try {
      // Prepare order data for API
      const orderData = {
        farmerId: items[0].product.sellerId, // Assuming all items are from same farmer for now
        products: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        deliveryAddress,
        notes: notes || '',
        paymentMethod: 'cash_on_delivery' // Default payment method
      };

      // If token is provided, make actual API call
      if (token) {
        try {
          const newOrder = await OrderService.createOrder(orderData);

          set(state => ({
            orders: [newOrder, ...state.orders],
            items: [], // Clear cart after successful order
            isLoading: false
          }));

          return newOrder;
        } catch (apiError) {
          console.error('API order creation failed:', apiError);
          // Fall back to local order creation
          throw apiError;
        }
      } else {
        // Create mock order for demo when no token provided
        const newOrder: Order = {
          id: Date.now().toString(),
          dealerId: 'current-dealer',
          farmerId: items[0].product.sellerId,
          products: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            totalPrice: item.totalPrice
          })),
          totalAmount: get().getTotalAmount() + 50, // Include shipping
          status: OrderStatus.PENDING,
          deliveryAddress,
          orderDate: new Date(),
          expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          notes: notes || ''
        };

        set(state => ({
          orders: [newOrder, ...state.orders],
          items: [], // Clear cart after order
          isLoading: false
        }));

        return newOrder;
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  getOrders: async (token: string) => {
    set({ isLoading: true });

    try {
      const orders = await OrderService.getDealerOrders();
      set({ orders, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch orders from API:', error);
      set({ isLoading: false });
      
      // Fall back to mock orders for demo
      const mockOrders: Order[] = [
        {
          id: '1',
          dealerId: 'current-dealer',
          farmerId: 'farmer1',
          products: [
            {
              productId: '1',
              quantity: 10,
              pricePerUnit: 25,
              totalPrice: 250
            }
          ],
          totalAmount: 300, // Including shipping
          status: OrderStatus.CONFIRMED,
          deliveryAddress: {
            address: 'Dealer Address',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            coordinates: { latitude: 12.9716, longitude: 77.5946 }
          },
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          notes: 'Fresh tomatoes needed'
        }
      ];

      set({ orders: mockOrders });
      
      // Re-throw error for UI handling
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus, token?: string) => {
    try {
      if (token) {
        const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
        
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId ? updatedOrder : order
          )
        }));
      } else {
        // Mock update for demo
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        }));
      }
    } catch (error: any) {
      console.error('Update order status failed:', error);
      
      // Mock update for demo on error
      set(state => ({
        orders: state.orders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      }));
      
      // Re-throw error for UI handling
      throw error;
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Cart persistence and validation
  saveCartToStorage: async () => {
    try {
      const { items } = get();
      await AsyncStorage.setItem('cart_items', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  },

  loadCartFromStorage: async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart_items');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        set({ items });
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
  },

  validateCartItems: async (token?: string) => {
    const { items } = get();
    
    if (items.length === 0) return;

    try {
      // If we have a token, validate against backend
      if (token) {
        // This would typically validate each product's availability
        // For now, we'll just check basic validation
        const validItems = items.filter(item => 
          item.quantity > 0 && 
          item.pricePerUnit > 0
        );
        
        if (validItems.length !== items.length) {
          set({ items: validItems });
          throw new Error('Some items in your cart are no longer available');
        }
      }
    } catch (error) {
      console.error('Cart validation failed:', error);
      throw error;
    }
  }
}));
