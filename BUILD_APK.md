# 📱 Build FlexiCash Android APK

Your Android project has been created! Follow these steps to build the APK.

## Prerequisites

1. **Install Android Studio**: https://developer.android.com/studio
2. **Install Java JDK 17**: https://www.oracle.com/java/technologies/downloads/#java17

## Build Steps

### Option 1: Using Android Studio (Recommended - Easy)

1. **Open the project in Android Studio:**
   ```powershell
   cd "c:\Cash Loan App\frontend\android"
   ```
   - Open Android Studio → "Open an existing project"
   - Navigate to `c:\Cash Loan App\frontend\android`
   - Wait for Gradle sync to complete (5-10 minutes first time)

2. **Build the APK:**
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to complete
   - Click "locate" in the notification
   - APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Install on phone:**
   - Connect phone via USB (enable USB debugging)
   - Copy APK to phone and install
   - Or click **Run** ▶️ in Android Studio

### Option 2: Command Line (Advanced)

**Prerequisites:**
- Set `JAVA_HOME` environment variable
- Set `ANDROID_HOME` to Android SDK location

**Build command:**
```powershell
cd "c:\Cash Loan App\frontend\android"
.\gradlew assembleDebug
```

**APK Location:**
`android\app\build\outputs\apk\debug\app-debug.apk`

## Important: Update API URL for Production

Before building for production, you need to deploy your backend API and update the URL.

**Edit** `c:\Cash Loan App\frontend\src\api.js`:
```javascript
// Change this line:
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// To your production backend URL:
const API_URL = 'https://your-backend-api.com/api';
```

Then rebuild:
```powershell
cd "c:\Cash Loan App\frontend"
npm run build
npx cap copy android
```

## Build Signed APK for Google Play Store

1. **Generate keystore:**
   ```powershell
   cd "c:\Cash Loan App\frontend\android\app"
   keytool -genkey -v -keystore flexicash-release.keystore -alias flexicash -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Edit** `android/app/build.gradle` and add:
   ```gradle
   signingConfigs {
       release {
           storeFile file('flexicash-release.keystore')
           storePassword 'your-password'
           keyAlias 'flexicash'
           keyPassword 'your-password'
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
       }
   }
   ```

3. **Build release APK:**
   ```powershell
   cd "c:\Cash Loan App\frontend\android"
   .\gradlew assembleRelease
   ```

**Release APK:** `android\app\build\outputs\apk\release\app-release.apk`

## App Info

- **App Name:** FlexiCash SA
- **Package:** com.flexicash.app
- **Min SDK:** Android 5.0+ (API 21)

## Troubleshooting

**"JAVA_HOME not set"**
- Install JDK 17
- Set environment variable: `JAVA_HOME=C:\Program Files\Java\jdk-17`

**"SDK location not found"**
- Open Android Studio and let it install SDK
- Or set `ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk`

**"Build failed"**
- Check internet connection (Gradle downloads dependencies)
- Wait for Gradle sync to complete in Android Studio

## Need Help?

- Android Studio Guide: https://developer.android.com/studio/run
- Capacitor Docs: https://capacitorjs.com/docs/android
