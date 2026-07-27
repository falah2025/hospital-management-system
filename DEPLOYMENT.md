# 🚀 دليل النشر والتثبيت

## 📋 متطلبات ما قبل التثبيت

### للويب فقط
- Node.js 18+
- PostgreSQL 14+
- npm أو yarn

### للموبايل (APK)
- كل ما سبق +
- Android Studio (أو Android SDK Command Line Tools)
- Java JDK 17+
- Gradle 8.2+

---

## 🌐 النشر على الويب

### 1. إعداد الخادم
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# macOS
brew install node postgresql nginx
```

### 2. إعداد قاعدة البيانات
```bash
sudo -u postgres psql -c "CREATE DATABASE hms_db;"
sudo -u postgres psql -c "CREATE USER hms_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hms_db TO hms_user;"
```

### 3. نشر Backend
```bash
cd backend
npm install --production

# إعداد البيئة
cp .env.example .env
# عدل: DATABASE_URL, JWT_SECRET, NODE_ENV=production

npx prisma migrate deploy
npx prisma generate
npm run build
npm start
```

### 4. نشر Frontend
```bash
cd frontend
npm install
npm run build

# انسخ dist/ إلى مجلد nginx
sudo cp -r dist/* /var/www/hms/
```

### 5. إعداد Nginx
```nginx
server {
    listen 80;
    server_name hospital.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name hospital.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /var/www/hms;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📱 بناء APK (تطبيق Android)

### الطريقة 1: سكربت تلقائي
```bash
# من مجلد المشروع الرئيسي
./build-apk.sh
```

### الطريقة 2: يدوي

#### أ) تثبيت Android SDK
```bash
# Ubuntu
sudo apt install -y android-sdk

# أو حمل Android Studio من:
# https://developer.android.com/studio
```

#### ب) إعداد المتغيرات البيئية
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### ج) بناء APK
```bash
cd frontend

# 1. تثبيت
npm install

# 2. بناء الويب
npm run build

# 3. مزامنة Capacitor
npx cap sync android

# 4. بناء APK
npx cap build android --keystorepath release-key.keystore   --keystorealias hms   --keystorepass hms123456   --keystorealiaspass hms123456
```

### الطريقة 3: Android Studio
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
```
ثم في Android Studio:
1. Build → Generate Signed Bundle / APK
2. اختر APK
3. أنشئ Keystore جديد (أو استخدم موجود)
4. اختر release
5. انقر Finish

---

## 🔑 إنشاء Keystore للتوقيع

```bash
keytool -genkey -v -keystore release-key.keystore   -alias hms -keyalg RSA -keysize 2048 -validity 10000
```

احفظ ملف `release-key.keystore` في مكان آمن!

---

## 🐳 Docker (اختياري)

### Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: hms_db
      POSTGRES_USER: hms_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://hms_user:secure_password@db:5432/hms_db
      JWT_SECRET: your-secret-key
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## ☁️ النشر على السحابة

### Railway / Render / Heroku
```bash
# Railway
railway login
railway init
railway up

# Render
# انسخ ملف render.yaml
```

### AWS
```bash
# EC2 + RDS
# 1. أنشئ EC2 instance
# 2. أنشئ RDS PostgreSQL
# 3. افتح المنافذ 80, 443, 5000
# 4. انسخ الكود وشغّل
```

---

## ✅ قائمة التحقق قبل الإنتاج

- [ ] غيّر كلمة مرور Admin الافتراضية
- [ ] استخدم JWT_SECRET عشوائي وطويل
- [ ] فعّل HTTPS
- [ ] اضبط CORS على النطاق الفعلي
- [ ] اضبط Rate Limiting
- [ ] فعّل Audit Logs
- [ ] اضبط النسخ الاحتياطي التلقائي
- [ ] اختبر على أجهزة مختلفة
- [ ] وقّع APK بـ Keystore
- [ ] اختبر الإشعارات على الموبايل
