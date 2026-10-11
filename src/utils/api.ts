/**
 * سرویس ارتباط با بکند فول‌استک و دیتابیس پایدار
 */

export const api = {
  // Health
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Cities
  async getCities() {
    try {
      const res = await fetch('/api/cities');
      const data = await res.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  },

  async saveCity(cityData: any) {
    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cityData)
      });
      return await res.json();
    } catch (err) {
      console.warn('API saveCity failed, fallback to local', err);
      return null;
    }
  },

  // Orders
  async getOrders(city?: string) {
    try {
      const url = city ? `/api/orders?city=${encodeURIComponent(city)}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  },

  async createOrder(order: any) {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateOrder(id: string, updates: any) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Vendors
  async getVendors(city?: string) {
    try {
      const url = city ? `/api/vendors?city=${encodeURIComponent(city)}` : '/api/vendors';
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  },

  async createVendor(vendor: any) {
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Coupons
  async validateCoupon(code: string, orderAmount: number) {
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Sync state to DB
  async syncDatabase(state: { operationalCities?: any[]; orders?: any[]; vendors?: any[]; coupons?: any[] }) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
    } catch {
      // offline / quiet fallback
    }
  }
};
