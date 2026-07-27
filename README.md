# 🏥 نظام إدارة المستشفى (Hospital Management System)

نظام متكامل لإدارة المستشفى يعمل كتطبيق ويب وتطبيق موبايل (Android APK).

## 📁 هيكل المشروع

```
hospital-management-system/
├── backend/                 # Node.js + Express + Prisma API
│   ├── prisma/
│   │   └── schema.prisma   # 25+ جدول قاعدة بيانات
│   ├── src/
│   │   ├── server.ts       # نقطة الدخول
│   │   ├── controllers/    # 10 وحدات تحكم
│   │   ├── routes/         # 10 ملفات توجيه
│   │   ├── middleware/     # مصادقة + صلاحيات + تدقيق
│   │   └── utils/          # JWT + أدوات مساعدة
│   └── package.json
├── frontend/               # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/          # Dashboard, Patients, Appointments...
│   │   ├── components/     # Layout, Sidebar, Header
│   │   ├── stores/         # Zustand state management
│   │   └── utils/          # API + Mobile utilities
│   ├── capacitor.config.ts # إعدادات Capacitor
│   ├── vite.config.ts      # Vite + PWA
│   └── package.json
├── build-apk.sh            # سكربت بناء APK
└── build-apk-debug.sh      # سكربت بناء APK (Debug)
```

## 🚀 متطلبات النظام

### Backend
- Node.js 18+
- PostgreSQL 14+
- npm أو yarn

### Frontend (Web)
- Node.js 18+
- npm أو yarn

### Mobile (APK)
- Android Studio (أو Android SDK فقط)
- Java JDK 17+
- Gradle (يُثبت تلقائياً)

## ⚡ التشغيل السريع

### 1. قاعدة البيانات
```bash
# أنشئ قاعدة البيانات
createdb hms_db

# انسخ ملف البيئة
cp backend/.env.example backend/.env
# عدل DATABASE_URL في backend/.env
```

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed    # (اختياري) بيانات تجريبية
npm run dev
```

### 3. Frontend (Web)
```bash
cd frontend
npm install
npm run dev
# افتح http://localhost:5173
```

## 📱 بناء APK (تطبيق Android)

### الطريقة السريعة
```bash
# من مجلد المشروع الرئيسي
./build-apk.sh
```

### الطريقة اليدوية
```bash
cd frontend

# 1. تثبيت الاعتماديات
npm install

# 2. بناء تطبيق الويب
npm run build

# 3. مزامنة Capacitor مع Android
npx cap sync android

# 4. فتح في Android Studio (اختياري)
npx cap open android

# 5. بناء APK
# من Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
# أو من سطر الأوامر:
cd android
./gradlew assembleRelease
```

### 📦 مكان ملف APK
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

### 📲 تثبيت على جهاز
```bash
adb install frontend/android/app/build/outputs/apk/release/app-release.apk
```

## 🔐 الأدوار والصلاحيات

| الدور | الصلاحيات |
|-------|----------|
| **Admin** | كامل الصلاحيات |
| **Doctor** | سجلات المرضى، وصفات، فحوصات |
| **Nurse** | تحديث السجلات، إدارة الأدوية |
| **Receptionist** | تسجيل مرضى، مواعيد |
| **Pharmacist** | مخزون الأدوية، صرف وصفات |
| **Accountant** | فواتير، دفعات، تأمين |
| **Lab Technician** | نتائج المختبر |
| **Radiologist** | تقارير الأشعة |

## 🛡️ ميزات الأمان

- ✅ مصادقة JWT مع تشفير bcrypt
- ✅ RBAC (Role-Based Access Control)
- ✅ Rate Limiting
- ✅ Helmet (حماية Headers)
- ✅ CORS محدد
- ✅ Audit Logs (سجل العمليات)
- ✅ Validation بـ Zod
- ✅ SQL Injection Protection (Prisma)

## 📱 ميزات الموبايل

- ✅ تطبيق Android APK أصلي
- ✅ PWA (يمكن تثبيته من المتصفح)
- ✅ وضع داكن (Dark Mode)
- ✅ إشعارات Push
- ✅ تخزين محلي آمن (Preferences)
- ✅ Status Bar مخصص
- ✅ Splash Screen
- ✅ يعمل Offline (Service Worker)

## 🗄️ جداول قاعدة البيانات

- Users, Roles, Permissions
- Staff, Doctors, Departments, Shifts
- Patients, MedicalRecords, Prescriptions
- Appointments
- Rooms, Beds, BedOccupancy
- Medicines, InventoryMovement
- LabTests, Radiology
- Invoices, Payments, InsuranceClaims
- EmergencyVisits
- Notifications, AuditLogs, Sessions

## 📡 نقاط API الرئيسية

| المسار | الوصف |
|--------|-------|
| `POST /api/auth/login` | تسجيل الدخول |
| `GET /api/dashboard/stats` | إحصائيات اللوحة |
| `GET /api/patients` | قائمة المرضى |
| `POST /api/appointments` | حجز موعد |
| `GET /api/rooms` | حالة الغرف |
| `POST /api/pharmacy/dispense` | صرف وصفة |
| `GET /api/lab/tests` | فحوصات المختبر |
| `POST /api/billing/invoices` | إنشاء فاتورة |
| `GET /api/emergency` | حالات الطوارئ |

## 🧪 الاختبار

```bash
# Backend tests
cd backend
npm test

# Frontend build test
cd frontend
npm run build
```

## 📝 ملاحظات

- تأكد من تغيير `JWT_SECRET` و `ENCRYPTION_KEY` في الإنتاج
- استخدم HTTPS في الإنتاج
- قم بإعداد SSL للـ Backend
- غيّر `FRONTEND_URL` و `appId` في Capacitor للإنتاج

## 📄 الترخيص

MIT License
