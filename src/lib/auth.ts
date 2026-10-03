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
