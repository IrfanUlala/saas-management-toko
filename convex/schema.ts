import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const role = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("manager"),
  v.literal("cashier"),
  v.literal("inventory"),
  v.literal("staff"),
);

const recordStatus = v.union(v.literal("active"), v.literal("inactive"));

const paymentMethod = v.union(
  v.literal("cash"),
  v.literal("bankTransfer"),
  v.literal("debitCard"),
  v.literal("creditCard"),
  v.literal("qris"),
  v.literal("eWallet"),
  v.literal("other"),
);

const paymentStatus = v.union(
  v.literal("unpaid"),
  v.literal("partial"),
  v.literal("paid"),
  v.literal("refunded"),
);

export default defineSchema({
  ...authTables,

  users: defineTable({
    ...authTables.users.validator.fields,
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_token_identifier", ["tokenIdentifier"]),

  stores: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    businessType: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("suspended")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  memberships: defineTable({
    storeId: v.id("stores"),
    userId: v.id("users"),
    role,
    status: v.union(
      v.literal("invited"),
      v.literal("active"),
      v.literal("suspended"),
    ),
    invitedBy: v.optional(v.id("users")),
    joinedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_user", ["storeId", "userId"])
    .index("by_user", ["userId"])
    .index("by_store_and_status", ["storeId", "status"]),

  storeSettings: defineTable({
    storeId: v.id("stores"),
    currencyCode: v.string(),
    timezone: v.string(),
    receiptPrefix: v.string(),
    nextSaleNumber: v.number(),
    nextPurchaseNumber: v.number(),
    taxEnabled: v.boolean(),
    taxRate: v.number(),
    receiptFooter: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_store", ["storeId"]),

  categories: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    normalizedName: v.optional(v.string()),
    description: v.optional(v.string()),
    status: recordStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_name", ["storeId", "name"])
    .index("by_store_and_normalized_name", ["storeId", "normalizedName"])
    .index("by_store_and_status", ["storeId", "status"]),

  units: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    abbreviation: v.string(),
    normalizedAbbreviation: v.optional(v.string()),
    status: recordStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_abbreviation", ["storeId", "abbreviation"])
    .index("by_store_and_normalized_abbreviation", [
      "storeId",
      "normalizedAbbreviation",
    ])
    .index("by_store_and_status", ["storeId", "status"]),

  products: defineTable({
    storeId: v.id("stores"),
    sku: v.string(),
    barcode: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    baseUnitId: v.id("units"),
    purchasePrice: v.number(),
    salePrice: v.number(),
    lowStockThreshold: v.number(),
    shelfLocation: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    allowFractionalQuantity: v.boolean(),
    status: recordStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_sku", ["storeId", "sku"])
    .index("by_store_and_barcode", ["storeId", "barcode"])
    .index("by_store_and_category", ["storeId", "categoryId"])
    .index("by_store_and_status", ["storeId", "status"]),

  productUnitConversions: defineTable({
    storeId: v.id("stores"),
    productId: v.id("products"),
    unitId: v.id("units"),
    baseQuantity: v.number(),
    purchasePrice: v.optional(v.number()),
    salePrice: v.optional(v.number()),
    isDefaultForPurchase: v.boolean(),
    isDefaultForSale: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_product", ["storeId", "productId"])
    .index("by_product_and_unit", ["productId", "unitId"]),

  inventoryLevels: defineTable({
    storeId: v.id("stores"),
    productId: v.id("products"),
    quantity: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_product", ["storeId", "productId"])
    .index("by_store", ["storeId"]),

  inventoryMovements: defineTable({
    storeId: v.id("stores"),
    productId: v.id("products"),
    type: v.union(
      v.literal("openingBalance"),
      v.literal("purchase"),
      v.literal("sale"),
      v.literal("adjustment"),
      v.literal("return"),
      v.literal("damage"),
    ),
    quantityChange: v.number(),
    quantityBefore: v.number(),
    quantityAfter: v.number(),
    referenceType: v.optional(
      v.union(
        v.literal("purchase"),
        v.literal("sale"),
        v.literal("adjustment"),
        v.literal("return"),
      ),
    ),
    referenceId: v.optional(v.string()),
    note: v.optional(v.string()),
    performedBy: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_store_and_product_and_time", [
      "storeId",
      "productId",
      "createdAt",
    ])
    .index("by_store_and_time", ["storeId", "createdAt"])
    .index("by_store_and_type_and_time", ["storeId", "type", "createdAt"]),

  vendors: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    normalizedName: v.optional(v.string()),
    contactName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    note: v.optional(v.string()),
    status: recordStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_name", ["storeId", "name"])
    .index("by_store_and_normalized_name", ["storeId", "normalizedName"])
    .index("by_store_and_status", ["storeId", "status"]),

  customers: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    note: v.optional(v.string()),
    status: recordStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_name", ["storeId", "name"])
    .index("by_store_and_phone", ["storeId", "phone"])
    .index("by_store_and_status", ["storeId", "status"]),

  sales: defineTable({
    storeId: v.id("stores"),
    receiptNumber: v.string(),
    cashierId: v.id("users"),
    customerId: v.optional(v.id("customers")),
    customerName: v.optional(v.string()),
    subtotal: v.number(),
    discountAmount: v.number(),
    taxAmount: v.number(),
    totalAmount: v.number(),
    amountPaid: v.number(),
    changeAmount: v.number(),
    paymentStatus,
    status: v.union(
      v.literal("completed"),
      v.literal("voided"),
      v.literal("partiallyRefunded"),
      v.literal("refunded"),
    ),
    note: v.optional(v.string()),
    soldAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_receipt_number", ["storeId", "receiptNumber"])
    .index("by_store_and_time", ["storeId", "soldAt"])
    .index("by_store_and_cashier_and_time", [
      "storeId",
      "cashierId",
      "soldAt",
    ])
    .index("by_store_and_customer_and_time", [
      "storeId",
      "customerId",
      "soldAt",
    ])
    .index("by_store_and_status_and_time", ["storeId", "status", "soldAt"]),

  saleItems: defineTable({
    storeId: v.id("stores"),
    saleId: v.id("sales"),
    productId: v.optional(v.id("products")),
    productName: v.string(),
    sku: v.optional(v.string()),
    unitId: v.optional(v.id("units")),
    unitName: v.string(),
    quantity: v.number(),
    baseQuantity: v.number(),
    unitPrice: v.number(),
    unitCost: v.number(),
    discountAmount: v.number(),
    lineTotal: v.number(),
  })
    .index("by_sale", ["saleId"])
    .index("by_store_and_product", ["storeId", "productId"]),

  salePayments: defineTable({
    storeId: v.id("stores"),
    saleId: v.id("sales"),
    method: paymentMethod,
    amount: v.number(),
    reference: v.optional(v.string()),
    paidAt: v.number(),
    receivedBy: v.id("users"),
  })
    .index("by_sale", ["saleId"])
    .index("by_store_and_time", ["storeId", "paidAt"]),

  purchases: defineTable({
    storeId: v.id("stores"),
    purchaseNumber: v.string(),
    vendorId: v.id("vendors"),
    vendorName: v.string(),
    invoiceNumber: v.optional(v.string()),
    createdBy: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("ordered"),
      v.literal("partiallyReceived"),
      v.literal("received"),
      v.literal("cancelled"),
    ),
    paymentStatus,
    subtotal: v.number(),
    discountAmount: v.number(),
    taxAmount: v.number(),
    totalAmount: v.number(),
    amountPaid: v.number(),
    note: v.optional(v.string()),
    purchasedAt: v.number(),
    receivedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_store_and_purchase_number", ["storeId", "purchaseNumber"])
    .index("by_store_and_time", ["storeId", "purchasedAt"])
    .index("by_store_and_vendor_and_time", [
      "storeId",
      "vendorId",
      "purchasedAt",
    ])
    .index("by_store_and_status_and_time", [
      "storeId",
      "status",
      "purchasedAt",
    ]),

  purchaseItems: defineTable({
    storeId: v.id("stores"),
    purchaseId: v.id("purchases"),
    productId: v.id("products"),
    productName: v.string(),
    sku: v.optional(v.string()),
    unitId: v.optional(v.id("units")),
    unitName: v.string(),
    quantity: v.number(),
    baseQuantity: v.number(),
    unitCost: v.number(),
    discountAmount: v.number(),
    lineTotal: v.number(),
    receivedBaseQuantity: v.number(),
  })
    .index("by_purchase", ["purchaseId"])
    .index("by_store_and_product", ["storeId", "productId"]),

  purchasePayments: defineTable({
    storeId: v.id("stores"),
    purchaseId: v.id("purchases"),
    method: paymentMethod,
    amount: v.number(),
    reference: v.optional(v.string()),
    paidAt: v.number(),
    recordedBy: v.id("users"),
  })
    .index("by_purchase", ["purchaseId"])
    .index("by_store_and_time", ["storeId", "paidAt"]),

  employees: defineTable({
    storeId: v.id("stores"),
    userId: v.optional(v.id("users")),
    employeeCode: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    status: recordStatus,
    hiredAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_employee_code", ["storeId", "employeeCode"])
    .index("by_store_and_user", ["storeId", "userId"])
    .index("by_store_and_status", ["storeId", "status"]),

  shifts: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    breakMinutes: v.optional(v.number()),
    status: recordStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_name", ["storeId", "name"])
    .index("by_store_and_status", ["storeId", "status"]),

  attendance: defineTable({
    storeId: v.id("stores"),
    employeeId: v.id("employees"),
    shiftId: v.optional(v.id("shifts")),
    attendanceDate: v.number(),
    status: v.union(
      v.literal("present"),
      v.literal("late"),
      v.literal("absent"),
      v.literal("leave"),
    ),
    clockInAt: v.optional(v.number()),
    clockOutAt: v.optional(v.number()),
    note: v.optional(v.string()),
    recordedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_employee_and_attendance_date", [
      "storeId",
      "employeeId",
      "attendanceDate",
    ])
    .index("by_employee_and_attendance_date", [
      "employeeId",
      "attendanceDate",
    ])
    .index("by_store_and_attendance_date", ["storeId", "attendanceDate"]),

  expenseCategories: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    status: recordStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_name", ["storeId", "name"])
    .index("by_store_and_status", ["storeId", "status"]),

  expenses: defineTable({
    storeId: v.id("stores"),
    categoryId: v.optional(v.id("expenseCategories")),
    title: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    method: paymentMethod,
    receiptStorageId: v.optional(v.id("_storage")),
    recordedBy: v.id("users"),
    incurredAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store_and_time", ["storeId", "incurredAt"])
    .index("by_store_and_category_and_time", [
      "storeId",
      "categoryId",
      "incurredAt",
    ])
    .index("by_store_and_recorder_and_time", [
      "storeId",
      "recordedBy",
      "incurredAt",
    ]),

  cashSessions: defineTable({
    storeId: v.id("stores"),
    cashierId: v.id("users"),
    status: v.union(v.literal("open"), v.literal("closed")),
    openingCash: v.number(),
    expectedCash: v.optional(v.number()),
    closingCash: v.optional(v.number()),
    cashDifference: v.optional(v.number()),
    openedAt: v.number(),
    closedAt: v.optional(v.number()),
    note: v.optional(v.string()),
  })
    .index("by_store_and_cashier_and_opened_at", [
      "storeId",
      "cashierId",
      "openedAt",
    ])
    .index("by_store_and_status_and_opened_at", [
      "storeId",
      "status",
      "openedAt",
    ]),
});
