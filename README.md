# WME UR Quick Answers

## Швидкі відповіді у WME Editor

`WME UR Quick Answers` – це Userscript, який додає до панелі *User Report* (UR) три кнопки **✅**, **✖** та **?**. Кнопки автоматично вставляють шаблонний текст, надсилають коментар і закривають звіт у потрібному стані. Можливе локальне налаштування шаблонів та поведінки через просте модальне вікно.

---

### 📖 Опис
- **Локалізовано** на українську, румунську та англійську (мова визначається за URL‑шляхом).
- **Налаштування** зберігаються у `localStorage` (`WMEQuickAnswers_settings`). Користувач може задати:
  - Текст шаблону,
  - Чи надсилати коментар,
  - Чи закривати звіт,
  - Який статус застосовувати (`solved`, `not‑identified`, `open`).
- **UI**: панель кнопок з'являється у правій/лівій частині вікна редагування UR. Кнопка *⚙* відкриває модальне вікно налаштувань.
- **Взаємодія зі SDK**: скрипт отримує WME SDK через `window.getWmeSdk` і використовує методи:
  - `DataModel.MapUpdateRequests.addComment`
  - `DataModel.MapUpdateRequests.updateResolutionState`
  - `DataModel.MapUpdateRequests.getUpdateRequestDetails`
- **Стійкість**: `getOpenUrId()` пробує три різних шляхи пошуку ID у внутрішніх React‑props, що дозволяє працювати після змін у WME.

---

### 🔧 Встановлення
1. **Встановіть менеджер Userscript** (наприклад, **Tampermonkey**, **Violentmonkey**).
2. Додайте новий скрипт, вказавши **URL** *raw* файлу:
   ```text
   https://raw.githubusercontent.com/SapozhnikUA/WME-UR-Quick-Answers/main/wme-ur-quick-answers.user.js
   ```
3. Збережіть та включіть скрипт. Після відкриття будь‑якого UR у WME Editor ви побачите нову панель кнопок.

---

## 🚀 Використання
| Кнопка | Дія | За замовчуванням |
|-------|-----|-------------------|
| ✅ | **Вирішено** – вставляє шаблон *Resolved*, надсилає коментар, закриває звіт як `solved`. |
| ✖ | **Не вирішено** – вставляє шаблон *Not resolved*, надсилає коментар, закриває звіт як `not‑identified`. |
| ? | **Запит інформації** – вставляє шаблон *Ask*, **не** надсилає коментар і **не** закриває звіт. |
| ⚙ | Відкриває модальне вікно *Налаштування*, де можна редагувати шаблони, переключати надсилання коментаря та вибирати статус закриття. |

---

### 🛠️ Технічна інформація
- **Основний файл** – `wme-ur-quick-answers.user.js`.
- **Залежності** – лише WME SDK, ніяких сторонніх бібліотек.
- **Підтримувані браузери** – Chrome/Chromium, Firefox (ES6).
- **Локалізація** – об’єкт `I18N` з перекладами для `uk`, `ro`, `en`.

---

### ⚙️ Налаштування
Налаштування зберігаються у `localStorage` під ключем `WMEQuickAnswers_settings`. Приклад структури:
```json
{
  "yes": {"text":"...","sendComment":true,"closeReport":true,"closeAs":"solved"},
  "no":  {"text":"...","sendComment":true,"closeReport":true,"closeAs":"not-identified"},
  "ask": {"text":"...","sendComment":false,"closeReport":false,"closeAs":"open"}
}
```
---

## 🧪 Розробка
1. **Клонування**
   ```bash
   git clone https://github.com/SapozhnikUA/WME-UR-Quick-Answers.git
   cd WME-UR-Quick-Answers
   ```
2. **Тестування** – відкрийте `http://www.waze.com/editor` у режимі розробника, підключіть скрипт через Tampermonkey і переконайтеся, що панель з'являється.
3. **Випуск** – збільшіть `@version` у метаданих Userscript, закоміть зміни та пуште.

---

## 📜 Ліцензія
Цей проєкт розповсюджується під **MIT License**.

---

## 🤝 Внесок
1. Fork репозиторій.
2. Створіть гілку (`feature/...` або `bugfix/...`).
3. Відкрийте Pull Request.
4. Після злиття не забудьте оновити `@version` у Userscript.

---

## 📣 Підтримка
- **Автор**: [SapozhnikUA](https://github.com/SapozhnikUA)
- **Issues**: відкривайте у GitHub.
- **Telegram‑чат**: `@wme-ur-quick-answers` (за запитом).
