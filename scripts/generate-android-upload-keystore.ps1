param(
  [string]$Alias = "mirrorai-upload",
  [string]$StoreFile = "app/mirrorai-upload.jks"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$androidDir = Join-Path $repoRoot "apps/mobile/android"
$keystorePath = Join-Path $androidDir $StoreFile
$propertiesPath = Join-Path $androidDir "keystore.properties"

if (Test-Path -LiteralPath $keystorePath) {
  throw "Keystore already exists: $keystorePath"
}

$keytool = Get-Command keytool -ErrorAction SilentlyContinue
if (-not $keytool) {
  throw "keytool was not found. Install/use a JDK, then run this script again."
}

function New-Password {
  $bytes = New-Object byte[] 24
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
  } finally {
    $rng.Dispose()
  }
  return [Convert]::ToBase64String($bytes).TrimEnd("=")
}

$storePassword = New-Password
$keyPassword = New-Password

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $keystorePath) | Out-Null

& $keytool.Source `
  -genkeypair `
  -v `
  -storetype JKS `
  -keystore $keystorePath `
  -alias $Alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass $storePassword `
  -keypass $keyPassword `
  -dname "CN=Mirror AI, OU=Mirror AI, O=Mirror AI, L=Istanbul, S=Istanbul, C=TR"

$properties = @"
storeFile=$StoreFile
storePassword=$storePassword
keyAlias=$Alias
keyPassword=$keyPassword
"@
[System.IO.File]::WriteAllText($propertiesPath, $properties, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Created upload keystore:"
Write-Host "  $keystorePath"
Write-Host "Created local signing properties:"
Write-Host "  $propertiesPath"
Write-Host ""
Write-Host "Keep both files private and backed up. If this key is lost, Play uploads become painful."
