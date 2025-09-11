import { Order, IOrder, IOrderItem } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Interface for creating an order
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

// Interface for order filters
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

// Interface for order update
export interface OrderUpdateData {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
}

export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(orderData: CreateOrderData, dealerId: string): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify dealer exists
      const dealer = await User.findById(dealerId).session(session);
      if (!dealer || !dealer.isActive) {
        throw new Error('Dealer not found or inactive');
      }

      // Verify farmer exists
      const farmer = await User.findById(orderData.farmerId).session(session);
      if (!farmer || !farmer.isActive) {
        throw new Error('Farmer not found or inactive');
      }

      // Verify products exist and calculate order items
      const orderItems: IOrderItem[] = [];
      let totalAmount = 0;

      for (const productOrder of orderData.products) {
        const product = await Product.findOne({
          _id: productOrder.productId,
          sellerId: orderData.farmerId,
          isActive: true
        }).session(session);

        if (!product) {
          throw new Error(`Product ${productOrder.productId} not found or not available`);
        }

        // Check if enough quantity is available
        if (product.quantity < productOrder.quantity) {
          throw new Error(`Insufficient quantity for product ${product.name}. Available: ${product.quantity}, Requested: ${productOrder.quantity}`);
        }

        const totalPrice = productOrder.quantity * product.price;
        totalAmount += totalPrice;

        orderItems.push({
          productId: product._id as mongoose.Types.ObjectId,
          quantity: productOrder.quantity,
          pricePerUnit: product.price,
          totalPrice: totalPrice
        });

        // Update product quantity
        product.quantity -= productOrder.quantity;
        if (product.quantity === 0) {
          product.isActive = false; // Mark as sold out
        }
        await product.save({ session });
      }

      // Create the order
      const order = new Order({
        dealerId,
        farmerId: orderData.farmerId,
        products: orderItems,
        totalAmount,
        deliveryAddress: {
          ...orderData.deliveryAddress,
          country: orderData.deliveryAddress.country || 'India'
        },
        notes: orderData.notes,
        paymentMethod: orderData.paymentMethod
      });

      // Calculate delivery estimate (7 days by default)
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 7);
      order.expectedDeliveryDate = estimatedDate;

      await order.save({ session });

      await session.commitTransaction();

      // Populate order details
      await order.populate([
        { path: 'dealer', select: 'name phone email' },
        { path: 'farmer', select: 'name phone email location' },
        { path: 'products.productId', select: 'name category unit images' }
      ]);

      return order;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error creating order:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string, userId?: string): Promise<IOrder | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID');
      }

      const query: any = { _id: orderId };
      
      // If userId is provided, ensure user has access to this order
      if (userId) {
        query.$or = [
          { dealerId: userId },
          { farmerId: userId }
        ];
      }

      const order = await Order.findOne(query)
        .populate('dealer', 'name phone email')
        .populate('farmer', 'name phone email location')
        .populate('products.productId', 'name category unit images');

      return order;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      throw error;
    }
  }

  /**
   * Update order status and details
   */
  static async updateOrder(
    orderId: string, 
    updates: OrderUpdateData, 
    userId: string
  ): Promise<IOrder | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID');
      }

      // Find order and verify user has permission to update
      const order = await Order.findOne({
        _id: orderId,
        $or: [
          { dealerId: userId },
          { farmerId: userId }
        ]
      });

      if (!order) {
        throw new Error('Order not found or you do not have permission to update it');
      }

      // Apply updates
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof OrderUpdateData] !== undefined) {
          (order as any)[key] = updates[key as keyof OrderUpdateData];
        }
      });

      // Set actual delivery date if status is delivered
      if (updates.status === 'delivered' && !updates.actualDeliveryDate) {
        order.actualDeliveryDate = new Date();
      }

      await order.save();

      // Populate order details
      await order.populate([
        { path: 'dealer', select: 'name phone email' },
        { path: 'farmer', select: 'name phone email location' },
        { path: 'products.productId', select: 'name category unit images' }
      ]);

      return order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Get orders with filters
   */
  static async getOrders(filters: OrderFilters): Promise<{
    orders: IOrder[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const {
        status,
        paymentStatus,
        farmerId,
        dealerId,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = filters;

      // Build query
      const query: any = {};

      if (status) {
        query.status = status;
      }

      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }

      if (farmerId) {
        query.farmerId = farmerId;
      }

      if (dealerId) {
        query.dealerId = dealerId;
      }

      if (startDate || endDate) {
        query.orderDate = {};
        if (startDate) {
          query.orderDate.$gte = startDate;
        }
        if (endDate) {
          query.orderDate.$lte = endDate;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [orders, totalCount] = await Promise.all([
        Order.find(query)
          .populate('dealer', 'name phone email')
          .populate('farmer', 'name phone email location')
          .populate('products.productId', 'name category unit images')
          .sort({ orderDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        orders: orders as IOrder[],
        totalCount,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  /**
   * Get dealer's orders
   */
  static async getDealerOrders(
    dealerId: string, 
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    orders: IOrder[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const query: any = { dealerId };
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [orders, totalCount] = await Promise.all([
        Order.find(query)
          .populate('farmer', 'name phone email location')
          .populate('products.productId', 'name category unit images')
          .sort({ orderDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        orders: orders as IOrder[],
        totalCount,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      console.error('Error getting dealer orders:', error);
      throw error;
    }
  }

  /**
   * Get farmer's orders
   */
  static async getFarmerOrders(
    farmerId: string, 
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    orders: IOrder[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const query: any = { farmerId };
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [orders, totalCount] = await Promise.all([
        Order.find(query)
          .populate('dealer', 'name phone email')
          .populate('products.productId', 'name category unit images')
          .sort({ orderDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        orders: orders as IOrder[],
        totalCount,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      console.error('Error getting farmer orders:', error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, userId: string, reason?: string): Promise<IOrder | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID');
      }

      // Find order and verify user has permission
      const order = await Order.findOne({
        _id: orderId,
        $or: [
          { dealerId: userId },
          { farmerId: userId }
        ]
      }).session(session);

      if (!order) {
        throw new Error('Order not found or you do not have permission to cancel it');
      }

      // Check if order can be cancelled
      if (['delivered', 'cancelled'].includes(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }

      // Restore product quantities
      for (const item of order.products) {
        const product = await Product.findById(item.productId).session(session);
        if (product) {
          product.quantity += item.quantity;
          product.isActive = true; // Reactivate if it was sold out
          await product.save({ session });
        }
      }

      // Update order status
      order.status = 'cancelled';
      if (reason) {
        order.notes = order.notes ? `${order.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
      }

      await order.save({ session });
      await session.commitTransaction();

      // Populate order details
      await order.populate([
        { path: 'dealer', select: 'name phone email' },
        { path: 'farmer', select: 'name phone email location' },
        { path: 'products.productId', select: 'name category unit images' }
      ]);

      return order;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error cancelling order:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get order statistics for a user
   */
  static async getOrderStatistics(userId: string, userType: 'dealer' | 'farmer'): Promise<{
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalAmount: number;
  }> {
    try {
      const userField = userType === 'dealer' ? 'dealerId' : 'farmerId';
      
      const stats = await Order.aggregate([
        { $match: { [userField]: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            confirmedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            },
            shippedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);

      return stats[0] || {
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalAmount: 0
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      throw error;
    }
  }
}