param(
  [ValidateSet("apk", "aab")]
  [string]$Type = "apk",

  [switch]$SkipReleaseValidation
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$mobileDir = Join-Path $repoRoot "apps/mobile"
$androidDir = Join-Path $mobileDir "android"
$buildGradle = Join-Path $androidDir "app/build.gradle"
$releaseValidationScript = Join-Path $repoRoot "scripts/validate-release-config.ps1"

if (-not $SkipReleaseValidation) {
  & powershell -NoProfile -ExecutionPolicy Bypass -File $releaseValidationScript -Platform android
  if ($LASTEXITCODE -ne 0) { throw "Release configuration validation failed." }
}

if (-not (Test-Path -LiteralPath $buildGradle)) {
  throw "Android project was not found at $androidDir. Run `npx expo prebuild --platform android` in apps/mobile first."
}

function Ensure-ReleaseSigningSupport {
  $content = Get-Content -Raw -LiteralPath $buildGradle
  if ($content -like "*releaseKeystoreProperties*") {
    return
  }

  $projectRootLine = 'def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()'
  $signingBlock = @'
def releaseKeystoreProperties = new Properties()
def releaseKeystorePropertiesFile = rootProject.file('keystore.properties')
if (releaseKeystorePropertiesFile.exists()) {
    releaseKeystorePropertiesFile.withInputStream { releaseKeystoreProperties.load(it) }
}

def hasReleaseKeystore =
    releaseKeystoreProperties['storeFile'] &&
    releaseKeystoreProperties['storePassword'] &&
    releaseKeystoreProperties['keyAlias'] &&
    releaseKeystoreProperties['keyPassword']
def requireReleaseSigning = (findProperty('requireReleaseSigning') ?: false).toBoolean()
if (requireReleaseSigning && !hasReleaseKeystore) {
    throw new GradleException("Play release signing requires apps/mobile/android/keystore.properties. Run scripts/generate-android-upload-keystore.ps1 first.")
}
'@
  $content = $content.Replace($projectRootLine, "$projectRootLine`r`n$signingBlock")

  $debugConfig = @'
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
'@
  $debugAndReleaseConfig = @'
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (hasReleaseKeystore) {
                storeFile rootProject.file(releaseKeystoreProperties['storeFile'])
                storePassword releaseKeystoreProperties['storePassword']
                keyAlias releaseKeystoreProperties['keyAlias']
                keyPassword releaseKeystoreProperties['keyPassword']
            }
        }
'@
  $content = $content.Replace($debugConfig, $debugAndReleaseConfig)

  $content = $content.Replace(
    "// Caution! In production, you need to generate your own keystore file.`r`n            // see https://reactnative.dev/docs/signed-apk-android.`r`n            signingConfig signingConfigs.debug",
    "signingConfig hasReleaseKeystore ? signingConfigs.release : signingConfigs.debug"
  )

  [System.IO.File]::WriteAllText($buildGradle, $content, (New-Object System.Text.UTF8Encoding($false)))
}

Ensure-ReleaseSigningSupport

Push-Location $androidDir
try {
  if ($Type -eq "aab") {
    & .\gradlew.bat bundleRelease -PrequireReleaseSigning=true
    if ($LASTEXITCODE -ne 0) { throw "Gradle bundleRelease failed with exit code $LASTEXITCODE" }
    Copy-Item -LiteralPath "app/build/outputs/bundle/release/app-release.aab" -Destination (Join-Path $repoRoot "MirrorAI-release.aab") -Force
    Get-Item -LiteralPath (Join-Path $repoRoot "MirrorAI-release.aab")
  } else {
    & .\gradlew.bat assembleRelease
    if ($LASTEXITCODE -ne 0) { throw "Gradle assembleRelease failed with exit code $LASTEXITCODE" }
    Copy-Item -LiteralPath "app/build/outputs/apk/release/app-release.apk" -Destination (Join-Path $repoRoot "MirrorAI-release.apk") -Force
    Get-Item -LiteralPath (Join-Path $repoRoot "MirrorAI-release.apk")
  }
} finally {
  Pop-Location
}
