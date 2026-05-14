// lib/orders/types.ts

export interface OrderTypeEntity {
  order_type_id: string;
  order_type_name: string;
  order_type_code: string;
}

export interface OrderItemResponse {
  order_item_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  item_price: number;
  subtotal: number;
  notes: string | null;
}

export interface OrderListItem {
  order_id: string;
  order_number: string;
  customer_name: string;
  table_number: string | null;
  order_type_id: string;
  order_type_name: string;
  total_amount: number;
  order_status_id: string;
  order_status_name: string;
  ordered_at: string;
  updated_at?: string;
}

export interface OrderDetail extends OrderListItem {
  unit_id: string;
  user_id: string;
  notes: string | null;
  subtotal: number;
  tax_amount: number;
  completed_at: string | null;
  items: OrderItemResponse[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrdersListResponse {
  success: true;
  statusCode: 200;
  message: string;
  data: OrderListItem[];
  meta: PaginationMeta;
}

export interface OrderDetailResponse {
  success: true;
  statusCode: number;
  message: string;
  data: OrderDetail;
}

export interface PaymentRecord {
  payment_id: string;
  order_id: string;
  reference_number: string;
  amount: number;
  payment_status: string;
  failure_reason: string | null;
  paid_at: string | null;
  expired_at: string | null;
  created_at: string;
}

export interface PaymentPayload {
  amount: number;
}

export interface CashPaymentResponse {
  success: true;
  statusCode: number;
  message: string;
  data: {
    payment: PaymentRecord;
  };
}

export interface CashlessPaymentResponse {
  success: true;
  statusCode: number;
  message: string;
  data: {
    payment: PaymentRecord;
    qr_code_url: string;
    qr_string: string;
    acquirer: string;
    webhook_signature_key: string;
  };
}

export interface OrderTypesListResponse {
  success: true;
  statusCode: number;
  message: string;
  data: OrderTypeEntity[];
  meta: PaginationMeta;
}

export interface CartItem {
  menu_item_id: string;
  menu_item_name: string;
  item_price: number;
  quantity: number;
  notes?: string;
}

export interface CreateOrderPayload {
  order_type_id: string;
  customer_name: string;
  table_number?: string;
  notes?: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    item_price: number;
    notes?: string;
  }>;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
}

export interface UpdateOrderPayload {
  order_type_id?: string;
  customer_name?: string;
  table_number?: string;
  notes?: string;
  items?: Array<{
    order_item_id?: string;
    menu_item_id: string;
    quantity: number;
    item_price: number;
    notes?: string;
  }>;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
}

export interface GetOrdersParams {
  status_id?: string;
  page?: number;
  limit?: number;
  sortBy?: "ordered_at" | "total_amount" | "customer_name";
  sortType?: "ASC" | "DESC";
}
