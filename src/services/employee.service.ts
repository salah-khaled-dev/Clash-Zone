import { supabase } from '../lib/supabase';

export interface EmployeeAccount {
  user_id: string;
  email: string;
  full_name?: string | null;
  role: 'admin' | 'manager' | 'employee' | 'unassigned';
  created_at: string;
  last_sign_in_at?: string | null;
  is_disabled: boolean;
}

function parseErrorMessage(err: any): string {
  if (!err) return 'حدث خطأ غير متوقع';
  const raw = typeof err === 'string' ? err : err.message || JSON.stringify(err);

  if (raw.includes('Failed to send a request to the Edge Function') || raw.includes('Failed to fetch')) {
    return 'فشل الاتصال بالدالة السحابية. يرجى التحقق من اتصال الإنترنت.';
  }
  if (raw.includes('Missing Authorization header') || raw.includes('Invalid or expired token')) {
    return 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول.';
  }
  if (raw.includes('Forbidden: Admin privileges required')) {
    return 'عفواً، يتطلب هذا الإجراء صلاحيات مسؤول النظام (Admin).';
  }
  if (raw.includes('already registered') || raw.includes('already been registered')) {
    return 'هذا البريد الإلكتروني مسجل مسبقاً لمستخدم آخر';
  }
  if (raw.includes('Password should be at least') || raw.includes('at least 6 characters')) {
    return 'كلمة المرور يجب أن لا تقل عن 6 أحرف';
  }
  return raw;
}

export const employeeService = {
  /**
   * List all employees (Admin only)
   */
  async listEmployees(): Promise<EmployeeAccount[]> {
    const { data, error } = await supabase.functions.invoke('manage-employee', {
      body: { action: 'list' },
    });

    if (error) {
      console.error('Error listing employees from Edge Function, attempting fallback:', error);
      // Fallback: Query ClashZone_user_roles directly via RLS
      const { data: rolesData, error: rolesErr } = await supabase
        .from('ClashZone_user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesErr) {
        throw new Error(parseErrorMessage(rolesErr));
      }

      return (rolesData || []).map((r) => ({
        user_id: r.user_id,
        email: r.email || 'غير متوفر',
        full_name: r.full_name || 'غير محدد',
        role: r.role as EmployeeAccount['role'],
        created_at: r.created_at || new Date().toISOString(),
        is_disabled: r.is_active === false,
      }));
    }

    if (data?.error) {
      throw new Error(parseErrorMessage(data.error));
    }

    return (data?.employees || []) as EmployeeAccount[];
  },

  /**
   * Create a new employee using official Supabase Auth Admin API
   */
  async createEmployee(
    fullName: string,
    email: string,
    password: string,
    role: 'admin' | 'manager' | 'employee'
  ): Promise<EmployeeAccount> {
    const { data, error } = await supabase.functions.invoke('manage-employee', {
      body: {
        action: 'create',
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      },
    });

    if (error) {
      console.error('Error creating employee:', error);
      throw new Error(parseErrorMessage(error));
    }

    if (data?.error) {
      throw new Error(parseErrorMessage(data.error));
    }

    return data as EmployeeAccount;
  },

  /**
   * Edit employee full name & role (Admin only)
   */
  async editUser(
    userId: string,
    fullName: string,
    role: 'admin' | 'manager' | 'employee' | 'unassigned'
  ): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-employee', {
      body: {
        action: 'edit_user',
        user_id: userId,
        full_name: fullName.trim(),
        role,
      },
    });

    if (error) {
      throw new Error(parseErrorMessage(error));
    }

    if (data?.error) {
      throw new Error(parseErrorMessage(data.error));
    }
  },

  /**
   * Update employee role (Admin only)
   */
  async updateRole(userId: string, newRole: 'admin' | 'manager' | 'employee' | 'unassigned'): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-employee', {
      body: {
        action: 'update_role',
        user_id: userId,
        new_role: newRole,
      },
    });

    if (error) {
      throw new Error(parseErrorMessage(error));
    }

    if (data?.error) {
      throw new Error(parseErrorMessage(data.error));
    }
  },

  /**
   * Toggle disable / enable employee access (Admin only)
   */
  async toggleStatus(userId: string, disable: boolean): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-employee', {
      body: {
        action: 'toggle_status',
        user_id: userId,
        disable,
      },
    });

    if (error) {
      throw new Error(parseErrorMessage(error));
    }

    if (data?.error) {
      throw new Error(parseErrorMessage(data.error));
    }
  },

  /**
   * Reset employee password (Admin only)
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-employee', {
      body: {
        action: 'reset_password',
        user_id: userId,
        new_password: newPassword,
      },
    });

    if (error) {
      throw new Error(parseErrorMessage(error));
    }

    if (data?.error) {
      throw new Error(parseErrorMessage(data.error));
    }
  },

  /**
   * Permanently delete employee account (Admin only)
   */
  async deleteEmployee(userId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-employee', {
      body: {
        action: 'delete',
        user_id: userId,
      },
    });

    if (error) {
      throw new Error(parseErrorMessage(error));
    }

    if (data?.error) {
      throw new Error(parseErrorMessage(data.error));
    }
  },
};
