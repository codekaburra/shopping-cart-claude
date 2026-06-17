// Rich block-content samples for product detail pages, keyed by seriesCode.
// Not yet wired into the schema/import — kept here verbatim for the future
// detail-page work (the Product.detailContent field is ready to hold this as JSON).
//
// The renderer will map each block `type` to a React component, so styling and
// responsiveness stay under our control and there is no raw-HTML / XSS surface.

export type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "list"; style: "bullet" | "number"; items: string[] }
  | { type: "callout"; tone: "note" | "warning"; text: string }
  | { type: "table"; columns: string[]; rows: string[][] };

export const detailContentSamples: Record<string, Block[]> = {
  "PEN-GEL-SMOOTH": [
    { type: "heading", level: 2, text: "PEN-GEL-SMOOTH 極順中性筆" },
    {
      type: "paragraph",
      text: "主打滑順書寫與低阻尼手感，適合長時間筆記、會議速記與日常簽寫。",
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80",
      alt: "PEN-GEL-SMOOTH 產品主視覺",
      caption: "霧面筆桿與防滑握位",
    },
    { type: "heading", level: 3, text: "材質與結構" },
    {
      type: "list",
      style: "bullet",
      items: [
        "筆桿：ABS 樹脂 + 霧面塗層",
        "筆尖：不鏽鋼 0.5 mm",
        "墨水：快乾凝膠墨水（黑）",
        "可替換筆芯：PEN-GEL-REFILL-05-BLK",
      ],
    },
    { type: "heading", level: 3, text: "使用建議" },
    {
      type: "paragraph",
      text: "適合紙本手帳、會議記錄與學習筆記。若搭配較薄紙張，建議先以 45 度筆角書寫減少暈墨。",
    },
    {
      type: "callout",
      tone: "note",
      text: "本系列支援客製雷雕（MOQ 100 支），交期約 14 個工作天。",
    },
    {
      type: "table",
      columns: ["規格", "值"],
      rows: [
        ["系列代碼", "PEN-GEL-SMOOTH"],
        ["筆尖", "0.5 mm"],
        ["墨色", "Black"],
        ["單支重量", "11 g"],
      ],
    },
  ],
};
