export const APP_NAME = "PharmaCare";

export const USER_ROLES = {
  OWNER: "owner",
  STAFF: "staff",
} as const;

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    roles: ["owner", "staff"],
  },
  {
    title: "Billing",
    href: "/billing",
    icon: "Receipt",
    roles: ["owner", "staff"],
  },
  {
    title: "Product Search",
    href: "/products",
    icon: "Search",
    roles: ["owner", "staff"],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: "Package",
    roles: ["owner"],
  },
  {
    title: "Purchases",
    href: "/purchases",
    icon: "ShoppingCart",
    roles: ["owner"],
  },
  {
    title: "Sales History",
    href: "/sales",
    icon: "TrendingUp",
    roles: ["owner"],
  },
  {
    title: "Expiry Tracker",
    href: "/expiry",
    icon: "AlertTriangle",
    roles: ["owner"],
  },
  {
    title: "GST Reports",
    href: "/gst",
    icon: "FileText",
    roles: ["owner"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "BarChart3",
    roles: ["owner"],
  },
  {
    title: "Audit Logs",
    href: "/audit",
    icon: "ClipboardList",
    roles: ["owner"],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: "Users",
    roles: ["owner", "staff"],
  },
  {
    title: "Backup & Export",
    href: "/backup",
    icon: "Download",
    roles: ["owner"],
  },
  {
    title: "User Management",
    href: "/users",
    icon: "Users",
    roles: ["owner"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
    roles: ["owner"],
  },
] as const;

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const UNIT_TYPES = [
  "Tablet",
  "Capsule",
  "Strip",
  "Box",
  "Bottle",
  "Syrup",
  "Injection",
  "Sachet",
  "Tube",
  "ml",
  "gm",
  "Nos",
] as const;

export const DRUG_SCHEDULES = ["H", "H1", "X"] as const;

export const PAYMENT_METHODS = ["cash", "upi", "card"] as const;
