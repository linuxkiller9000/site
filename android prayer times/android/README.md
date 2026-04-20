# Android APK wrapper

This Android project packages the existing web app into a native APK using `WebView`.

## What it does

- Loads the current web app from local Android assets
- Keeps live API requests working over the network
- Supports location permission inside the app
- Hides browser install prompts when the app runs as an APK

## Build

1. Open the `android/` folder in Android Studio, or build with Gradle after installing:
   - Android SDK Platform 34
   - Android Build-Tools 34
2. Build a debug APK:

```bash
./gradlew assembleDebug
```

## Output

After a successful debug build, the APK is generated at:

`app/build/outputs/apk/debug/app-debug.apk`

## Notes

- The APK uses the same `index.html`, `script.js`, `style.css`, and `icons/` files from the main project during the Android build.
- Browser-only install flows and service worker registration are disabled inside the Android shell.
- Web Notification support inside Android `WebView` is limited, so the existing alert UI may behave differently than Chrome.
