@echo off
setlocal

set "ROOT=%~dp0"
set "MOBILE=%ROOT%apps\mobile"
set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
set "NPX=%ProgramFiles%\nodejs\npx.cmd"
set "PKG=com.mirrorai.app"
set "DEBUG_APK=%MOBILE%\android\app\build\outputs\apk\debug\app-debug.apk"
set "DEV_LINK=%PKG%://expo-development-client/?url=http%%3A%%2F%%2F127.0.0.1%%3A8081"
set "METRO_RUNNER=%ROOT%start-mirror-metro.cmd"
set "ROUTE=%~1"

if not exist "%ADB%" (
  echo Android adb bulunamadi:
  echo %ADB%
  echo Android Studio veya SDK kurulumunu kontrol et.
  exit /b 1
)

if not exist "%MOBILE%" (
  echo Mobile proje klasoru bulunamadi:
  echo %MOBILE%
  pause
  exit /b 1
)

if not exist "%NPX%" (
  set "NPX=npx.cmd"
)

echo Emulator bekleniyor...
for /l %%i in (1,1,60) do (
  set "HAS_DEVICE="
  for /f "skip=1 tokens=1,2" %%a in ('"%ADB%" devices') do (
    if "%%b"=="device" set "HAS_DEVICE=1"
  )
  if defined HAS_DEVICE goto device_ready
  timeout /t 2 /nobreak >nul
)

:device_ready
if not defined HAS_DEVICE (
  echo Aktif emulator/cihaz bulunamadi.
  echo Once emulatoru Android Studio'dan ac, sonra bu dosyayi tekrar calistir.
  "%ADB%" devices
  pause
  exit /b 1
)

echo ADB reverse ayarlaniyor...
"%ADB%" reverse tcp:8081 tcp:8081 >nul 2>nul

if exist "%DEBUG_APK%" (
  echo Debug build emulatore kuruluyor...
  "%ADB%" install -r -d "%DEBUG_APK%" >nul
  if errorlevel 1 exit /b 1
) else (
  "%ADB%" shell pm path %PKG% >nul 2>nul
  if errorlevel 1 (
    echo Debug APK bulunamadi:
    echo %DEBUG_APK%
    echo Once su komutu calistir:
    echo cd /d "%MOBILE%"
    echo npx.cmd expo run:android --no-bundler
    pause
    exit /b 1
  )
)

call :check_metro
if not defined METRO_READY (
  echo Metro baslatiliyor. Acilan Metro penceresini kapatma.
  > "%METRO_RUNNER%" echo @echo off
  >> "%METRO_RUNNER%" echo cd /d "%MOBILE%"
  >> "%METRO_RUNNER%" echo "%NPX%" expo start --dev-client --host localhost --clear
  >> "%METRO_RUNNER%" echo pause
  start "Mirror AI Metro" "%METRO_RUNNER%"
)

echo Metro hazir olana kadar bekleniyor...
for /l %%i in (1,1,90) do (
  call :check_metro
  if defined METRO_READY goto metro_ready
  timeout /t 1 /nobreak >nul
)

echo Metro 8081 uzerinde hazir gorunmuyor.
echo Acilan Metro penceresinde hata var mi kontrol et.
echo Hazir oldugunda bu dosyayi tekrar calistir.
pause
exit /b 1

:metro_ready
echo Mirror AI dev client ile aciliyor...
"%ADB%" shell am force-stop %PKG% >nul 2>nul
"%ADB%" shell am start -W -a android.intent.action.VIEW -d "%DEV_LINK%" %PKG%

if not "%ROUTE%"=="" (
  timeout /t 4 /nobreak >nul
  "%ADB%" shell am start -W -a android.intent.action.VIEW -d "mirrorai://tabs/%ROUTE%" %PKG%
)

echo.
echo Uygulama acildi. Metro penceresini test boyunca acik birak.
echo Kirmizi ekran kalirsa app icinde Reload'a bas veya bu dosyayi tekrar calistir.
pause
endlocal
exit /b 0

:check_metro
set "METRO_READY="
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8081/status' -TimeoutSec 1; if ($r.Content -match 'packager-status:running') { exit 0 } } catch {}; exit 1" >nul 2>nul
if not errorlevel 1 set "METRO_READY=1"
exit /b 0
