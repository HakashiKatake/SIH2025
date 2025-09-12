"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
class OrderService {
    /**
     * Create a new order
     */
    static async createOrder(orderData, dealerId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Verify dealer exists
            const dealer = await User_1.User.findById(dealerId).session(session);
            if (!dealer || !dealer.isActive) {
                throw new Error('Dealer not found or inactive');
            }
            // Verify farmer exists
            const farmer = await User_1.User.findById(orderData.farmerId).session(session);
            if (!farmer || !farmer.isActive) {
                throw new Error('Farmer not found or inactive');
            }
            // Verify products exist and calculate order items
            const orderItems = [];
            let totalAmount = 0;
            for (const productOrder of orderData.products) {
                const product = await Product_1.Product.findOne({
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
                    productId: product._id,
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
            const order = new Order_1.Order({
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
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error creating order:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * Get order by ID
     */
    static async getOrderById(orderId, userId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
                throw new Error('Invalid order ID');
            }
            const query = { _id: orderId };
            // If userId is provided, ensure user has access to this order
            if (userId) {
                query.$or = [
                    { dealerId: userId },
                    { farmerId: userId }
                ];
            }
            const order = await Order_1.Order.findOne(query)
                .populate('dealer', 'name phone email')
                .populate('farmer', 'name phone email location')
                .populate('products.productId', 'name category unit images');
            return order;
        }
        catch (error) {
            console.error('Error getting order by ID:', error);
            throw error;
        }
    }
    /**
     * Update order status and details
     */
    static async updateOrder(orderId, updates, userId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
                throw new Error('Invalid order ID');
            }
            // Find order and verify user has permission to update
            const order = await Order_1.Order.findOne({
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
                if (updates[key] !== undefined) {
                    order[key] = updates[key];
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
        }
        catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }
    /**
     * Get orders with filters
     */
    static async getOrders(filters) {
        try {
            const { status, paymentStatus, farmerId, dealerId, startDate, endDate, page = 1, limit = 20 } = filters;
            // Build query
            const query = {};
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
                Order_1.Order.find(query)
                    .populate('dealer', 'name phone email')
                    .populate('farmer', 'name phone email location')
                    .populate('products.productId', 'name category unit images')
                    .sort({ orderDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Order_1.Order.countDocuments(query)
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                orders: orders,
                totalCount,
                currentPage: page,
                totalPages
            };
        }
        catch (error) {
            console.error('Error getting orders:', error);
            throw error;
        }
    }
    /**
     * Get dealer's orders
     */
    static async getDealerOrders(dealerId, status, page = 1, limit = 20) {
        try {
            const query = { dealerId };
            if (status) {
                query.status = status;
            }
            const skip = (page - 1) * limit;
            const [orders, totalCount] = await Promise.all([
                Order_1.Order.find(query)
                    .populate('farmer', 'name phone email location')
                    .populate('products.productId', 'name category unit images')
                    .sort({ orderDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Order_1.Order.countDocuments(query)
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                orders: orders,
                totalCount,
                currentPage: page,
                totalPages
            };
        }
        catch (error) {
            console.error('Error getting dealer orders:', error);
            throw error;
        }
    }
    /**
     * Get farmer's orders
     */
    static async getFarmerOrders(farmerId, status, page = 1, limit = 20) {
        try {
            const query = { farmerId };
            if (status) {
                query.status = status;
            }
            const skip = (page - 1) * limit;
            const [orders, totalCount] = await Promise.all([
                Order_1.Order.find(query)
                    .populate('dealer', 'name phone email')
                    .populate('products.productId', 'name category unit images')
                    .sort({ orderDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Order_1.Order.countDocuments(query)
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                orders: orders,
                totalCount,
                currentPage: page,
                totalPages
            };
        }
        catch (error) {
            console.error('Error getting farmer orders:', error);
            throw error;
        }
    }
    /**
     * Cancel order
     */
    static async cancelOrder(orderId, userId, reason) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
                throw new Error('Invalid order ID');
            }
            // Find order and verify user has permission
            const order = await Order_1.Order.findOne({
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
                const product = await Product_1.Product.findById(item.productId).session(session);
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
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error cancelling order:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * Get order statistics for a user
     */
    static async getOrderStatistics(userId, userType) {
        try {
            const userField = userType === 'dealer' ? 'dealerId' : 'farmerId';
            const stats = await Order_1.Order.aggregate([
                { $match: { [userField]: new mongoose_1.default.Types.ObjectId(userId) } },
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
        }
        catch (error) {
            console.error('Error getting order statistics:', error);
            throw error;
        }
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=orderService.js.map