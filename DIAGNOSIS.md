# تشخيص أخطاء مشروع hospital-management-system

## الأخطاء المؤكدة (تسبب فشل البناء)
1. **`src/stores/authStore.ts` يستدعي `./utils/mobile`** → هذا المسار صحيح فعلياً والملف موجود (`src/utils/mobile.ts`)، لكن الخطأ في rollup/vite:
   - الملف `authStore.ts` يستدعي `"./utils/mobile"` بينما الملف فعلياً في `../utils/mobile` بالنسبة لموقعه في `src/stores/`!
   - الصحيح: `import { nativeStorage } from "../utils/mobile";` (الاستيراد الحالي `./utils/mobile` خاطئ).
2. **الصفحات المؤقتة (Placeholders)** فارغة أو return null:
   - `Patients.tsx` = 0 بايت (فارغ تماماً)
   - `Dashboard.tsx` = return null
   - `Login.tsx` = return null
   - `Appointments.tsx` = return null
   - `Layout.tsx` = return children فقط (بدون sidebar/navigation)
3. **`utils/api.ts` غير موجود** لكن 6 صفحات تستدعيه: Billing, Emergency, Lab, PatientDetail, Pharmacy, Rooms
4. `main.tsx` يستدعي `"./index.css"` (معلق بتعليق — لا مشكلة لكن يلزم إنشاء ملف CSS للـ Tailwind إذا أرادت الصفحات تنسيقاً)
5. ملفات `icon-192x192.png`, `icon-512x512.png`, `favicon.ico` غير موجودة في public (vite-plugin-pwa يعطّي تحذير).
6. `public/manifest.json` يوجد — يجب فحصه.

## خطة الإصلاح
- إصلاح مسار الاستيراد في authStore.ts إلى `../utils/mobile`.
- إنشاء `src/utils/api.ts` (axios instance يستخدم API_BASE_URL).
- إنشاء `src/index.css` مع Tailwind directives.
- كتابة الصفحات الحقيقية: Login, Dashboard, Patients, Appointments + Layout كامل (sidebar + header) متوافق مع كل الصفحات الأخرى.
- توليد أيقونات التطبيق.
- ثم build + cap sync + build APK.

## ملاحظات Capacitor
- capacitor.config.ts يشير إلى webDir: dist — صحيح.
- لا يوجد مجلد `android` بعد (لم يتم cap add بعد) — يجب cap add android بعد البناء.
- build-apk.sh في جذر المشروع: يفترض بناء APK مع keystore.
