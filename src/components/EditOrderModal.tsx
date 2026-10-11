import React, { useState } from 'react';
import { VisitRequest, OrderStatus } from '../types';
import { X, Save, User, Phone, MapPin, Calendar, Clock, DollarSign, FileEdit } from 'lucide-react';

interface EditOrderModalProps {
  order: VisitRequest;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: VisitRequest) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  const [customerName, setCustomerName] = useState(order.customerName);
  const [phone, setPhone] = useState(order.phone);
  const [city, setCity] = useState(order.city);
  const [district, setDistrict] = useState(order.district);
  const [address, setAddress] = useState(order.address);
  const [floorAndUnit, setFloorAndUnit] = useState(order.floorAndUnit || '');
  const [approximateWindows, setApproximateWindows] = useState(order.approximateWindows);
  const [approximateWidthMeters, setApproximateWidthMeters] = useState(order.approximateWidthMeters);
  const [preferredDate, setPreferredDate] = useState(order.preferredDate);
  const [timeSlot, setTimeSlot] = useState(order.timeSlot);
  const [depositAmount, setDepositAmount] = useState(order.depositAmount);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...order,
      customerName,
      phone,
      city,
      district,
      address,
      floorAndUnit,
      approximateWindows: Number(approximateWindows),
      approximateWidthMeters: Number(approximateWidthMeters),
      preferredDate,
      timeSlot,
      depositAmount: Number(depositAmount),
      status,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in duration-150 text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-amber-800" />
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              ویرایش اطلاعات سفارش و مشتری #{order.orderNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">نام کامل مشتری:</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">شماره تماس همراه:</label>
              <input
                type="text"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">شهر:</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">محله / منطقه:</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">نشانی دقیق پستی:</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">طبقه و واحد:</label>
              <input
                type="text"
                value={floorAndUnit}
                onChange={(e) => setFloorAndUnit(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">تعداد پنجره‌ها:</label>
              <input
                type="number"
                min={1}
                value={approximateWindows}
                onChange={(e) => setApproximateWindows(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">عرض تقریبی (متر):</label>
              <input
                type="number"
                step="0.1"
                value={approximateWidthMeters}
                onChange={(e) => setApproximateWidthMeters(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">تاریخ مراجعه درخواستی:</label>
              <input
                type="text"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">بازه زمانی ساعت:</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">مبلغ بیعانه نقدی (تومان):</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">وضعیت جاری سفارش:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900 font-medium"
              >
                <option value="bidding">در انتظار شکار در مزایده (bidding)</option>
                <option value="assigned">ارجاع شده به فروشگاه (assigned)</option>
                <option value="visited">ویزیت شده / صدور فاکتور (visited)</option>
                <option value="approved">تایید فاکتور توسط مشتری (approved)</option>
                <option value="re_routed">مزایده مجدد جهت مقایسه (re_routed)</option>
                <option value="installed">تکمیل و نصب شده (installed)</option>
                <option value="cancelled">لغو شده (cancelled)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">یادداشت‌ها و توضیحات تکمیلی:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات سفارش</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
