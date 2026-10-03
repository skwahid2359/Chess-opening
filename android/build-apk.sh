#!/usr/bin/env sh
set -eu
if ! command -v gradle >/dev/null 2>&1; then
  echo "Gradle CLI is required. Install Android Studio/Gradle or use the GitHub Actions workflow." >&2
  exit 1
fi
if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
  echo "ANDROID_HOME or ANDROID_SDK_ROOT must point to an installed Android SDK." >&2
  exit 1
fi
cd "$(dirname "$0")"
gradle --no-daemon :app:assembleDebug
APK="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK" ]; then
  echo "Build command completed but APK was not found at $APK" >&2
  exit 1
fi
echo "Debug APK created: $(pwd)/$APK"
