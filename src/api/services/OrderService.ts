
import apiClient from '../apiClient';

// Type definitions
export interface OrderItem {
  medication: string;
  medicationId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  '@id'?: string;
  id?: string;
  supplier: string;
  supplierId?: string;
  orderDate: string;
  deliveryDate: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'En attente' | 'En cours' | 'Expédié' | 'Livré' | 'Annulé';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

class OrderService {
  private endpoint = '/orders';

  // Get all orders with pagination
  async getAllOrders(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    // For testing purposes
    const mockResponse = {
      'hydra:member': [
        {
          id: 'O-1001',
          '@id': '/orders/O-1001',
          supplier: 'Pharma France',
          supplierId: 'S-001',
          orderDate: '2023-05-10',
          deliveryDate: '2023-05-15',
          items: [
            { medication: 'Paracétamol', medicationId: 'M-001', quantity: 100, unitPrice: 0.5 },
            { medication: 'Amoxicilline', medicationId: 'M-002', quantity: 50, unitPrice: 1.2 }
          ],
          totalAmount: 110,
          status: 'Livré',
          createdAt: '2023-05-10T10:00:00',
          updatedAt: '2023-05-15T14:30:00'
        },
        {
          id: 'O-1002',
          '@id': '/orders/O-1002',
          supplier: 'MediPharma',
          supplierId: 'S-002',
          orderDate: '2023-05-12',
          deliveryDate: '2023-05-18',
          items: [
            { medication: 'Ibuprofène', medicationId: 'M-003', quantity: 80, unitPrice: 0.6 }
          ],
          totalAmount: 48,
          status: 'En cours',
          createdAt: '2023-05-12T11:20:00',
          updatedAt: '2023-05-12T11:20:00'
        }
      ],
      'hydra:totalItems': 2
    };
    
    return Promise.resolve({
      items: mockResponse['hydra:member'],
      totalItems: mockResponse['hydra:totalItems'],
      itemsPerPage,
      totalPages: Math.ceil((mockResponse['hydra:totalItems'] || 0) / itemsPerPage),
      currentPage: page,
    });
    
    // When API is ready, uncomment this:
    // return apiClient.getCollection<Order>(this.endpoint, page, itemsPerPage, filters);
  }

  // Get a single order by ID
  async getOrderById(id: string) {
    // For testing purposes
    const mockResponse = {
      id,
      '@id': `/orders/${id}`,
      supplier: 'Pharma France',
      supplierId: 'S-001',
      orderDate: '2023-05-10',
      deliveryDate: '2023-05-15',
      items: [
        { medication: 'Paracétamol', medicationId: 'M-001', quantity: 100, unitPrice: 0.5 },
        { medication: 'Amoxicilline', medicationId: 'M-002', quantity: 50, unitPrice: 1.2 }
      ],
      totalAmount: 110,
      status: 'Livré' as const,
      createdAt: '2023-05-10T10:00:00',
      updatedAt: '2023-05-15T14:30:00'
    };
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Order>(`${this.endpoint}/${id}`);
  }

  // Create a new order
  async createOrder(order: Omit<Order, '@id' | 'id'>) {
    // For testing purposes

    // Mock successful response
    const mockResponse = {
      ...order,
      id: `O-${Math.floor(1000 + Math.random() * 9000)}`,
      '@id': `/orders/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.post<Order>(this.endpoint, order);
  }

  // Update an existing order
  async updateOrder(id: string, order: Partial<Order>) {
    // For testing purposes

    // Mock successful response
    const mockResponse = {
      ...order,
      id,
      '@id': `/orders/${id}`,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse as Order);
    
    // When API is ready, uncomment this:
    // return apiClient.patch<Order>(`${this.endpoint}/${id}`, order);
  }

  // Delete an order
  async deleteOrder(id: string) {
    // For testing purposes

    // Mock successful response
    return Promise.resolve({});
    
    // When API is ready, uncomment this:
    // return apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get orders by supplier
  async getOrdersBySupplier(supplierId: string) {
    // For testing purposes
    const mockResponse = [
      {
        id: 'O-1001',
        '@id': '/orders/O-1001',
        supplier: 'Pharma France',
        supplierId,
        orderDate: '2023-05-10',
        deliveryDate: '2023-05-15',
        items: [
          { medication: 'Paracétamol', medicationId: 'M-001', quantity: 100, unitPrice: 0.5 },
          { medication: 'Amoxicilline', medicationId: 'M-002', quantity: 50, unitPrice: 1.2 }
        ],
        totalAmount: 110,
        status: 'Livré',
        createdAt: '2023-05-10T10:00:00',
        updatedAt: '2023-05-15T14:30:00'
      }
    ];
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Order[]>(`${this.endpoint}?supplierId=${supplierId}`);
  }

  // Get orders by status
  async getOrdersByStatus(status: string) {
    // For testing purposes
    const mockResponse = [
      {
        id: 'O-1002',
        '@id': '/orders/O-1002',
        supplier: 'MediPharma',
        supplierId: 'S-002',
        orderDate: '2023-05-12',
        deliveryDate: '2023-05-18',
        items: [
          { medication: 'Ibuprofène', medicationId: 'M-003', quantity: 80, unitPrice: 0.6 }
        ],
        totalAmount: 48,
        status,
        createdAt: '2023-05-12T11:20:00',
        updatedAt: '2023-05-12T11:20:00'
      }
    ];
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Order[]>(`${this.endpoint}?status=${status}`);
  }
  
  // Update order status
  async updateOrderStatus(id: string, status: Order['status']) {

    // Mock successful response
    const mockResponse = {
      id,
      '@id': `/orders/${id}`,
      status,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse as Order);
    
    // When API is ready, uncomment this:
    // return apiClient.patch<Order>(`${this.endpoint}/${id}`, { status });
  }
}

export default new OrderService();
