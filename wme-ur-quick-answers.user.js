// ==UserScript==
// @name         WME UR Quick Answers
// @namespace    https://github.com/SapozhnikUA/WME-UR-Quick-Answers
// @version      1.10
// @description  Швидкі відповіді на UR — кнопки ✓ ✗ ? у панелі звіту
// @homepageURL  https://github.com/SapozhnikUA/WME-UR-Quick-Answers
// @downloadURL  https://raw.githubusercontent.com/SapozhnikUA/WME-UR-Quick-Answers/main/wme-ur-quick-answers.user.js
// @updateURL    https://raw.githubusercontent.com/SapozhnikUA/WME-UR-Quick-Answers/main/wme-ur-quick-answers.user.js
// @author       SapozhnikUA
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_ID   = 'wme-ur-quick-answers';
    const SCRIPT_NAME = 'UR Quick Answers';
    const LS_KEY      = 'WMEQuickAnswers_settings';

    let sdk = null;

    // =========================================================================
    // Локалізація — визначаємо мову за URL редактора
    // /uk/ /ru/ → українська | /ro/ /md/ → румунська | решта → англійська
    // =========================================================================
    function detectLang() {
        const m = location.pathname.match(/^\/([a-z]{2})\//);
        const code = m ? m[1] : 'en';
        if (['uk', 'ru'].includes(code)) return 'uk';
        if (['ro', 'md'].includes(code)) return 'ro';
        return 'en';
    }

    const LANG = detectLang();

    const I18N = {
        uk: {
            btnYesTitle:   'Вирішено',
            btnNoTitle:    'Не вирішено',
            btnAskTitle:   'Запит інформації',
            btnCfgTitle:   'Налаштування',
            settingsTitle: '⚙ Налаштування Quick Answers',
            labelText:     'Текст:',
            labelSend:     'Надсилати повідомлення',
            labelClose:    'Закривати звіт',
            labelStatus:   'Статус:',
            statusSolved:  'Вирішено',
            statusNotId:   "Нез'ясовано",
            statusOpen:    'Відкрито',
            btnReset:      'Скинути до дефолту',
            btnCancel:     'Скасувати',
            btnSave:       'Зберегти',
            confirmReset:  'Скинути всі налаштування до дефолтних значень?',
            sectionYes:    '✓ Вирішено',
            sectionNo:     '✗ Не вирішено',
            sectionAsk:    '? Запит інформації',
            savedOk:       'Налаштування збережено',
            noUrId:        'Не вдалося визначити ID UR',
            noSession:     'Сесія UR не завантажена, коментар пропущено',
            commentSent:   'Коментар надіслано',
            closedAs:      'Закрито як',
            panelAdded:    'Кнопки додано до панелі UR',
            observerOn:    'MutationObserver запущено',
            clipboardFallback: 'Textarea не знайдено — текст скопійовано в буфер обміну',
            defaultYes:    'Дякуємо за допомогу!\nПроблему вирішено. Оновлення мапи за декілька днів.\nПриєднуйтесь до наших спільнот у соціальних мережах.\nУсі посилання можна знайти на сторінці http://waze.com.ua',
            defaultNo:     'На жаль, ми не отримали достатньо інформації для виправлення помилки.\nУ випадку виникнення помилки повторно, або якщо у Вас є зауваження, надішліть, будь ласка, новий звіт.\nПриєднуйтесь до наших спільнот у соціальних мережах.\nУсі посилання можна знайти на сторінці http://waze.com.ua',
            defaultAsk:    "Дякуємо за пильність.\nБудьте ласкаві, надайте більш детальну інформацію про помилку.\nПомилка без коментарів буде закрита як нез'ясована.",
        },
        ro: {
            btnYesTitle:   'Rezolvat',
            btnNoTitle:    'Nerezolvat',
            btnAskTitle:   'Solicitare informații',
            btnCfgTitle:   'Setări',
            settingsTitle: '⚙ Setări Quick Answers',
            labelText:     'Text:',
            labelSend:     'Trimite mesaj',
            labelClose:    'Închide raportul',
            labelStatus:   'Status:',
            statusSolved:  'Rezolvat',
            statusNotId:   'Neidentificat',
            statusOpen:    'Deschis',
            btnReset:      'Resetare implicită',
            btnCancel:     'Anulare',
            btnSave:       'Salvare',
            confirmReset:  'Resetați toate setările la valorile implicite?',
            sectionYes:    '✓ Rezolvat',
            sectionNo:     '✗ Nerezolvat',
            sectionAsk:    '? Solicitare informații',
            savedOk:       'Setări salvate',
            noUrId:        'Nu s-a putut determina ID-ul UR',
            noSession:     'Sesiunea UR nu este încărcată, comentariu omis',
            commentSent:   'Comentariu trimis',
            closedAs:      'Închis ca',
            panelAdded:    'Butoane adăugate la panoul UR',
            observerOn:    'MutationObserver pornit',
            clipboardFallback: 'Textarea nu a fost găsită — text copiat în clipboard',
            defaultYes:    'Vă mulțumim pentru ajutor!\nProblema a fost rezolvată. Actualizările hărții vor apărea în câteva zile.\nAlăturați-vă comunităților noastre din rețelele sociale.\nToate linkurile le găsiți pe pagina http://waze.com.ua',
            defaultNo:     'Din păcate, nu am primit suficiente informații pentru a remedia eroarea.\nDacă problema reapare sau aveți observații, vă rugăm să trimiteți un nou raport.\nAlăturați-vă comunităților noastre din rețelele sociale.\nToate linkurile le găsiți pe pagina http://waze.com.ua',
            defaultAsk:    'Vă mulțumim pentru vigilență.\nVă rugăm să furnizați informații mai detaliate despre eroare.\nErorile fără comentarii vor fi închise ca neidentificate.',
        },
        en: {
            btnYesTitle:   'Resolved',
            btnNoTitle:    'Not resolved',
            btnAskTitle:   'Request information',
            btnCfgTitle:   'Settings',
            settingsTitle: '⚙ Quick Answers Settings',
            labelText:     'Text:',
            labelSend:     'Send message',
            labelClose:    'Close report',
            labelStatus:   'Status:',
            statusSolved:  'Resolved',
            statusNotId:   'Not identified',
            statusOpen:    'Open',
            btnReset:      'Reset to defaults',
            btnCancel:     'Cancel',
            btnSave:       'Save',
            confirmReset:  'Reset all settings to default values?',
            sectionYes:    '✓ Resolved',
            sectionNo:     '✗ Not resolved',
            sectionAsk:    '? Request information',
            savedOk:       'Settings saved',
            noUrId:        'Could not determine UR ID',
            noSession:     'UR session not loaded, comment skipped',
            commentSent:   'Comment sent',
            closedAs:      'Closed as',
            panelAdded:    'Buttons added to UR panel',
            observerOn:    'MutationObserver started',
            clipboardFallback: 'Textarea not found — text copied to clipboard',
            defaultYes:    'Thank you for your help!\nThe issue has been resolved. Map updates will appear within a few days.\nJoin our communities on social media.\nAll links can be found at http://waze.com.ua',
            defaultNo:     'Unfortunately, we did not receive enough information to fix the error.\nIf the issue recurs or you have any comments, please submit a new report.\nJoin our communities on social media.\nAll links can be found at http://waze.com.ua',
            defaultAsk:    'Thank you for your attention.\nPlease provide more detailed information about the error.\nReports without comments will be closed as not identified.',
        },
    };

    const T = I18N[LANG];

    // =========================================================================
    // Дефолтні налаштування
    // =========================================================================
    function getDefaults() {
        return {
            yes: { text: T.defaultYes, sendComment: true,  closeReport: true,  closeAs: 'solved'        },
            no:  { text: T.defaultNo,  sendComment: true,  closeReport: true,  closeAs: 'not-identified' },
            ask: { text: T.defaultAsk, sendComment: false, closeReport: false, closeAs: 'open'           },
        };
    }

    // =========================================================================
    // Утиліти
    // =========================================================================
    function log(msg)       { console.log(`[${SCRIPT_NAME}] ${msg}`); }
    function logErr(msg, e) { console.error(`[${SCRIPT_NAME}] ✖ ${msg}`, e); }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return getDefaults();
            return Object.assign(getDefaults(), JSON.parse(raw));
        } catch { return getDefaults(); }
    }

    function saveSettings(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }

    function escHtml(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // =========================================================================
    // Отримати ID відкритого UR
    // =========================================================================
    function getOpenUrId() {
        // 1️⃣ Перший пріоритет – знайти видиму (відкриту) картку UR у DOM (надійніше, бо саме вона активна)
        const cards = document.querySelectorAll('.overlay-container wz-card.mapUpdateRequest');
        for (const card of cards) {
            if (card.offsetParent !== null) { // видима
                const raw = card.getAttribute('data-id') || card.id || '';
                const m = raw.match(/\d+/);
                if (m) return Number(m[0]);
            }
        }
        // 2️⃣ Якщо DOM не дав результату, спробувати SDK (може містити відкриті, які ще не відображені)
        if (sdk && sdk.DataModel) {
            try {
                const all = sdk.DataModel.MapUpdateRequests.getAll();
                // Шукаємо запит, який маркований як open і editable
                const candidate = all.find(u => (u.isOpen || u.state === 'open') && (u.isEditable || u.editable));
                if (candidate && candidate.id) {
                    return Number(candidate.id);
                }
            } catch (_) { /* ignore SDK errors */ }
        }
        // 3️⃣ Запасний варіант – ID з URL
        const urlMatch = location.search.match(/[?&]urs=(\d+)/);
        if (urlMatch) return Number(urlMatch[1]);
        // 4️⃣ Пошук в textarea або її батьківській картці (як остання інша спроба)
        const textarea = document.querySelector('.overlay-container wz-card.mapUpdateRequest textarea, .overlay-container wz-card.mapUpdateRequest [contenteditable="true"]');
        if (textarea) {
            const card = textarea.closest('.mapUpdateRequest');
            if (card) {
                const raw = card.getAttribute('data-id') || card.id || '';
                const m = raw.match(/\d+/);
                if (m) return Number(m[0]);
            }
        }
        // 5️⃣ Якщо нічого не знайдено – null
        return null;
    }

    // =========================================================================
    // Вставити текст у textarea в DOM
    // Використовуємо React nativeSetter щоб фреймворк "побачив" зміну
    // =========================================================================
async function insertCommentText(text) {
        // Додаткові кроки для поліпшення сумісності з різними UI‑фреймворками та різними шаблонами textarea
        // Пошук textarea або елементу з contenteditable
        let ta = document.querySelector(
            '.overlay-container wz-card.mapUpdateRequest textarea,' +
            '.overlay-container wz-card.mapUpdateRequest wz-textarea textarea,' +
            '.overlay-container wz-card.mapUpdateRequest [contenteditable="true"]'
        );
        if (!ta) {
            // Textarea не знайдено – копіюємо в буфер як запасний варіант
            try {
                await navigator.clipboard.writeText(text);
                log(`${T.clipboardFallback || 'Textarea не знайдено — текст скопійовано в буфер обміну'}`);
            } catch (e) {
                logErr('Clipboard copy failed', e);
            }
            return false;
        }
        // Якщо це contenteditable, використаємо execCommand для вставки
        if (ta.isContentEditable) {
            ta.focus();
            if (document.execCommand && document.execCommand('insertText', false, text)) {
                log('Текст успішно вставлено у contenteditable');
                return true;
            }
        }
        // Спробуємо встановити значення так, щоб React/Angular/модуль UI побачив зміну
        const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
        )?.set;
        if (nativeSetter) {
            nativeSetter.call(ta, text);
        }
        // Додаткова гарантія – явно присвоюємо value і атрибут
        ta.value = text;
        ta.setAttribute('value', text);
        // Виділяємо весь текст – іноді UI оновлює лише при виділенні
        if (typeof ta.select === 'function') ta.select();
        // Тригеримо події, які очікує UI (input, change, keydown, keyup) і фокусуємо поле
        const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true, data: text, inputType: 'insertText' });
        ta.dispatchEvent(inputEvent);
        ta.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        ta.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
        ta.focus();
        // Додаємо blur‑focus, щоб змусити React оновитися
        ta.dispatchEvent(new Event('blur'));
        ta.focus();
        // Встановлюємо курсор в кінець тексту
        if (typeof ta.setSelectionRange === 'function') {
            ta.setSelectionRange(text.length, text.length);
        }
        // Невелика пауза, щоб React встиг оновити стан
        await new Promise(r => setTimeout(r, 300));
        // Перезапускаємо input на випадок, якщо попередній не спрацював
        try { ta.dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); } catch (_) {}
        log('Текст успішно вставлено у textarea та події відправлені');
        return true;
    }

async function sendComment(urId, text) {
        try {
            await sdk.DataModel.MapUpdateRequests.getUpdateRequestDetails({
                mapUpdateRequestId: urId,
            });
        } catch (e) {
            log(`${T.noSession}: ${e?.message}`);
            return false;
        }
        try {
            await sdk.DataModel.MapUpdateRequests.addComment({
                mapUpdateRequestId: urId,
                text,
            });
            log(`${T.commentSent} #${urId}`);
            return true;
        } catch (e) {
            log(`${T.noSession}: ${e?.message}`);
            return false;
        }
    }

    // =========================================================================
    // Головна функція дії
    // =========================================================================
    async function performAction(actionKey) {
        const cfg = loadSettings()[actionKey];
        if (!cfg) return;

        // Кнопка «?» без надсилання — тільки вставляємо в textarea і виходимо
        if (!cfg.sendComment && !cfg.closeReport) {
            await insertCommentText(cfg.text);
            return;
        }

        const urId = getOpenUrId();
        if (!urId) { log(T.noUrId); return; }

        log(`Дія "${actionKey}" для UR #${urId}`);

        // Надіслати коментар (з примусовим завантаженням сесії)
        if (cfg.sendComment && cfg.text.trim()) {
            await sendComment(urId, cfg.text);
        }

        // Закрити звіт
        if (cfg.closeReport) {
            try {
                await sdk.DataModel.MapUpdateRequests.updateResolutionState({
                    mapUpdateRequestId: urId,
                    resolutionState: cfg.closeAs,
                });
                log(`${T.closedAs} "${cfg.closeAs}" #${urId}`);
            } catch (e) {
                logErr(`updateResolutionState #${urId}`, e);
            }
        }
    }

    // =========================================================================
    // Ін'єкція кнопок у панель UR
    // =========================================================================
    function injectButtons() {
        if (document.getElementById('qa-btn-bar')) return;

        const card = document.querySelector('.overlay-container wz-card.mapUpdateRequest');
        if (!card) return;

        const bar = document.createElement('div');
        bar.id = 'qa-btn-bar';
        bar.style.cssText = 'position:absolute;top:8px;right:8px;display:flex;gap:4px;z-index:9999;';

        const BTNS = [
            { key: 'yes',  icon: '✓', title: T.btnYesTitle, color: '#27ae60' },
            { key: 'no',   icon: '✗', title: T.btnNoTitle,  color: '#e74c3c' },
            { key: 'ask',  icon: '?', title: T.btnAskTitle, color: '#f39c12' },
            { key: '_cfg', icon: '⚙', title: T.btnCfgTitle, color: '#7f8c8d' },
        ];

        BTNS.forEach(({ key, icon, title, color }) => {
            const btn = document.createElement('button');
            btn.textContent = icon;
            btn.title = title;
            btn.style.cssText = [
                'width:26px','height:26px','border:none','border-radius:50%',
                `background:${color}`,'color:#fff','font-size:14px','font-weight:bold',
                'cursor:pointer','display:flex','align-items:center','justify-content:center',
                'padding:0','line-height:1','box-shadow:0 1px 3px rgba(0,0,0,.35)',
                'transition:opacity .15s',
            ].join(';');
            btn.onmouseenter = () => { btn.style.opacity = '0.75'; };
            btn.onmouseleave = () => { btn.style.opacity = '1'; };
            btn.addEventListener('click', key === '_cfg' ? openSettings : () => performAction(key));
            bar.appendChild(btn);
        });

        if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
        card.appendChild(bar);
        log(T.panelAdded);
    }

    // =========================================================================
    // Модальне вікно налаштувань
    // =========================================================================
    function openSettings() {
        if (document.getElementById('qa-settings-modal')) return;
        const settings = loadSettings();

        const overlay = document.createElement('div');
        overlay.id = 'qa-settings-modal';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center;';

        const modal = document.createElement('div');
        modal.style.cssText = 'background:#fff;border-radius:8px;padding:20px;width:540px;max-height:85vh;overflow-y:auto;font-family:sans-serif;font-size:13px;box-shadow:0 8px 32px rgba(0,0,0,.3);';

        const SECTIONS = [
            { key: 'yes', label: T.sectionYes, color: '#27ae60' },
            { key: 'no',  label: T.sectionNo,  color: '#e74c3c' },
            { key: 'ask', label: T.sectionAsk,  color: '#f39c12' },
        ];

        let html = `<h3 style="margin:0 0 16px;font-size:15px;">${T.settingsTitle}</h3>`;

        SECTIONS.forEach(({ key, label, color }) => {
            const cfg = settings[key];
            html += `
            <div style="border-left:4px solid ${color};padding:8px 12px;margin-bottom:14px;background:#fafafa;border-radius:0 6px 6px 0;">
                <div style="font-weight:bold;color:${color};margin-bottom:8px;">${label}</div>
                <label style="display:block;margin-bottom:4px;">${T.labelText}</label>
                <textarea id="qa-text-${key}" rows="4"
                    style="width:100%;box-sizing:border-box;font-size:12px;padding:6px;border:1px solid #ccc;border-radius:4px;resize:vertical;"
                >${escHtml(cfg.text)}</textarea>
                <div style="display:flex;gap:14px;margin-top:8px;align-items:center;flex-wrap:wrap;">
                    <label style="display:flex;align-items:center;gap:4px;">
                        <input type="checkbox" id="qa-send-${key}" ${cfg.sendComment ? 'checked' : ''}>
                        ${T.labelSend}</label>
                    <label style="display:flex;align-items:center;gap:4px;">
                        <input type="checkbox" id="qa-close-${key}" ${cfg.closeReport ? 'checked' : ''}>
                        ${T.labelClose}</label>
                    <label style="display:flex;align-items:center;gap:4px;margin-left:auto;">
                        ${T.labelStatus}
                        <select id="qa-state-${key}" style="padding:2px 4px;border-radius:3px;border:1px solid #ccc;">
                            <option value="solved"         ${cfg.closeAs==='solved'         ? 'selected':''} >${T.statusSolved}</option>
                            <option value="not-identified" ${cfg.closeAs==='not-identified' ? 'selected':''} >${T.statusNotId}</option>
                            <option value="open"           ${cfg.closeAs==='open'           ? 'selected':''} >${T.statusOpen}</option>
                        </select></label>
                </div>
            </div>`;
        });

        html += `
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
                <button id="qa-reset"  style="padding:6px 14px;border:1px solid #ccc;border-radius:4px;cursor:pointer;background:#fff;">${T.btnReset}</button>
                <button id="qa-cancel" style="padding:6px 14px;border:1px solid #ccc;border-radius:4px;cursor:pointer;background:#fff;">${T.btnCancel}</button>
                <button id="qa-save"   style="padding:6px 14px;border:none;border-radius:4px;cursor:pointer;background:#3498db;color:#fff;font-weight:bold;">${T.btnSave}</button>
            </div>`;

        modal.innerHTML = html;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        document.getElementById('qa-cancel').addEventListener('click', () => overlay.remove());
        document.getElementById('qa-reset').addEventListener('click', () => {
            if (!confirm(T.confirmReset)) return;
            saveSettings(getDefaults());
            overlay.remove();
            openSettings();
        });
        document.getElementById('qa-save').addEventListener('click', () => {
            const s = {};
            SECTIONS.forEach(({ key }) => {
                s[key] = {
                    text:        document.getElementById(`qa-text-${key}`).value,
                    sendComment: document.getElementById(`qa-send-${key}`).checked,
                    closeReport: document.getElementById(`qa-close-${key}`).checked,
                    closeAs:     document.getElementById(`qa-state-${key}`).value,
                };
            });
            saveSettings(s);
            log(T.savedOk);
            overlay.remove();
        });
    }

    // =========================================================================
    // MutationObserver — слідкуємо за появою панелі UR
    // =========================================================================
    function watchForUrPanel() {
        const observer = new MutationObserver(() => {
            const card = document.querySelector('.overlay-container wz-card.mapUpdateRequest');
            if (card && !document.getElementById('qa-btn-bar')) {
                setTimeout(injectButtons, 250);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        log(T.observerOn);
    }

    // =========================================================================
    // Ініціалізація
    // =========================================================================
    function init() {
        if (typeof window.getWmeSdk !== 'function') { logErr('getWmeSdk недоступний'); return; }
        try {
            sdk = window.getWmeSdk({ scriptId: SCRIPT_ID, scriptName: SCRIPT_NAME });
        } catch (e) { logErr('getWmeSdk', e); return; }

        sdk.Events.once({ eventName: 'wme-ready' }).then(() => {
            log(`Готово [${LANG}]`);
            watchForUrPanel();
        });
    }

    // Bootstrap — точно як у Auto-Closer
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () =>
            window.SDK_INITIALIZED.then(init).catch(e => logErr('SDK_INITIALIZED', e))
        );
    } else {
        window.SDK_INITIALIZED.then(init).catch(e => logErr('SDK_INITIALIZED', e));
    }

})();
