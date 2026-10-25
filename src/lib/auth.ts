import { DemoUser, INITIAL_USERS } from "./demo-store";

export type UserRole = "ADMIN" | "MANAGER" | "SALESPERSON" | "INVENTORY_STAFF";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Owner / Admin",
  MANAGER: "Manager",
  SALESPERSON: "Salesperson",
  INVENTORY_STAFF: "Inventory Staff",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: "Full access to all modules, financials, reports, and system settings.",
  MANAGER: "Access to Inventory, Sales, Customers, Reports, and Staff overview.",
  SALESPERSON: "Access to Customers, Leads, Follow-ups, Test Drives, Reservations, and Sales.",
  INVENTORY_STAFF: "Access to Vehicles, Acquisition, Vehicle Expenses, Suppliers, and Vehicle Status.",
};

export interface RolePermissions {
  canViewAllFinancials: boolean;
  canManageInventory: boolean;
  canManageCosts: boolean;
  canManageCRM: boolean;
  canManageSales: boolean;
  canManageSuppliers: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
}

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case "ADMIN":
      return {
        canViewAllFinancials: true,
        canManageInventory: true,
        canManageCosts: true,
        canManageCRM: true,
        canManageSales: true,
        canManageSuppliers: true,
        canViewReports: true,
        canManageUsers: true,
        canManageSettings: true,
      };
    case "MANAGER":
      return {
        canViewAllFinancials: true,
        canManageInventory: true,
        canManageCosts: true,
        canManageCRM: true,
        canManageSales: true,
        canManageSuppliers: true,
        canViewReports: true,
        canManageUsers: false,
        canManageSettings: true,
      };
    case "SALESPERSON":
      return {
        canViewAllFinancials: false,
        canManageInventory: false,
        canManageCosts: false,
        canManageCRM: true,
        canManageSales: true,
        canManageSuppliers: false,
        canViewReports: true,
        canManageUsers: false,
        canManageSettings: false,
      };
    case "INVENTORY_STAFF":
      return {
        canViewAllFinancials: false,
        canManageInventory: true,
        canManageCosts: true,
        canManageCRM: false,
        canManageSales: false,
        canManageSuppliers: true,
        canViewReports: true,
        canManageUsers: false,
        canManageSettings: false,
      };
  }
}

export function getDefaultUser(): DemoUser {
  return INITIAL_USERS[0]; // David Mwangi (Owner / Admin)
}

export function canAccessRoute(
  pathname: string,
  permissions: RolePermissions
): { allowed: boolean; requiredPermissionLabel?: string } {
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/showroom") ||
    pathname === "/dashboard" ||
    pathname === "/inventory" ||
    (pathname.startsWith("/inventory/") &&
      pathname !== "/inventory/add" &&
      pathname !== "/inventory/costs")
  ) {
    return { allowed: true };
  }

  if (pathname === "/inventory/add") {
    return {
      allowed: permissions.canManageInventory,
      requiredPermissionLabel: "Inventory Management (Admin, Manager, or Inventory Staff)",
    };
  }

  if (pathname === "/inventory/costs") {
    return {
      allowed: permissions.canManageCosts,
      requiredPermissionLabel: "Vehicle Costs & Financials (Admin, Manager, or Inventory Staff)",
    };
  }

  if (pathname.startsWith("/suppliers")) {
    return {
      allowed: permissions.canManageSuppliers,
      requiredPermissionLabel: "Supplier Management (Admin, Manager, or Inventory Staff)",
    };
  }

  if (
    pathname.startsWith("/customers") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/pipeline") ||
    pathname.startsWith("/follow-ups") ||
    pathname.startsWith("/test-drives") ||
    pathname.startsWith("/reservations") ||
    pathname.startsWith("/ai-conversations")
  ) {
    return {
      allowed: permissions.canManageCRM || permissions.canManageSales,
      requiredPermissionLabel: "CRM & Sales Pipeline Access (Admin, Manager, or Salesperson)",
    };
  }

  if (pathname.startsWith("/sales")) {
    return {
      allowed: permissions.canManageSales,
      requiredPermissionLabel: "Sales Management (Admin, Manager, or Salesperson)",
    };
  }

  if (pathname.startsWith("/reports")) {
    return {
      allowed: permissions.canViewReports,
      requiredPermissionLabel: "Reports Access",
    };
  }

  if (pathname.startsWith("/settings") || pathname.startsWith("/ai-settings")) {
    return {
      allowed: permissions.canManageSettings,
      requiredPermissionLabel: "System & Website Settings (Owner / Admin or Manager)",
    };
  }

  return { allowed: true };
}

