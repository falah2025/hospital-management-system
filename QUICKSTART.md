# ⚡ دليل البدء السريع

## 🎯 في 5 دقائق

### 1. تثبيت
```bash
git clone <repo-url>
cd hospital-management-system
./setup.sh
```

### 2. إعداد قاعدة البيانات
```bash
cd backend
cp .env.example .env
# عدل DATABASE_URL في .env
npx prisma migrate dev
npx prisma db seed
```

### 3. تشغيل
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. افتح المتصفح
```
http://localhost:5173
```

### 5. سجل الدخول
```
Email: admin@hospital.com
Password: admin123
```

---

## 📱 بناء APK

```bash
./build-apk.sh
```

ملف APK سيكون في:
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

---

## 🆘 استكشاف الأخطاء

### مشكلة: `prisma: command not found`
```bash
npm install -g prisma
# أو
npx prisma
```

### مشكلة: `Cannot find module '@prisma/client'`
```bash
cd backend
npx prisma generate
```

### مشكلة: Android build fails
```bash
cd frontend/android
./gradlew clean
./gradlew assembleDebug
```

### مشكلة: CORS errors
```bash
# تأكد من FRONTEND_URL في backend/.env
# يجب أن يطابق عنوان Frontend
```
