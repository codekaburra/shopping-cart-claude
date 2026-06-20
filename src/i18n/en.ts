// English UI strings. Same keys as zh-Hant.ts.

export const dictionary = {
  // App / shared
  appName: "Stationery Shop",
  appTagline: "Scan to order, pay cash on pickup",
  loading: "Loading…",

  // Login
  loginTitle: "Enter invite code",
  loginSubtitle: "Enter the invite code from the shop to start ordering",
  inviteCodePlaceholder: "Invite code",
  loginButton: "Enter shop",
  loginErrorInvalid: "Invalid or disabled invite code, please try again",
  loginErrorEmpty: "Please enter an invite code",

  // Shop
  shopTitle: "Shop stationery",
  categoryAll: "All",
  searchPlaceholder: "Search product ID, series or keyword",
  sidebarNote: "All products are managed by series and SKU (product ID).",
  promoCode: "Promo code",
  addToCart: "Add to cart",
  added: "Added",
  emptyProducts: "No products yet",
  viewProduct: "View details",
  priceFrom: "and up",
  variantsCount: "sizes",

  // Product detail
  selectSize: "Select size",
  productNotFound: "Product not found",
  outOfStock: "Out of stock",
  unitPrice: "Unit price",
  material: "Material",

  // Cart
  cartTitle: "Cart",
  cartEmpty: "Your cart is empty",
  cartEmptyHint: "Head back to the shop to pick some stationery",
  backToShop: "Continue shopping",
  remove: "Remove",
  subtotal: "Subtotal",
  total: "Total",
  goToCheckout: "Checkout",
  quantity: "Qty",

  // Checkout
  checkoutTitle: "Confirm order",
  fulfillmentLabel: "Fulfilment",
  fulfillmentPickup: "Pick up in store",
  fulfillmentDelivery: "Delivery",
  contactName: "Name",
  contactPhone: "Phone",
  address: "Delivery address",
  addressPlaceholder: "Enter the full delivery address",
  note: "Note (optional)",
  notePlaceholder: "Add any special requests",
  orderSummary: "Order summary",
  cashNotice: "We don't take online payment — please pay cash on pickup.",
  placeOrder: "Place order",
  placingOrder: "Placing order…",
  errorNameRequired: "Please enter your name",
  errorPhoneRequired: "Please enter your phone number",
  errorAddressRequired: "Delivery needs an address",
  errorOrderFailed: "Order failed, please try again later",

  // Order confirmation
  orderConfirmedTitle: "Order confirmed",
  orderNumber: "Order number",
  orderConfirmedNotice: "Please prepare cash and pay on pickup. Thank you!",
  contactInfo: "Contact details",
  deliveryTo: "Deliver to",
  pickupInStore: "Pick up in store",
  orderNotFound: "Order not found",

  // Common
  currencySymbol: "$",
} as const;
