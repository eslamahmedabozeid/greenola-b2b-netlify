const STORAGE_KEY = "greenola_locale";

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const AR_WEEKDAYS = [
  "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت",
];
const EN_WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const MEAL_EN = {
  "كبسة دجاج": "Chicken Kabsa",
  "كبسة لحم": "Meat Kabsa",
  "سليق": "Saleeg",
  "جريش": "Jareesh",
  "ملوخية بالأرز": "Molokhia with Rice",
  "كباب حلة مع أرز": "Kebab Halla with Rice",
  "ورق عنب مع لحم": "Stuffed Grape Leaves with Meat",
  "طاجن دجاج مغربي": "Moroccan Chicken Tagine",
  "طاجن لحم مغربي": "Moroccan Beef Tagine",
  "بيف اسكندر": "Beef Iskender",
  "كفتة السلطان": "Sultan Kofta",
  "باستا الفريدو": "Alfredo Pasta",
  "لازنيا لحم": "Beef Lasagna",
  "برياني دجاج بالمكسرات": "Chicken Biryani with Nuts",
  "دجاج تكا": "Chicken Tikka",
  "برجر دجاج": "Chicken Burger",
  "كرات اللحم السويدي": "Swedish Meatballs",
  "سمك سلمون بالأرز": "Salmon with Rice",
  "سلطة سيزر بالدجاج": "Chicken Caesar Salad",
  "تبولة بالكينوا": "Quinoa Tabbouleh",
  "سلطة الجبنة الفيتا": "Feta Cheese Salad",
  "بول الكينوا بالأفوكادو": "Quinoa Avocado Bowl",
  "شوربة عدس": "Lentil Soup",
  "شوربة كريمة الفطر": "Cream of Mushroom Soup",
  "شوربة بروكلي": "Broccoli Soup",
  "تيراميسو كلاسيك": "Classic Tiramisu",
  "تمر محشي بالمكسرات": "Stuffed Dates with Nuts",
  "براونيز": "Brownies",
  "كريم بروليه": "Crème Brûlée",
  "مهلبية بالفستق": "Pistachio Muhallabia",
  "بامية مصرية": "Egyptian Okra",
  "كوسة بالباشميل": "Zucchini Moussaka",
  "بيستو باستا": "Pesto Pasta",
  "باستا بني بالروبيان": "Brown Pasta with Shrimp",
  "دجاج بالصوص الكريمي": "Chicken in Cream Sauce",
  "دجاج روزماري": "Rosemary Chicken",
  "دجاج بيستو": "Pesto Chicken",
  "دجاج مع أرز حساوي": "Chicken with Hasawi Rice",
  "ساندوتش كباب لحم": "Beef Kebab Sandwich",
  "تورلي": "Turli",
  "دجاج صويا بالأرز المقلي": "Soy Chicken with Fried Rice",
  "دجاج جريفي": "Gravy Chicken",
  "دجاج سويت اند ساور": "Sweet & Sour Chicken",
  "نودلز بالدجاج والخضار": "Chicken Noodle Stir-fry",
  "ساندوتش دجاج باربكيو": "BBQ Chicken Sandwich",
  "سمك يوناني": "Greek Fish",
  "بيف ستيك ساندوتش": "Beef Steak Sandwich",
  "ميني برجر لحم": "Mini Beef Burger",
  "ساندويتش فاهيتا": "Fajita Sandwich",
  "كاساديا الدجاج": "Chicken Quesadilla",
  "سلطة التونة بالبيض": "Tuna & Egg Salad",
  "سلطة الكينوا بالفواكه": "Fruit Quinoa Salad",
  "سلطة الرمان بالجبنة": "Pomegranate Cheese Salad",
  "حمص بالطحينة": "Hummus with Tahini",
  "شوربة طماطم": "Tomato Soup",
  "شوربة جمبري": "Shrimp Soup",
  "تشيز كيك البرتقال": "Orange Cheesecake",
  "كوكيز الشوكولاتة": "Chocolate Cookies",
  "بسبوسة بالكنافة": "Basbousa with Kunafa",
  "كرات الفستق": "Pistachio Balls",
  "بسكوتي بالفستق": "Pistachio Biscotti",
};

export const translations = {
  ar: {
    currency: "ر.س",
    currencyPerDay: "ر.س / يوم",
    day: "يوم",
    days: "يوم",
    optional: "اختياري",
    login_name: "الاسم",
    login_name_ph: "أحمد محمد",
    login_phone: "رقم الجوال",
    login_company: "اسم الشركة",
    login_company_ph: "أرامكو السعودية",
    login_companyCode: "كود الشركة",
    login_codeHint: "احصل على الكود من قسم الموارد البشرية في شركتك.",
    login_submit: "ابدأ تجربتك",
    login_trust: "بياناتك آمنة معنا — للمتابعة فقط",
    greeting: "أهلاً",
    step: "الخطوة",
    progress_1: "١ / ٤",
    progress_2: "٢ / ٤",
    progress_3: "٣ / ٤",
    progress_4: "٤ / ٤",
    choose_plan: "اختر الخطة اللي تناسبك",
    plan_balanced: "متوازنة",
    plan_protein: "عالية البروتين",
    plan_lowcarb: "منخفضة الكارب",
    macro_protein: "بروتين",
    macro_carb: "كارب",
    macro_fat: "دهون",
    badge_popular: "الأكثر اختياراً",
    choose_meals: "اختر عدد الوجبات في اليوم",
    meal_lunch: "غداء فقط",
    meal_lunch_snack: "غداء + سناك",
    price_from: "ابتداءً من",
    choose_duration: "اختر عدد أيام الاشتراك",
    duration_breakdown_20: "٥ أيام × ٤ أسابيع",
    duration_breakdown_24: "٦ أيام × ٤ أسابيع",
    total: "الإجمالي",
    discount_badge: "خصم ٤٠٪",
    continue: "تابع",
    back: "رجوع",
    menu_title: "المنيو 🍽️",
    menu_preview: "هذه معاينة فقط للأطباق. اختيار وجباتك اليومية يتم بعد الاشتراك ليكون أسهل.",
    filter_all: "الكل",
    filter_main: "🍽️ رئيسي",
    filter_salad: "🥗 سلطة",
    filter_soup: "🍲 شوربة",
    filter_dessert: "🍮 حلا",
    filter_saudi: "🇸🇦 سعودي",
    filter_italian: "🇮🇹 إيطالي",
    filter_indian: "🇮🇳 هندي",
    filter_american: "🇺🇸 أمريكي",
    filter_lebanese: "🇱🇧 لبناني",
    filter_french: "🇫🇷 فرنسي",
    filter_greek: "🇬🇷 يوناني",
    filter_mexican: "🇲🇽 مكسيكي",
    filter_chinese: "🇨🇳 صيني",
    filter_turkish: "🇹🇷 تركي",
    filter_moroccan: "🇲🇦 مغربي",
    filter_egyptian: "🇪🇬 مصري",
    filter_mediterranean: "🌊 متوسطي",
    filter_healthy: "🌿 صحي",
    filter_arabic: "🌍 عربي",
    filter_intl: "🌍 عالمي",
    see_more: "عرض المزيد",
    meal_empty: "لا توجد أطباق مطابقة",
    next: "التالي",
    address_title: "العنوان والتاريخ 📍",
    address_info_title: "التوصيل لمكتب شركتك",
    address_info_sub: "سنرتب التفاصيل النهائية معك.",
    start_date: "تاريخ بدء الاشتراك",
    addr_building: "رقم/اسم المبنى",
    addr_floor: "الدور",
    addr_office: "رقم المكتب",
    addr_notes: "ملاحظات",
    addr_building_ph: "برج المملكة",
    addr_floor_ph: "١٢",
    addr_office_ph: "١٢٠٤",
    addr_notes_ph: "عند الاستقبال",
    checkout_title: "الدفع 💳",
    checkout_order: "طلبك",
    checkout_plan_balanced: "الخطة المتوازنة",
    checkout_plan_protein: "خطة البروتين العالي",
    checkout_plan_lowcarb: "خطة قليلة الكارب",
    checkout_plan_sub: "غداء فقط · ٢٤ يوم",
    checkout_starts: "يبدأ",
    checkout_delivery: "التوصيل",
    checkout_office_default: "مكتب شركتك",
    receipt_package: "سعر الباقة",
    receipt_subsidy: "دعم شركتك",
    receipt_total: "المتبقي عليك",
    tax_details: "تفاصيل الضريبة",
    tax_inclusive: "المجموع شامل الضريبة",
    tax_exclusive: "المجموع قبل الضريبة",
    tax_vat: "ضريبة القيمة المضافة (١٥٪)",
    payment_method: "طريقة الدفع",
    pay_apple_sub: "دفع آمن وسريع عبر جهازك",
    pay_mada: "مدى",
    pay_mada_sub: "بطاقة الصراف الآلي السعودية",
    pay_card: "بطاقة ائتمان أو خصم",
    checkout_trust: "الدفع آمن — جميع البيانات مشفرة",
    pay_select_method: "اختر طريقة الدفع",
    code_checking: "جارٍ التحقق من الكود...",
    code_cap_reached: "الكود وصل الحد الأقصى — تواصل مع شركتك",
    code_expired: "الكود منتهي الصلاحية",
    code_invalid: "كود غير صحيح — تأكد من الكتابة",
    code_subsidy: "{pct}% دعم من شركتك",
    code_discount: "{pct}% خصم",
    date_friday: "الجمعة غير متاحة — اختر يوماً آخر",
    date_saturday: "باقتك لا تشمل السبت — اختر يوماً آخر",
    date_unavailable: "هذا التاريخ غير متاح — مهلة 48 ساعة قبل البدء",
    date_ready: "{weekday} — جاهز للبدء",
    date_invalid_toast: "تاريخ غير صالح — اختر يوماً متاحاً ⚠️",
    date_invalid_retry: "تاريخ غير صالح — يرجى المحاولة مجدداً",
    price_error: "تعذّر حساب السعر — يرجى المحاولة مجدداً",
    continuing: "جارٍ المتابعة...",
    done: "تم! ✓",
    transition_error: "خطأ في الانتقال: {msg}",
    continue_error: "خطأ في المتابعة: {msg}",
    company_covers: "{company} تتكفل",
    company_default: "الشركة",
    floor_label: "الدور {n}",
    office_label: "مكتب {n}",
    pay_apple: "ادفع {amount} عبر Apple Pay",
    pay_mada_btn: "ادفع {amount} عبر مدى",
    pay_card_btn: "ادفع {amount}",
    pay_preparing: "جارٍ تجهيز الدفع...",
    pay_coming_soon: "💳 بوابة الدفع قيد التطوير — سنخبرك عند الإطلاق!",
    plan_fallback: "خطة",
    meal_days_suffix: "{meal} · {days} يوم",
  },
  en: {
    currency: "SAR",
    currencyPerDay: "SAR / day",
    day: "day",
    days: "days",
    optional: "optional",
    login_name: "Full name",
    login_name_ph: "Ahmed Mohammed",
    login_phone: "Mobile number",
    login_company: "Company name",
    login_company_ph: "Aramco Saudi Arabia",
    login_companyCode: "Company code",
    login_codeHint: "Get the code from your company's HR department.",
    login_submit: "Start your trial",
    login_trust: "Your data is safe with us — for follow-up only",
    greeting: "Hello",
    step: "Step",
    progress_1: "1 / 4",
    progress_2: "2 / 4",
    progress_3: "3 / 4",
    progress_4: "4 / 4",
    choose_plan: "Choose the plan that fits you",
    plan_balanced: "Balanced",
    plan_protein: "High protein",
    plan_lowcarb: "Low carb",
    macro_protein: "Protein",
    macro_carb: "Carbs",
    macro_fat: "Fat",
    badge_popular: "Most popular",
    choose_meals: "Choose meals per day",
    meal_lunch: "Lunch only",
    meal_lunch_snack: "Lunch + snack",
    price_from: "From",
    choose_duration: "Choose subscription length",
    duration_breakdown_20: "5 days × 4 weeks",
    duration_breakdown_24: "6 days × 4 weeks",
    total: "Total",
    discount_badge: "40% off",
    continue: "Continue",
    back: "Back",
    menu_title: "Menu 🍽️",
    menu_preview: "This is a preview only. You'll pick your daily meals after subscribing.",
    filter_all: "All",
    filter_main: "🍽️ Main",
    filter_salad: "🥗 Salad",
    filter_soup: "🍲 Soup",
    filter_dessert: "🍮 Dessert",
    filter_saudi: "🇸🇦 Saudi",
    filter_italian: "🇮🇹 Italian",
    filter_indian: "🇮🇳 Indian",
    filter_american: "🇺🇸 American",
    filter_lebanese: "🇱🇧 Lebanese",
    filter_french: "🇫🇷 French",
    filter_greek: "🇬🇷 Greek",
    filter_mexican: "🇲🇽 Mexican",
    filter_chinese: "🇨🇳 Chinese",
    filter_turkish: "🇹🇷 Turkish",
    filter_moroccan: "🇲🇦 Moroccan",
    filter_egyptian: "🇪🇬 Egyptian",
    filter_mediterranean: "🌊 Mediterranean",
    filter_healthy: "🌿 Healthy",
    filter_arabic: "🌍 Arabic",
    filter_intl: "🌍 International",
    see_more: "See more",
    meal_empty: "No matching dishes",
    next: "Next",
    address_title: "Address & date 📍",
    address_info_title: "Delivery to your office",
    address_info_sub: "We'll finalize the details with you.",
    start_date: "Subscription start date",
    addr_building: "Building no./name",
    addr_floor: "Floor",
    addr_office: "Office no.",
    addr_notes: "Notes",
    addr_building_ph: "Kingdom Tower",
    addr_floor_ph: "12",
    addr_office_ph: "1204",
    addr_notes_ph: "At reception",
    checkout_title: "Payment 💳",
    checkout_order: "Your order",
    checkout_plan_balanced: "Balanced plan",
    checkout_plan_protein: "High protein plan",
    checkout_plan_lowcarb: "Low carb plan",
    checkout_plan_sub: "Lunch only · 24 days",
    checkout_starts: "Starts",
    checkout_delivery: "Delivery",
    checkout_office_default: "Your company office",
    receipt_package: "Package price",
    receipt_subsidy: "Company subsidy",
    receipt_total: "You pay",
    tax_details: "Tax details",
    tax_inclusive: "Total incl. VAT",
    tax_exclusive: "Total excl. VAT",
    tax_vat: "VAT (15%)",
    payment_method: "Payment method",
    pay_apple_sub: "Fast, secure payment on your device",
    pay_mada: "mada",
    pay_mada_sub: "Saudi debit card",
    pay_card: "Credit or debit card",
    checkout_trust: "Secure payment — all data encrypted",
    pay_select_method: "Choose payment method",
    code_checking: "Checking code...",
    code_cap_reached: "Code limit reached — contact your company",
    code_expired: "Code has expired",
    code_invalid: "Invalid code — please check spelling",
    code_subsidy: "{pct}% company subsidy",
    code_discount: "{pct}% discount",
    date_friday: "Fridays unavailable — pick another day",
    date_saturday: "Your plan excludes Saturday — pick another day",
    date_unavailable: "Date unavailable — 48-hour lead time required",
    date_ready: "{weekday} — ready to start",
    date_invalid_toast: "Invalid date — pick an available day ⚠️",
    date_invalid_retry: "Invalid date — please try again",
    price_error: "Couldn't calculate price — please try again",
    continuing: "Continuing...",
    done: "Done! ✓",
    transition_error: "Transition error: {msg}",
    continue_error: "Continue error: {msg}",
    company_covers: "{company} covers",
    company_default: "Company",
    floor_label: "Floor {n}",
    office_label: "Office {n}",
    pay_apple: "Pay {amount} with Apple Pay",
    pay_mada_btn: "Pay {amount} with mada",
    pay_card_btn: "Pay {amount}",
    pay_preparing: "Preparing payment...",
    pay_coming_soon: "💳 Payment gateway coming soon — we'll notify you at launch!",
    plan_fallback: "Plan",
    meal_days_suffix: "{meal} · {days} days",
  },
};

let locale =
  typeof window !== "undefined"
    ? sessionStorage.getItem(STORAGE_KEY) || "ar"
    : "ar";
const listeners = new Set();

function toArabicDigits(value) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value)
    .split("")
    .map((c) => (/[0-9]/.test(c) ? map[parseInt(c, 10)] : c))
    .join("");
}

export function getLocale() {
  return locale;
}

export function t(key, vars = {}) {
  const dict = translations[locale] || translations.ar;
  let str = dict[key] ?? translations.ar[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replaceAll(`{${k}}`, String(v));
  }
  return str;
}

export function formatNumber(value) {
  return locale === "ar" ? toArabicDigits(value) : String(value);
}

export function formatCurrency(amount, compact = false) {
  const suffix = compact ? "" : ` ${t("currency")}`;
  return `${formatNumber(amount)}${suffix}`;
}

export function formatCurrencyHtml(amount) {
  return `${formatNumber(amount)}<small>${t("currency")}</small>`;
}

export function getMealName(meal) {
  if (!meal) return "";
  if (locale === "en") return MEAL_EN[meal.n] || meal.n;
  return meal.n;
}

export function getPlanLabels() {
  return {
    balanced: { name: t("checkout_plan_balanced"), icon: "🌿" },
    protein: { name: t("checkout_plan_protein"), icon: "💪" },
    lowcarb: { name: t("checkout_plan_lowcarb"), icon: "🥗" },
  };
}

export function getMealConfigLabels() {
  return {
    lunch: t("meal_lunch"),
    lunch_snack: t("meal_lunch_snack"),
  };
}

export function formatLocalizedDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDate();
  const month = (locale === "ar" ? AR_MONTHS : EN_MONTHS)[d.getUTCMonth()];
  const weekday = (locale === "ar" ? AR_WEEKDAYS : EN_WEEKDAYS)[d.getUTCDay()];
  return `${weekday} ${formatNumber(day)} ${month}`;
}

export function getWeekday(date) {
  const weekdays = locale === "ar" ? AR_WEEKDAYS : EN_WEEKDAYS;
  return weekdays[date.getUTCDay()];
}

export function summarizeAddress(addr) {
  if (!addr) return t("checkout_office_default");
  const parts = [];
  if (addr.building) parts.push(addr.building);
  if (addr.floor) parts.push(t("floor_label", { n: formatNumber(addr.floor) }));
  if (addr.office) parts.push(t("office_label", { n: formatNumber(addr.office) }));
  return parts.length ? parts.join(" · ") : t("checkout_office_default");
}

export function applyDocumentLocale() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

export function applyTranslations(root = document) {
  if (!root) return;

  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  const toggle = root.querySelector(".lang-toggle span");
  if (toggle) toggle.textContent = locale === "ar" ? "EN" : "AR";
}

export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn(locale);
    } catch (e) {
      console.warn("[Greenola i18n] listener error", e);
    }
  });
  if (typeof window !== "undefined" && window.__greenolaRefreshLocale) {
    window.__greenolaRefreshLocale();
  }
}

export function setLocale(next) {
  locale = next === "en" ? "en" : "ar";
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, locale);
  }
  applyDocumentLocale();
  applyTranslations();
  notifyListeners();
}

export function toggleLocale() {
  setLocale(locale === "ar" ? "en" : "ar");
}

export function initI18n() {
  if (typeof sessionStorage !== "undefined") {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ar") locale = saved;
  }
  applyDocumentLocale();
  applyTranslations();
}
