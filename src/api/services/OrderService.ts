
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
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

class OrderService {
  private endpoint = '/orders';

  // Get all orders with pagination
  async getAllOrders(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    return apiClient.getCollection<Order>(this.endpoint, page, itemsPerPage, filters);
  }

  // Get a single order by ID
  async getOrderById(id: string) {
    return apiClient.get<Order>(`${this.endpoint}/${id}`);
  }

  // Create a new order
  async createOrder(order: Omit<Order, '@id' | 'id'>) {
    return apiClient.post<Order>(this.endpoint, order);
  }

  // Update an existing order
  async updateOrder(id: string, order: Partial<Order>) {
    return apiClient.patch<Order>(`${this.endpoint}/${id}`, order);
  }

  // Delete an order
  async deleteOrder(id: string) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get orders by supplier
  async getOrdersBySupplier(supplierId: string) {
    return apiClient.get<Order[]>(`${this.endpoint}?supplierId=${supplierId}`);
  }

  // Get orders by status
  async getOrdersByStatus(status: string) {
    return apiClient.get<Order[]>(`${this.endpoint}?status=${status}`);
  }
  
  // Update order status
  async updateOrderStatus(id: string, status: Order['status']) {
    return apiClient.patch<Order>(`${this.endpoint}/${id}`, { status });
  }
}

export default new OrderService();
