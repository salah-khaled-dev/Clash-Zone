// Supabase Edge Function: manage-employee
// Uses the official Supabase Auth Admin API (service_role) in a secure server-side runtime.
// Authorizes 'admin' (full user management) and 'manager' (create employee accounts ONLY).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: missing service credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client with privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Verify caller authentication
    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Read caller role and active state from trusted database
    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from("ClashZone_user_roles")
      .select("role, is_active")
      .eq("user_id", callerUser.id)
      .maybeSingle();

    if (roleError || !roleRow || roleRow.is_active === false) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Account inactive or role not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerRole = roleRow.role;
    if (callerRole !== "admin" && callerRole !== "manager") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin or Manager privileges required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      // -------------------------------------------------------------
      // 1. List employees (Admin & Manager can view)
      // -------------------------------------------------------------
      case "list": {
        const { data: roles, error: rolesQueryErr } = await supabaseAdmin
          .from("ClashZone_user_roles")
          .select("*")
          .order("created_at", { ascending: false });

        if (rolesQueryErr) {
          throw rolesQueryErr;
        }

        // Fetch auth users to get banned status and last sign in
        const { data: authData, error: listUsersErr } = await supabaseAdmin.auth.admin.listUsers({
          perPage: 1000
        });
        
        if (listUsersErr) {
          console.warn("Could not list auth users, using database roles only:", listUsersErr);
        }

        const authUserMap = new Map((authData?.users || []).map((u) => [u.id, u]));

        const enrichedEmployees = (roles || []).map((r) => {
          const authUser = authUserMap.get(r.user_id);
          const bannedUntil = authUser?.banned_until;
          const isBanned = !!bannedUntil && new Date(bannedUntil).getTime() > Date.now();
          const isDisabled = r.is_active === false || isBanned;
          return {
            user_id: r.user_id,
            email: r.email || authUser?.email || "غير معروف",
            full_name: r.full_name || authUser?.user_metadata?.full_name || "غير محدد",
            role: r.role,
            created_at: r.created_at || authUser?.created_at,
            last_sign_in_at: authUser?.last_sign_in_at || null,
            is_disabled: isDisabled,
          };
        });

        return new Response(JSON.stringify({ success: true, employees: enrichedEmployees }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // -------------------------------------------------------------
      // 2. Create User Account (Admin: Any role | Manager: Employee ONLY)
      // -------------------------------------------------------------
      case "create": {
        const { email, password, role = "employee", full_name = "" } = body;

        // CRITICAL SECURITY RULE: Managers can CREATE Employee accounts ONLY
        if (callerRole === "manager") {
          if (role && role !== "employee") {
            return new Response(
              JSON.stringify({ error: "المدير يمكنه إنشاء حساب موظف فقط" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        const cleanFullName = String(full_name).trim();
        if (!cleanFullName || cleanFullName.length < 2) {
          return new Response(
            JSON.stringify({ error: "الاسم الكامل للموظف مطلوب" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (password.length < 6) {
          return new Response(
            JSON.stringify({ error: "كلمة المرور يجب أن لا تقل عن 6 أحرف" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Role assignment:
        // Admin: can assign 'admin', 'manager', 'employee'
        // Manager: STRICTLY forced to 'employee'
        const validRoles = ["admin", "manager", "employee"];
        let assignedRole = "employee";
        if (callerRole === "admin") {
          assignedRole = validRoles.includes(role) ? role : "employee";
        } else {
          assignedRole = "employee";
        }

        // Create user using official Supabase Auth Admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password: password,
          email_confirm: true,
          user_metadata: { 
            role: assignedRole,
            full_name: cleanFullName,
            created_by_user_id: callerUser.id
          },
        });

        if (createError) {
          let localizedMsg = createError.message;
          if (localizedMsg.includes("already registered") || localizedMsg.includes("already been registered")) {
            localizedMsg = "البريد الإلكتروني مستخدم بالفعل";
          }
          return new Response(
            JSON.stringify({ error: localizedMsg }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Upsert role & full_name in public.ClashZone_user_roles
        const { error: upsertRoleErr } = await supabaseAdmin
          .from("ClashZone_user_roles")
          .upsert({
            user_id: newUser.user.id,
            role: assignedRole,
            full_name: cleanFullName,
            email: email.trim().toLowerCase(),
            is_active: true,
            created_at: new Date().toISOString(),
          });

        if (upsertRoleErr) {
          console.error("Error setting role in database:", upsertRoleErr);
        }

        return new Response(
          JSON.stringify({
            success: true,
            user_id: newUser.user.id,
            email: email.trim().toLowerCase(),
            full_name: cleanFullName,
            role: assignedRole,
            is_disabled: false
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // -------------------------------------------------------------
      // 3. Edit User Full Name & Role (Admin ONLY)
      // -------------------------------------------------------------
      case "edit_user": {
        if (callerRole !== "admin") {
          return new Response(
            JSON.stringify({ error: "ليس لديك صلاحية لتنفيذ هذا الإجراء" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { user_id, full_name, role } = body;

        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "معرف المستخدم مطلوب" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (user_id === callerUser.id && role && role !== "admin") {
          return new Response(
            JSON.stringify({ error: "لا يمكن تعديل رتبة حسابك كمسؤول" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: Record<string, unknown> = {};
        const metaUpdate: Record<string, unknown> = {};

        if (full_name !== undefined) {
          const cleanName = String(full_name).trim();
          if (cleanName.length < 2) {
            return new Response(
              JSON.stringify({ error: "الاسم الكامل غير صالح" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          updateData.full_name = cleanName;
          metaUpdate.full_name = cleanName;
        }

        if (role !== undefined) {
          const validRoles = ["admin", "manager", "employee", "unassigned"];
          if (!validRoles.includes(role)) {
            return new Response(
              JSON.stringify({ error: "رتبة غير صالحة" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          updateData.role = role;
          metaUpdate.role = role;
        }

        if (Object.keys(updateData).length > 0) {
          const { error: updateErr } = await supabaseAdmin
            .from("ClashZone_user_roles")
            .update(updateData)
            .eq("user_id", user_id);

          if (updateErr) {
            throw updateErr;
          }

          if (Object.keys(metaUpdate).length > 0) {
            await supabaseAdmin.auth.admin.updateUserById(user_id, {
              user_metadata: metaUpdate,
            });
          }
        }

        return new Response(
          JSON.stringify({ success: true, user_id, ...updateData }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // -------------------------------------------------------------
      // 4. Update Role (Admin ONLY)
      // -------------------------------------------------------------
      case "update_role": {
        if (callerRole !== "admin") {
          return new Response(
            JSON.stringify({ error: "ليس لديك صلاحية لتنفيذ هذا الإجراء" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { user_id, new_role } = body;

        if (!user_id || !new_role) {
          return new Response(
            JSON.stringify({ error: "معرف المستخدم والرتبة مطلوبان" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (user_id === callerUser.id && new_role !== "admin") {
          return new Response(
            JSON.stringify({ error: "لا يمكن تعديل رتبة حسابك كمسؤول" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const validRoles = ["admin", "manager", "employee", "unassigned"];
        if (!validRoles.includes(new_role)) {
          return new Response(
            JSON.stringify({ error: "رتبة غير صالحة" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateRoleErr } = await supabaseAdmin
          .from("ClashZone_user_roles")
          .update({ role: new_role })
          .eq("user_id", user_id);

        if (updateRoleErr) {
          throw updateRoleErr;
        }

        await supabaseAdmin.auth.admin.updateUserById(user_id, {
          user_metadata: { role: new_role },
        });

        return new Response(
          JSON.stringify({ success: true, user_id, role: new_role }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // -------------------------------------------------------------
      // 5. Toggle disable / enable access (Admin ONLY)
      // -------------------------------------------------------------
      case "toggle_status": {
        if (callerRole !== "admin") {
          return new Response(
            JSON.stringify({ error: "ليس لديك صلاحية لتنفيذ هذا الإجراء" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { user_id, disable } = body;

        if (!user_id || typeof disable !== "boolean") {
          return new Response(
            JSON.stringify({ error: "معرف المستخدم والحالة مطلوبان" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (user_id === callerUser.id) {
          return new Response(
            JSON.stringify({ error: "لا يمكنك تعطيل حسابك كمسؤول" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prevent deactivating the last active Admin
        if (disable) {
          const { data: targetRole } = await supabaseAdmin
            .from("ClashZone_user_roles")
            .select("role")
            .eq("user_id", user_id)
            .maybeSingle();

          if (targetRole?.role === "admin") {
            const { count } = await supabaseAdmin
              .from("ClashZone_user_roles")
              .select("*", { count: "exact", head: true })
              .eq("role", "admin")
              .eq("is_active", true);

            if (count !== null && count <= 1) {
              return new Response(
                JSON.stringify({ error: "لا يمكن تعطيل آخر مسؤول نظام نشط في المنظومة" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }

        // Update database active state
        await supabaseAdmin
          .from("ClashZone_user_roles")
          .update({ is_active: !disable })
          .eq("user_id", user_id);

        // Update Supabase Auth ban status
        const { error: banErr } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
          ban_duration: disable ? "876000h" : "none", // 100 years or none
        });

        if (banErr) {
          console.warn("Could not update auth ban duration:", banErr);
        }

        return new Response(
          JSON.stringify({ success: true, user_id, is_disabled: disable }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // -------------------------------------------------------------
      // 6. Reset employee password (Admin ONLY)
      // -------------------------------------------------------------
      case "reset_password": {
        if (callerRole !== "admin") {
          return new Response(
            JSON.stringify({ error: "ليس لديك صلاحية لتنفيذ هذا الإجراء" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { user_id, new_password } = body;

        if (!user_id || !new_password || new_password.length < 6) {
          return new Response(
            JSON.stringify({ error: "كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: passErr } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
          password: new_password,
        });

        if (passErr) {
          throw passErr;
        }

        return new Response(
          JSON.stringify({ success: true, user_id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // -------------------------------------------------------------
      // 7. Delete employee account (Admin ONLY)
      // -------------------------------------------------------------
      case "delete": {
        if (callerRole !== "admin") {
          return new Response(
            JSON.stringify({ error: "ليس لديك صلاحية لتنفيذ هذا الإجراء" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { user_id } = body;

        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "معرف المستخدم مطلوب" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (user_id === callerUser.id) {
          return new Response(
            JSON.stringify({ error: "لا يمكنك حذف حسابك كمسؤول" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prevent deleting the last active admin
        const { data: targetRole } = await supabaseAdmin
          .from("ClashZone_user_roles")
          .select("role")
          .eq("user_id", user_id)
          .maybeSingle();

        if (targetRole?.role === "admin") {
          const { count } = await supabaseAdmin
            .from("ClashZone_user_roles")
            .select("*", { count: "exact", head: true })
            .eq("role", "admin")
            .eq("is_active", true);

          if (count !== null && count <= 1) {
            return new Response(
              JSON.stringify({ error: "لا يمكن حذف آخر مسؤول نظام نشط في المنظومة" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Delete from ClashZone_user_roles first
        await supabaseAdmin.from("ClashZone_user_roles").delete().eq("user_id", user_id);

        // Delete from Supabase Auth
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user_id);
        if (delErr) {
          throw delErr;
        }

        return new Response(
          JSON.stringify({ success: true, user_id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `إجراء غير معروف: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Unhandled error in manage-employee function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "حدث خطأ غير متوقع في الخادم" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
