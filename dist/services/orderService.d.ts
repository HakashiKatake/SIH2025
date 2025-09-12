import { IOrder } from '../models/Order';
export interface CreateOrderData {
    farmerId: string;
    products: {
        productId: string;
        quantity: number;
    }[];
    deliveryAddress: {
        address: string;
        city: string;
        state: string;
        country?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    notes?: string;
    paymentMethod?: string;
}
export interface OrderFilters {
    status?: string;
    paymentStatus?: string;
    farmerId?: string;
    dealerId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
export interface OrderUpdateData {
    status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
    trackingNumber?: string;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    notes?: string;
}
export declare class OrderService {
    /**
     * Create a new order
     */
    static createOrder(orderData: CreateOrderData, dealerId: string): Promise<IOrder>;
    /**
     * Get order by ID
     */
    static getOrderById(orderId: string, userId?: string): Promise<IOrder | null>;
    /**
     * Update order status and details
     */
    static updateOrder(orderId: string, updates: OrderUpdateData, userId: string): Promise<IOrder | null>;
    /**
     * Get orders with filters
     */
    static getOrders(filters: OrderFilters): Promise<{
        orders: IOrder[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
    }>;
    /**
     * Get dealer's orders
     */
    static getDealerOrders(dealerId: string, status?: string, page?: number, limit?: number): Promise<{
        orders: IOrder[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
    }>;
    /**
     * Get farmer's orders
     */
    static getFarmerOrders(farmerId: string, status?: string, page?: number, limit?: number): Promise<{
        orders: IOrder[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
    }>;
    /**
     * Cancel order
     */
    static cancelOrder(orderId: string, userId: string, reason?: string): Promise<IOrder | null>;
    /**
     * Get order statistics for a user
     */
    static getOrderStatistics(userId: string, userType: 'dealer' | 'farmer'): Promise<{
        totalOrders: number;
        pendingOrders: number;
        confirmedOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        totalAmount: number;
    }>;
}
//# sourceMappingURL=orderService.d.ts.map