// @ts-nocheck
// Ported from legacy index.html inline script

import {
  initI18n,
  toggleLocale,
  t,
  formatNumber,
  formatCurrency,
  formatCurrencyHtml,
  getMealName,
  getPlanLabels,
  getMealConfigLabels,
  formatLocalizedDate,
  getWeekday,
  summarizeAddress,
  applyTranslations,
} from './i18n';

export function initGreenolaApp() {
      initI18n();
      // ═══════════════════════════════════════════════════════════════
      //  GREENOLA B2B — Page 1 (login) + Page 2 (joyful) + Supabase
      // ═══════════════════════════════════════════════════════════════
      let pricingMatrix = null;
      const cfg = window.GREENOLA_CONFIG || {};
      
      // Custom Supabase REST client that ONLY uses the apikey header (publishable keys can't go in Authorization)
      const SB = (() => {
        if (!cfg.supabaseUrl || !cfg.supabaseKey) return null;
        const baseUrl = cfg.supabaseUrl;
        const apiKey = cfg.supabaseKey;
        
        function request(path, options = {}) {
          return fetch(`${baseUrl}${path}`, {
            ...options,
            headers: {
              'apikey': apiKey,
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...(options.headers || {}),
            },
          }).then(async r => {
            if (!r.ok) {
              const text = await r.text().catch(() => '');
              throw new Error(`Supabase ${r.status}: ${text.slice(0, 200)}`);
            }
            if (r.status === 204) return null;
            const txt = await r.text();
            return txt ? JSON.parse(txt) : null;
          });
        }
        
        return {
          select: (table, query = '') => request(`/rest/v1/${table}?${query}`),
          insert: (table, data) => request(`/rest/v1/${table}`, {
            method: 'POST',
            headers: { 'Prefer': 'return=representation' },
            body: JSON.stringify(data),
          }),
          upsert: (table, data, onConflict) => request(`/rest/v1/${table}?on_conflict=${onConflict}`, {
            method: 'POST',
            headers: {
              'Prefer': 'return=representation,resolution=merge-duplicates',
            },
            body: JSON.stringify(data),
          }),
          rpc: (fnName, params) => request(`/rest/v1/rpc/${fnName}`, {
            method: 'POST',
            body: JSON.stringify(params),
          }),
        };
      })();
      
      if (SB) console.log('[Greenola B2B] Supabase REST client ready');
      else console.warn('[Greenola B2B] No Supabase config found');
      
      const FALLBACK_PRICING = {
        'balanced_lunch': 25, 'balanced_lunch_snack': 30,
        'lowcarb_lunch': 25, 'lowcarb_lunch_snack': 30,
        'protein_lunch': 30, 'protein_lunch_snack': 35,
      };
      
      async function loadPricing() {
        if (!SB) return;
        try {
          const data = await SB.select('meal_pricing', 'active=eq.true');
          pricingMatrix = {};
          (data || []).forEach(row => {
            pricingMatrix[`${row.plan_type}_${row.meal_config}`] = parseFloat(row.price_per_day);
          });
          console.log('[Greenola B2B] Pricing loaded:', Object.keys(pricingMatrix).length, 'rows');
        } catch (e) { console.warn('[Greenola B2B] Pricing load failed:', e?.message || e); }
      }
      setTimeout(() => { if (SB) loadPricing(); }, 200);
      
      // Read-only preview — used by live validation as user types in the code field.
      // Does NOT increment usage_count or write to redemption log.
      async function previewCompanyCode(code) {
        if (!SB || !code || !code.trim()) return null;
        try {
          const result = await SB.rpc('preview_company_code', { p_code: code.trim() });
          return result || null;
        } catch (e) {
          console.warn('[Greenola B2B] Code preview failed:', e?.message);
          return null;
        }
      }
      
      // Redeem on submit — atomic. This is the only place usage_count gets bumped.
      // Returns the full deal row (with locked_address etc.) on success, or null.
      async function redeemCompanyCode(code, leadData) {
        if (!SB || !code || !code.trim()) return null;
        try {
          const result = await SB.rpc('redeem_company_code', {
            p_code: code.trim(),
            p_lead_id: null,
            p_phone: leadData?.phone || null,
            p_full_name: leadData?.full_name || null,
            p_company_typed: leadData?.company_name || null,
          });
          if (result?.ok && result.deal) return result.deal;
          if (result && !result.ok) {
            console.warn('[Greenola B2B] Code rejected:', result.reason);
          }
          return null;
        } catch (e) {
          console.warn('[Greenola B2B] Redemption failed:', e?.message);
          return null;
        }
      }
      
      function getSessionId() {
        let s = sessionStorage.getItem('greenola_session_id');
        if (!s) {
          s = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
          sessionStorage.setItem('greenola_session_id', s);
        }
        return s;
      }
      
      async function upsertLead(leadData, companyCode) {
        if (!SB) return null;
        try {
          // Code-first matching. If no code, lead is captured at full price.
          let deal = null;
          if (companyCode && companyCode.trim()) {
            deal = await redeemCompanyCode(companyCode, leadData);
          }
          const payload = {
            ...leadData,
            company_deal_id: deal ? deal.id : null,
            device_info: {
              ua: navigator.userAgent.slice(0, 200),
              screen: { w: window.screen.width, h: window.screen.height },
              lang: navigator.language,
            },
          };
          const result = await SB.upsert('b2b_leads', payload, 'phone,company_name');
          const lead = Array.isArray(result) ? result[0] : result;
          if (!lead) throw new Error('No lead returned');
          return { lead, deal };
        } catch (e) {
          console.error('[Greenola B2B] Lead save failed:', e?.message || e);
          return null;
        }
      }
      
      async function logActivity(leadId, eventType, eventData = {}) {
        if (!SB || !leadId) return;
        try {
          await SB.insert('b2b_activity', {
            lead_id: leadId, event_type: eventType,
            event_data: eventData, session_id: getSessionId(),
          });
        } catch (e) { /* silent */ }
      }
      
      function calculatePrice({ plan, mealConfig, duration, deal }) {
        const matrix = pricingMatrix || FALLBACK_PRICING;
        const key = `${plan}_${mealConfig}`;
        const pricePerDay = matrix[key];
        if (!pricePerDay) return null;
        const baseTotal = pricePerDay * duration;
        
        // Fixed SAR subsidy — one-time deduction the company covers per subscription
        // No percentage discounts. The "before" strikethrough is pure theater.
        const fixedSubsidy = Math.max(0, parseFloat(deal?.fixed_subsidy_sar) || 0);
        // Don't let subsidy exceed the actual price
        const companyPays = Math.min(fixedSubsidy, baseTotal);
        const userPays = baseTotal - companyPays;
        
        return {
          pricePerDay,
          baseTotal: Math.round(baseTotal),
          // Legacy fields kept for the b2b_subscription_intent payload (so DB inserts don't break)
          discountPct: 0,
          discountAmount: 0,
          afterDiscount: Math.round(baseTotal),  // No real discount = same as baseTotal
          subsidyPct: 0,                          // Not used anymore
          // Active fields
          fixedSubsidy: Math.round(fixedSubsidy),
          companyPays: Math.round(companyPays),
          userPays: Math.round(userPays),
          // Always show the company's contribution when there's a deal with subsidy
          showBreakdown: companyPays > 0,
        };
      }
      
      const state = {
        lead: null, dealMatched: null,
        selectedPlan: null, mealConfig: null, selectedDuration: null,
      };
      // ─── STATE PERSISTENCE (refresh-safe) ───
      const STORAGE_KEY = 'greenola_b2b_state';
      function saveState(screenNum) {
        try {
          const current = document.querySelector('.screen-page:not(.exit):not(.enter-from-right)');
          const scr = screenNum || (current ? parseInt(current.dataset.screen) : 1);
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            selectedPlan: state.selectedPlan,
            mealConfig: state.mealConfig,
            selectedDuration: state.selectedDuration,
            currentScreen: scr,
            lead: state.lead,
          }));
        } catch(e) {}
      }
      function restoreState() {
        try {
          const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
          if (!saved) return;
          if (saved.selectedPlan) state.selectedPlan = saved.selectedPlan;
          if (saved.mealConfig) state.mealConfig = saved.mealConfig;
          if (saved.selectedDuration) state.selectedDuration = saved.selectedDuration;
          if (saved.lead) state.lead = saved.lead;
          state._restoredScreen = saved.currentScreen || 1;
        } catch(e) {}
      }
      restoreState();
      
      function toast(msg) {
        let t = document.getElementById('toast');
        if (!t) {
          t = document.createElement('div');
          t.id = 'toast';
          t.className = 'toast';
          document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2400);
      }
      
      function showScreen(num) {
        document.querySelectorAll('.screen-page').forEach(p => {
          const ps = parseInt(p.dataset.screen);
          if (ps === num) p.classList.remove('exit', 'enter-from-right');
          else if (ps < num) { p.classList.add('exit'); p.classList.remove('enter-from-right'); }
          else { p.classList.add('enter-from-right'); p.classList.remove('exit'); }
        });
      }
      
      // ─── SCREEN 1 (Page 1's form) ───
      const form = document.getElementById('loginForm');
      const nameInput = document.getElementById('name');
      const phoneInput = document.getElementById('phone');
      const companyInput = document.getElementById('company');
      const codeInput = document.getElementById('companyCode');
      const codeHintEl = document.getElementById('codeHint');
      const codeFieldWrap = codeInput?.closest('.code-field');
      const submitBtn = document.getElementById('submitBtn');
      
      const urlParams = new URLSearchParams(window.location.search);
      const companyParam = urlParams.get('company');
      if (companyParam) companyInput.value = decodeURIComponent(companyParam);
      // Allow ?code=ARAMCO25 in URL for shared links
      const codeParam = urlParams.get('code');
      if (codeParam && codeInput) codeInput.value = codeParam.toUpperCase();
      
      function validateForm() {
        const nameValid = nameInput.value.trim().length >= 2;
        const phoneValid = /^[0-9]{9}$/.test(phoneInput.value.trim());
        const companyValid = companyInput.value.trim().length >= 2;
        // Code is OPTIONAL — never blocks the submit button
        submitBtn.disabled = !(nameValid && phoneValid && companyValid);
      }
      [nameInput, phoneInput, companyInput].forEach(el => el.addEventListener('input', validateForm));
      phoneInput.addEventListener('input', e => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });
      
      // ─── Live code validation (debounced 400ms) ───
      let codePreviewTimer = null;
      let lastPreviewedCode = '';
      function setCodeUI(state, message) {
        if (!codeFieldWrap || !codeHintEl) return;
        codeFieldWrap.classList.remove('code-valid', 'code-invalid');
        codeHintEl.classList.remove('code-hint-valid', 'code-hint-invalid');
        if (state === 'valid') {
          codeFieldWrap.classList.add('code-valid');
          codeHintEl.classList.add('code-hint-valid');
        } else if (state === 'invalid') {
          codeFieldWrap.classList.add('code-invalid');
          codeHintEl.classList.add('code-hint-invalid');
        }
        codeHintEl.textContent = message;
      }
      function defaultCodeHint() {
        setCodeUI('neutral', t('login_codeHint'));
      }
      
      if (codeInput) {
        codeInput.addEventListener('input', () => {
          // Force uppercase for visual consistency (ASCII codes only)
          codeInput.value = codeInput.value.replace(/\s+/g, '');
          const v = codeInput.value.trim();
          clearTimeout(codePreviewTimer);
          if (!v) { defaultCodeHint(); lastPreviewedCode = ''; return; }
          if (v === lastPreviewedCode) return;
          setCodeUI('neutral', t('code_checking'));
          codePreviewTimer = setTimeout(async () => {
            lastPreviewedCode = v;
            const result = await previewCompanyCode(v);
            if (codeInput.value.trim() !== v) return; // user changed input meanwhile
            if (result?.ok) {
              const subsidy = parseFloat(result.subsidy_pct) || 0;
              const discount = parseFloat(result.discount_pct) || 0;
              const perks = [];
              if (subsidy > 0) perks.push(t('code_subsidy', { pct: subsidy }));
              else if (discount > 0) perks.push(t('code_discount', { pct: discount }));
              const msg = perks.length
                ? `✓ ${result.company_name} — ${perks.join(' · ')}`
                : `✓ ${result.company_name}`;
              setCodeUI('valid', msg);
            } else if (result?.reason === 'cap_reached') {
              setCodeUI('invalid', t('code_cap_reached'));
            } else if (result?.reason === 'expired' || result?.reason === 'inactive') {
              setCodeUI('invalid', t('code_expired'));
            } else {
              setCodeUI('invalid', t('code_invalid'));
            }
          }, 400);
        });
        defaultCodeHint();
      }
      
      form.addEventListener('submit', async e => {
        e.preventDefault();
        submitBtn.disabled = true;
        const span = submitBtn.querySelector('span');
        const originalText = span.textContent;
        
        const leadData = {
          full_name: nameInput.value.trim(),
          phone: '+966' + phoneInput.value.trim(),
          company_name: companyInput.value.trim(),
          source: companyParam ? 'shared_link' : 'direct',
          utm_source: urlParams.get('utm_source') || null,
          utm_campaign: urlParams.get('utm_campaign') || null,
        };
        const enteredCode = codeInput?.value.trim() || null;
        
        // 1) Personalize Page 2 greeting (no network — instant)
        const userNameEl = document.querySelector('[data-screen="2"] .header-title-strong');
        if (userNameEl) userNameEl.textContent = leadData.full_name.split(' ')[0];
        
        // 2) Optimistic local state so Page 2 renders immediately
        state.lead = { id: null, ...leadData };
        
        // 3) Navigate to Page 2 RIGHT NOW — don't block on Supabase
        showScreen(2);
        saveState(2);
        
        // 4) Fire Supabase writes in the background. When they resolve,
        //    update state and refresh pricing so any company-deal subsidy applies.
        upsertLead(leadData, enteredCode).then(result => {
          if (!result) return;
          state.lead = result.lead;
          state.dealMatched = result.deal;
          if (typeof loadPricing === 'function') loadPricing();
          logActivity(result.lead.id, 'login', {
            matched_deal: result.deal?.id || null,
            deal_name: result.deal?.company_name || null,
            code_used: enteredCode || null,
            code_redeemed: !!result.deal,
          });
          logActivity(result.lead.id, 'screen_view', { screen: 'plans' });
        }).catch(err => console.error('[Greenola B2B] Background lead save failed:', err));
        
        // 5) Reset the button (in case user navigates back)
        setTimeout(() => {
          span.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 800);
      });
      
      document.querySelector('.lang-toggle')?.addEventListener('click', () => {
        toggleLocale();
      });
      
      // ─── SCREEN 2 (joyful design) ───
      
      
      function findPriceElements() {
        const valueEl = document.getElementById('priceValue');
        const valueBeforeEl = document.getElementById('priceValueBefore');
        const discountBadgeEl = document.getElementById('discountBadge');
        const continueBtn = document.getElementById('continueBtn');
        return { valueEl, valueBeforeEl, discountBadgeEl, continueBtn };
      }
      
      // Theater multiplier — fixed 40% nominal, rounded up to nearest 50 SAR
      // Formula: ceil((real / 0.60) / 50) × 50
      function calcTheaterBefore(realPrice) {
        if (!realPrice || realPrice <= 0) return 0;
        return Math.ceil((realPrice / 0.60) / 50) * 50;
      }
      
      function updatePriceDisplay() {
        const { valueEl, valueBeforeEl, discountBadgeEl, continueBtn } = findPriceElements();
        if (!valueEl) return;
        
        if (!state.selectedPlan || !state.mealConfig || !state.selectedDuration) {
          valueEl.innerHTML = `—<small>${t('currency')}</small>`;
          if (valueBeforeEl) { valueBeforeEl.hidden = true; valueBeforeEl.textContent = ''; }
          if (discountBadgeEl) discountBadgeEl.hidden = true;
          if (continueBtn) continueBtn.disabled = true;
          return;
        }
        
        const pricing = calculatePrice({
          plan: state.selectedPlan, mealConfig: state.mealConfig,
          duration: state.selectedDuration, deal: state.dealMatched,
        });
        if (!pricing) return;
        
        // ═══ PLAN SCREEN PRICE THEATER ═══
        // The real price is baseTotal (price_per_day × duration). User pays this at checkout.
        // For coded users, show a fake higher "before" strikethrough to imply ~40% off:
        //   - bold value = baseTotal (the REAL price)
        //   - strikethrough = ceil(baseTotal / 0.60 / 50) × 50 (theater "before" — rounded up to nearest 50)
        //   - "خصم ٤٠٪" badge
        // Example: baseTotal 600 → strikethrough 1000 → user pays 600.
        // The fixed-amount subsidy from the deal is revealed only on checkout (Screen 5).
        const hasDeal = !!state.dealMatched;
        const display = pricing.baseTotal;
        valueEl.innerHTML = formatCurrencyHtml(display);
        
        if (hasDeal && valueBeforeEl && discountBadgeEl) {
          const before = calcTheaterBefore(display);
          if (before > display) {
            valueBeforeEl.textContent = formatCurrency(before);
            valueBeforeEl.hidden = false;
            discountBadgeEl.hidden = false;
          } else {
            valueBeforeEl.hidden = true;
            discountBadgeEl.hidden = true;
          }
        } else {
          if (valueBeforeEl) valueBeforeEl.hidden = true;
          if (discountBadgeEl) discountBadgeEl.hidden = true;
        }
        
        if (continueBtn) continueBtn.disabled = false;
      }
      
      const planMap = ['balanced', 'protein', 'lowcarb'];
      document.querySelectorAll('[data-screen="2"] .plan-card').forEach((card, idx) => {
        if (!card.dataset.plan) card.dataset.plan = planMap[idx] || 'balanced';
        card.addEventListener('click', () => {
          document.querySelectorAll('[data-screen="2"] .plan-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          state.selectedPlan = card.dataset.plan;
          saveState();
          if (state.lead?.id) logActivity(state.lead.id, 'plan_selected', { plan: state.selectedPlan });
          updatePriceDisplay();
        });
      });
      
      const mealMap = ['lunch', 'lunch_snack'];
      document.querySelectorAll('[data-screen="2"] .meal-card').forEach((card, idx) => {
        if (!card.dataset.meal) card.dataset.meal = mealMap[idx] || 'lunch';
        card.addEventListener('click', () => {
          document.querySelectorAll('[data-screen="2"] .meal-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          state.mealConfig = card.dataset.meal;
          saveState();
          if (state.lead?.id) logActivity(state.lead.id, 'meal_config_selected', { config: state.mealConfig });
          updatePriceDisplay();
        });
      });
      
      const durMap = [20, 24];
      document.querySelectorAll('[data-screen="2"] .duration-card').forEach((card, idx) => {
        if (!card.dataset.duration) card.dataset.duration = String(durMap[idx] || 20);
        card.addEventListener('click', () => {
          document.querySelectorAll('[data-screen="2"] .duration-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          state.selectedDuration = parseInt(card.dataset.duration);
          saveState();
          if (state.lead?.id) logActivity(state.lead.id, 'duration_selected', { duration: state.selectedDuration });
          updatePriceDisplay();
        });
      });
      
      document.querySelectorAll('[data-screen="2"] .plan-card.selected, [data-screen="2"] .meal-card.selected, [data-screen="2"] .duration-card.selected').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Restore visual selections from sessionStorage
      (function restoreVisualSelections() {
        if (state.selectedPlan) {
          const c = document.querySelector('[data-screen="2"] .plan-card[data-plan="' + state.selectedPlan + '"]');
          if (c) c.classList.add('selected');
        }
        if (state.mealConfig) {
          const c = document.querySelector('[data-screen="2"] .meal-card[data-meal="' + state.mealConfig + '"]');
          if (c) c.classList.add('selected');
        }
        if (state.selectedDuration) {
          const c = document.querySelector('[data-screen="2"] .duration-card[data-duration="' + state.selectedDuration + '"]');
          if (c) c.classList.add('selected');
        }
        updatePriceDisplay();
      })();
      
      setTimeout(() => {
        const { continueBtn } = findPriceElements();
        if (continueBtn) {
          continueBtn.addEventListener('click', () => {
            if (continueBtn.disabled) return;
            const pricing = calculatePrice({
              plan: state.selectedPlan, mealConfig: state.mealConfig,
              duration: state.selectedDuration, deal: state.dealMatched,
            });
            if (state.lead?.id) {
              logActivity(state.lead.id, 'continue_clicked', {
                plan: state.selectedPlan, mealConfig: state.mealConfig,
                duration: state.selectedDuration, pricing,
              });
            }
            // Navigate to menu screen
            showScreen(3);
            saveState(3);
            if (typeof renderMenu === 'function' && !window.__menuRendered) {
              renderMenu();
              window.__menuRendered = true;
            }
            if (state.lead?.id) {
              logActivity(state.lead.id, 'screen_view', { screen: 'menu' });
            }
          });
        }
        const backBtn = document.querySelector('[data-screen="2"] .back-btn');
        if (backBtn) backBtn.addEventListener('click', () => showScreen(1));
        const menuBackBtn = document.getElementById('menuBackBtn');
        if (menuBackBtn) menuBackBtn.addEventListener('click', () => showScreen(2));
        const screen4BackBtn = document.getElementById('screen4BackBtn');
        if (screen4BackBtn) screen4BackBtn.addEventListener('click', () => showScreen(3));
        updatePriceDisplay();
      }, 80);
      
      // Liquid gradient cursor effect
      document.querySelectorAll('[data-liquid], .cta').forEach(btn => {
        btn.addEventListener('mousemove', e => {
          const rect = btn.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          btn.style.setProperty('--mx', x + '%');
          btn.style.setProperty('--my', y + '%');
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.setProperty('--mx', '50%');
          btn.style.setProperty('--my', '50%');
        });
      });
      
      validateForm();
      // Restore journey if user refreshed mid-flow
      if (state._restoredScreen && state._restoredScreen > 1 && state.lead) {
        const firstName = (state.lead.full_name || '').split(' ')[0] || '';
        const userNameEl = document.querySelector('[data-screen="2"] .header-title-strong');
        if (userNameEl && firstName) userNameEl.textContent = firstName;
        showScreen(state._restoredScreen);
        if (state._restoredScreen >= 3 && typeof renderMenu === 'function' && !window.__menuRendered) {
          renderMenu(); window.__menuRendered = true;
        }
      } else {
        showScreen(1);
      }

      refreshLocalizedNumbers();
    
      // ═══ MENU SCREEN LOGIC ═══════════════════════════════════════════
      const MEALS = [{"n": "كبسة دجاج", "i": "https://greenolasa-menu.pages.dev/images/kabsa-chicken-saudi.jpg", "ca": "main", "co": "saudi", "fl": "🇸🇦"}, {"n": "كبسة لحم", "i": "https://greenolasa-menu.pages.dev/images/kabsa-meat-saudi.jpg", "ca": "main", "co": "saudi", "fl": "🇸🇦"}, {"n": "سليق", "i": "https://greenolasa-menu.pages.dev/images/saleeg.jpg", "ca": "main", "co": "saudi", "fl": "🇸🇦"}, {"n": "جريش", "i": "https://greenolasa-menu.pages.dev/images/jareesh.jpg", "ca": "main", "co": "saudi", "fl": "🇸🇦"}, {"n": "ملوخية بالأرز", "i": "https://greenolasa-menu.pages.dev/images/molokhia-rice-egyptian.jpg", "ca": "main", "co": "egyptian", "fl": "🇪🇬"}, {"n": "كباب حلة مع أرز", "i": "https://greenolasa-menu.pages.dev/images/kabab-halla-rice-egyptian.jpg", "ca": "main", "co": "egyptian", "fl": "🇪🇬"}, {"n": "ورق عنب مع لحم", "i": "https://greenolasa-menu.pages.dev/images/grape-leaves-meat-egyptian.jpg", "ca": "main", "co": "egyptian", "fl": "🇪🇬"}, {"n": "طاجن دجاج مغربي", "i": "https://greenolasa-menu.pages.dev/images/tagine-chicken-moroccan.jpg", "ca": "main", "co": "moroccan", "fl": "🇲🇦"}, {"n": "طاجن لحم مغربي", "i": "https://greenolasa-menu.pages.dev/images/tagine-beef-moroccan.jpg", "ca": "main", "co": "moroccan", "fl": "🇲🇦"}, {"n": "بيف اسكندر", "i": "https://greenolasa-menu.pages.dev/images/beef-iskender.jpg", "ca": "main", "co": "turkish", "fl": "🇹🇷"}, {"n": "كفتة السلطان", "i": "https://greenolasa-menu.pages.dev/images/main-19.jpg", "ca": "main", "co": "turkish", "fl": "🇹🇷"}, {"n": "باستا الفريدو", "i": "https://greenolasa-menu.pages.dev/images/pasta-alfredo.jpg", "ca": "main", "co": "italian", "fl": "🇮🇹"}, {"n": "لازنيا لحم", "i": "https://greenolasa-menu.pages.dev/images/main-16.jpg", "ca": "main", "co": "italian", "fl": "🇮🇹"}, {"n": "برياني دجاج بالمكسرات", "i": "https://greenolasa-menu.pages.dev/images/biryani-chicken.jpg", "ca": "main", "co": "indian", "fl": "🇮🇳"}, {"n": "دجاج تكا", "i": "https://greenolasa-menu.pages.dev/images/chicken-tikka-masala.jpg", "ca": "main", "co": "indian", "fl": "🇮🇳"}, {"n": "برجر دجاج", "i": "https://greenolasa-menu.pages.dev/images/chicken-burger.jpg", "ca": "main", "co": "american", "fl": "🇺🇸"}, {"n": "كرات اللحم السويدي", "i": "https://greenolasa-menu.pages.dev/images/swedish-meatballs.jpg", "ca": "main", "co": "french", "fl": "🇫🇷"}, {"n": "سمك سلمون بالأرز", "i": "https://greenolasa-menu.pages.dev/images/main-11.jpg", "ca": "main", "co": "mediterranean", "fl": "🌊"}, {"n": "سلطة سيزر بالدجاج", "i": "https://greenolasa-menu.pages.dev/images/salad-16.jpg", "ca": "salad", "co": "american", "fl": "🇺🇸"}, {"n": "تبولة بالكينوا", "i": "https://greenolasa-menu.pages.dev/images/salad-14.jpg", "ca": "salad", "co": "lebanese", "fl": "🇱🇧"}, {"n": "سلطة الجبنة الفيتا", "i": "https://greenolasa-menu.pages.dev/images/salad-15.jpg", "ca": "salad", "co": "greek", "fl": "🇬🇷"}, {"n": "بول الكينوا بالأفوكادو", "i": "https://greenolasa-menu.pages.dev/images/salad-13.jpg", "ca": "salad", "co": "intl", "fl": "🌍"}, {"n": "شوربة عدس", "i": "https://greenolasa-menu.pages.dev/images/lentil-soup.jpg", "ca": "soup", "co": "saudi", "fl": "🇸🇦"}, {"n": "شوربة كريمة الفطر", "i": "https://greenolasa-menu.pages.dev/images/soup-3.jpg", "ca": "soup", "co": "french", "fl": "🇫🇷"}, {"n": "شوربة بروكلي", "i": "https://greenolasa-menu.pages.dev/images/soup-5.jpg", "ca": "soup", "co": "healthy", "fl": "🌿"}, {"n": "تيراميسو كلاسيك", "i": "https://greenolasa-menu.pages.dev/images/dessert-7.jpg", "ca": "dessert", "co": "italian", "fl": "🇮🇹"}, {"n": "تمر محشي بالمكسرات", "i": "https://greenolasa-menu.pages.dev/images/dessert-5.jpg", "ca": "dessert", "co": "saudi", "fl": "🇸🇦"}, {"n": "براونيز", "i": "https://greenolasa-menu.pages.dev/images/dessert-6.jpg", "ca": "dessert", "co": "american", "fl": "🇺🇸"}, {"n": "كريم بروليه", "i": "https://greenolasa-menu.pages.dev/images/dessert-16.jpg", "ca": "dessert", "co": "french", "fl": "🇫🇷"}, {"n": "مهلبية بالفستق", "i": "https://greenolasa-menu.pages.dev/images/dessert-17.jpg", "ca": "dessert", "co": "arabic", "fl": "🌍"}, {"n": "بامية مصرية", "i": "https://greenolasa-menu.pages.dev/images/bamia-egyptian.jpg", "ca": "main", "co": "egyptian", "fl": "🇪🇬"}, {"n": "كوسة بالباشميل", "i": "https://greenolasa-menu.pages.dev/images/moussaka-beef-egyptian.jpg", "ca": "main", "co": "egyptian", "fl": "🇪🇬"}, {"n": "بيستو باستا", "i": "https://greenolasa-menu.pages.dev/images/pasta-chicken.jpg", "ca": "main", "co": "italian", "fl": "🇮🇹"}, {"n": "باستا بني بالروبيان", "i": "https://greenolasa-menu.pages.dev/images/main-6.jpg", "ca": "main", "co": "italian", "fl": "🇮🇹"}, {"n": "دجاج بالصوص الكريمي", "i": "https://greenolasa-menu.pages.dev/images/main-5.jpg", "ca": "main", "co": "italian", "fl": "🇮🇹"}, {"n": "دجاج روزماري", "i": "https://greenolasa-menu.pages.dev/images/chicken-rosemary.jpg", "ca": "main", "co": "italian", "fl": "🇮🇹"}, {"n": "دجاج بيستو", "i": "https://greenolasa-menu.pages.dev/images/chicken-pesto.jpg", "ca": "main", "co": "italian", "fl": "🇮🇹"}, {"n": "دجاج مع أرز حساوي", "i": "https://greenolasa-menu.pages.dev/images/hasawi-rice.jpg", "ca": "main", "co": "saudi", "fl": "🇸🇦"}, {"n": "ساندوتش كباب لحم", "i": "https://greenolasa-menu.pages.dev/images/kabsa-meat-saudi.jpg", "ca": "main", "co": "lebanese", "fl": "🇱🇧"}, {"n": "تورلي", "i": "https://greenolasa-menu.pages.dev/images/turli.jpg", "ca": "main", "co": "lebanese", "fl": "🇱🇧"}, {"n": "دجاج صويا بالأرز المقلي", "i": "https://greenolasa-menu.pages.dev/images/biryani-chicken.jpg", "ca": "main", "co": "indian", "fl": "🇮🇳"}, {"n": "دجاج جريفي", "i": "https://greenolasa-menu.pages.dev/images/chicken-tikka-masala.jpg", "ca": "main", "co": "indian", "fl": "🇮🇳"}, {"n": "دجاج سويت اند ساور", "i": "https://greenolasa-menu.pages.dev/images/chicken-noodles.jpg", "ca": "main", "co": "chinese", "fl": "🇨🇳"}, {"n": "نودلز بالدجاج والخضار", "i": "https://greenolasa-menu.pages.dev/images/chicken-noodles.jpg", "ca": "main", "co": "chinese", "fl": "🇨🇳"}, {"n": "ساندوتش دجاج باربكيو", "i": "https://greenolasa-menu.pages.dev/images/chicken-burger.jpg", "ca": "main", "co": "intl", "fl": "🌍"}, {"n": "سمك يوناني", "i": "https://greenolasa-menu.pages.dev/images/main-1.jpg", "ca": "main", "co": "intl", "fl": "🌍"}, {"n": "بيف ستيك ساندوتش", "i": "https://greenolasa-menu.pages.dev/images/main-20.jpg", "ca": "main", "co": "american", "fl": "🇺🇸"}, {"n": "ميني برجر لحم", "i": "https://greenolasa-menu.pages.dev/images/main-19.jpg", "ca": "main", "co": "american", "fl": "🇺🇸"}, {"n": "ساندويتش فاهيتا", "i": "https://greenolasa-menu.pages.dev/images/chicken-wrap.jpg", "ca": "main", "co": "mexican", "fl": "🇲🇽"}, {"n": "كاساديا الدجاج", "i": "https://greenolasa-menu.pages.dev/images/chicken-wrap.jpg", "ca": "main", "co": "mexican", "fl": "🇲🇽"}, {"n": "سلطة التونة بالبيض", "i": "https://greenolasa-menu.pages.dev/images/salad-1.jpg", "ca": "salad", "co": "mediterranean", "fl": "🌊"}, {"n": "سلطة الكينوا بالفواكه", "i": "https://greenolasa-menu.pages.dev/images/salad-12.jpg", "ca": "salad", "co": "healthy", "fl": "🌿"}, {"n": "سلطة الرمان بالجبنة", "i": "https://greenolasa-menu.pages.dev/images/salad-17.jpg", "ca": "salad", "co": "mediterranean", "fl": "🌊"}, {"n": "حمص بالطحينة", "i": "https://greenolasa-menu.pages.dev/images/hummus-1.jpg", "ca": "main", "co": "lebanese", "fl": "🇱🇧"}, {"n": "شوربة طماطم", "i": "https://greenolasa-menu.pages.dev/images/soup-4.jpg", "ca": "soup", "co": "intl", "fl": "🌍"}, {"n": "شوربة جمبري", "i": "https://greenolasa-menu.pages.dev/images/soup-2.jpg", "ca": "soup", "co": "mediterranean", "fl": "🌊"}, {"n": "تشيز كيك البرتقال", "i": "https://greenolasa-menu.pages.dev/images/dessert-10.jpg", "ca": "dessert", "co": "american", "fl": "🇺🇸"}, {"n": "كوكيز الشوكولاتة", "i": "https://greenolasa-menu.pages.dev/images/dessert-8.jpg", "ca": "dessert", "co": "american", "fl": "🇺🇸"}, {"n": "بسبوسة بالكنافة", "i": "https://greenolasa-menu.pages.dev/images/dessert-21.jpg", "ca": "dessert", "co": "arabic", "fl": "🌍"}, {"n": "كرات الفستق", "i": "https://greenolasa-menu.pages.dev/images/dessert-14.jpg", "ca": "dessert", "co": "intl", "fl": "🌍"}, {"n": "بسكوتي بالفستق", "i": "https://greenolasa-menu.pages.dev/images/dessert-3.jpg", "ca": "dessert", "co": "italian", "fl": "🇮🇹"}];
      const HIGHLIGHTS = 30;
      const menuState = { cat: 'all', co: 'all', expanded: false };
      
      function filteredMeals() {
        return MEALS.filter(m => 
          (menuState.cat === 'all' || m.ca === menuState.cat) &&
          (menuState.co === 'all' || m.co === menuState.co)
        );
      }
      
      function renderMenu() {
        const grid = document.getElementById('mealGrid');
        const empty = document.getElementById('mealEmpty');
        const seeMoreBtn = document.getElementById('seeMoreBtn');
        if (!grid) return;
        
        const list = filteredMeals();
        const showAll = menuState.expanded || menuState.cat !== 'all' || menuState.co !== 'all';
        const toShow = showAll ? list : list.slice(0, HIGHLIGHTS);
        
        if (list.length === 0) {
          grid.innerHTML = '';
          empty.hidden = false;
          seeMoreBtn.hidden = true;
          return;
        }
        empty.hidden = true;
        
        // Cycle through 3 aspect ratios so the masonry layout naturally staggers
        const ratios = ['ar-tall', 'ar-square', 'ar-short', 'ar-square', 'ar-tall', 'ar-short'];
        grid.innerHTML = toShow.map((m, idx) => `
          <div class="meal-card">
            <div class="meal-img-wrap ${ratios[idx % ratios.length]}">
              <img class="meal-img" src="${m.i}" alt="${m.n}" loading="lazy"
                onerror="this.closest('.meal-card').style.display='none'">
              <span class="meal-flag">${m.fl}</span>
            </div>
            <div class="meal-info"><div class="meal-name">${getMealName(m)}</div></div>
          </div>
        `).join('');
        
        // Show "see more" only when in default view AND there are more to show
        seeMoreBtn.hidden = showAll || list.length <= HIGHLIGHTS;
      }
      
      // Filter pill click handlers
      document.querySelectorAll('.menu-filters').forEach(row => {
        const filterType = row.dataset.filterType;
        row.addEventListener('click', e => {
          const pill = e.target.closest('.filter-pill');
          if (!pill) return;
          row.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          menuState[filterType] = pill.dataset.val;
          menuState.expanded = false; // reset expansion when filter changes
          renderMenu();
        });
      });
      
      // See-more button
      const seeMoreBtn = document.getElementById('seeMoreBtn');
      if (seeMoreBtn) seeMoreBtn.addEventListener('click', () => {
        menuState.expanded = true;
        renderMenu();
        if (state.lead?.id) logActivity(state.lead.id, 'see_more_meals', {});
      });
      
      // Menu next button → Screen 4 (address + start date, step 2 of 3)
      const menuNextBtn = document.getElementById('menuNextBtn');
      if (menuNextBtn) menuNextBtn.addEventListener('click', () => {
        showScreen(4);
        saveState(4);
        if (typeof refreshStartDateField === 'function') refreshStartDateField();
        if (typeof validateScreen4 === 'function') validateScreen4();
        if (state.lead?.id) logActivity(state.lead.id, 'screen_view', { screen: 'address' });
      });
      
      // ─── Screen 4: address + start date (step 2 of 3) ───
      const dateEl = document.getElementById('startDate');
      const screen4NextBtn = document.getElementById('screen4NextBtn');
      const dateHintEl = document.getElementById('startDateHint');
      const addrBuildingEl = document.getElementById('addrBuilding');
      const addrFloorEl = document.getElementById('addrFloor');
      const addrOfficeEl = document.getElementById('addrOffice');
      const addrNotesEl = document.getElementById('addrNotes');
      
      // Plan-aware date rules (mirrors Postgres calc_earliest_start_date)
      function calcEarliestStartLocal(planDays) {
        const saudiNow = new Date(Date.now() + (3 * 60 * 60 * 1000));
        const saudiToday = new Date(Date.UTC(
          saudiNow.getUTCFullYear(), saudiNow.getUTCMonth(), saudiNow.getUTCDate()
        ));
        let candidate = new Date(saudiToday.getTime() + 2 * 86400000);
        for (let i = 0; i < 14; i++) {
          const dow = candidate.getUTCDay();
          if (dow === 5) { candidate = new Date(candidate.getTime() + 86400000); continue; }
          if (dow === 6 && planDays === 20) { candidate = new Date(candidate.getTime() + 86400000); continue; }
          return candidate;
        }
        return candidate;
      }
      function isValidStartLocal(planDays, dateStr) {
        if (!dateStr) return false;
        const earliest = calcEarliestStartLocal(planDays);
        const d = new Date(dateStr + 'T00:00:00Z');
        if (d < earliest) return false;
        const dow = d.getUTCDay();
        if (dow === 5) return false;
        if (dow === 6 && planDays === 20) return false;
        return true;
      }
      function fmtUTCDate(d) { return d.toISOString().split('T')[0]; }
      
      function refreshStartDateField() {
        if (!dateEl) return;
        const planDays = state.selectedDuration || 20;
        const earliest = calcEarliestStartLocal(planDays);
        dateEl.min = fmtUTCDate(earliest);
        if (!dateEl.value || !isValidStartLocal(planDays, dateEl.value)) {
          dateEl.value = fmtUTCDate(earliest);
        }
        updateDateHint();
      }
      function updateDateHint() {
        if (!dateHintEl || !dateEl?.value) return;
        const planDays = state.selectedDuration || 20;
        const d = new Date(dateEl.value + 'T00:00:00Z');
        const valid = isValidStartLocal(planDays, dateEl.value);
        const skipsSat = planDays === 20;
        if (!valid) {
          const dow = d.getUTCDay();
          if (dow === 5) dateHintEl.textContent = t('date_friday');
          else if (dow === 6 && skipsSat) dateHintEl.textContent = t('date_saturday');
          else dateHintEl.textContent = t('date_unavailable');
          dateHintEl.classList.add('hint-error');
        } else {
          dateHintEl.textContent = t('date_ready', { weekday: getWeekday(d) });
          dateHintEl.classList.remove('hint-error');
        }
      }
      function validateScreen4() {
        if (!screen4NextBtn) return;
        const planDays = state.selectedDuration || 20;
        const dateOk = isValidStartLocal(planDays, dateEl?.value);
        // Only constraint: valid date. Address fields are all optional.
        screen4NextBtn.disabled = !dateOk;
        updateDateHint();
      }
      
      [dateEl, addrBuildingEl, addrFloorEl, addrOfficeEl, addrNotesEl].forEach(el => {
        el?.addEventListener('input', validateScreen4);
        el?.addEventListener('change', validateScreen4);
      });
      
      // ─── Continue button: persist to b2b_subscription_intent (status=draft), then go to payment ───
      if (screen4NextBtn) screen4NextBtn.addEventListener('click', async () => {
        const planDays = state.selectedDuration || 20;
        if (!isValidStartLocal(planDays, dateEl.value)) {
          toast(t('date_invalid_toast'));
          return;
        }
        
        screen4NextBtn.disabled = true;
        const span = screen4NextBtn.querySelector('span');
        const originalText = span.textContent;
        span.textContent = t('continuing');
        
        // Always-reset helper so the button can never get stuck
        const resetButton = () => {
          if (span) span.textContent = originalText;
          screen4NextBtn.disabled = false;
        };
        
        try {
          // Server-side date validation (best-effort — never blocks on network errors)
          try {
            const r = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/assert_valid_start_date`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': cfg.supabaseKey,
                'Authorization': `Bearer ${cfg.supabaseKey}`,
              },
              body: JSON.stringify({ plan_days: planDays, start_date: dateEl.value }),
            });
            if (!r.ok) {
              toast(t('date_invalid_retry'));
              resetButton();
              return;
            }
          } catch (err) {
            console.warn('[Greenola B2B] Server date validation unreachable:', err);
          }
          
          // Build the address payload — user's input takes priority, fall back to deal's locked_address
          const userAddress = {
            building: addrBuildingEl?.value.trim() || null,
            floor: addrFloorEl?.value.trim() || null,
            office: addrOfficeEl?.value.trim() || null,
            notes: addrNotesEl?.value.trim() || null,
          };
          const lockedAddress = state.dealMatched?.locked_address || null;
          const finalAddress = lockedAddress
            ? { ...lockedAddress, ...Object.fromEntries(Object.entries(userAddress).filter(([_, v]) => v)) }
            : userAddress;
          
          // Save state for next screens (payment + confirmation)
          state.deliveryAddress = finalAddress;
          state.startDate = dateEl.value;
          
          // Compute pricing snapshot (defensive — pricing matrix may not be loaded yet)
          const pricing = calculatePrice({
            plan: state.selectedPlan,
            mealConfig: state.mealConfig,
            duration: state.selectedDuration,
            deal: state.dealMatched,
          });
          
          if (!pricing) {
            console.warn('[Greenola B2B] Pricing not ready — selections may be incomplete', {
              plan: state.selectedPlan, mealConfig: state.mealConfig, duration: state.selectedDuration,
            });
            toast(t('price_error'));
            resetButton();
            return;
          }
          
          // Persist a draft intent (so we have it even if the user drops off at payment) — fire-and-forget
          const intentPayload = {
            lead_id: state.lead?.id || null,
            company_deal_id: state.dealMatched?.id || null,
            plan_type: state.selectedPlan,
            meal_config: state.mealConfig,
            duration_days: state.selectedDuration,
            address: finalAddress,
            start_date: dateEl.value,
            price_per_day: pricing.pricePerDay,
            base_total: pricing.baseTotal,
            discount_pct: pricing.discountPct || 0,
            discount_amount: pricing.discountAmount || 0,
            after_discount: pricing.afterDiscount || pricing.baseTotal,
            subsidy_pct: pricing.subsidyPct || 0,
            company_pays: pricing.companyPays || 0,
            user_pays: pricing.userPays || pricing.afterDiscount || pricing.baseTotal,
            currency: 'SAR',
            status: 'draft',
          };
          
          fetch(`${cfg.supabaseUrl}/rest/v1/b2b_subscription_intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': cfg.supabaseKey,
              'Authorization': `Bearer ${cfg.supabaseKey}`,
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(intentPayload),
          }).then(async ins => {
            if (ins.ok) {
              const [intent] = await ins.json();
              state.intentId = intent?.id;
              console.log('[Greenola B2B] Draft intent saved:', intent?.id);
            } else {
              const errBody = await ins.text();
              console.error('[Greenola B2B] Draft intent save failed:', errBody);
            }
          }).catch(err => console.error('[Greenola B2B] Draft intent error:', err));
          
          if (state.lead?.id) logActivity(state.lead.id, 'address_continue', {
            start_date: dateEl.value,
            has_building: !!userAddress.building,
            has_floor: !!userAddress.floor,
            has_office: !!userAddress.office,
          });
          
          // Move to Screen 5 (checkout)
          span.textContent = t('done');
          setTimeout(() => {
            try {
              renderCheckout();
              sessionStorage.removeItem(STORAGE_KEY);
              showScreen(5);
              if (state.lead?.id) logActivity(state.lead.id, 'screen_view', { screen: 'checkout' });
            } catch (err) {
              console.error('[Greenola B2B] Checkout render failed:', err);
              const msg = err?.message || String(err) || 'unknown';
              toast(t('transition_error', { msg: msg.slice(0, 80) }));
            } finally {
              resetButton();
            }
          }, 400);
        } catch (err) {
          console.error('[Greenola B2B] Screen 4 continue failed:', err);
          const msg = err?.message || String(err) || 'unknown';
          toast(t('continue_error', { msg: msg.slice(0, 80) }));
          resetButton();
        }
      });
      
      // ─── Screen 5: checkout ───

      function renderCheckout() {
        const planMeta = getPlanLabels()[state.selectedPlan] || { name: t('plan_fallback'), icon: '🌿' };
        const mealLabel = getMealConfigLabels()[state.mealConfig] || '';
        const days = state.selectedDuration || 0;
        
        // Order summary
        const planIconEl = document.getElementById('coPlanIcon');
        const planNameEl = document.getElementById('coPlanName');
        const planSubEl = document.getElementById('coPlanSub');
        const startDateEl = document.getElementById('coStartDate');
        const addressEl = document.getElementById('coAddress');
        
        if (planIconEl) planIconEl.textContent = planMeta.icon;
        if (planNameEl) planNameEl.textContent = planMeta.name;
        if (planSubEl) planSubEl.textContent = t('meal_days_suffix', { meal: mealLabel, days: formatNumber(days) });
        if (startDateEl) startDateEl.textContent = formatLocalizedDate(state.startDate);
        if (addressEl) addressEl.textContent = summarizeAddress(state.deliveryAddress);
        
        // Receipt math
        const pricing = calculatePrice({
          plan: state.selectedPlan, mealConfig: state.mealConfig,
          duration: state.selectedDuration, deal: state.dealMatched,
        });
        if (!pricing) return;
        
        const baseTotal = pricing.baseTotal;       // Real Greenola price (price/day × days)
        const companyPays = pricing.companyPays;   // Fixed subsidy from deal
        const userPays = pricing.userPays;         // baseTotal − companyPays
        
        // Plan screen shows the 40% theater. Checkout shows only the REAL math:
        //   سعر الباقة      baseTotal
        //   {company} تتكفل  −companyPays
        //   ───────────────
        //   المتبقي عليك    userPays
        const subLabel = document.getElementById('rcvSubLabel');
        const subEl = document.getElementById('rcvSub');
        if (subLabel) subLabel.textContent = t('receipt_package');
        if (subEl) subEl.textContent = formatCurrency(baseTotal);
        
        // Company subsidy row — visible whenever the deal includes a fixed subsidy
        const subsidyRow = document.getElementById('rcvSubsidyRow');
        const subsidyLabel = document.getElementById('rcvSubsidyLabel');
        const subsidyEl = document.getElementById('rcvSubsidy');
        if (companyPays > 0) {
          subsidyRow.hidden = false;
          const company = state.dealMatched?.company_name || t('company_default');
          subsidyLabel.textContent = t('company_covers', { company });
          subsidyEl.textContent = `−${formatCurrency(companyPays)}`;
        } else {
          subsidyRow.hidden = true;
        }
        
        // Total = what user actually pays
        const totalEl = document.getElementById('rcvTotal');
        if (totalEl) totalEl.textContent = formatCurrency(userPays);
        
        // ZATCA breakdown — VAT is on what user actually pays (inclusive of 15% VAT)
        const inclusive = userPays;
        const exclusive = +(inclusive / 1.15).toFixed(2);
        const vat = +(inclusive - exclusive).toFixed(2);
        const fmtDecimal = n => formatNumber(n.toFixed(2));
        const zInc = document.getElementById('zatcaInclusive');
        const zExc = document.getElementById('zatcaExclusive');
        const zVat = document.getElementById('zatcaVat');
        if (zInc) zInc.textContent = formatCurrency(inclusive);
        if (zExc) zExc.textContent = formatCurrency(exclusive);
        if (zVat) zVat.textContent = formatCurrency(vat);
        
        // Reset payment method selection on each render
        state.selectedPaymentMethod = null;
        document.querySelectorAll('[data-screen="5"] .pay-method').forEach(m => m.classList.remove('selected'));
        const payBtn = document.getElementById('payBtn');
        const payBtnLabel = document.getElementById('payBtnLabel');
        if (payBtn) { payBtn.disabled = true; payBtn.classList.remove('cta-black'); }
        if (payBtnLabel) payBtnLabel.textContent = t('pay_select_method');
      }
      
      // Screen 5: Back button
      const screen5BackBtn = document.getElementById('screen5BackBtn');
      if (screen5BackBtn) screen5BackBtn.addEventListener('click', () => showScreen(4));
      
      // Screen 5: ZATCA toggle
      const zatcaToggle = document.getElementById('zatcaToggle');
      const zatcaBody = document.getElementById('zatcaBody');
      if (zatcaToggle && zatcaBody) {
        zatcaToggle.addEventListener('click', () => {
          const expanded = zatcaToggle.getAttribute('aria-expanded') === 'true';
          zatcaToggle.setAttribute('aria-expanded', String(!expanded));
          zatcaBody.hidden = expanded;
        });
      }
      
      // Screen 5: Payment method selection
      document.querySelectorAll('[data-screen="5"] .pay-method').forEach(method => {
        method.addEventListener('click', () => {
          document.querySelectorAll('[data-screen="5"] .pay-method').forEach(m => m.classList.remove('selected'));
          method.classList.add('selected');
          const m = method.dataset.method;
          state.selectedPaymentMethod = m;
          
          const payBtn = document.getElementById('payBtn');
          const payBtnLabel = document.getElementById('payBtnLabel');
          if (!payBtn) return;
          
          payBtn.disabled = false;
          // Apple Pay + Card → BLACK ; mada → GREEN
          if (m === 'apple_pay' || m === 'card') {
            payBtn.classList.add('cta-black');
          } else {
            payBtn.classList.remove('cta-black');
          }
          
          // Compute the pay amount label
          const pricing = calculatePrice({
            plan: state.selectedPlan, mealConfig: state.mealConfig,
            duration: state.selectedDuration, deal: state.dealMatched,
          });
          const userPays = pricing && pricing.showBreakdown && pricing.subsidyPct > 0
            ? pricing.userPays : (pricing ? pricing.afterDiscount : 0);
          
          if (payBtnLabel) {
            if (m === 'apple_pay') {
              payBtnLabel.textContent = t('pay_apple', { amount: formatCurrency(userPays) });
            } else if (m === 'mada') {
              payBtnLabel.textContent = t('pay_mada_btn', { amount: formatCurrency(userPays) });
            } else {
              payBtnLabel.textContent = t('pay_card_btn', { amount: formatCurrency(userPays) });
            }
          }
          
          if (state.lead?.id) logActivity(state.lead.id, 'payment_method_selected', { method: m });
        });
      });
      
      // Screen 5: Pay button (placeholder until payment provider integrated)
      const payBtn = document.getElementById('payBtn');
      if (payBtn) payBtn.addEventListener('click', () => {
        if (!state.selectedPaymentMethod) return;
        payBtn.disabled = true;
        const lbl = document.getElementById('payBtnLabel');
        const original = lbl ? lbl.textContent : '';
        if (lbl) lbl.textContent = t('pay_preparing');
        
        if (state.lead?.id) logActivity(state.lead.id, 'pay_clicked', { method: state.selectedPaymentMethod });
        
        setTimeout(() => {
          toast(t('pay_coming_soon'));
          if (lbl) lbl.textContent = original;
          payBtn.disabled = false;
        }, 700);
      });

      function refreshLocalizedNumbers() {
        document.querySelectorAll('[data-duration]').forEach((card) => {
          const numEl = card.querySelector('.num');
          if (numEl) numEl.textContent = formatNumber(card.dataset.duration);
        });
        const discountBadgeEl = document.getElementById('discountBadge');
        if (discountBadgeEl) discountBadgeEl.textContent = t('discount_badge');
      }

      window.__greenolaRefreshLocale = () => {
        applyTranslations();
        refreshLocalizedNumbers();
        updatePriceDisplay();
        if (typeof updateDateHint === 'function') updateDateHint();
        if (typeof renderMenu === 'function' && window.__menuRendered) renderMenu();
        if (state._restoredScreen >= 5 || document.querySelector('[data-screen="5"].active')) {
          if (typeof renderCheckout === 'function') renderCheckout();
        }
        defaultCodeHint();
      };
}
