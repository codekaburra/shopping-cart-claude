// UI string dictionary. Keys are English identifiers; values are the
// Traditional Chinese text shown to users. Default (and currently only)
// locale is zh-Hant; the shape is ready for an `en` locale to be added later.

export const dictionary = {
  // App / shared
  appName: "文具網購",
  appTagline: "掃碼下單，到時付現金",
  loading: "載入中…",

  // Login
  loginTitle: "輸入邀請碼",
  loginSubtitle: "請輸入店家提供的邀請碼以開始下單",
  inviteCodePlaceholder: "邀請碼",
  loginButton: "進入商店",
  loginErrorInvalid: "邀請碼無效或已停用，請重試",
  loginErrorEmpty: "請輸入邀請碼",

  // Shop
  shopTitle: "選購文具",
  categoryAll: "全部",
  searchPlaceholder: "搜尋產品 ID、系列或關鍵字",
  sidebarNote: "所有商品以系列與 SKU（產品 ID）管理。",
  promoCode: "優惠碼",
  addToCart: "加入購物車",
  added: "已加入",
  emptyProducts: "暫時未有商品",
  viewProduct: "查看詳情",
  priceFrom: "起",
  variantsCount: "款尺寸",

  // Product detail
  selectSize: "選擇尺寸",
  productNotFound: "找不到此商品",
  outOfStock: "暫時缺貨",
  unitPrice: "單價",
  material: "材質",

  // Cart
  cartTitle: "購物車",
  cartEmpty: "購物車是空的",
  cartEmptyHint: "返回商店挑選文具吧",
  backToShop: "繼續選購",
  remove: "移除",
  subtotal: "小計",
  total: "總計",
  goToCheckout: "去結帳",
  quantity: "數量",

  // Checkout
  checkoutTitle: "確認訂單",
  fulfillmentLabel: "取貨方式",
  fulfillmentPickup: "到店自取",
  fulfillmentDelivery: "送貨上門",
  contactName: "姓名",
  contactPhone: "電話",
  address: "送貨地址",
  addressPlaceholder: "請填寫詳細送貨地址",
  note: "備註（可選）",
  notePlaceholder: "如有特別要求請註明",
  orderSummary: "訂單摘要",
  cashNotice: "本店不設網上付款，請於取貨時以現金付款。",
  placeOrder: "確認下單",
  placingOrder: "下單中…",
  errorNameRequired: "請填寫姓名",
  errorPhoneRequired: "請填寫電話",
  errorAddressRequired: "送貨需要填寫地址",
  errorOrderFailed: "下單失敗，請稍後再試",

  // Order confirmation
  orderConfirmedTitle: "訂單已確認",
  orderNumber: "訂單編號",
  orderConfirmedNotice: "請準備現金，於取貨時付款。多謝惠顧！",
  contactInfo: "聯絡資料",
  deliveryTo: "送貨至",
  pickupInStore: "到店自取",
  orderNotFound: "找不到此訂單",

  // Common
  currencySymbol: "$",
} as const;
