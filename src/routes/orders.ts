import express, { Request, Response } from 'express';
import { OrderService, CreateOrderData, OrderFilters, OrderUpdateData } from '../services/orderService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, ValidationResult, ValidationError } from '../utils/validation';

const router = express.Router();

// Validation functions
const validateCreateOrder = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Farmer ID validation
  if (!data.farmerId || typeof data.farmerId !== 'string') {
    errors.push({ field: 'farmerId', message: 'Farmer ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(data.farmerId)) {
    errors.push({ field: 'farmerId', message: 'Invalid farmer ID format' });
  }

  // Products validation
  if (!Array.isArray(data.products) || data.products.length === 0) {
    errors.push({ field: 'products', message: 'At least one product is required' });
  } else {
    data.products.forEach((product: any, index: number) => {
      if (!product.productId || typeof product.productId !== 'string') {
        errors.push({ field: `products[${index}].productId`, message: 'Product ID is required' });
      } else if (!/^[0-9a-fA-F]{24}$/.test(product.productId)) {
        errors.push({ field: `products[${index}].productId`, message: 'Invalid product ID format' });
      }

      if (typeof product.quantity !== 'number' || product.quantity < 1) {
        errors.push({ field: `products[${index}].quantity`, message: 'Quantity must be at least 1' });
      }
    });
  }

  // Delivery address validation
  if (!data.deliveryAddress || typeof data.deliveryAddress !== 'object') {
    errors.push({ field: 'deliveryAddress', message: 'Delivery address is required' });
  } else {
    const { address, city, state, coordinates } = data.deliveryAddress;

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      errors.push({ field: 'deliveryAddress.address', message: 'Address is required' });
    } else if (address.trim().length > 200) {
      errors.push({ field: 'deliveryAddress.address', message: 'Address cannot exceed 200 characters' });
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      errors.push({ field: 'deliveryAddress.city', message: 'City is required' });
    } else if (city.trim().length > 50) {
      errors.push({ field: 'deliveryAddress.city', message: 'City cannot exceed 50 characters' });
    }

    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      errors.push({ field: 'deliveryAddress.state', message: 'State is required' });
    } else if (state.trim().length > 50) {
      errors.push({ field: 'deliveryAddress.state', message: 'State cannot exceed 50 characters' });
    }

    if (coordinates) {
      if (typeof coordinates.latitude !== 'number' || coordinates.latitude < -90 || coordinates.latitude > 90) {
        errors.push({ field: 'deliveryAddress.coordinates.latitude', message: 'Latitude must be between -90 and 90' });
      }
      if (typeof coordinates.longitude !== 'number' || coordinates.longitude < -180 || coordinates.longitude > 180) {
        errors.push({ field: 'deliveryAddress.coordinates.longitude', message: 'Longitude must be between -180 and 180' });
      }
    }
  }

  // Notes validation (optional)
  if (data.notes && (typeof data.notes !== 'string' || data.notes.length > 500)) {
    errors.push({ field: 'notes', message: 'Notes cannot exceed 500 characters' });
  }

  // Payment method validation (optional)
  if (data.paymentMethod && (typeof data.paymentMethod !== 'string' || data.paymentMethod.length > 50)) {
    errors.push({ field: 'paymentMethod', message: 'Payment method cannot exceed 50 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateOrderUpdate = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Status validation (optional)
  if (data.status !== undefined) {
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(data.status)) {
      errors.push({ field: 'status', message: 'Status must be one of: pending, confirmed, shipped, delivered, cancelled' });
    }
  }

  // Payment status validation (optional)
  if (data.paymentStatus !== undefined) {
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(data.paymentStatus)) {
      errors.push({ field: 'paymentStatus', message: 'Payment status must be one of: pending, paid, failed, refunded' });
    }
  }

  // Tracking number validation (optional)
  if (data.trackingNumber !== undefined && (typeof data.trackingNumber !== 'string' || data.trackingNumber.length > 100)) {
    errors.push({ field: 'trackingNumber', message: 'Tracking number cannot exceed 100 characters' });
  }

  // Date validations (optional)
  if (data.expectedDeliveryDate !== undefined) {
    const date = new Date(data.expectedDeliveryDate);
    if (isNaN(date.getTime())) {
      errors.push({ field: 'expectedDeliveryDate', message: 'Invalid expected delivery date' });
    }
  }

  if (data.actualDeliveryDate !== undefined) {
    const date = new Date(data.actualDeliveryDate);
    if (isNaN(date.getTime())) {
      errors.push({ field: 'actualDeliveryDate', message: 'Invalid actual delivery date' });
    }
  }

  // Notes validation (optional)
  if (data.notes !== undefined && (typeof data.notes !== 'string' || data.notes.length > 500)) {
    errors.push({ field: 'notes', message: 'Notes cannot exceed 500 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateOrderId = (id: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!id || typeof id !== 'string') {
    errors.push({ field: 'id', message: 'Order ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    errors.push({ field: 'id', message: 'Invalid order ID format' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', 
  authenticateToken, 
  validateRequest(validateCreateOrder), 
  async (req: Request, res: Response): Promise<void> => {
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

      const orderData: CreateOrderData = req.body;
      const dealerId = (req.user._id as any).toString();

      const order = await OrderService.createOrder(orderData, dealerId);

      res.status(201).json({
        success: true,
        data: {
          order
        },
        message: 'Order created successfully'
      });

    } catch (error) {
      console.error('Order creation error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found or inactive')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: error.message
            },
            timestamp: new Date().toISOString(),
            path: req.path
          });
          return;
        }

        if (error.message.includes('not found or not available') || error.message.includes('Insufficient quantity')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'PRODUCT_UNAVAILABLE',
              message: error.message
            },
            timestamp: new Date().toISOString(),
            path: req.path
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: 'Failed to create order'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/orders
 * Get orders with filters
 */
router.get('/', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
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

      const userId = (req.user._id as any).toString();
      
      const filters: OrderFilters = {
        status: req.query.status as string,
        paymentStatus: req.query.paymentStatus as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      // Add user-specific filter based on role or query parameter
      const userType = req.query.userType as string;
      if (userType === 'dealer' || !userType) {
        filters.dealerId = userId;
      } else if (userType === 'farmer') {
        filters.farmerId = userId;
      }

      const result = await OrderService.getOrders(filters);

      res.json({
        success: true,
        data: result,
        message: 'Orders retrieved successfully'
      });

    } catch (error) {
      console.error('Orders retrieval error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ORDERS_RETRIEVAL_FAILED',
          message: 'Failed to retrieve orders'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/orders/:id
 * Get order details by ID
 */
router.get('/:id', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
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

      const orderId = req.params.id;
      const userId = (req.user._id as any).toString();
      
      // Validate order ID
      const idValidation = validateOrderId(orderId);
      if (!idValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORDER_ID',
            message: 'Invalid order ID format',
            details: idValidation.errors
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      const order = await OrderService.getOrderById(orderId, userId);

      if (!order) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found or you do not have access to it'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.json({
        success: true,
        data: {
          order
        },
        message: 'Order details retrieved successfully'
      });

    } catch (error) {
      console.error('Order details error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_DETAILS_FAILED',
          message: 'Failed to retrieve order details'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * PUT /api/orders/:id
 * Update order status and details
 */
router.put('/:id', 
  authenticateToken,
  validateRequest(validateOrderUpdate), 
  async (req: Request, res: Response): Promise<void> => {
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

      const orderId = req.params.id;
      const userId = (req.user._id as any).toString();
      
      // Validate order ID
      const idValidation = validateOrderId(orderId);
      if (!idValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORDER_ID',
            message: 'Invalid order ID format',
            details: idValidation.errors
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      const updates: OrderUpdateData = req.body;

      const order = await OrderService.updateOrder(orderId, updates, userId);

      if (!order) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found or you do not have permission to update it'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.json({
        success: true,
        data: {
          order
        },
        message: 'Order updated successfully'
      });

    } catch (error) {
      console.error('Order update error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_UPDATE_FAILED',
          message: 'Failed to update order'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * POST /api/orders/:id/cancel
 * Cancel an order
 */
router.post('/:id/cancel', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
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

      const orderId = req.params.id;
      const userId = (req.user._id as any).toString();
      const reason = req.body.reason as string;
      
      // Validate order ID
      const idValidation = validateOrderId(orderId);
      if (!idValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORDER_ID',
            message: 'Invalid order ID format',
            details: idValidation.errors
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const order = await OrderService.cancelOrder(orderId, userId, reason);

      if (!order) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found or you do not have permission to cancel it'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.json({
        success: true,
        data: {
          order
        },
        message: 'Order cancelled successfully'
      });

    } catch (error) {
      console.error('Order cancellation error:', error);
      
      if (error instanceof Error && error.message.includes('Cannot cancel order')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CANCELLATION',
            message: error.message
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_CANCELLATION_FAILED',
          message: 'Failed to cancel order'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/orders/dealer/my-orders
 * Get dealer's orders
 */
router.get('/dealer/my-orders', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
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

      const dealerId = (req.user._id as any).toString();
      const status = req.query.status as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await OrderService.getDealerOrders(dealerId, status, page, limit);

      res.json({
        success: true,
        data: result,
        message: 'Dealer orders retrieved successfully'
      });

    } catch (error) {
      console.error('Dealer orders error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DEALER_ORDERS_FAILED',
          message: 'Failed to retrieve dealer orders'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/orders/farmer/my-orders
 * Get farmer's orders
 */
router.get('/farmer/my-orders', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
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

      const farmerId = (req.user._id as any).toString();
      const status = req.query.status as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await OrderService.getFarmerOrders(farmerId, status, page, limit);

      res.json({
        success: true,
        data: result,
        message: 'Farmer orders retrieved successfully'
      });

    } catch (error) {
      console.error('Farmer orders error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'FARMER_ORDERS_FAILED',
          message: 'Failed to retrieve farmer orders'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/orders/statistics
 * Get order statistics for the current user
 */
router.get('/statistics', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
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

      const userId = (req.user._id as any).toString();
      const userType = req.query.userType as 'dealer' | 'farmer' || 'dealer';

      const statistics = await OrderService.getOrderStatistics(userId, userType);

      res.json({
        success: true,
        data: {
          statistics,
          userType
        },
        message: 'Order statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Order statistics error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_STATISTICS_FAILED',
          message: 'Failed to retrieve order statistics'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

export default router;