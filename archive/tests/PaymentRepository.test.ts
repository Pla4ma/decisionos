/**
 * PaymentRepository Tests
 * 
 * Comprehensive test suite for PaymentRepository functionality including
 * payment processing, refunds, payment methods, and payment analytics.
 */

import { PaymentRepository } from '../repositories/PaymentRepository';
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

describe('PaymentRepository', () => {
  let paymentRepository: PaymentRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentRepository = new PaymentRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Payment Processing', () => {
    it('should process payment', async () => {
      // Arrange
      const paymentData = {
        orderId: 'order-123',
        amount: 99.99,
        currency: 'USD',
        method: 'credit_card',
        gateway: 'stripe',
        customerId: 'customer-123',
        paymentMethodId: 'pm-123',
        metadata: {
          description: 'Test payment',
          source: 'web_checkout',
        },
      };

      const mockResult = {
        rows: [{
          id: 'payment-123',
          order_id: 'order-123',
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'processing',
          customer_id: 'customer-123',
          payment_method_id: 'pm-123',
          gateway_transaction_id: 'txn-123',
          metadata: JSON.stringify(paymentData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.processPayment(paymentData);

      // Assert
      expect(result).toBeDefined();
      expect(result.orderId).toBe(paymentData.orderId);
      expect(result.amount).toBe(paymentData.amount);
      expect(result.currency).toBe(paymentData.currency);
      expect(result.method).toBe(paymentData.method);
      expect(result.gateway).toBe(paymentData.gateway);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO payments'),
        expect.arrayContaining([
          paymentData.orderId,
          paymentData.amount,
          paymentData.currency,
          paymentData.method,
          paymentData.gateway,
          paymentData.customerId,
          paymentData.paymentMethodId,
          JSON.stringify(paymentData.metadata),
        ])
      );
    });

    it('should find payment by ID', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const mockResult = {
        rows: [{
          id: paymentId,
          order_id: 'order-123',
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'completed',
          customer_id: 'customer-123',
          payment_method_id: 'pm-123',
          gateway_transaction_id: 'txn-123',
          metadata: JSON.stringify({ description: 'Test payment' }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.findById(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(paymentId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        paymentId
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should update payment status', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const newStatus = 'completed';
      const gatewayResponse = {
        gatewayTransactionId: 'txn-456',
        gatewayResponse: JSON.stringify({ status: 'succeeded' }),
        processedAt: new Date(),
      };

      const mockResult = {
        rows: [{
          id: paymentId,
          order_id: 'order-123',
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: newStatus,
          gateway_transaction_id: 'txn-456',
          gateway_response: JSON.stringify({ status: 'succeeded' }),
          processed_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.updatePaymentStatus(paymentId, newStatus, gatewayResponse);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(newStatus);
      expect(result.gatewayTransactionId).toBe(gatewayResponse.gatewayTransactionId);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should process refund', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const refundData = {
        amount: 50.00,
        reason: 'Customer request',
        refundMethod: 'credit_card',
        metadata: {
          processedBy: 'admin-123',
          notes: 'Partial refund approved',
        },
      };

      const mockResult = {
        rows: [{
          id: 'refund-123',
          payment_id: paymentId,
          amount: 50.00,
          reason: 'Customer request',
          refund_method: 'credit_card',
          status: 'processing',
          gateway_refund_id: 'refund-456',
          metadata: JSON.stringify(refundData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.processRefund(paymentId, refundData);

      // Assert
      expect(result).toBeDefined();
      expect(result.paymentId).toBe(paymentId);
      expect(result.amount).toBe(refundData.amount);
      expect(result.reason).toBe(refundData.reason);
    });

    it('should update refund status', async () => {
      // Arrange
      const refundId = 'refund-123';
      const newStatus = 'completed';
      const gatewayResponse = {
        gatewayRefundId: 'refund-789',
        gatewayResponse: JSON.stringify({ status: 'succeeded' }),
        processedAt: new Date(),
      };

      const mockResult = {
        rows: [{
          id: refundId,
          payment_id: 'payment-123',
          amount: 50.00,
          reason: 'Customer request',
          status: newStatus,
          gateway_refund_id: 'refund-789',
          gateway_response: JSON.stringify({ status: 'succeeded' }),
          processed_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.updateRefundStatus(refundId, newStatus, gatewayResponse);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(newStatus);
      expect(result.gatewayRefundId).toBe(gatewayResponse.gatewayRefundId);
    });
  });

  describe('Payment Queries', () => {
    it('should find payments by order', async () => {
      // Arrange
      const orderId = 'order-123';
      const mockResult = {
        rows: [{
          id: 'payment-123',
          order_id: orderId,
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'completed',
          created_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getPaymentsByOrder(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].orderId).toBe(orderId);
    });

    it('should find payments by customer', async () => {
      // Arrange
      const customerId = 'customer-123';
      const options = {
        limit: 10,
        offset: 0,
        status: 'completed',
      };

      const mockResult = {
        rows: [{
          id: 'payment-123',
          order_id: 'order-123',
          customer_id: customerId,
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'completed',
          created_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getPaymentsByCustomer(customerId, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].customerId).toBe(customerId);
    });

    it('should find payments by gateway', async () => {
      // Arrange
      const gateway = 'stripe';
      const options = {
        limit: 10,
        offset: 0,
        status: 'completed',
      };

      const mockResult = {
        rows: [{
          id: 'payment-123',
          order_id: 'order-123',
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: gateway,
          status: 'completed',
          created_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getPaymentsByGateway(gateway, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].gateway).toBe(gateway);
    });

    it('should search payments', async () => {
      // Arrange
      const searchTerm = 'order-123';
      const filters = {
        status: 'completed',
        method: 'credit_card',
        gateway: 'stripe',
        minAmount: 50,
        maxAmount: 200,
      };
      const options = {
        limit: 10,
        offset: 0,
      };

      const mockResult = {
        rows: [{
          id: 'payment-123',
          order_id: 'order-123',
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'completed',
          created_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.searchPayments(searchTerm, filters, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].orderId).toContain(searchTerm);
    });

    it('should get refunds by payment', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const mockResult = {
        rows: [{
          id: 'refund-123',
          payment_id: paymentId,
          amount: 50.00,
          reason: 'Customer request',
          refund_method: 'credit_card',
          status: 'completed',
          created_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getRefundsByPayment(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].paymentId).toBe(paymentId);
    });
  });

  describe('Payment Analytics', () => {
    it('should get payment statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_payments: 1000,
          total_amount: 100000,
          payments_by_status: { pending: 50, processing: 100, completed: 800, failed: 50 },
          payments_by_method: { credit_card: 600, paypal: 200, bank_transfer: 150, crypto: 50 },
          payments_by_gateway: { stripe: 500, paypal: 300, square: 150, braintree: 50 },
          average_payment_amount: 100,
          successful_payments: 800,
          failed_payments: 50,
          success_rate: 94.1,
          total_refunds: 100,
          total_refund_amount: 10000,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getPaymentStats(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.totalPayments).toBe(1000);
      expect(result.totalAmount).toBe(100000);
      expect(result.successRate).toBe(94.1);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should get daily payment trends', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          { date: '2023-01-01', payments: 30, amount: 3000, successful: 28, failed: 2 },
          { date: '2023-01-02', payments: 35, amount: 3500, successful: 33, failed: 2 },
          { date: '2023-01-03', payments: 25, amount: 2500, successful: 24, failed: 1 },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getDailyPaymentTrends(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result[0].date).toBe('2023-01-01');
      expect(result[0].payments).toBe(30);
    });

    it('should get payment method analytics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          {
            method: 'credit_card',
            total_payments: 600,
            total_amount: 60000,
            successful: 570,
            failed: 30,
            success_rate: 95.0,
            average_amount: 100,
          },
          {
            method: 'paypal',
            total_payments: 200,
            total_amount: 20000,
            successful: 190,
            failed: 10,
            success_rate: 95.0,
            average_amount: 100,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getPaymentMethodAnalytics(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].method).toBe('credit_card');
      expect(result[0].successRate).toBe(95.0);
    });

    it('should get gateway performance', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [
          {
            gateway: 'stripe',
            total_payments: 500,
            total_amount: 50000,
            successful: 480,
            failed: 20,
            success_rate: 96.0,
            average_processing_time: 2.5,
          },
          {
            gateway: 'paypal',
            total_payments: 300,
            total_amount: 30000,
            successful: 285,
            failed: 15,
            success_rate: 95.0,
            average_processing_time: 3.2,
          },
        ],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getGatewayPerformance(timeRange);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].gateway).toBe('stripe');
      expect(result[0].successRate).toBe(96.0);
    });
  });

  describe('Payment Methods', () => {
    it('should create payment method', async () => {
      // Arrange
      const paymentMethodData = {
        customerId: 'customer-123',
        type: 'credit_card',
        gateway: 'stripe',
        gatewayMethodId: 'pm-123',
        details: {
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025,
        },
        isDefault: true,
        metadata: {
          nickname: 'My Visa Card',
        },
      };

      const mockResult = {
        rows: [{
          id: 'payment-method-123',
          customer_id: 'customer-123',
          type: 'credit_card',
          gateway: 'stripe',
          gateway_method_id: 'pm-123',
          details: JSON.stringify(paymentMethodData.details),
          is_default: true,
          metadata: JSON.stringify(paymentMethodData.metadata),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.createPaymentMethod(paymentMethodData);

      // Assert
      expect(result).toBeDefined();
      expect(result.customerId).toBe(paymentMethodData.customerId);
      expect(result.type).toBe(paymentMethodData.type);
      expect(result.gateway).toBe(paymentMethodData.gateway);
      expect(result.isDefault).toBe(paymentMethodData.isDefault);
    });

    it('should get payment methods by customer', async () => {
      // Arrange
      const customerId = 'customer-123';
      const mockResult = {
        rows: [{
          id: 'payment-method-123',
          customer_id: customerId,
          type: 'credit_card',
          gateway: 'stripe',
          gateway_method_id: 'pm-123',
          details: JSON.stringify({ last4: '4242', brand: 'visa' }),
          is_default: true,
          created_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.getPaymentMethodsByCustomer(customerId);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].customerId).toBe(customerId);
    });

    it('should set default payment method', async () => {
      // Arrange
      const paymentMethodId = 'payment-method-123';
      const customerId = 'customer-123';
      const mockResult = {
        rows: [{
          id: paymentMethodId,
          customer_id: customerId,
          is_default: true,
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.setDefaultPaymentMethod(paymentMethodId, customerId);

      // Assert
      expect(result).toBeDefined();
      expect(result.isDefault).toBe(true);
    });

    it('should delete payment method', async () => {
      // Arrange
      const paymentMethodId = 'payment-method-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await paymentRepository.deletePaymentMethod(paymentMethodId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM payment_methods WHERE id = $1',
        [paymentMethodId]
      );
    });
  });

  describe('Validation', () => {
    it('should validate payment data', async () => {
      // Arrange
      const invalidPaymentData = {
        orderId: '',
        amount: -10,
        currency: '',
        method: '',
        gateway: '',
        customerId: '',
        paymentMethodId: '',
      };

      // Act & Assert
      await expect(paymentRepository.processPayment(invalidPaymentData)).rejects.toThrow('Order ID is required');
    });

    it('should validate amount is positive', async () => {
      // Arrange
      const invalidPaymentData = {
        orderId: 'order-123',
        amount: -99.99,
        currency: 'USD',
        method: 'credit_card',
        gateway: 'stripe',
        customerId: 'customer-123',
        paymentMethodId: 'pm-123',
      };

      // Act & Assert
      await expect(paymentRepository.processPayment(invalidPaymentData)).rejects.toThrow('Amount must be positive');
    });

    it('should validate currency code', async () => {
      // Arrange
      const invalidPaymentData = {
        orderId: 'order-123',
        amount: 99.99,
        currency: 'INVALID',
        method: 'credit_card',
        gateway: 'stripe',
        customerId: 'customer-123',
        paymentMethodId: 'pm-123',
      };

      // Act & Assert
      await expect(paymentRepository.processPayment(invalidPaymentData)).rejects.toThrow('Invalid currency code');
    });

    it('should validate payment method', async () => {
      // Arrange
      const invalidPaymentData = {
        orderId: 'order-123',
        amount: 99.99,
        currency: 'USD',
        method: 'invalid_method',
        gateway: 'stripe',
        customerId: 'customer-123',
        paymentMethodId: 'pm-123',
      };

      // Act & Assert
      await expect(paymentRepository.processPayment(invalidPaymentData)).rejects.toThrow('Invalid payment method');
    });

    it('should validate refund amount', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const invalidRefundData = {
        amount: -50.00,
        reason: 'Customer request',
        refundMethod: 'credit_card',
      };

      // Act & Assert
      await expect(paymentRepository.processRefund(paymentId, invalidRefundData)).rejects.toThrow('Refund amount must be positive');
    });
  });

  describe('Caching', () => {
    it('should cache payment statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockResult = {
        rows: [{
          total_payments: 1000,
          total_amount: 100000,
          success_rate: 95.0,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await paymentRepository.getPaymentStats(timeRange);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('paymentStats'),
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should return cached payment statistics', async () => {
      // Arrange
      const timeRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const cachedStats = {
        totalPayments: 1000,
        totalAmount: 100000,
        successRate: 95.0,
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedStats);

      // Act
      const result = await paymentRepository.getPaymentStats(timeRange);

      // Assert
      expect(result).toEqual(cachedStats);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
    });

    it('should clear cache on payment status update', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const newStatus = 'completed';
      const mockResult = {
        rows: [{
          id: paymentId,
          status: newStatus,
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await paymentRepository.updatePaymentStatus(paymentId, newStatus);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('paymentStats')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const paymentData = {
        orderId: 'order-123',
        amount: 99.99,
        currency: 'USD',
        method: 'credit_card',
        gateway: 'stripe',
        customerId: 'customer-123',
        paymentMethodId: 'pm-123',
      };

      const dbError = new Error('Database connection failed');
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(paymentRepository.processPayment(paymentData)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: dbError.message,
        })
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidPaymentData = {
        orderId: '',
        amount: -10,
        currency: '',
        method: '',
        gateway: '',
        customerId: '',
        paymentMethodId: '',
      };

      // Act & Assert
      await expect(paymentRepository.processPayment(invalidPaymentData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      // Arrange
      const largeResult = {
        rows: Array.from({ length: 1000 }, (_, i) => ({
          id: `payment-${i}`,
          order_id: `order-${i}`,
          amount: 99.99 + i,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'completed',
          created_at: new Date(),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await paymentRepository.getPaymentsByCustomer('customer-123', { limit: 1000 });
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const paymentId = "payment-123'; DROP TABLE payments; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await paymentRepository.findById(paymentId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM payments WHERE id = $1'),
        [paymentId]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      // Arrange
      const paymentId = 'payment-123';
      const mockResult = {
        rows: [{
          id: paymentId,
          order_id: 'order-123',
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'completed',
          gateway_transaction_id: null,
          gateway_response: null,
          processed_at: null,
          metadata: null,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.findById(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(result.gatewayTransactionId).toBeNull();
      expect(result.gatewayResponse).toBeNull();
      expect(result.processedAt).toBeNull();
      expect(result.metadata).toBeNull();
    });

    it('should handle empty result sets', async () => {
      // Arrange
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await paymentRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const paymentData = {
        orderId: 'order-123',
        amount: 99.99,
        currency: 'USD',
        method: 'credit_card',
        gateway: 'stripe',
        customerId: 'customer-123',
        paymentMethodId: 'pm-123',
      };

      const mockResult = {
        rows: [{
          id: 'payment-123',
          order_id: 'order-123',
          amount: 99.99,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'processing',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        paymentRepository.processPayment(paymentData)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.orderId).toBe(paymentData.orderId);
      });
    });

    it('should handle decimal precision in amounts', async () => {
      // Arrange
      const paymentData = {
        orderId: 'order-123',
        amount: 99.999999,
        currency: 'USD',
        method: 'credit_card',
        gateway: 'stripe',
        customerId: 'customer-123',
        paymentMethodId: 'pm-123',
      };

      const mockResult = {
        rows: [{
          id: 'payment-123',
          order_id: 'order-123',
          amount: 99.999999,
          currency: 'USD',
          method: 'credit_card',
          gateway: 'stripe',
          status: 'processing',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await paymentRepository.processPayment(paymentData);

      // Assert
      expect(result).toBeDefined();
      expect(result.amount).toBe(paymentData.amount);
    });
  });
});
