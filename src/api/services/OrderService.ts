import apiClient from '../apiClient';

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

  async getAllOrders(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
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
  }

  async getOrderById(id: string) {
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
  }

  async createOrder(order: Omit<Order, '@id' | 'id'>) {
    const mockResponse = {
      ...order,
      id: `O-${Math.floor(1000 + Math.random() * 9000)}`,
      '@id': `/orders/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse);
  }

  async updateOrder(id: string, order: Partial<Order>) {
    const mockResponse = {
      ...order,
      id,
      '@id': `/orders/${id}`,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse as Order);
  }

  async deleteOrder(id: string) {
    return Promise.resolve({});
  }

  async getOrdersBySupplier(supplierId: string) {
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
  }

  async getOrdersByStatus(status: string) {
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
  }
  
  async updateOrderStatus(id: string, status: Order['status']) {
    const mockResponse = {
      id,
      '@id': `/orders/${id}`,
      status,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse as Order);
  }
}

export default new OrderService();