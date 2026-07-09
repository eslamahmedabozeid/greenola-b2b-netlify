'use client';

export function GreenolaMarkup() {
  return (
    <>
      <div className="preview-bg">
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="app">
              <div className="screen-page" data-screen="1">
                <div className="hero">
                  <button className="lang-toggle" type="button" aria-label="Toggle language">
                    <span>EN</span>
                  </button>
                </div>
                <form className="form" id="loginForm" noValidate>
                  <div className="field">
                    <label className="field-label" htmlFor="name" data-i18n="login_name">الاسم</label>
                    <input className="input" type="text" id="name" name="name" data-i18n-placeholder="login_name_ph" placeholder="أحمد محمد" required minLength={2} autoComplete="name" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="phone" data-i18n="login_phone">رقم الجوال</label>
                    <div className="phone-field">
                      <div className="country-code">
                        <span className="flag">🇸🇦</span>
                        <span>+966</span>
                      </div>
                      <input className="input" type="tel" id="phone" name="phone" placeholder="5XXXXXXXX" required pattern="[0-9]{9}" autoComplete="tel-national" maxLength={9} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="company" data-i18n="login_company">اسم الشركة</label>
                    <div className="company-field">
                      <input className="input" type="text" id="company" name="company" data-i18n-placeholder="login_company_ph" placeholder="أرامكو السعودية" required minLength={2} />
                      <svg className="company-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                      </svg>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="companyCode">
                      <span data-i18n="login_companyCode">كود الشركة</span>{' '}
                      <span className="optional-tag" data-i18n="optional">اختياري</span>
                    </label>
                    <div className="code-field">
                      <input className="input" type="text" id="companyCode" name="companyCode" placeholder="ARAMCO25" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={32} />
                      <svg className="code-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1={7} y1={7} x2="7.01" y2={7} />
                      </svg>
                    </div>
                    <span className="code-hint" id="codeHint" data-i18n="login_codeHint">احصل على الكود من قسم الموارد البشرية في شركتك.</span>
                  </div>
                  <div className="cta-wrap">
                    <button className="cta" type="submit" id="submitBtn" disabled>
                      <span data-i18n="login_submit">ابدأ تجربتك</span>
                      <svg className="arrow" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1={19} y1={12} x2={5} y2={12} />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                    </button>
                    <p className="trust-note">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <span data-i18n="login_trust">بياناتك آمنة معنا — للمتابعة فقط</span>
                    </p>
                  </div>
                </form>
              </div>

              <div className="screen-page enter-from-right" data-screen="2">
                <div className="top-strip">
                  <div className="header-row">
                    <button className="back-btn" type="button" data-i18n-aria="back" aria-label="رجوع">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <div className="header-title">
                      <span data-i18n="greeting">أهلاً</span>{' '}
                      <span className="header-title-strong">أحمد</span> 🌿
                    </div>
                    <div style={{ width: 32 }} />
                  </div>
                  <div className="progress-row">
                    <span className="progress-label" data-i18n="step">الخطوة</span>
                    <div className="progress-bar"><div className="progress-fill progress-fill-1" /></div>
                    <span className="progress-step" data-i18n="progress_1">١ / ٤</span>
                  </div>
                </div>
                <div className="content">
                  <div className="card">
                    <div className="card-title"><span className="title-icon">🥗</span><span data-i18n="choose_plan">اختر الخطة اللي تناسبك</span></div>
                    <div className="plan-stack">
                      <div className="plan-card" data-plan="balanced">
                        <div className="plate-info">
                          <div className="plate-name" data-i18n="plan_balanced">متوازنة</div>
                          <div className="plate-macros">
                            <span className="plate-macro"><span data-i18n="macro_protein">بروتين</span> <em>30٪</em></span>
                            <span className="plate-macro"><span data-i18n="macro_carb">كارب</span> <em>50٪</em></span>
                            <span className="plate-macro"><span data-i18n="macro_fat">دهون</span> <em>20٪</em></span>
                          </div>
                        </div>
                        <div className="plate-check"><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
                      </div>
                      <div className="plan-card selected" data-plan="protein">
                        <span className="badge-popular" data-i18n="badge_popular">الأكثر اختياراً</span>
                        <div className="plate-info">
                          <div className="plate-name" data-i18n="plan_protein">عالية البروتين</div>
                          <div className="plate-macros">
                            <span className="plate-macro"><span data-i18n="macro_protein">بروتين</span> <em>45٪</em></span>
                            <span className="plate-macro"><span data-i18n="macro_carb">كارب</span> <em>35٪</em></span>
                            <span className="plate-macro"><span data-i18n="macro_fat">دهون</span> <em>20٪</em></span>
                          </div>
                        </div>
                        <div className="plate-check"><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
                      </div>
                      <div className="plan-card" data-plan="lowcarb">
                        <div className="plate-info">
                          <div className="plate-name" data-i18n="plan_lowcarb">منخفضة الكارب</div>
                          <div className="plate-macros">
                            <span className="plate-macro"><span data-i18n="macro_protein">بروتين</span> <em>30٪</em></span>
                            <span className="plate-macro"><span data-i18n="macro_carb">كارب</span> <em>15٪</em></span>
                            <span className="plate-macro"><span data-i18n="macro_fat">دهون</span> <em>55٪</em></span>
                          </div>
                        </div>
                        <div className="plate-check"><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title"><span className="title-icon">🍱</span><span data-i18n="choose_meals">اختر عدد الوجبات في اليوم</span></div>
                    <div className="meal-row">
                      <div className="meal-card selected" data-meal="lunch">
                        <div className="check-corner"><svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
                        <div className="meal-card-head">
                          <span className="meal-label" data-i18n="meal_lunch">غداء فقط</span>
                        </div>
                        <div className="meal-price-from"><span data-i18n="price_from">ابتداءً من</span> <span className="amount">٢٥</span> <span data-i18n="currencyPerDay">ر.س / يوم</span></div>
                      </div>
                      <div className="meal-card" data-meal="lunch_snack">
                        <div className="check-corner"><svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
                        <div className="meal-card-head">
                          <span className="meal-label" data-i18n="meal_lunch_snack">غداء + سناك</span>
                        </div>
                        <div className="meal-price-from"><span data-i18n="price_from">ابتداءً من</span> <span className="amount">٣٠</span> <span data-i18n="currencyPerDay">ر.س / يوم</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title"><span className="title-icon">📅</span><span data-i18n="choose_duration">اختر عدد أيام الاشتراك</span></div>
                    <div className="duration-row">
                      <div className="duration-card" data-duration="20">
                        <div className="num">٢٠</div>
                        <div className="day-label" data-i18n="day">يوم</div>
                        <div className="breakdown" data-i18n="duration_breakdown_20">٥ أيام × ٤ أسابيع</div>
                      </div>
                      <div className="duration-card selected" data-duration="24">
                        <span className="badge-popular-dur" data-i18n="badge_popular">الأكثر اختياراً</span>
                        <div className="num">٢٤</div>
                        <div className="day-label" data-i18n="day">يوم</div>
                        <div className="breakdown" data-i18n="duration_breakdown_24">٦ أيام × ٤ أسابيع</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bottom-bar">
                  <div className="price-block">
                    <span className="label" data-i18n="total">الإجمالي</span>
                    <div className="price-row">
                      <span className="value" id="priceValue">٧٢٠<small>ر.س</small></span>
                      <div className="price-right-stack">
                        <span className="discount-badge" id="discountBadge" data-i18n="discount_badge" hidden>خصم ٤٠٪</span>
                        <span className="value-before" id="priceValueBefore" hidden />
                      </div>
                    </div>
                  </div>
                  <button className="cta" id="continueBtn" data-liquid type="button">
                    <span data-i18n="continue">تابع</span>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1={19} y1={12} x2={5} y2={12} /><polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="screen-page enter-from-right" data-screen="3">
                <div className="top-strip">
                  <div className="header-row">
                    <button className="back-btn" id="menuBackBtn" data-i18n-aria="back" aria-label="رجوع" type="button">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <div className="header-title" data-i18n="menu_title">المنيو 🍽️</div>
                    <div style={{ width: 32 }} />
                  </div>
                  <div className="progress-row">
                    <span className="progress-label" data-i18n="step">الخطوة</span>
                    <div className="progress-bar"><div className="progress-fill progress-fill-2" /></div>
                    <span className="progress-step" data-i18n="progress_2">٢ / ٤</span>
                  </div>
                </div>
                <div className="menu-scroll" id="menuScroll">
                  <div className="menu-preview-note">
                    <i className="info-icon" aria-hidden="true">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx={12} cy={12} r={10} /><line x1={12} y1={16} x2={12} y2={12} /><line x1={12} y1={8} x2="12.01" y2={8} />
                      </svg>
                    </i>
                    <span data-i18n="menu_preview">هذه معاينة فقط للأطباق. اختيار وجباتك اليومية يتم بعد الاشتراك ليكون أسهل.</span>
                  </div>
                  <div className="menu-filters" id="catFilters" data-filter-type="cat">
                    <button className="filter-pill active" data-val="all" type="button" data-i18n="filter_all">الكل</button>
                    <button className="filter-pill" data-val="main" type="button" data-i18n="filter_main">🍽️ رئيسي</button>
                    <button className="filter-pill" data-val="salad" type="button" data-i18n="filter_salad">🥗 سلطة</button>
                    <button className="filter-pill" data-val="soup" type="button" data-i18n="filter_soup">🍲 شوربة</button>
                    <button className="filter-pill" data-val="dessert" type="button" data-i18n="filter_dessert">🍮 حلا</button>
                  </div>
                  <div className="menu-filters" id="coFilters" data-filter-type="co">
                    <button className="filter-pill active" data-val="all" type="button" data-i18n="filter_all">الكل</button>
                    <button className="filter-pill" data-val="saudi" type="button" data-i18n="filter_saudi">🇸🇦 سعودي</button>
                    <button className="filter-pill" data-val="italian" type="button" data-i18n="filter_italian">🇮🇹 إيطالي</button>
                    <button className="filter-pill" data-val="indian" type="button" data-i18n="filter_indian">🇮🇳 هندي</button>
                    <button className="filter-pill" data-val="american" type="button" data-i18n="filter_american">🇺🇸 أمريكي</button>
                    <button className="filter-pill" data-val="lebanese" type="button" data-i18n="filter_lebanese">🇱🇧 لبناني</button>
                    <button className="filter-pill" data-val="french" type="button" data-i18n="filter_french">🇫🇷 فرنسي</button>
                    <button className="filter-pill" data-val="greek" type="button" data-i18n="filter_greek">🇬🇷 يوناني</button>
                    <button className="filter-pill" data-val="mexican" type="button" data-i18n="filter_mexican">🇲🇽 مكسيكي</button>
                    <button className="filter-pill" data-val="chinese" type="button" data-i18n="filter_chinese">🇨🇳 صيني</button>
                    <button className="filter-pill" data-val="turkish" type="button" data-i18n="filter_turkish">🇹🇷 تركي</button>
                    <button className="filter-pill" data-val="moroccan" type="button" data-i18n="filter_moroccan">🇲🇦 مغربي</button>
                    <button className="filter-pill" data-val="egyptian" type="button" data-i18n="filter_egyptian">🇪🇬 مصري</button>
                    <button className="filter-pill" data-val="mediterranean" type="button" data-i18n="filter_mediterranean">🌊 متوسطي</button>
                    <button className="filter-pill" data-val="healthy" type="button" data-i18n="filter_healthy">🌿 صحي</button>
                    <button className="filter-pill" data-val="arabic" type="button" data-i18n="filter_arabic">🌍 عربي</button>
                    <button className="filter-pill" data-val="intl" type="button" data-i18n="filter_intl">🌍 عالمي</button>
                  </div>
                  <div className="meal-grid" id="mealGrid" />
                  <button className="see-more-btn" id="seeMoreBtn" type="button">
                    <span data-i18n="see_more">عرض المزيد</span>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div className="meal-empty" id="mealEmpty" hidden>
                    <span data-i18n="meal_empty">لا توجد أطباق مطابقة</span>
                  </div>
                </div>
                <div className="menu-bottom-bar">
                  <button className="cta" id="menuNextBtn" type="button">
                    <span data-i18n="next">التالي</span>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1={19} y1={12} x2={5} y2={12} /><polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="screen-page enter-from-right" data-screen="4">
                <div className="top-strip">
                  <div className="header-row">
                    <button className="back-btn" id="screen4BackBtn" data-i18n-aria="back" aria-label="رجوع" type="button">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <div className="header-title" data-i18n="address_title">العنوان والتاريخ 📍</div>
                    <div style={{ width: 32 }} />
                  </div>
                  <div className="progress-row">
                    <span className="progress-label" data-i18n="step">الخطوة</span>
                    <div className="progress-bar"><div className="progress-fill progress-fill-3" /></div>
                    <span className="progress-step" data-i18n="progress_3">٣ / ٤</span>
                  </div>
                </div>
                <div className="screen4-content" id="screen4Content">
                  <div className="address-info-card">
                    <div className="address-info-icon">
                      <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x={4} y={2} width={16} height={20} rx={2} />
                        <line x1={9} y1={22} x2={9} y2={18} /><line x1={15} y1={22} x2={15} y2={18} />
                        <line x1={8} y1={6} x2={10} y2={6} /><line x1={14} y1={6} x2={16} y2={6} />
                        <line x1={8} y1={10} x2={10} y2={10} /><line x1={14} y1={10} x2={16} y2={10} />
                        <line x1={8} y1={14} x2={10} y2={14} /><line x1={14} y1={14} x2={16} y2={14} />
                      </svg>
                    </div>
                    <div className="address-info-text">
                      <p className="address-info-title" data-i18n="address_info_title">التوصيل لمكتب شركتك</p>
                      <p className="address-info-sub" data-i18n="address_info_sub">سنرتب التفاصيل النهائية معك.</p>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="startDate" data-i18n="start_date">تاريخ بدء الاشتراك</label>
                    <input className="input" id="startDate" type="date" />
                    <span className="date-hint" id="startDateHint" />
                  </div>
                  <div className="address-grid">
                    <div className="field">
                      <label className="field-label" htmlFor="addrBuilding">
                        <span data-i18n="addr_building">رقم/اسم المبنى</span>{' '}
                        <span className="optional-tag" data-i18n="optional">اختياري</span>
                      </label>
                      <input className="input" id="addrBuilding" type="text" data-i18n-placeholder="addr_building_ph" placeholder="برج المملكة" autoComplete="off" />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="addrFloor">
                        <span data-i18n="addr_floor">الدور</span>{' '}
                        <span className="optional-tag" data-i18n="optional">اختياري</span>
                      </label>
                      <input className="input" id="addrFloor" type="text" data-i18n-placeholder="addr_floor_ph" placeholder="١٢" inputMode="numeric" autoComplete="off" />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="addrOffice">
                        <span data-i18n="addr_office">رقم المكتب</span>{' '}
                        <span className="optional-tag" data-i18n="optional">اختياري</span>
                      </label>
                      <input className="input" id="addrOffice" type="text" data-i18n-placeholder="addr_office_ph" placeholder="١٢٠٤" autoComplete="off" />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="addrNotes">
                        <span data-i18n="addr_notes">ملاحظات</span>{' '}
                        <span className="optional-tag" data-i18n="optional">اختياري</span>
                      </label>
                      <input className="input" id="addrNotes" type="text" data-i18n-placeholder="addr_notes_ph" placeholder="عند الاستقبال" autoComplete="off" />
                    </div>
                  </div>
                </div>
                <div className="menu-bottom-bar" id="screen4BottomBar">
                  <button className="cta" id="screen4NextBtn" type="button">
                    <span data-i18n="continue">تابع</span>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1={19} y1={12} x2={5} y2={12} /><polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="screen-page enter-from-right" data-screen="5">
                <div className="top-strip">
                  <div className="header-row">
                    <button className="back-btn" id="screen5BackBtn" data-i18n-aria="back" aria-label="رجوع" type="button">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <div className="header-title" data-i18n="checkout_title">الدفع 💳</div>
                    <div style={{ width: 32 }} />
                  </div>
                  <div className="progress-row">
                    <span className="progress-label" data-i18n="step">الخطوة</span>
                    <div className="progress-bar"><div className="progress-fill progress-fill-4" /></div>
                    <span className="progress-step" data-i18n="progress_4">٤ / ٤</span>
                  </div>
                </div>
                <div className="checkout-scroll">
                  <div className="checkout-order-card">
                    <div className="checkout-section-label" data-i18n="checkout_order">طلبك</div>
                    <div className="checkout-order-head">
                      <div className="checkout-plan-icon" id="coPlanIcon">🌿</div>
                      <div className="checkout-plan-meta">
                        <div className="checkout-plan-name" id="coPlanName" data-i18n="checkout_plan_balanced">الخطة المتوازنة</div>
                        <div className="checkout-plan-sub" id="coPlanSub">غداء فقط · ٢٤ يوم</div>
                      </div>
                    </div>
                    <div className="checkout-order-rows">
                      <div className="checkout-row">
                        <div className="checkout-row-icon">
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x={3} y={4} width={18} height={18} rx={2} /><line x1={16} y1={2} x2={16} y2={6} /><line x1={8} y1={2} x2={8} y2={6} /><line x1={3} y1={10} x2={21} y2={10} />
                          </svg>
                        </div>
                        <span className="checkout-row-label" data-i18n="checkout_starts">يبدأ</span>
                        <span className="checkout-row-value" id="coStartDate">—</span>
                      </div>
                      <div className="checkout-row">
                        <div className="checkout-row-icon">
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx={12} cy={10} r={3} />
                          </svg>
                        </div>
                        <span className="checkout-row-label" data-i18n="checkout_delivery">التوصيل</span>
                        <span className="checkout-row-value" id="coAddress" data-i18n="checkout_office_default">مكتب شركتك</span>
                      </div>
                    </div>
                  </div>
                  <div className="checkout-receipt-card">
                    <div className="receipt-row">
                      <span className="receipt-label" id="rcvSubLabel" data-i18n="receipt_package">سعر الباقة</span>
                      <span className="receipt-value" id="rcvSub">—</span>
                    </div>
                    <div className="receipt-row receipt-subsidy" id="rcvSubsidyRow" hidden>
                      <span className="receipt-label" id="rcvSubsidyLabel" data-i18n="receipt_subsidy">دعم شركتك</span>
                      <span className="receipt-value receipt-subsidy-value" id="rcvSubsidy">—</span>
                    </div>
                    <div className="receipt-divider" />
                    <div className="receipt-row receipt-total">
                      <span className="receipt-label" data-i18n="receipt_total">المتبقي عليك</span>
                      <span className="receipt-value" id="rcvTotal">—</span>
                    </div>
                    <button className="zatca-toggle" id="zatcaToggle" type="button" aria-expanded="false">
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="zatca-chev">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      <span data-i18n="tax_details">تفاصيل الضريبة</span>
                    </button>
                    <div className="zatca-body" id="zatcaBody" hidden>
                      <div className="receipt-row receipt-mini">
                        <span className="receipt-label" data-i18n="tax_inclusive">المجموع شامل الضريبة</span>
                        <span className="receipt-value" id="zatcaInclusive">—</span>
                      </div>
                      <div className="receipt-row receipt-mini">
                        <span className="receipt-label" data-i18n="tax_exclusive">المجموع قبل الضريبة</span>
                        <span className="receipt-value" id="zatcaExclusive">—</span>
                      </div>
                      <div className="receipt-row receipt-mini">
                        <span className="receipt-label" data-i18n="tax_vat">ضريبة القيمة المضافة (١٥٪)</span>
                        <span className="receipt-value" id="zatcaVat">—</span>
                      </div>
                    </div>
                  </div>
                  <div className="checkout-payment-card">
                    <div className="checkout-section-label" data-i18n="payment_method">طريقة الدفع</div>
                    <div className="pay-method" data-method="apple_pay">
                      <div className="pay-radio" />
                      <div className="pay-info">
                        <div className="pay-name">Apple Pay</div>
                        <div className="pay-sub" data-i18n="pay_apple_sub">دفع آمن وسريع عبر جهازك</div>
                      </div>
                      <div className="pay-logo pay-logo-apple">
                        <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                      </div>
                    </div>
                    <div className="pay-method" data-method="mada">
                      <div className="pay-radio" />
                      <div className="pay-info">
                        <div className="pay-name" data-i18n="pay_mada">مدى</div>
                        <div className="pay-sub" data-i18n="pay_mada_sub">بطاقة الصراف الآلي السعودية</div>
                      </div>
                      <div className="pay-logo pay-logo-mada">
                        <span className="mada-dots"><span className="d1" /><span className="d2" /><span className="d3" /></span>
                        <span className="mada-text">mada</span>
                      </div>
                    </div>
                    <div className="pay-method" data-method="card">
                      <div className="pay-radio" />
                      <div className="pay-info">
                        <div className="pay-name" data-i18n="pay_card">بطاقة ائتمان أو خصم</div>
                        <div className="pay-sub">Visa / Mastercard</div>
                      </div>
                      <div className="pay-logo pay-logo-card">
                        <svg width={20} height={14} viewBox="0 0 24 16" fill="none">
                          <rect x={0} y={0} width={24} height={16} rx={2} fill="#1A1F71" />
                          <text x={12} y={11} textAnchor="middle" fontFamily="Arial Black" fontSize={6} fill="#fff" fontWeight={900}>VISA</text>
                        </svg>
                        <svg width={20} height={14} viewBox="0 0 24 16" fill="none">
                          <rect x={0} y={0} width={24} height={16} rx={2} fill="#fff" stroke="#E0E0E0" />
                          <circle cx={9} cy={8} r={5} fill="#EB001B" />
                          <circle cx={15} cy={8} r={5} fill="#F79E1B" fillOpacity="0.85" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="checkout-trust">
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span data-i18n="checkout_trust">الدفع آمن — جميع البيانات مشفرة</span>
                  </p>
                </div>
                <div className="menu-bottom-bar checkout-bottom-bar">
                  <button className="cta cta-pay" id="payBtn" type="button" disabled>
                    <span id="payBtnLabel" data-i18n="pay_select_method">اختر طريقة الدفع</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
