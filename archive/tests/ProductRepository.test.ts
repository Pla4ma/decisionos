/**
 * ProductRepository Tests
 * 
 * Comprehensive test suite for ProductRepository functionality including
 * CRUD operations, inventory management, search, and business logic.
 */

import { ProductRepository } from '../repositories/ProductRepository';
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

describe('ProductRepository', () => {
  let productRepository: ProductRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    productRepository = new ProductRepository(mockDbConnection, mockCacheManager, mockLogger);
  });

  describe('Basic CRUD Operations', () => {
    it('should create a new product', async () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        sku: 'TEST-001',
        price: 99.99,
        currency: 'USD',
        category: 'electronics',
        status: 'active',
        inventory: {
          quantity: 100,
          reserved: 0,
          available: 100,
        },
      };

      const mockResult = {
        rows: [{
          id: 'product-123',
          name: 'Test Product',
          description: 'A test product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify(productData.inventory),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.create(productData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(productData.name);
      expect(result.sku).toBe(productData.sku);
      expect(result.price).toBe(productData.price);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining([
          productData.name,
          productData.description,
          productData.sku,
          productData.price,
          productData.currency,
          productData.category,
          productData.status,
          JSON.stringify(productData.inventory),
        ])
      );
    });

    it('should find product by ID', async () => {
      // Arrange
      const productId = 'product-123';
      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify({ quantity: 100, reserved: 0, available: 100 }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.findById(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(productId);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        productId
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should return null when product not found', async () => {
      // Arrange
      const productId = 'nonexistent-product';
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await productRepository.findById(productId);

      // Assert
      expect(result).toBeNull();
    });

    it('should update product information', async () => {
      // Arrange
      const productId = 'product-123';
      const updates = {
        name: 'Updated Product',
        price: 149.99,
      };

      const mockResult = {
        rows: [{
          id: productId,
          name: 'Updated Product',
          sku: 'TEST-001',
          price: 149.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify({ quantity: 100, reserved: 0, available: 100 }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.update(productId, updates);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(updates.name);
      expect(result.price).toBe(updates.price);
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });

    it('should delete product', async () => {
      // Arrange
      const productId = 'product-123';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await productRepository.delete(productId);

      // Assert
      expect(result).toBe(true);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        'DELETE FROM products WHERE id = $1',
        [productId]
      );
      expect(mockCacheManager.delete).toHaveBeenCalled();
    });
  });

  describe('Business Logic Methods', () => {
    it('should find product by SKU', async () => {
      // Arrange
      const sku = 'TEST-001';
      const mockResult = {
        rows: [{
          id: 'product-123',
          name: 'Test Product',
          sku: sku,
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify({ quantity: 100, reserved: 0, available: 100 }),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.findBySku(sku);

      // Assert
      expect(result).toBeDefined();
      expect(result.sku).toBe(sku);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sku = $1'),
        [sku]
      );
    });

    it('should find product by barcode', async () => {
      // Arrange
      const barcode = '1234567890123';
      const mockResult = {
        rows: [{
          id: 'product-123',
          name: 'Test Product',
          sku: 'TEST-001',
          barcode: barcode,
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.findByBarcode(barcode);

      // Assert
      expect(result).toBeDefined();
      expect(result.barcode).toBe(barcode);
    });

    it('should search products', async () => {
      // Arrange
      const searchTerm = 'test';
      const filters = {
        category: 'electronics',
        status: 'active',
        minPrice: 50,
        maxPrice: 200,
      };
      const options = {
        limit: 10,
        offset: 0,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      const mockResult = {
        rows: [{
          id: 'product-123',
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.searchProducts(searchTerm, filters, options);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining([
          `%${searchTerm}%`,
          filters.category,
          filters.status,
          filters.minPrice,
          filters.maxPrice,
          options.limit,
          options.offset,
        ])
      );
    });

    it('should update inventory', async () => {
      // Arrange
      const productId = 'product-123';
      const inventoryUpdate = {
        quantity: 150,
        reserved: 10,
        available: 140,
      };

      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify(inventoryUpdate),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.updateInventory(productId, inventoryUpdate);

      // Assert
      expect(result).toBeDefined();
      expect(result.inventory.quantity).toBe(inventoryUpdate.quantity);
      expect(result.inventory.reserved).toBe(inventoryUpdate.reserved);
      expect(result.inventory.available).toBe(inventoryUpdate.available);
    });

    it('should reserve inventory', async () => {
      // Arrange
      const productId = 'product-123';
      const quantity = 5;
      const currentInventory = { quantity: 100, reserved: 10, available: 90 };
      const updatedInventory = { quantity: 100, reserved: 15, available: 85 };

      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify(currentInventory),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.reserveInventory(productId, quantity);

      // Assert
      expect(result).toBeDefined();
      expect(result.inventory.reserved).toBe(currentInventory.reserved + quantity);
      expect(result.inventory.available).toBe(currentInventory.available - quantity);
    });

    it('should release inventory', async () => {
      // Arrange
      const productId = 'product-123';
      const quantity = 3;
      const currentInventory = { quantity: 100, reserved: 15, available: 85 };
      const updatedInventory = { quantity: 100, reserved: 12, available: 88 };

      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify(currentInventory),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.releaseInventory(productId, quantity);

      // Assert
      expect(result).toBeDefined();
      expect(result.inventory.reserved).toBe(currentInventory.reserved - quantity);
      expect(result.inventory.available).toBe(currentInventory.available + quantity);
    });

    it('should get low stock products', async () => {
      // Arrange
      const threshold = 20;
      const mockResult = {
        rows: [{
          id: 'product-123',
          name: 'Low Stock Product',
          sku: 'LOW-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify({ quantity: 15, reserved: 5, available: 10 }),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.getLowStockProducts(threshold);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE inventory->>\'available\' <= $1'),
        [threshold]
      );
    });

    it('should get products by category', async () => {
      // Arrange
      const category = 'electronics';
      const mockResult = {
        rows: [{
          id: 'product-123',
          name: 'Electronic Product',
          sku: 'ELEC-001',
          price: 99.99,
          currency: 'USD',
          category: category,
          status: 'active',
          inventory: JSON.stringify({ quantity: 100, reserved: 0, available: 100 }),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.getByCategory(category);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].category).toBe(category);
    });

    it('should get product statistics', async () => {
      // Arrange
      const mockResult = {
        rows: [{
          total_products: 1000,
          active_products: 850,
          products_by_category: { electronics: 300, clothing: 200, books: 150, home: 350 },
          low_stock_count: 25,
          out_of_stock_count: 10,
          average_price: 49.99,
          total_inventory_value: 50000,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.getProductStats();

      // Assert
      expect(result).toBeDefined();
      expect(result.totalProducts).toBe(1000);
      expect(result.activeProducts).toBe(850);
      expect(result.lowStockCount).toBe(25);
      expect(result.outOfStockCount).toBe(10);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate product data before creation', async () => {
      // Arrange
      const invalidProductData = {
        name: '',
        description: '',
        sku: '',
        price: -10,
        currency: '',
        category: '',
        status: '',
      };

      // Act & Assert
      await expect(productRepository.create(invalidProductData)).rejects.toThrow('Product name is required');
    });

    it('should validate SKU format', async () => {
      // Arrange
      const invalidProductData = {
        name: 'Test Product',
        description: 'A test product',
        sku: 'invalid-sku-format-with-spaces',
        price: 99.99,
        currency: 'USD',
        category: 'electronics',
        status: 'active',
      };

      // Act & Assert
      await expect(productRepository.create(invalidProductData)).rejects.toThrow('Invalid SKU format');
    });

    it('should validate price is positive', async () => {
      // Arrange
      const invalidProductData = {
        name: 'Test Product',
        description: 'A test product',
        sku: 'TEST-001',
        price: -99.99,
        currency: 'USD',
        category: 'electronics',
        status: 'active',
      };

      // Act & Assert
      await expect(productRepository.create(invalidProductData)).rejects.toThrow('Price must be positive');
    });

    it('should validate currency code', async () => {
      // Arrange
      const invalidProductData = {
        name: 'Test Product',
        description: 'A test product',
        sku: 'TEST-001',
        price: 99.99,
        currency: 'INVALID',
        category: 'electronics',
        status: 'active',
      };

      // Act & Assert
      await expect(productRepository.create(invalidProductData)).rejects.toThrow('Invalid currency code');
    });

    it('should validate inventory values', async () => {
      // Arrange
      const invalidProductData = {
        name: 'Test Product',
        description: 'A test product',
        sku: 'TEST-001',
        price: 99.99,
        currency: 'USD',
        category: 'electronics',
        status: 'active',
        inventory: {
          quantity: -10,
          reserved: -5,
          available: -15,
        },
      };

      // Act & Assert
      await expect(productRepository.create(invalidProductData)).rejects.toThrow('Inventory values must be non-negative');
    });
  });

  describe('Caching', () => {
    it('should cache find by ID results', async () => {
      // Arrange
      const productId = 'product-123';
      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify({ quantity: 100, reserved: 0, available: 100 }),
          created_at: new Date(),
          updated_at: new Date(),
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await productRepository.findById(productId);

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
      const productId = 'product-123';
      const cachedProduct = {
        id: productId,
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        currency: 'USD',
        category: 'electronics',
        status: 'active',
        inventory: { quantity: 100, reserved: 0, available: 100 },
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(cachedProduct);

      // Act
      const result = await productRepository.findById(productId);

      // Assert
      expect(result).toEqual(cachedProduct);
      expect(mockDbConnection.query).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('cache_hit'),
        expect.any(Object)
      );
    });

    it('should clear cache on update', async () => {
      // Arrange
      const productId = 'product-123';
      const updates = { name: 'Updated Product' };
      const mockResult = {
        rows: [{
          id: productId,
          name: 'Updated Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await productRepository.update(productId, updates);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        productId
      );
    });

    it('should clear cache on inventory update', async () => {
      // Arrange
      const productId = 'product-123';
      const inventoryUpdate = { quantity: 150, reserved: 0, available: 150 };
      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify(inventoryUpdate),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      await productRepository.updateInventory(productId, inventoryUpdate);

      // Assert
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        expect.stringContaining('findById'),
        productId
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const productId = 'product-123';
      const dbError = new Error('Database connection failed');
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(productRepository.findById(productId)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
          productId,
          error: dbError.message,
        })
      );
    });

    it('should handle insufficient inventory error', async () => {
      // Arrange
      const productId = 'product-123';
      const quantity = 100;
      const currentInventory = { quantity: 50, reserved: 10, available: 40 };
      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify(currentInventory),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act & Assert
      await expect(productRepository.reserveInventory(productId, quantity)).rejects.toThrow('Insufficient inventory');
    });

    it('should handle invalid release quantity error', async () => {
      // Arrange
      const productId = 'product-123';
      const quantity = 20;
      const currentInventory = { quantity: 100, reserved: 10, available: 90 };
      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify(currentInventory),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act & Assert
      await expect(productRepository.releaseInventory(productId, quantity)).rejects.toThrow('Cannot release more inventory than reserved');
    });

    it('should handle duplicate SKU error', async () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        sku: 'DUPLICATE-SKU',
        price: 99.99,
        currency: 'USD',
        category: 'electronics',
        status: 'active',
      };

      const dbError = new Error('duplicate key value violates unique constraint "products_sku_key"');
      mockDbConnection.query = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(productRepository.create(productData)).rejects.toThrow('SKU already exists');
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      // Arrange
      const largeResult = {
        rows: Array.from({ length: 1000 }, (_, i) => ({
          id: `product-${i}`,
          name: `Product ${i}`,
          sku: `PROD-${i.toString().padStart(3, '0')}`,
          price: 99.99 + i,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify({ quantity: 100, reserved: 0, available: 100 }),
        })),
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(largeResult);

      // Act
      const startTime = Date.now();
      const result = await productRepository.findMany({ limit: 1000 });
      const endTime = Date.now();

      // Assert
      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should use parameterized queries for security', async () => {
      // Arrange
      const productId = "product-123'; DROP TABLE products; --";
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await productRepository.findById(productId);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM products WHERE id = $1'),
        [productId]
      );
    });

    it('should use indexes for efficient queries', async () => {
      // Arrange
      const sku = 'TEST-001';
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      await productRepository.findBySku(sku);

      // Assert
      expect(mockDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sku = $1'),
        [sku]
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null inventory gracefully', async () => {
      // Arrange
      const productId = 'product-123';
      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: null,
        }],
      };

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.findById(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result.inventory).toBeNull();
    });

    it('should handle empty search results', async () => {
      // Arrange
      const searchTerm = 'nonexistent';
      mockDbConnection.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await productRepository.searchProducts(searchTerm);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle concurrent inventory updates', async () => {
      // Arrange
      const productId = 'product-123';
      const inventoryUpdate = { quantity: 150, reserved: 0, available: 150 };
      const mockResult = {
        rows: [{
          id: productId,
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
          inventory: JSON.stringify(inventoryUpdate),
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const promises = Array.from({ length: 10 }, () => 
        productRepository.updateInventory(productId, inventoryUpdate)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.inventory.quantity).toBe(inventoryUpdate.quantity);
      });
    });

    it('should handle decimal precision in prices', async () => {
      // Arrange
      const productData = {
        name: 'Precision Product',
        description: 'Product with precise pricing',
        sku: 'PREC-001',
        price: 99.999999,
        currency: 'USD',
        category: 'electronics',
        status: 'active',
      };

      const mockResult = {
        rows: [{
          id: 'product-123',
          name: 'Precision Product',
          sku: 'PREC-001',
          price: 99.999999,
          currency: 'USD',
          category: 'electronics',
          status: 'active',
        }],
      };

      mockDbConnection.query = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await productRepository.create(productData);

      // Assert
      expect(result).toBeDefined();
      expect(result.price).toBe(productData.price);
    });
  });
});
