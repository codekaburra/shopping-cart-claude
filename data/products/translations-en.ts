// English translations overlaid on the Chinese catalog snapshot at import time.
// Keeps the source snapshot (catalog-2026-06-17.ts) clean; this is the en layer.
// Keyed by the same identifiers (category code, subCategory text, seriesId).

export const topCategoryEn: Record<string, string> = {
  Pens: "Pens",
  Notebooks: "Notebooks",
  Tape: "Tape",
  Paper: "Paper",
  Tools: "Tools & Office",
  Refills: "Refills",
};

// Keyed by the Chinese subCategory string used in the catalog.
export const subCategoryEn: Record<string, string> = {
  原子筆: "Ballpoint Pens",
  中性筆: "Gel Pens",
  "水性筆.簽字筆.細字筆": "Water-based / Sign / Fineliner Pens",
  螢光筆: "Highlighters",
  自動鉛筆: "Mechanical Pencils",
  方格筆記本: "Grid Notebooks",
  點陣手帳: "Dot-grid Journals",
  線圈筆記簿: "Spiral Notebooks",
  紙膠帶: "Washi Tape",
  修正帶: "Correction Tape",
  便條紙: "Memo Pads",
  影印紙: "Copy Paper",
  彩色卡紙: "Coloured Card",
  尺規: "Rulers",
  長尾夾: "Binder Clips",
  美工刀: "Utility Knives",
  訂書機: "Staplers",
  "筆管.筆芯.替芯": "Pen Barrels / Refills",
  訂書針: "Staples",
  週計劃本: "Weekly Planners",
  剪刀: "Scissors",
  封箱膠帶: "Packing Tape",
  標籤貼紙: "Label Stickers",
  "壓克力/廣告/顏料畫材 / 油壺": "Acrylic & Paint Supplies / Oil Pot",
  "壓克力/廣告/顏料畫材 / 畫筆": "Acrylic & Paint Supplies / Brushes",
  "壓克力/廣告/顏料畫材 / 排筆": "Acrylic & Paint Supplies / Flat Brushes",
  "壓克力/廣告/顏料畫材 / 廣告顏料/國畫/版畫":
    "Acrylic & Paint Supplies / Gouache, Ink & Printmaking",
  "壓克力/廣告/顏料畫材 / 油畫/陶磁/壓克力顏料":
    "Acrylic & Paint Supplies / Oil, Ceramic & Acrylic Paint",
  "壓克力/廣告/顏料畫材 / 插畫顏料":
    "Acrylic & Paint Supplies / Illustration Paint",
  "水彩 / 整組水彩": "Watercolour / Watercolour Sets",
  "水彩 / 水彩筆": "Watercolour / Watercolour Brushes",
  "水彩 / 調色盤": "Watercolour / Palettes",
  "便條盒/便條座/便條台/便條夾": "Memo Holders & Stands",
  "證件套/證件帶/桌牌/立牌/名牌/貼夾": "Badge Holders, Lanyards & Signs",
  "標示牌/標示夾/標示架": "Sign Boards, Clips & Stands",
  "訂書機/除針器/釘槍": "Staplers, Removers & Tackers",
  板夾: "Clipboards",
  "迴紋針/圖釘/別針類": "Paper Clips, Push Pins & Safety Pins",
  "OPP袋/封口袋": "OPP Bags & Zip Bags",
  "膠圈/橡皮筋": "Rubber Bands",
  "夾子類/長尾夾/原子夾": "Clips / Binder Clips / Bulldog Clips",
  "留言板/白板/白板周邊": "Whiteboards & Accessories",
  "指揮筆/指揮桿": "Pointers",
  "計數器/計時器": "Counters & Timers",
  辦公印材: "Stamp Supplies",
  "信箱/摸彩箱": "Suggestion & Raffle Boxes",
  其他事務用品: "Other Office Supplies",
  鉛筆: "Pencils",
  油性筆: "Oil-based Pens",
  擦擦筆: "Erasable Pens",
  鋼珠筆: "Rollerball Pens",
  "多色.多用筆": "Multi-colour / Multi-function Pens",
  "毛筆.自來水筆": "Brush Pens & Water Brushes",
  "粉筆.粉筆週邊": "Chalk & Accessories",
  白板筆: "Whiteboard Markers",
  工業筆: "Industrial Markers",
  精品高級筆: "Premium Pens",
  其他筆類: "Other Pens",
};

export type SeriesEn = {
  name: string;
  summary: string;
  detail: string;
  material: string;
};

// Keyed by seriesId.
export const seriesEn: Record<string, SeriesEn> = {
  "PEN-BALL-CLASSIC": {
    name: "Classic Retractable Ballpoint Pen",
    summary: "Everyday oil-based ballpoint, in several ink colours and tip sizes.",
    detail:
      "Smooth, low-skip writing for students, offices and receipts. Ink colour, tip size and barrel colour are split into individual SKUs.",
    material: "ABS barrel, oil-based ink, stainless-steel tip",
  },
  "PEN-GEL-SMOOTH": {
    name: "Smooth Gel Pen",
    summary: "Quick-drying gel ink, great for notes, journals and signing.",
    detail:
      "Steady ink flow with saturated lines. Available in 0.38, 0.5 and 0.7 mm and several common ink colours.",
    material: "Resin barrel, gel ink, metal tip, replaceable refill",
  },
  "PEN-FINELINER-COLOR": {
    name: "Coloured Fineliner",
    summary: "Fine-line coloured pens for annotation, drawing and journaling.",
    detail:
      "Fibre tip with steady ink flow and clear colours. Each colour is managed as its own SKU for easy restocking.",
    material: "PP barrel, water-based pigment ink, fibre tip",
  },
  "PEN-HIGHLIGHT-PASTEL": {
    name: "Pastel Highlighter",
    summary: "Low-saturation pastel colours that mark text without glare.",
    detail:
      "Chisel tip draws thick or thin lines; suits textbooks, documents and journals.",
    material: "PP barrel, water-based fluorescent ink, chisel fibre tip",
  },
  "PCL-MECH-DRAFT": {
    name: "Drafting Mechanical Pencil",
    summary:
      "Metal-grip mechanical pencil for line work, sketching and engineering notes.",
    detail:
      "Well-balanced with a stable tip. Stock split by lead size and barrel colour.",
    material: "Aluminium-alloy body, brass chuck, metal clip",
  },
  "NOTE-GRID": {
    name: "Hardcover Grid Notebook",
    summary: "Hardcover grid pages for class notes, project records and sketching.",
    detail:
      "Light-grey 5 mm grid pages with several cover colours. Size and page count are split into individual SKUs.",
    material: "100 gsm woodfree paper, sewn binding, cloth-texture hardcover",
  },
  "NOTE-DOT-JOURNAL": {
    name: "Dot-grid Journal",
    summary:
      "Dot-grid pages for bullet journaling, monthly planning and habit tracking.",
    detail:
      "Lies flat at 180° with sewn binding; includes index pages and page numbers. Sizes, covers and paper colours managed separately.",
    material: "120 gsm off-white paper, sewn binding, PU soft cover",
  },
  "NOTE-SPIRAL-SUBJECT": {
    name: "Spiral Subject Notebook",
    summary: "Tear-off spiral notebook with ruled, grid or blank pages.",
    detail:
      "Good for fast note-taking in class and meetings. Page format, size and count are all separate products.",
    material: "80 gsm paper, twin-ring binding, matte PP cover",
  },
  "TAPE-MATTE": {
    name: "Matte Writable Tape",
    summary: "Writable tape for labels, packaging and journal collage.",
    detail:
      "Matte paper surface takes ballpoint and oil-based pens. Split into SKUs by width and colour.",
    material: "Washi base, low-residue adhesive",
  },
  "TAPE-CORRECTION": {
    name: "Correction Tape",
    summary: "Dry correction tape, ready to write over instantly.",
    detail:
      "Smooth coverage for notes and document edits. SKUs by tape width, length and case colour.",
    material: "PET correction film, ABS case",
  },
  "PAD-MEMO": {
    name: "Desk Memo Pad",
    summary: "Tear-off memo pads for to-dos, price tags and counter messages.",
    detail:
      "Top-glued so sheets tear off without scattering. Size, paper colour and sheet count managed separately.",
    material: "90 gsm woodfree paper, top-glued",
  },
  "PAPER-COPY-PREMIUM": {
    name: "Copy Paper",
    summary: "Everyday office copy paper in various weights and sizes.",
    detail:
      "For printing, copying and document filing. Size, weight and pack quantity split into individual SKUs.",
    material: "Acid-free white paper, FSC mixed-source pulp",
  },
  "PAPER-CARD-COLOR": {
    name: "Coloured Card",
    summary: "Coloured card for crafts, signage and covers.",
    detail: "Clear colours with firm body. Managed by colour, size and weight.",
    material: "160–220 gsm coloured card",
  },
  "TOOL-RULER": {
    name: "Stainless-steel Ruler",
    summary:
      "Clearly marked stainless-steel ruler for drawing lines and cutting paper.",
    detail:
      "Etched, wear-resistant scale with a non-slip back. SKUs by length and pack format.",
    material: "Stainless steel, etched scale, cork non-slip backing",
  },
  "CLIP-BINDER": {
    name: "Black Binder Clips",
    summary: "Binder clips for organising and bundling documents.",
    detail:
      "Steady clamping force with a matte-black coating. Size and pack quantity split into individual products.",
    material: "Spring steel, powder coating, nickel-plated handles",
  },
  "TOOL-CUTTER-SAFE": {
    name: "Safety Utility Knife",
    summary: "Utility knife for opening boxes, cutting paper and crafts.",
    detail:
      "Self-locking blade slider with a stable grip. Choose blade width and spare-blade packs.",
    material: "ABS housing, stainless-steel rail, carbon-steel blade",
  },
  "TOOL-STAPLER": {
    name: "Effort-saving Stapler",
    summary: "Common office stapler for organising documents.",
    detail:
      "Effort-saving mechanism with stable repeat stapling. SKUs by sheet capacity, colour and staple size.",
    material: "Steel mechanism, ABS housing, rubber base",
  },
  "REF-GEL": {
    name: "Gel Pen Refills",
    summary: "Gel-pen refills, choose by tip size and ink colour.",
    detail:
      "Fits the Smooth Gel Pen series and same-spec barrels. Each refill has its own stock.",
    material: "Gel ink, PP tube, metal tip",
  },
  "REF-PENCIL-LEAD": {
    name: "Mechanical Pencil Leads",
    summary: "Mechanical-pencil leads in various diameters and hardness.",
    detail:
      "For drawing, exams and everyday writing. SKUs by lead diameter, hardness and count.",
    material: "Polymer graphite lead, plastic case",
  },
  "REF-STAPLES": {
    name: "Staple Refill Box",
    summary: "Refill staples for staplers in several specs.",
    detail:
      "Fits different sheet counts and stapler models. Spec, box count and staple count managed separately.",
    material: "Galvanised steel staples, paper-box packaging",
  },
  "PEN-BRUSH-SIGN": {
    name: "Soft-tip Sign Pen",
    summary:
      "Soft brush-tip sign pen for headline lettering and journals; thick or thin strokes.",
    detail:
      "Flexible tip varies line weight; great for cards, hand-lettered titles and simple brush lettering.",
    material: "Fibre soft tip, water-based pigment ink, PP barrel",
  },
  "NOTE-WEEKLY-PLANNER": {
    name: "Weekly Planner",
    summary: "Week-view planner with to-do and goal fields.",
    detail:
      "Suits work scheduling, timetables and habit tracking. Cover colour and start-month versions managed separately.",
    material: "100 gsm off-white paper, sewn binding, hard cover",
  },
  "TOOL-SCISSOR-DESK": {
    name: "Office Scissors",
    summary: "Scissors for everyday paperwork and packaging, comfortable and durable.",
    detail:
      "Stainless-steel blades with a non-slip grip; cuts paper, tape and thin plastics.",
    material: "Stainless-steel blades, TPR non-slip grip",
  },
  "TAPE-PACK-KRAFT": {
    name: "Kraft Packing Tape",
    summary: "High-tack packing tape for shipping and warehouse packing.",
    detail:
      "Tear-resistant base with stable adhesion. Width and length offered as separate specs.",
    material: "BOPP base, acrylic adhesive",
  },
  "PAPER-LABEL-ROLL": {
    name: "Self-adhesive Label Roll",
    summary: "Writable and printable label stickers for sorting and shipping.",
    detail:
      "Surface takes ballpoint, oil-based pens and thermal printing; sizes managed per roll.",
    material: "Coated label paper, acrylic adhesive",
  },
  "REF-ERASER-MECH": {
    name: "Mechanical Eraser Refills",
    summary: "Replacement erasers for drafting and mechanical-pencil end caps.",
    detail:
      "Spec by eraser diameter and length; for maintaining common mechanical pencils.",
    material: "PVC-free eraser, plastic sleeve",
  },
  "ART-OIL-POT": {
    name: "Oil Pot",
    summary: "Oil pot for oil and acrylic painting, for mixing mediums and cleaning.",
    detail:
      "For decanting turpentine, linseed oil and cleaner; leak-proof lid and handle.",
    material: "Stainless-steel body, solvent-resistant seal",
  },
  "ART-BRUSH-ROUND": {
    name: "Round Brush",
    summary:
      "All-purpose round brush for watercolour and acrylic; lining and detail work.",
    detail:
      "Springy bristles for layered washes and fine detail in small areas.",
    material: "Nylon bristles, wood handle, chrome-plated ferrule",
  },
  "ART-BRUSH-FLAT": {
    name: "Flat Brush",
    summary: "Flat brush for washes and large areas; suits acrylic and gouache.",
    detail:
      "For base layers, printmaking roller prep and quick background coverage.",
    material: "Blended bristles, wood handle, aluminium ferrule",
  },
  "ART-PAINT-GOUACHE": {
    name: "Gouache / Chinese Painting / Printmaking Paint",
    summary:
      "Opaque water-based paint for design classes, printmaking and flat illustration.",
    detail:
      "High saturation and coverage; suits gouache techniques and teaching.",
    material: "Water-based paint paste, aluminium-tube packaging",
  },
  "ART-PAINT-OIL-ACRY": {
    name: "Oil / Ceramic / Acrylic Paint",
    summary: "Multi-surface paints for canvas, wood and ceramic work.",
    detail:
      "Offers mainstream oil and acrylic colours, plus ceramic-adhering options.",
    material: "High-pigment paste, resin medium",
  },
  "ART-PAINT-ILLUS": {
    name: "Illustration Paint",
    summary: "Paint for illustration and comic colouring; good for layering and gradients.",
    detail: "Palette designed for illustration; works on paper and card.",
    material: "High-chroma water-based paint, plastic palette",
  },
  "ART-WATERCOLOR-SET": {
    name: "Watercolour Set",
    summary: "Portable watercolour set for plein-air and beginners.",
    detail:
      "Includes watercolour pans, a palette and a portable case for outdoor sketching.",
    material: "High-transparency watercolour pans, ABS case",
  },
  "ART-WATERCOLOR-BRUSH": {
    name: "Watercolour Brush",
    summary: "Dedicated watercolour brush focused on water capacity and a stable point.",
    detail:
      "For washes, layering and edging; pairs with watercolour pads and cotton paper.",
    material: "Imitation-sable fibre, wood handle, nickel-copper ferrule",
  },
  "ART-PALETTE": {
    name: "Palette",
    summary:
      "All-purpose palette for watercolour and acrylic; clear wells, easy to clean.",
    detail: "Plastic and ceramic versions for different painting habits and media.",
    material: "PP / ceramic surface",
  },
  "OFFICE-INK-REFILL": {
    name: "Ink Refills / Cartridges",
    summary:
      "Fountain-pen cartridges and bottled ink for daily writing and office sign-off.",
    detail:
      "Standard short cartridges and bottled ink; stock split by colour and capacity.",
    material: "Water-based dye ink, PP cartridge / glass bottle",
  },
  "OFFICE-NOTE-HOLDER": {
    name: "Memo Box / Holder",
    summary: "Desktop memo storage for counters and office desks.",
    detail:
      "Memo boxes, holders and clip-style memo stands; fit standard memo sizes.",
    material: "ABS / acrylic body, metal clip",
  },
  "OFFICE-BADGE-SIGN": {
    name: "Badge Holder / Desk Sign / Standee",
    summary:
      "ID accessories and display signage for counters, meetings and events.",
    detail:
      "Includes badge holders, lanyards, desk signs, name tags and clip accessories.",
    material: "PVC holder, nylon lanyard, acrylic sign stand",
  },
  "OFFICE-LABEL-STAND": {
    name: "Sign Board / Clip / Stand",
    summary: "Signage for warehouses and counters, for sorting and wayfinding.",
    detail: "Standing, clip-on and stick-on signage systems.",
    material: "Acrylic stand, metal spring clip, PP sign sheet",
  },
  "OFFICE-STAPLE-HEAVY": {
    name: "Stapler / Remover / Tacker",
    summary: "Document-binding and packing-fixing tool series.",
    detail: "Includes a standard stapler, a staple remover and a manual tacker.",
    material: "Steel mechanism, ABS housing",
  },
  "OFFICE-CLIP-BOARD": {
    name: "Clipboard",
    summary: "Clipboard for writing and stock-taking; suits field and warehouse work.",
    detail: "Metal clip with a hanging hole; A4/B5 common sizes.",
    material: "MDF core, metal clip, PP coating",
  },
  "OFFICE-PIN-FASTENER": {
    name: "Paper Clips / Push Pins / Safety Pins",
    summary: "Common document-fixing consumables.",
    detail:
      "Includes paper clips, push pins and safety pins for sorting and organising.",
    material: "Nickel-plated steel wire, plastic storage box",
  },
  "OFFICE-BAG-OPP": {
    name: "OPP Bags / Zip Bags",
    summary: "Clear storage bags for documents and small items, easy to identify.",
    detail: "OPP self-seal bags and zip-lock bags in multiple sizes.",
    material: "OPP / PE film",
  },
  "OFFICE-BAND-RUBBER": {
    name: "Rubber Bands",
    summary: "Common consumable for bundling and document-fixing.",
    detail: "Spec by diameter and thickness; for documents, parcels and inventory.",
    material: "Natural rubber",
  },
  "OFFICE-CLIP-MIX": {
    name: "Clips / Binder Clips / Bulldog Clips",
    summary: "Multi-size document clips for filing and separating.",
    detail: "Includes binder clips, bulldog clips and document-clip combos.",
    material: "Spring steel, nickel-plated clips",
  },
  "OFFICE-WHITEBOARD": {
    name: "Whiteboard & Accessories",
    summary: "Display tools for meetings and notices; for teaching and office use.",
    detail:
      "Includes magnetic whiteboards, message boards and accessories like markers and erasers.",
    material: "Painted steel board, aluminium frame, magnetic accessories",
  },
  "OFFICE-POINTER": {
    name: "Pointer",
    summary: "Pointing tool for teaching and presentations.",
    detail: "Telescopic pointers for classrooms, meeting rooms and displays.",
    material: "Stainless-steel telescopic rod, rubber grip",
  },
  "OFFICE-COUNTER-TIMER": {
    name: "Counter / Timer",
    summary: "Tools for events, stock-taking and time management.",
    detail: "Handheld counters and desktop digital timers.",
    material: "ABS housing, electronic display module",
  },
  "OFFICE-STAMP-MATERIAL": {
    name: "Stamp Supplies",
    summary: "Stamp and ink-pad consumables for admin and finance workflows.",
    detail: "Includes quick-dry ink pads, refill ink and date stamps.",
    material: "Oil-based stamp ink, rubber die, plastic housing",
  },
  "OFFICE-BOX-LOTTERY": {
    name: "Suggestion / Raffle Box",
    summary: "Collection and raffle boxes with a clear, see-through design.",
    detail: "For feedback, voting and on-site raffles.",
    material: "Acrylic body, metal lock",
  },
  "OFFICE-MISC-SUPPLIES": {
    name: "Other Office Supplies",
    summary: "A mix of common miscellaneous office supplies.",
    detail:
      "Covers tape dispensers, letter openers, document rails and other small tools.",
    material: "Mixed materials (PP, stainless steel, rubber)",
  },
  "PEN-WOOD-HB": {
    name: "Pencil",
    summary: "Classic wooden pencil for writing and sketching.",
    detail: "Common hardness grades like HB/2B; suits students, exams and daily notes.",
    material: "Wood barrel, graphite core, water-based paint finish",
  },
  "PEN-MECH-CLASSIC": {
    name: "Mechanical Pencil",
    summary: "Classic click mechanical pencil for long writing sessions.",
    detail: "SKUs by lead size and barrel colour; works with lead refills.",
    material: "ABS barrel, metal tip, spring mechanism",
  },
  "PEN-BALL-OIL": {
    name: "Oil-based Pen",
    summary: "Quick-dry oil-based pen for document sign-off and marking.",
    detail: "Water-resistant lines; works on regular paper and slightly slick surfaces.",
    material: "Oil-based ink, resin barrel, metal tip",
  },
  "PEN-ERASABLE": {
    name: "Erasable Pen",
    summary: "Friction-erasable pen for notes and changeable content.",
    detail: "Special heat-sensitive ink erases; popular for journals and class notes.",
    material: "Heat-sensitive ink, rubber friction end",
  },
  "PEN-ROLLER-ELITE": {
    name: "Rollerball Pen",
    summary: "Smooth rollerball ink for signatures and formal documents.",
    detail: "Fluid stroke with stable lines; offered in business and everyday barrels.",
    material: "Rollerball tip, water-based ink, metal / resin barrel",
  },
  "PEN-MULTI-4IN1": {
    name: "Multi-colour / Multi-function Pen",
    summary: "One pen, multiple refills; colour switching plus pencil function.",
    detail:
      "Combines black/blue/red/green; some versions also include a 0.5 mm mechanical pencil.",
    material: "ABS barrel, spring switch mechanism, refill modules",
  },
  "REF-PEN-CARTRIDGE": {
    name: "Pen Barrels / Refills",
    summary: "Various refill consumables to cut the cost of replacing whole pens.",
    detail: "Fits ballpoint, gel, rollerball and multi-colour pen systems.",
    material: "Ink refills, metal tips, plastic refill tubes",
  },
  "PEN-WATER-SIGN": {
    name: "Water-based / Sign / Fineliner Pen",
    summary: "Water-based ink and fineliner series for notes and annotation.",
    detail: "Offers 0.3–0.8 mm line widths; works on regular and journal paper.",
    material: "Water-based dye ink, fibre tip",
  },
  "PEN-BRUSH-FOUNTAIN": {
    name: "Brush Pen / Water Brush",
    summary: "Calligraphy and sketch pens combining brush feel with portability.",
    detail:
      "Includes refillable water brushes and regular brush pens for practice and drawing.",
    material: "Synthetic brush hair, resin barrel, cartridge / ink converter",
  },
  "PEN-CHALK-SCHOOL": {
    name: "Chalk & Accessories",
    summary: "Board chalk plus holders and grips for teaching.",
    detail:
      "Includes dustless and coloured chalk, with chalk holders to keep hands clean.",
    material: "Calcium-carbonate chalk, plastic chalk holder",
  },
  "PEN-WHITEBOARD-MARKER": {
    name: "Whiteboard Marker",
    summary: "Low-odour whiteboard markers for meeting rooms and teaching.",
    detail: "Round and chisel tips with clear line widths; easy to erase.",
    material: "Alcohol-based ink, fibre tip, PP barrel",
  },
  "PEN-INDUSTRIAL": {
    name: "Industrial Marker",
    summary: "Water- and wear-resistant marking pens for sites and factories.",
    detail: "Writes on metal, plastic, wood and oily surfaces.",
    material: "Oil-based industrial ink, wear-resistant tip, aluminium-tube body",
  },
  "PEN-LUXURY": {
    name: "Premium Pen",
    summary: "High-quality business writing pens, good for gifts and signing.",
    detail: "Metal body and premium nibs, with gift-box packaging.",
    material: "Brass body, plated clip, premium nib",
  },
  "PEN-OTHER": {
    name: "Other Pens",
    summary: "A collection of special-purpose pens.",
    detail:
      "Includes fabric pens, glass pens and card-decoration pens for special uses.",
    material: "Mixed tips and specialty inks",
  },
};
