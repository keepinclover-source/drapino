/**
 * Relational Database Client API for Drapino Application.
 * Communicates with backend endpoints (/api/v1/db/*) for real database operations.
 */

export interface DBUser {
  id?: number;
  user_uid: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'vendor' | 'admin';
  vendor_id?: string;
  store_name?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  floor_and_unit?: string;
}

export interface DBOrder {
  id?: number;
  order_number?: string;
  customer_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  floor_and_unit?: string;
  rooms_json?: any;
  approximate_windows?: number;
  approximate_width_meters?: number;
  preferred_styles_json?: any;
  preferred_date: string;
  time_slot: string;
  notes?: string;
  deposit_amount?: number;
  deposit_status?: string;
  status?: string;
  assigned_vendor_id?: string | number;
  assigned_vendor_name?: string;
  assigned_vendor_phone?: string;
}

export interface DBVendor {
  id?: number;
  vendor_uid?: string;
  name: string;
  owner_name: string;
  phone: string;
  city: string;
  address: string;
  covered_districts_json?: any;
  rating?: number;
  rating_count?: number;
  wallet_balance?: number;
  tier?: string;
}

export interface DBInvoice {
  order_id: number;
  invoice_number: string;
  vendor_id?: number | string;
  vendor_name: string;
  vendor_phone: string;
  subtotal: number;
  final_payable: number;
  issued_at: string;
}

export interface DBReview {
  order_id?: number;
  order_number: string;
  vendor_id: number | string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  rating: number;
  comment: string;
  review_date: string;
}

// Fetch all users from relational database
export async function fetchDBUsers(): Promise<DBUser[]> {
  try {
    const res = await fetch('/api/v1/db/users');
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (e) {
    console.error('Failed to fetch users from DB API:', e);
    return [];
  }
}

// Create a new user in relational database
export async function createDBUser(user: DBUser): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/db/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Failed to create user in DB API:', e);
    return false;
  }
}

// Fetch all orders from relational database
export async function fetchDBOrders(): Promise<DBOrder[]> {
  try {
    const res = await fetch('/api/v1/db/orders');
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (e) {
    console.error('Failed to fetch orders from DB API:', e);
    return [];
  }
}

// Create a new order in relational database
export async function createDBOrder(order: DBOrder): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/db/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Failed to create order in DB API:', e);
    return false;
  }
}

// Update an order in relational database
export async function updateDBOrder(orderId: string | number, updates: Partial<DBOrder>): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/db/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Failed to update order in DB API:', e);
    return false;
  }
}

// Fetch all vendors from relational database
export async function fetchDBVendors(): Promise<DBVendor[]> {
  try {
    const res = await fetch('/api/v1/db/vendors');
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (e) {
    console.error('Failed to fetch vendors from DB API:', e);
    return [];
  }
}

// Create a new vendor in relational database
export async function createDBVendor(vendor: DBVendor): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/db/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor)
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Failed to create vendor in DB API:', e);
    return false;
  }
}

// Update a vendor in relational database
export async function updateDBVendor(vendorId: string | number, updates: Partial<DBVendor>): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/db/vendors/${vendorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Failed to update vendor in DB API:', e);
    return false;
  }
}

// Create an invoice in relational database
export async function createDBInvoice(invoice: DBInvoice): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/db/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Failed to create invoice in DB API:', e);
    return false;
  }
}

// Create a review in relational database
export async function createDBReview(review: DBReview): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/db/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Failed to create review in DB API:', e);
    return false;
  }
}
