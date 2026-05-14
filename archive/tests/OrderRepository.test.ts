/**
 * OrderRepository Tests
 * 
 * Comprehensive test suite for OrderRepository functionality including
 * CRUD operations, order management, payment processing, and business logic.
 */

import { OrderRepository } from '../repositories/OrderRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

// Mock dependencies
const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
} as unknown as CacheManager;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

const mockDbConnection = {
  query: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
} as unknown as DatabaseConnection;

describe('OrderRepository', () => {
  let orderRepository: OrderRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    orderRepository = new OrderRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Basic CRUD Operations', () => {
    it('should create a new order', async () => {
      // Arrange
      const orderData = {
        orderNumber: 'ORD-001',
        customerId: 'customer-123',
        items: [
          {
            productId: 'product-1',
            quantity: 2,
            price: 99.99,
            total: 199.98,
          },
        ],
        subtotal: 199.98,
        tax: 20.00,
        shipping: 10.00,
        total: 229.98,
        currency: 'USD',
        status: 'pending',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
        },
      };

      const mockResult = {
        rows: [{
          id: 'order-123',
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          items: JSON.stringify(orderData.items),
          subtotal: 199.98,
          tax: 20.00,
          shipping: 10.00,
          total: 229.98,
          currency: 'USD',
          status: 'pending',
          shipping_address: JSON.stringify(orderData.shippingAddress),
          billing_address: JSON.stringify(orderData.billingAddress),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.create(orderData);

      // Assert
      expect(result).toBeDefined();
      expect(result.orderNumber).toBe(orderData.orderNumber);
      expect(result.customerId).toBe(orderData.customerId);
      expect(result.total).toBe(orderData.total);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO orders'),
        expect.arrayContaining([
          orderData.orderNumber,
          orderData.customerId,
          JSON.stringify(orderData.items),
          orderData.subtotal,
          orderData.tax,
          orderData.shipping,
          orderData.total,
          orderData.currency,
          orderData.status,
          JSON.stringify(orderData.shippingAddress),
          JSON.stringify(orderData.billingAddress),
        ])
      );
    });

    it('should find order by ID', async () => {
      // Arrange
      const orderId = 'order-123';
      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          items: JSON.stringify([{
            productId: 'product-1',
            quantity: 2,
            price: 99.99,
            total: 199.98,
          }]),
          subtotal: 199.98,
          tax: 20.00,
          shipping: 10.00,
          total: 229.98,
          currency: 'USD',
          status: 'pending',
          shipping_address: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            address1: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            country: 'US',
          }),
          billing_address: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            address1: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            country: 'US',
          }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.findById(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        orderId
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should return null when order not found', async () => {
      // Arrange
      const orderId = 'nonexistent-order';
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await orderRepository.findById(orderId);

      // Assert
      expect(result).toBeNull();
    });

    it('should update order information', async () => {
      // Arrange
      const orderId = 'order-123';
      const updates = {
        status: 'processing',
        tax: 25.00,
        total: 234.98,
      };

      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          status: 'processing',
          tax: 25.00,
          total: 234.98,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.update(orderId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(updates.status);
      expect(result.tax).toBe(updates.tax);
      expect(result.total).toBe(updates.total);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete order', async () => {
      // Arrange
      const orderId = 'order-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await orderRepository.delete(orderId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM orders WHERE id = $1',
        [orderId]
      );
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });
  });

  describe('Business Logic Methods', () => {
    it('should find order by order number', async () => {
      // Arrange
      const orderNumber = 'ORD-001';
      const mockResult = {
        rows: [{
          id: 'order-123',
          order_number: orderNumber,
          customer_id: 'customer-123',
          status: 'pending',
          total: 229.98,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.findByOrderNumber(orderNumber);

      // Assert
      expect(result).toBeDefined();
      expect(result.orderNumber).toBe(orderNumber);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE order_number = $1'),
        [orderNumber]
      );
    });

    it('should find orders by customer', async () => {
      // Arrange
      const customerId = 'customer-123';
      const options = {
        limit: 10,
        offset: 0,
      };

      const mockResult = {
        rows: [{
          id: 'order-123',
          order_number: 'ORD-001',
          customer_id: customerId,
          status: 'pending',
          total: 229.98,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.findByCustomer(customerId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].customerId).toBe(customerId);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE customer_id = $1'),
        expect.arrayContaining([customerId, options.limit, options.offset])
      );
    });

    it('should update order status', async () => {
      // Arrange
      const orderId = 'order-123';
      const newStatus = 'shipped';
      const trackingNumber = 'TRACK-123';
      const carrier = 'UPS';

      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          status: newStatus,
          tracking_number: trackingNumber,
          carrier: carrier,
          shipped_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.updateStatus(orderId, newStatus, trackingNumber, carrier);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(newStatus);
      expect(result.trackingNumber).toBe(trackingNumber);
      expect(result.carrier).toBe(carrier);
    });

    it('should update payment status', async () => {
      // Arrange
      const orderId = 'order-123';
      const paymentStatus = 'paid';
      const paymentMethod = 'credit_card';
      const transactionId = 'txn-123';

      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          paid_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.updatePaymentStatus(orderId, paymentStatus, paymentMethod, transactionId);

      // Assert
      expect(result).toBeDefined();
      expect(result.paymentStatus).toBe(paymentStatus);
      expect(result.paymentMethod).toBe(paymentMethod);
      expect(result.transactionId).toBe(transactionId);
    });

    it('should update shipping status', async () => {
      // Arrange
      const orderId = 'order-123';
      const shippingStatus = 'delivered';
      const deliveryDate = new Date();

      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          shipping_status: shippingStatus,
          delivered_at: deliveryDate,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.updateShippingStatus(orderId, shippingStatus, deliveryDate);

      // Assert
      expect(result).toBeDefined();
      expect(result.shippingStatus).toBe(shippingStatus);
      expect(result.deliveredAt).toBe(deliveryDate);
    });

    it('should cancel order', async () => {
      // Arrange
      const orderId = 'order-123';
      const reason = 'Customer request';
      const refundAmount = 229.98;

      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          status: 'cancelled',
          cancellation_reason: reason,
          refund_amount: refundAmount,
          cancelled_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.cancelOrder(orderId, reason, refundAmount);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('cancelled');
      expect(result.cancellationReason).toBe(reason);
      expect(result.refundAmount).toBe(refundAmount);
    });

    it('should get pending orders', async () => {
      // Arrange
      const mockResult = {
        rows: [{
          id: 'order-123',
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          status: 'pending',
          total: 229.98,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.getPendingOrders();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].status).toBe('pending');
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = $1'),
        ['pending']
      );
    });

    it('should get order statistics', async () => {
      // Arrange
      const mockResult = {
        rows: [{
          total_orders: 1000,
          orders_by_status: { pending: 50, processing: 100, shipped: 300, delivered: 500, cancelled: 50 },
          orders_by_payment_status: { pending: 100, paid: 800, failed: 50, refunded: 50 },
          total_revenue: 100000,
          average_order_value: 100,
          recent_orders: 25,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.getOrderStats();

      // Assert
      expect(result).toBeDefined();
      expect(result.totalOrders).toBe(1000);
      expect(result.totalRevenue).toBe(100000);
      expect(result.averageOrderValue).toBe(100);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate order data before creation', async () => {
      // Arrange
      const invalidOrderData = {
        orderNumber: '',
        customerId: '',
        items: [],
        subtotal: -10,
        tax: -5,
        shipping: -5,
        total: -20,
        currency: '',
        status: '',
      };

      // Act & Assert
      await expect(orderRepository.create(invalidOrderData)).rejects.toThrow('Order number is required');
    });

    it('should validate order number format', async () => {
      // Arrange
      const invalidOrderData = {
        orderNumber: 'invalid-format-with-spaces',
        customerId: 'customer-123',
        items: [{
          productId: 'product-1',
          quantity: 1,
          price: 99.99,
          total: 99.99,
        }],
        subtotal: 99.99,
        tax: 10.00,
        shipping: 5.00,
        total: 114.99,
        currency: 'USD',
        status: 'pending',
      };

      // Act & Assert
      await expect(orderRepository.create(invalidOrderData)).rejects.toThrow('Invalid order number format');
    });

    it('should validate items are not empty', async () => {
      // Arrange
      const invalidOrderData = {
        orderNumber: 'ORD-001',
        customerId: 'customer-123',
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        currency: 'USD',
        status: 'pending',
      };

      // Act & Assert
      await expect(orderRepository.create(invalidOrderData)).rejects.toThrow('Order must contain at least one item');
    });

    it('should validate total calculation', async () => {
      // Arrange
      const invalidOrderData = {
        orderNumber: 'ORD-001',
        customerId: 'customer-123',
        items: [{
          productId: 'product-1',
          quantity: 1,
          price: 99.99,
          total: 99.99,
        }],
        subtotal: 99.99,
        tax: 10.00,
        shipping: 5.00,
        total: 200.00, // Incorrect total
        currency: 'USD',
        status: 'pending',
      };

      // Act & Assert
      await expect(orderRepository.create(invalidOrderData)).rejects.toThrow('Order total calculation is incorrect');
    });

    it('should validate currency code', async () => {
      // Arrange
      const invalidOrderData = {
        orderNumber: 'ORD-001',
        customerId: 'customer-123',
        items: [{
          productId: 'product-1',
          quantity: 1,
          price: 99.99,
          total: 99.99,
        }],
        subtotal: 99.99,
        tax: 10.00,
        shipping: 5.00,
        total: 114.99,
        currency: 'INVALID',
        status: 'pending',
      };

      // Act & Assert
      await expect(orderRepository.create(invalidOrderData)).rejects.toThrow('Invalid currency code');
    });
  });

  describe('Caching', () => {
    it('should cache find by ID results', async () => {
      // Arrange
      const orderId = 'order-123';
      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          status: 'pending',
          total: 229.98,
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await orderRepository.findById(orderId);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached results when available', async () => {
      // Arrange
      const orderId = 'order-123';
      const cachedOrder = {
        id: orderId,
        orderNumber: 'ORD-001',
        customerId: 'customer-123',
        status: 'pending',
        total: 229.98,
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedOrder);

      // Act
      const result = await orderRepository.findById(orderId);

      // Assert
      expect(result).toEqual(cachedOrder);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('cache_hit'),
        expect.any(Object)
      );
    });

    it('should clear cache on update', async () => {
      // Arrange
      const orderId = 'order-123';
      const updates = { status: 'processing' };
      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          status: 'processing',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await orderRepository.update(orderId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        orderId
      );
    });

    it('should clear cache on status update', async () => {
      // Arrange
      const orderId = 'order-123';
      const newStatus = 'shipped';
      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          status: newStatus,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await orderRepository.updateStatus(orderId, newStatus);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        orderId
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const orderId = 'order-123';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(orderRepository.findById(orderId)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          orderId,
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidOrderData = {
        orderNumber: '',
        customerId: '',
        items: [],
        subtotal: -10,
        tax: -5,
        shipping: -5,
        total: -20,
        currency: '',
        status: '',
      };

      // Act & Assert
      await expect(orderRepository.create(invalidOrderData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      const orderId = 'order-123';
      const cacheError = new Error('Cache service unavailable');
      mockCacheManager.get = jest.fn().mockRejectedValue(cacheError);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act & Assert
      await expect(orderRepository.findById(orderId)).resolves.toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          orderId,
          error: cacheError.message,
        })
      );
    });

    it('should handle duplicate order number error', async () => {
      // Arrange
      const orderData = {
        orderNumber: 'DUPLICATE-001',
        customerId: 'customer-123',
        items: [{
          productId: 'product-1',
          quantity: 1,
          price: 99.99,
          total: 99.99,
        }],
        subtotal: 99.99,
        tax: 10.00,
        shipping: 5.00,
        total: 114.99,
        currency: 'USD',
        status: 'pending',
      };

      const dbError = new Error('duplicate key value violates unique constraint "orders_order_number_key"');
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(orderRepository.create(orderData)).rejects.toThrow('Order number already exists');
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      // Arrange
      const largeResult = {
        rows: Array.from({ length: 1000 }, (_, i) => ({
          id: `order-${i}`,
          order_number: `ORD-${i.toString().padStart(3, '0')}`,
          customer_id: `customer-${i}`,
          status: 'pending',
          total: 100 + i,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await orderRepository.findMany({ limit: 1000 });
      const endTime = Date.now();

      // Assert
      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const orderId = "order-123'; DROP TABLE orders; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await orderRepository.findById(orderId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM orders WHERE id = $1'),
        [orderId]
      );
    });

    it('should use indexes for efficient queries', async () => {
      // Arrange
      const orderNumber = 'ORD-001';
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await orderRepository.findByOrderNumber(orderNumber);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE order_number = $1'),
        [orderNumber]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const orderId = 'order-123';
      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          tracking_number: null,
          carrier: null,
          notes: null,
          status: 'pending',
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.findById(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.trackingNumber).toBeNull();
      expect(result.carrier).toBeNull();
      expect(result.notes).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await orderRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const orderId = 'order-123';
      const updates = { status: 'processing' };
      const mockResult = {
        rows: [{
          id: orderId,
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          status: 'processing',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        orderRepository.update(orderId, updates)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.status).toBe('processing');
      });
    });

    it('should handle decimal precision in totals', async () => {
      // Arrange
      const orderData = {
        orderNumber: 'ORD-001',
        customerId: 'customer-123',
        items: [{
          productId: 'product-1',
          quantity: 1,
          price: 99.999999,
          total: 99.999999,
        }],
        subtotal: 99.999999,
        tax: 10.00,
        shipping: 5.00,
        total: 114.999999,
        currency: 'USD',
        status: 'pending',
      };

      const mockResult = {
        rows: [{
          id: 'order-123',
          order_number: 'ORD-001',
          customer_id: 'customer-123',
          total: 114.999999,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await orderRepository.create(orderData);

      // Assert
      expect(result).toBeDefined();
      expect(result.total).toBe(orderData.total);
    });
  });
});
