@echo off
setlocal
set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
set "PKG=com.mirrorai.app"
set "DEV_LINK=%PKG%://expo-development-client/?url=http%%3A%%2F%%2F127.0.0.1%%3A8081"

echo ADB devices:
"%ADB%" devices
echo.
echo ADB reverse:
"%ADB%" reverse tcp:8081 tcp:8081
echo.
echo Killing existing Mirror AI process...
"%ADB%" shell am force-stop %PKG%
echo.
echo Starting via dev link: %DEV_LINK%
"%ADB%" shell am start -W -a android.intent.action.VIEW -d "%DEV_LINK%" %PKG%
echo.
echo Logcat (15s) - press Ctrl+C to abort:
start "" cmd /c "%ADB% logcat -T 100 -v color *:E ReactNative:V ReactNativeJS:V & timeout /t 60"
echo.
echo DONE.
pause
