$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$metadataPath = Join-Path $repoRoot "docs/store/metadata.json"
$storeDir = Join-Path $repoRoot "docs/store"

if (-not (Test-Path -LiteralPath $metadataPath)) {
  throw "docs/store/metadata.json was not found."
}

$metadata = Get-Content -Raw -LiteralPath $metadataPath | ConvertFrom-Json
$errors = @()

function Check-Length {
  param(
    [string]$Label,
    [string]$Value,
    [int]$Max
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    $script:errors += "$Label is empty."
    return
  }

  if ($Value.Length -gt $Max) {
    $script:errors += "$Label is $($Value.Length) chars, max is $Max."
  }
}

Check-Length "Google Play TR app_name" $metadata.google_play.tr.app_name 30
Check-Length "Google Play EN app_name" $metadata.google_play.en.app_name 30
Check-Length "Google Play TR short_description" $metadata.google_play.tr.short_description 80
Check-Length "Google Play EN short_description" $metadata.google_play.en.short_description 80
Check-Length "App Store TR app_name" $metadata.app_store.tr.app_name 30
Check-Length "App Store EN app_name" $metadata.app_store.en.app_name 30
Check-Length "App Store TR subtitle" $metadata.app_store.tr.subtitle 30
Check-Length "App Store EN subtitle" $metadata.app_store.en.subtitle 30
Check-Length "App Store TR promotional_text" $metadata.app_store.tr.promotional_text 170
Check-Length "App Store EN promotional_text" $metadata.app_store.en.promotional_text 170
Check-Length "App Store TR keywords" $metadata.app_store.tr.keywords 100
Check-Length "App Store EN keywords" $metadata.app_store.en.keywords 100

$forbiddenPatterns = @(
  "kesin geri d[öo]necek",
  "seni kesin seviyor",
  "kader e[sş]i",
  "aldat[ıi]yor mu",
  "gelece[gğ]ini kesin",
  "will definitely come back",
  "definitely love you",
  "destined soulmate",
  "learn if they are cheating",
  "know your future for certain",
  "replaces therapy",
  "provides psychological diagnosis",
  "offers psychological diagnosis"
)

$listingFiles = Get-ChildItem -LiteralPath $storeDir -Filter "listing.*.md"
foreach ($file in $listingFiles) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  $content = ($content -split "## Forbidden Language")[0]
  $content = ($content -split "## Yasakli Dil")[0]
  foreach ($pattern in $forbiddenPatterns) {
    if ($content -match $pattern) {
      $errors += "$($file.Name) contains forbidden claim pattern: $pattern"
    }
  }
}

if ($errors.Count -gt 0) {
  Write-Host "Store metadata check failed:" -ForegroundColor Red
  foreach ($errorItem in $errors) {
    Write-Host " - $errorItem" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Store metadata checks passed." -ForegroundColor Green
