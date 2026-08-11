// Lightweight extractor that turns a free-text Arabic production message into
// structured data. This is the "sample" stand-in for the LLM that will run in
// production — same input/output shape, so it can be swapped for a real model
// call without changing the UI or the database.

export type ParsedReport = {
  order_no: string | null;
  line_no: string | null;
  product: string | null;
  quantity: number | null;
  unit: string | null;
  scrap_pct: number | null;
  status: string | null; // مكتمل | قيد التنفيذ | متوقف
  issue: string | null;
  confidence: number; // 0..1
};

// Arabic-Indic / Persian digits -> ASCII
function normalizeDigits(s: string): string {
  const map: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٪": "%",
  };
  return s.replace(/[٠-٩۰-۹٪]/g, (c) => map[c] ?? c);
}

const PRODUCT_HINTS = [
  "درام", "كرسي", "جردل", "صندوق", "دلو", "طاولة", "سلة", "حاوية", "مجلى",
  "غطاء", "برميل", "قصعة", "طبق", "كوب", "علبة",
];

export function parseProductionMessage(raw: string): ParsedReport {
  const text = normalizeDigits(raw || "");
  let hits = 0;

  // Order number: PO-4471 / أمر / الطلب <code>
  let order_no: string | null = null;
  const po = text.match(/\bPO[-\s]?(\d{2,})\b/i);
  if (po) order_no = "PO-" + po[1];
  else {
    const ar = text.match(/(?:الطلب|أمر(?:\s*الإنتاج)?|طلب)\s*[:#]?\s*([A-Za-z]{0,4}-?\d{2,})/);
    if (ar) order_no = ar[1].toUpperCase();
  }
  if (order_no) hits++;

  // Line: خط 2 / الخط ٢ / line 2
  let line_no: string | null = null;
  const line = text.match(/(?:خط|الخط|line)\s*[:#]?\s*(\d+)/i);
  if (line) line_no = line[1];
  else {
    const words: Record<string, string> = {
      "الأول": "1", "الاول": "1", "الثاني": "2", "الثالث": "3",
      "الرابع": "4", "الخامس": "5", "السادس": "6",
    };
    const w = text.match(/(?:خط|الخط)\s*(الأول|الاول|الثاني|الثالث|الرابع|الخامس|السادس)/);
    if (w) line_no = words[w[1]] ?? null;
  }
  if (line_no) hits++;

  // Quantity + unit
  let quantity: number | null = null;
  let unit: string | null = null;
  const qty = text.match(/(\d{2,})\s*(عبوة|عبوه|قطعة|قطعه|كرتون|كرتونة|كيس|حبة|حبه|طن|كجم)/);
  if (qty) {
    quantity = Number(qty[1]);
    unit = qty[2].replace(/ه$/, "ة");
    hits++;
  }

  // Scrap percent
  let scrap_pct: number | null = null;
  const scrap =
    text.match(/(?:الهالك|هالك|تالف|سكراب)\D{0,6}(\d+(?:\.\d+)?)\s*%?/) ||
    text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:هالك|تالف)/);
  if (scrap) {
    scrap_pct = Number(scrap[1]);
    hits++;
  }

  // Status
  let status: string | null = null;
  if (/(أنهى|انهى|انتهى|خلص|اكتمل|مكتمل|تسليم|سلّم|سلم)/.test(text)) status = "مكتمل";
  else if (/(تعطل|عطل|توقف|واقف|متوقف|وقف)/.test(text)) status = "متوقف";
  else if (/(يشتغل|قيد|جاري|جارٍ|شغال|مستمر)/.test(text)) status = "قيد التنفيذ";
  if (status) hits++;

  // Issue / problem
  let issue: string | null = null;
  const issueM = text.match(/(?:عطل|مشكلة|نقص|تعطل|خلل|صيانة)[^.،\n]{0,50}/);
  if (issueM) {
    issue = issueM[0].trim();
    hits++;
  }

  // Product (best-effort keyword match)
  let product: string | null = null;
  for (const h of PRODUCT_HINTS) {
    const m = text.match(new RegExp(`([\\u0600-\\u06FF]*\\s*)?${h}[\\u0600-\\u06FF\\s]{0,12}`));
    if (m) {
      product = m[0].trim().replace(/\s+/g, " ");
      hits++;
      break;
    }
  }

  const confidence = Math.min(1, hits / 5);
  return { order_no, line_no, product, quantity, unit, scrap_pct, status, issue, confidence };
}
