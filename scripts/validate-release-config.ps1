param(
  [ValidateSet("android", "ios")]
  [string]$Platform = "android",

  [switch]$AllowTestRevenueCatKey
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$mobileDir = Join-Path $repoRoot "apps/mobile"
$envPath = Join-Path $mobileDir ".env"
$appJsonPath = Join-Path $mobileDir "app.json"
$androidKeystorePath = Join-Path $mobileDir "android/keystore.properties"

function Read-DotEnv {
  param([string]$Path)

  $values = @{}
  if (-not (Test-Path -LiteralPath $Path)) {
    return $values
  }

  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#")) {
      continue
    }

    $parts = $trimmed -split "=", 2
    if ($parts.Count -ne 2) {
      continue
    }

    $key = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    $values[$key] = $value
  }

  return $values
}

function Add-Error {
  param([string]$Message)
  $script:errors += $Message
}

function Require-Env {
  param(
    [hashtable]$Env,
    [string]$Name
  )

  if (-not $Env.ContainsKey($Name) -or [string]::IsNullOrWhiteSpace([string]$Env[$Name])) {
    Add-Error "$Name is required for a production release."
  }
}

function Require-Env-Equals {
  param(
    [hashtable]$Env,
    [string]$Name,
    [string]$Expected
  )

  if (-not $Env.ContainsKey($Name) -or [string]::IsNullOrWhiteSpace([string]$Env[$Name])) {
    return
  }

  if ([string]$Env[$Name] -ne $Expected) {
    Add-Error "$Name must be '$Expected' for the current RevenueCat setup."
  }
}

$script:errors = @()

if (-not (Test-Path -LiteralPath $envPath)) {
  Add-Error "apps/mobile/.env was not found."
}

$env = Read-DotEnv -Path $envPath

$requiredPublicEnv = @(
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_ASTROLOGY_SERVICE_URL",
  "EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID",
  "EXPO_PUBLIC_REVENUECAT_OFFERING_ID",
  "EXPO_PUBLIC_REVENUECAT_PLUS_MONTHLY_PRODUCT_ID",
  "EXPO_PUBLIC_REVENUECAT_PLUS_YEARLY_PRODUCT_ID",
  "EXPO_PUBLIC_REVENUECAT_CREDIT_SMALL_PRODUCT_ID"
)

foreach ($name in $requiredPublicEnv) {
  Require-Env -Env $env -Name $name
}

if ($Platform -eq "android") {
  Require-Env -Env $env -Name "EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY"
} else {
  Require-Env -Env $env -Name "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY"
}

Require-Env-Equals -Env $env -Name "EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID" -Expected "mirror_plus"
Require-Env-Equals -Env $env -Name "EXPO_PUBLIC_REVENUECAT_OFFERING_ID" -Expected "default"
Require-Env-Equals -Env $env -Name "EXPO_PUBLIC_REVENUECAT_PLUS_MONTHLY_PRODUCT_ID" -Expected "mirror_plus_monthly"
Require-Env-Equals -Env $env -Name "EXPO_PUBLIC_REVENUECAT_PLUS_YEARLY_PRODUCT_ID" -Expected "mirror_plus_yearly"
Require-Env-Equals -Env $env -Name "EXPO_PUBLIC_REVENUECAT_CREDIT_SMALL_PRODUCT_ID" -Expected "mirror_credits_10"

$revenueCatKeyName = if ($Platform -eq "android") { "EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY" } else { "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY" }
if ($env.ContainsKey($revenueCatKeyName)) {
  $revenueCatKey = [string]$env[$revenueCatKeyName]
  if (-not $AllowTestRevenueCatKey -and $revenueCatKey.StartsWith("test_")) {
    Add-Error "$revenueCatKeyName uses a RevenueCat Test Store key. Use the production public SDK key for release/payment testing."
  }
}

if ($env.ContainsKey("EXPO_PUBLIC_ALLOW_MOCKS") -and [string]$env["EXPO_PUBLIC_ALLOW_MOCKS"] -eq "true") {
  Add-Error "EXPO_PUBLIC_ALLOW_MOCKS=true is not allowed in release builds."
}

$forbiddenMobileEnv = @(
  "GEMINI_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEYS",
  "SUPABASE_DB_URL",
  "REVENUECAT_SECRET_KEY",
  "ASTROLOGY_SERVICE_TOKEN",
  "CRON_SECRET"
)

foreach ($name in $forbiddenMobileEnv) {
  if ($env.ContainsKey($name)) {
    Add-Error "$name must never be placed in apps/mobile/.env. Put server secrets in Supabase Edge Function Secrets."
  }
}

if ($Platform -eq "android" -and -not (Test-Path -LiteralPath $androidKeystorePath)) {
  Add-Error "apps/mobile/android/keystore.properties is required for Play release signing."
}

if (Test-Path -LiteralPath $appJsonPath) {
  $appJson = Get-Content -Raw -LiteralPath $appJsonPath | ConvertFrom-Json
  if ($appJson.expo.android.package -ne "com.mirrorai.app") {
    Add-Error "Android package must stay com.mirrorai.app for the configured RevenueCat/Play Console products."
  }
  if ($appJson.expo.ios.bundleIdentifier -ne "com.mirrorai.app") {
    Add-Error "iOS bundleIdentifier must stay com.mirrorai.app for the configured RevenueCat/App Store products."
  }
} else {
  Add-Error "apps/mobile/app.json was not found."
}

if ($errors.Count -gt 0) {
  Write-Host "Release configuration failed:" -ForegroundColor Red
  foreach ($errorItem in $errors) {
    Write-Host " - $errorItem" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Release configuration looks ready for $Platform." -ForegroundColor Green
