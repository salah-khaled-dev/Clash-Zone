import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiUsers, 
  FiUserPlus, 
  FiShield, 
  FiKey, 
  FiLock, 
  FiMail, 
  FiUser,
  FiCheckCircle, 
  FiTrash2, 
  FiRefreshCw,
  FiAlertCircle,
  FiUserCheck,
  FiUserX,
  FiEdit2,
  FiX
} from 'react-icons/fi';
import { employeeService, type EmployeeAccount } from '../services/employee.service';
import { useToast } from './useToast';
import type { UserRole } from '../types/booking';

interface EmployeeManagementProps {
  currentUserId: string;
  currentUserRole?: UserRole;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ 
  currentUserId, 
  currentUserRole = 'admin' 
}) => {
  const { showToast } = useToast();

  const isAdmin = currentUserRole === 'admin';
  const isManager = currentUserRole === 'manager';

  const [employees, setEmployees] = useState<EmployeeAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Employee Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'manager' | 'employee'>('employee');
  const [showAddForm, setShowAddForm] = useState(isManager); // Default open for Manager for streamlined flow

  // Edit User Modal State (Admin only)
  const [editTargetUser, setEditTargetUser] = useState<EmployeeAccount | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'manager' | 'employee' | 'unassigned'>('employee');
  const [isEditing, setIsEditing] = useState(false);

  // Reset Password Modal State (Admin only)
  const [resetTargetUser, setResetTargetUser] = useState<EmployeeAccount | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeeService.listEmployees();
      setEmployees(data);
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Failed to load employees:', e);
      setError(e.message || 'فشل تحميل قائمة الموظفين');
      showToast(e.message || 'فشل تحميل قائمة الموظفين', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFullName.trim() || newFullName.trim().length < 2) {
      showToast('يرجى إدخال الاسم الكامل للموظف (حرفين على الأقل)', 'warning');
      return;
    }

    if (!newEmail.trim() || !newPassword) {
      showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('كلمة المرور يجب أن لا تقل عن 6 أحرف', 'warning');
      return;
    }

    // Role Enforcement:
    // If caller is Manager, role MUST be strictly 'employee'
    const roleToAssign = isManager ? 'employee' : newRole;

    setIsSubmitting(true);
    try {
      await employeeService.createEmployee(newFullName.trim(), newEmail.trim(), newPassword, roleToAssign);
      showToast(`تم إنشاء حساب الموظف (${newFullName.trim()}) بنجاح`, 'success');
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('employee');
      if (isAdmin) {
        setShowAddForm(false);
      }
      await fetchEmployees();
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || 'فشل إنشاء حساب الموظف', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (emp: EmployeeAccount) => {
    if (!isAdmin) {
      showToast('ليس لديك صلاحية لتنفيذ هذا الإجراء', 'error');
      return;
    }
    setEditTargetUser(emp);
    setEditFullName(emp.full_name && emp.full_name !== 'غير محدد' ? emp.full_name : '');
    setEditRole(emp.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editTargetUser) return;

    if (!editFullName.trim() || editFullName.trim().length < 2) {
      showToast('الاسم الكامل يجب أن يكون حرفين على الأقل', 'warning');
      return;
    }

    setIsEditing(true);
    try {
      await employeeService.editUser(editTargetUser.user_id, editFullName.trim(), editRole);
      showToast(`تم تحديث بيانات الموظف بنجاح`, 'success');
      setEditTargetUser(null);
      await fetchEmployees();
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || 'فشل تحديث بيانات الموظف', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleStatus = async (employee: EmployeeAccount) => {
    if (!isAdmin) {
      showToast('ليس لديك صلاحية لتنفيذ هذا الإجراء', 'error');
      return;
    }

    if (employee.user_id === currentUserId) {
      showToast('لا يمكنك تعطيل حسابك الخاص كمسؤول', 'warning');
      return;
    }

    const nextDisabled = !employee.is_disabled;
    const actionLabel = nextDisabled ? 'تعطيل' : 'تفعيل';
    const displayName = employee.full_name || employee.email;

    if (!window.confirm(`هل أنت متأكد من ${actionLabel} وصول الموظف (${displayName})؟`)) {
      return;
    }

    try {
      await employeeService.toggleStatus(employee.user_id, nextDisabled);
      showToast(`تم ${actionLabel} حساب الموظف بنجاح`, 'success');
      await fetchEmployees();
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || `فشل ${actionLabel} الحساب`, 'error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !resetTargetUser) return;

    if (!newResetPassword || newResetPassword.length < 6) {
      showToast('كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف', 'warning');
      return;
    }

    setIsResetting(true);
    try {
      await employeeService.resetPassword(resetTargetUser.user_id, newResetPassword);
      showToast(`تم تعيين كلمة مرور جديدة للموظف (${resetTargetUser.full_name || resetTargetUser.email})`, 'success');
      setResetTargetUser(null);
      setNewResetPassword('');
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || 'فشل إعادة تعيين كلمة المرور', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteEmployee = async (employee: EmployeeAccount) => {
    if (!isAdmin) {
      showToast('ليس لديك صلاحية لتنفيذ هذا الإجراء', 'error');
      return;
    }

    if (employee.user_id === currentUserId) {
      showToast('لا يمكنك حذف حسابك الخاص كمسؤول', 'warning');
      return;
    }

    const displayName = employee.full_name || employee.email;
    if (!window.confirm(`تحذير: هل أنت متأكد تماماً من حذف حساب (${displayName}) نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    try {
      await employeeService.deleteEmployee(employee.user_id);
      showToast(`تم حذف حساب (${displayName}) بنجاح`, 'success');
      await fetchEmployees();
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || 'فشل حذف الحساب', 'error');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <FiShield className="w-3 h-3 text-red-600" />
            <span>مسؤول النظام (Admin)</span>
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <FiShield className="w-3 h-3 text-blue-600" />
            <span>مدير (Manager)</span>
          </span>
        );
      case 'employee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <FiUsers className="w-3 h-3 text-amber-600" />
            <span>موظف (Employee)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <FiAlertCircle className="w-3 h-3 text-slate-400" />
            <span>غير محدد (Unassigned)</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isAdmin ? 'إدارة الموظفين والصلاحيات' : 'تسجيل موظف جديد'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isAdmin 
                ? 'لوحة التحكم الإدارية الكاملة لإنشاء وتعديل حسابات فريق العمل وتحديد أدوارهم' 
                : 'تسجيل حسابات جديدة لفريق العمل برتبة موظف (Employee) لإدخال وتعديل الحجوزات'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={fetchEmployees}
            disabled={isLoading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center"
            title="تحديث القائمة"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary-luxury px-4 py-2.5 text-xs font-bold flex items-center gap-2 flex-grow md:flex-grow-0"
          >
            <FiUserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'إخفاء النموذج' : 'إضافة موظف جديد'}</span>
          </button>
        </div>
      </div>

      {/* Add Employee Form Drawer */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FiUserPlus className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-black text-slate-900">
                {isAdmin ? 'تسجيل حساب موظف أو مدير جديد' : 'تسجيل حساب موظف جديد (Employee)'}
              </h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* 1. Full Name — الاسم الكامل */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5 text-slate-400" />
                <span>الاسم الكامل للموظف *</span>
              </label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="أحمد محمد"
                className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
              />
            </div>

            {/* 2. Email — البريد الإلكتروني */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <FiMail className="w-3.5 h-3.5 text-slate-400" />
                <span>البريد الإلكتروني *</span>
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="ahmed@example.com"
                className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                dir="ltr"
              />
            </div>

            {/* 3. Password — كلمة المرور الأولية */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <FiLock className="w-3.5 h-3.5 text-slate-400" />
                <span>كلمة المرور الأولية *</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="لا تقل عن 6 أحرف"
                className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                dir="ltr"
              />
            </div>

            {/* 4. Role — الصلاحية (Dropdown for Admin, Fixed Read-Only for Manager) */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5 text-slate-400" />
                <span>الرتبة الممنوحة *</span>
              </label>
              {isAdmin ? (
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'manager' | 'employee')}
                  className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none"
                >
                  <option value="employee">موظف (Employee)</option>
                  <option value="manager">مدير (Manager)</option>
                  <option value="admin">مسؤول النظام (Admin)</option>
                </select>
              ) : (
                <div className="w-full px-3.5 h-10 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>موظف — Employee</span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-extrabold">
                    محدد للمدير
                  </span>
                </div>
              )}
            </div>

            <div className="md:col-span-12 flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-luxury px-6 py-2 text-xs font-bold flex items-center gap-2"
              >
                {isSubmitting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                <span>حفظ وإنشاء الحساب</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Employees Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">قائمة حسابات النظام</span>
            <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
              {employees.length} حساب
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            {isAdmin 
              ? 'تطبق الصلاحيات آلياً عبر Supabase Row Level Security' 
              : 'عرض قائمة فريق العمل (صلاحية إدارية خاصة بالمسؤول فقط)'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
            <FiRefreshCw className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-xs font-bold">جاري تحميل قائمة الموظفين...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <FiUsers className="w-10 h-10 stroke-1" />
            <span className="text-sm font-bold text-slate-600">لا يوجد موظفين مسجلين حالياً</span>
            <span className="text-xs">اضغط على زر "إضافة موظف جديد" لإنشاء أول حساب لفريق العمل.</span>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black text-slate-500 bg-slate-50/80">
                  <th className="py-3 px-4">الموظف (الاسم والبريد)</th>
                  <th className="py-3 px-4">الرتبة والصلاحية</th>
                  <th className="py-3 px-4">حالة الحساب</th>
                  <th className="py-3 px-4">تاريخ الإنشاء</th>
                  {isAdmin && (
                    <th className="py-3 px-4 text-left">إجراءات الإدارة</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {employees.map((emp) => {
                  const isCurrent = emp.user_id === currentUserId;
                  const displayName = emp.full_name && emp.full_name !== 'غير محدد' ? emp.full_name : 'غير محدد';
                  return (
                    <tr 
                      key={emp.user_id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        emp.is_disabled ? 'bg-slate-50/40 opacity-70' : ''
                      }`}
                    >
                      {/* Full Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {displayName}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                حسابك الحالي
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-medium" dir="ltr">
                            {emp.email}
                          </span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(emp.role)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {emp.is_disabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <FiUserX className="w-3 h-3 text-rose-600" />
                            <span>معطل ومحظور</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <FiUserCheck className="w-3 h-3 text-emerald-600" />
                            <span>نشط ومفعل</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {emp.created_at ? new Date(emp.created_at).toLocaleDateString('ar-EG', { dateStyle: 'medium' }) : '-'}
                      </td>

                      {/* Administrative Actions (Admin ONLY) */}
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit User Button */}
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-colors cursor-pointer outline-none"
                              title="تعديل الاسم والرتبة"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setResetTargetUser(emp);
                                setNewResetPassword('');
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-colors cursor-pointer outline-none"
                              title="إعادة تعيين كلمة المرور"
                            >
                              <FiKey className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Active / Disabled */}
                            {!isCurrent && (
                              <button
                                onClick={() => handleToggleStatus(emp)}
                                className={`p-1.5 border rounded-lg transition-colors cursor-pointer outline-none ${
                                  emp.is_disabled 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' 
                                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                }`}
                                title={emp.is_disabled ? 'إعادة تفعيل الحساب' : 'تعطيل الحساب'}
                              >
                                {emp.is_disabled ? <FiUserCheck className="w-3.5 h-3.5" /> : <FiUserX className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Delete Account */}
                            {!isCurrent && (
                              <button
                                onClick={() => handleDeleteEmployee(emp)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer outline-none"
                                title="حذف الحساب نهائياً"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal (Admin ONLY) */}
      {isAdmin && editTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 flex flex-col text-right animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FiEdit2 className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-black text-slate-900">تعديل بيانات الموظف</h3>
              </div>
              <button
                onClick={() => setEditTargetUser(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              الحساب: <span className="font-bold text-slate-800" dir="ltr">{editTargetUser.email}</span>
            </p>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600">الاسم الكامل للموظف *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="أدخل الاسم الكامل"
                  className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600">الرتبة والصلاحية *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'admin' | 'manager' | 'employee' | 'unassigned')}
                  disabled={editTargetUser.user_id === currentUserId}
                  className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="employee">موظف (Employee)</option>
                  <option value="manager">مدير (Manager)</option>
                  <option value="admin">مسؤول النظام (Admin)</option>
                  <option value="unassigned">غير محدد (Unassigned)</option>
                </select>
                {editTargetUser.user_id === currentUserId && (
                  <span className="text-[10px] text-slate-400">لا يمكنك تغيير رتبة حسابك كمسؤول رئيسي</span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTargetUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="btn-primary-luxury px-5 py-2 text-xs font-bold flex items-center gap-2"
                >
                  {isEditing ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal (Admin ONLY) */}
      {isAdmin && resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 flex flex-col text-right animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FiKey className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-black text-slate-900">إعادة تعيين كلمة المرور</h3>
              </div>
              <button
                onClick={() => setResetTargetUser(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              تعيين كلمة مرور جديدة للموظف <span className="font-bold text-slate-800" dir="ltr">({resetTargetUser.full_name || resetTargetUser.email})</span>
            </p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600">كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="لا تقل عن 6 أحرف"
                  className="w-full px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="btn-primary-luxury px-5 py-2 text-xs font-bold flex items-center gap-2"
                >
                  {isResetting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                  <span>حفظ كلمة المرور</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
