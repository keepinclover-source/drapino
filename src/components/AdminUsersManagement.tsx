import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Key, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Store, 
  Building2, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, UserRole, OperationalCity } from '../types';

interface AdminUsersManagementProps {
  users: UserProfile[];
  onAddUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (user: UserProfile) => void;
  onChangeUserPassword: (userId: string, newPassword: string) => void;
  operationalCities?: OperationalCity[];
  currentAdminId?: string;
}

export const AdminUsersManagement: React.FC<AdminUsersManagementProps> = ({
  users,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  onChangeUserPassword,
  operationalCities = [],
  currentAdminId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  
  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
  const [viewDetailsUser, setViewDetailsUser] = useState<UserProfile | null>(null);

  // Add user form state
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('customer');
  const [addPassword, setAddPassword] = useState('123456');
  const [addEmail, setAddEmail] = useState('');
  const [addCity, setAddCity] = useState('تهران');
  const [addDistrict, setAddDistrict] = useState('مرکز شهر');
  const [addAddress, setAddAddress] = useState('');
  const [addStoreOrCompany, setAddStoreOrCompany] = useState('');
  const [addFormError, setAddFormError] = useState('');

  // Edit user form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('customer');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStoreOrCompany, setEditStoreOrCompany] = useState('');

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = 
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.city && u.city.includes(q)) ||
      (u.storeName && u.storeName.includes(q)) ||
      (u.companyName && u.companyName.includes(q));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Role badge helper
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'customer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <User className="w-3 h-3 text-amber-700" />
            <span>مشتری خانگی</span>
          </span>
        );
      case 'vendor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
            <Store className="w-3 h-3 text-blue-700" />
            <span>فروشگاه همکار</span>
          </span>
        );
      case 'wholesaler':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200">
            <Building2 className="w-3 h-3 text-purple-700" />
            <span>بنکدار و تامین‌کننده</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>مدیر سامانه</span>
          </span>
        );
    }
  };

  // Open Edit User
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditRole(user.role);
    setEditEmail(user.email || '');
    setEditCity(user.city || 'تهران');
    setEditDistrict(user.district || 'مرکز شهر');
    setEditAddress(user.address || '');
    setEditStoreOrCompany(user.storeName || user.companyName || '');
  };

  // Save Edit User
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated: UserProfile = {
      ...editingUser,
      name: editName.trim(),
      phone: editPhone.trim(),
      role: editRole,
      email: editEmail.trim() || undefined,
      city: editCity,
      district: editDistrict,
      address: editAddress,
      storeName: editRole === 'vendor' ? editStoreOrCompany : editingUser.storeName,
      companyName: editRole === 'wholesaler' ? editStoreOrCompany : editingUser.companyName,
    };

    onUpdateUser(updated);
    setEditingUser(null);
  };

  // Submit Add User
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError('');

    if (!addName.trim() || !addPhone.trim()) {
      setAddFormError('لطفاً نام و شماره تلفن همراه را وارد نمایید.');
      return;
    }

    // Check unique phone
    const cleanPhone = addPhone.trim().replace(/\s+/g, '');
    const exists = users.some(
      (u) => u.phone.replace(/^0/, '') === cleanPhone.replace(/^0/, '')
    );
    if (exists) {
      setAddFormError('این شماره تلفن قبلاً در سامانه ثبت شده است.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${addRole}-${Date.now()}`,
      name: addName.trim(),
      phone: cleanPhone,
      role: addRole,
      password: addPassword || '123456',
      email: addEmail.trim() || undefined,
      province: 'تهران',
      city: addCity,
      district: addDistrict,
      address: addAddress || 'ثبت شده توسط مدیر سامانه',
      storeName: addRole === 'vendor' ? addStoreOrCompany : undefined,
      companyName: addRole === 'wholesaler' ? addStoreOrCompany : undefined,
      warehouseCity: addRole === 'wholesaler' ? addCity : undefined,
      warehouseAddress: addRole === 'wholesaler' ? addAddress : undefined,
      isVerified: true,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    onAddUser(newUser);

    // Reset and close
    setAddName('');
    setAddPhone('');
    setAddRole('customer');
    setAddPassword('123456');
    setAddEmail('');
    setAddAddress('');
    setAddStoreOrCompany('');
    setIsAddUserModalOpen(false);
  };

  // Submit Change Password
  const handleSubmitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChangeUser || !newPasswordInput.trim()) return;

    onChangeUserPassword(passwordChangeUser.id, newPasswordInput.trim());
    setPasswordChangeUser(null);
    setNewPasswordInput('');
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteConfirmUser) return;
    onDeleteUser(deleteConfirmUser.id);
    setDeleteConfirmUser(null);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
            <Users className="w-4 h-4 text-amber-700" />
            <span>مدیریت یکپارچه حساب‌های کاربری</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900">
            فهرست کاربران سامانه ({users.length} حساب فعال)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            مشاهده، تعریف کاربر جدید، تغییر نقش، ویرایش اطلاعات، حذف حساب و تغییر رمز عبور کاربران
          </p>
        </div>

        <button
          onClick={() => {
            setAddFormError('');
            setIsAddUserModalOpen(true);
          }}
          className="px-5 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>افزودن کاربر جدید</span>
        </button>
      </div>

      {/* Role Counts Quick Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setRoleFilter('all')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            roleFilter === 'all'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block opacity-80">همه کاربران:</span>
          <span className="text-xl font-black font-mono">{users.length}</span>
        </button>

        <button
          onClick={() => setRoleFilter('customer')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            roleFilter === 'customer'
              ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block opacity-80">مشتریان خانگی:</span>
          <span className="text-xl font-black font-mono">
            {users.filter((u) => u.role === 'customer').length}
          </span>
        </button>

        <button
          onClick={() => setRoleFilter('vendor')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            roleFilter === 'vendor'
              ? 'bg-blue-800 text-white border-blue-800 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block opacity-80">فروشگاه‌های همکار:</span>
          <span className="text-xl font-black font-mono">
            {users.filter((u) => u.role === 'vendor').length}
          </span>
        </button>

        <button
          onClick={() => setRoleFilter('wholesaler')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            roleFilter === 'wholesaler'
              ? 'bg-purple-800 text-white border-purple-800 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block opacity-80">بنکداران و عمده‌فروشان:</span>
          <span className="text-xl font-black font-mono">
            {users.filter((u) => u.role === 'wholesaler').length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو با نام، شماره همراه، شهر، نام فروشگاه یا بنکداری..."
            className="w-full pl-3 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-700 text-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {(['all', 'customer', 'vendor', 'wholesaler', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'bg-amber-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {r === 'all' && 'همه'}
              {r === 'customer' && 'مشتریان'}
              {r === 'vendor' && 'فروشگاه‌ها'}
              {r === 'wholesaler' && 'بنکداران'}
              {r === 'admin' && 'مدیران'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold bg-stone-50/70">
                <th className="py-3.5 px-4">کاربر</th>
                <th className="py-3.5 px-4">شماره تماس</th>
                <th className="py-3.5 px-4">نقش سیستمی</th>
                <th className="py-3.5 px-4">محل فعالیت / شهر</th>
                <th className="py-3.5 px-4">فروشگاه / شرکت</th>
                <th className="py-3.5 px-4">تاریخ ثبت‌نام</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* User name & avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 font-black text-xs flex items-center justify-center shrink-0">
                          {user.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-xs sm:text-sm">
                            {user.name}
                          </div>
                          {user.email && (
                            <div className="text-[10px] text-stone-400 font-mono">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800 dir-ltr text-right">
                      {user.phone}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 text-stone-600">
                      <span className="font-bold text-stone-800">{user.city || 'تهران'}</span>
                      {user.district && <span className="text-[11px] text-stone-500 block">{user.district}</span>}
                    </td>

                    {/* Store or Company */}
                    <td className="py-3.5 px-4">
                      {user.role === 'vendor' && (user.storeName || 'بدون نام فروشگاه')}
                      {user.role === 'wholesaler' && (user.companyName || 'بدون نام بازرگانی')}
                      {user.role === 'customer' && <span className="text-stone-400">-</span>}
                      {user.role === 'admin' && <span className="text-emerald-700 font-bold">دفتر مرکزی</span>}
                    </td>

                    {/* Registration Date */}
                    <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                      {user.createdAt || '۱۴۰۳/۰۱/۰۱'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* Change Password */}
                        <button
                          onClick={() => {
                            setPasswordChangeUser(user);
                            setNewPasswordInput('');
                          }}
                          title="تغییر رمز عبور کاربر"
                          className="p-1.5 hover:bg-amber-50 text-amber-700 hover:text-amber-800 rounded-xl transition-colors border border-transparent hover:border-amber-200 cursor-pointer"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        {/* Edit details */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="ویرایش مشخصات"
                          className="p-1.5 hover:bg-stone-100 text-stone-700 hover:text-stone-900 rounded-xl transition-colors border border-transparent hover:border-stone-200 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* View full details */}
                        <button
                          onClick={() => setViewDetailsUser(user)}
                          title="مشاهده جزئیات کامل حساب"
                          className="p-1.5 hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded-xl transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete user */}
                        <button
                          onClick={() => setDeleteConfirmUser(user)}
                          title="حذف حساب کاربری"
                          className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    کاربری با مشخصات جستجو شده یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: ADD NEW USER ================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 overflow-y-auto max-h-[90vh] text-right space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-700" />
                <h3 className="font-black text-base text-stone-900">تعریف کاربر جدید در سامانه</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{addFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              
              {/* Role Select */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">نقش کاربری در سیستم:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['customer', 'vendor', 'wholesaler', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAddRole(r)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        addRole === r
                          ? 'border-amber-700 bg-amber-50 text-amber-950 shadow-2xs'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {r === 'customer' && 'مشتری'}
                      {r === 'vendor' && 'فروشگاه'}
                      {r === 'wholesaler' && 'بنکدار'}
                      {r === 'admin' && 'مدیر ارشد'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="مثال: رضا احمدی"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">شماره همراه (نام کاربری ورود):</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="09121234567"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">رمز عبور پیش‌فرض:</label>
                <input
                  type="text"
                  required
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="رمز عبور کاربر"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center"
                />
              </div>

              {/* Store or Company name if vendor or wholesaler */}
              {(addRole === 'vendor' || addRole === 'wholesaler') && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {addRole === 'vendor' ? 'نام گالری / پرده‌سرا:' : 'نام بازرگانی / شرکت بنکداری:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={addStoreOrCompany}
                    onChange={(e) => setAddStoreOrCompany(e.target.value)}
                    placeholder={addRole === 'vendor' ? 'مثال: گالری پرده رویال' : 'مثال: نساجی و بنکداری منسوجات امین'}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              )}

              {/* City & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">شهر محل فعالیت:</label>
                  <select
                    value={addCity}
                    onChange={(e) => setAddCity(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  >
                    {operationalCities.length > 0 ? (
                      operationalCities.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="تهران">تهران</option>
                        <option value="کرج">کرج</option>
                        <option value="مشهد">مشهد</option>
                        <option value="اصفهان">اصفهان</option>
                        <option value="شیراز">شیراز</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">محله / منطقه:</label>
                  <input
                    type="text"
                    value={addDistrict}
                    onChange={(e) => setAddDistrict(e.target.value)}
                    placeholder="مثال: نیاوران / بازار"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">نشانی پستی:</label>
                <textarea
                  rows={2}
                  value={addAddress}
                  onChange={(e) => setAddAddress(e.target.value)}
                  placeholder="خیابان، پلاک، واحد..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  ثبت و فعال‌سازی کاربر
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CHANGE PASSWORD ================= */}
      {passwordChangeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-700" />
                <h3 className="font-black text-base text-stone-900">تغییر رمز عبور کاربر</h3>
              </div>
              <button
                onClick={() => setPasswordChangeUser(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="block font-bold">کاربر: {passwordChangeUser.name}</span>
              <span className="block font-mono text-[11px]">شماره همراه: {passwordChangeUser.phone}</span>
            </div>

            <form onSubmit={handleSubmitPasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">رمز عبور جدید:</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="حداقل ۶ نویسه یا عدد"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordChangeUser(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  ثبت رمز عبور جدید
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: EDIT USER ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 overflow-y-auto max-h-[90vh] text-right space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-700" />
                <h3 className="font-black text-base text-stone-900">ویرایش مشخصات کاربر</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">شماره همراه:</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">نقش کاربری:</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="customer">مشتری خانگی</option>
                  <option value="vendor">فروشگاه همکار</option>
                  <option value="wholesaler">بنکدار و تامین‌کننده</option>
                  <option value="admin">مدیر ارشد سامانه</option>
                </select>
              </div>

              {(editRole === 'vendor' || editRole === 'wholesaler') && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {editRole === 'vendor' ? 'نام فروشگاه:' : 'نام شرکت بنکداری:'}
                  </label>
                  <input
                    type="text"
                    value={editStoreOrCompany}
                    onChange={(e) => setEditStoreOrCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">شهر:</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">محله / منطقه:</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">نشانی پستی:</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DELETE CONFIRM ================= */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-right space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-stone-900">آیا از حذف این حساب اطمینان دارید؟</h3>
              <p className="text-xs text-stone-500">
                حساب کاربر «{deleteConfirmUser.name}» با شماره {deleteConfirmUser.phone} حذف خواهد شد و دسترسی وی به سامانه قطع می‌گردد.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                بله، حساب حذف شود
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: VIEW DETAILS ================= */}
      {viewDetailsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-black text-base text-stone-900">شناسنامه کامل حساب کاربری</h3>
              <button
                onClick={() => setViewDetailsUser(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500">شناسه سیستمی:</span>
                <span className="font-mono font-bold">{viewDetailsUser.id}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500">نام کامل:</span>
                <span className="font-bold text-stone-900">{viewDetailsUser.name}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500">شماره همراه:</span>
                <span className="font-mono font-bold text-stone-900">{viewDetailsUser.phone}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500">نقش کاربری:</span>
                {getRoleBadge(viewDetailsUser.role)}
              </div>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500">شهر و منطقه:</span>
                <span className="font-bold">{viewDetailsUser.city} - {viewDetailsUser.district}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-stone-500 block">نشانی:</span>
                <span className="font-bold text-stone-900">{viewDetailsUser.address || '-'}</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setViewDetailsUser(null)}
                className="px-6 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
