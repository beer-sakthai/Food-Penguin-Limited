export type Role = "Admin" | "Manager" | "Staff" | "User";

export const rolePermissions: Record<Role, string[]> = {
  Admin: ["Overview", "Solution", "Advisor", "Sell", "Targets & Production", "Waste", "Hours", "Suppliers", "P&L", "Reports", "Analytics", "Price Import"],
  Manager: ["Overview", "Solution", "Sell", "Targets & Production", "Waste", "Hours", "Suppliers", "P&L", "Reports", "Price Import"],
  Staff: ["Overview", "Targets & Production", "Waste", "Hours", "Suppliers", "Price Import"],
  User: ["Overview"],
};
