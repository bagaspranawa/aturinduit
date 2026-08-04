# ============================================================
#  Builds two things from the same sources:
#
#    AturinDuit.html  - one self-contained file, for opening
#                       straight off disk or Google Drive
#    docs\            - the deployable site (adds manifest,
#                       service worker, icons). Named "docs"
#                       because GitHub Pages can only serve a
#                       branch root or a /docs folder, and the
#                       root here holds the sources.
#
#  Run:  powershell -ExecutionPolicy Bypass -File build.ps1
#
#  Kept ASCII-only on purpose: Windows PowerShell 5.1 reads
#  script files as ANSI, so non-ASCII text here would corrupt.
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$out  = Join-Path $root 'AturinDuit.html'
$site = Join-Path $root 'docs'
$pwa  = Join-Path $root 'pwa'

$html = Get-Content (Join-Path $root 'index.html') -Raw -Encoding UTF8
$css  = Get-Content (Join-Path $root 'assets\styles.css') -Raw -Encoding UTF8

# Drop the ?v= cache busters and the note explaining them; nothing is fetched
# once every asset is inlined.
$html = [regex]::Replace($html, '(href|src)="(assets/[^"?]+)\?v=\d+"', '$1="$2"')
$html = [regex]::Replace($html, '(?s)\s*<!-- \?v= is a cache buster.*?-->', '')

# String.Replace (not -replace) so $ and \ inside the CSS/JS stay literal.
$html = $html.Replace(
  '<link rel="stylesheet" href="assets/styles.css">',
  "<style>`n$css`n  </style>")

$closeTag = '</' + 'script'
$scripts  = @('icons', 'utils', 'store', 'charts', 'pwa', 'ui', 'sheets', 'main')

foreach ($name in $scripts) {
  $js = Get-Content (Join-Path $root "assets\$name.js") -Raw -Encoding UTF8
  if ($js.Contains($closeTag)) {
    throw "assets\$name.js contains a literal closing script tag; bundling would break the page."
  }
  $tag = '<script src="assets/' + $name + '.js"></script>'
  if (-not $html.Contains($tag)) {
    throw "index.html has no script tag for assets\$name.js."
  }
  $html = $html.Replace($tag, "<script>`n$js`n  </script>")
}

if ($html.Contains('src="assets/'))  { throw 'A script tag was not inlined; check the filenames.' }
if ($html.Contains('href="assets/')) { throw 'The stylesheet was not inlined; check the link tag.' }

# UTF-8 without BOM keeps the file clean for file:// and Drive previews.
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($out, $html, $utf8)

# ---------- deployable site ----------

if (Test-Path $site) { Remove-Item $site -Recurse -Force }
New-Item -ItemType Directory -Force $site | Out-Null

# The deployed copy gets a STATIC manifest link. Injecting it from script at
# runtime is too late for Chrome's install check, which reads the initial HTML;
# without it Android mints a plain bookmark shortcut instead of a real app.
# It stays out of AturinDuit.html on purpose: opened from file:// there is no
# manifest.json beside it, and a static link would only produce a 404.
$siteHtml = $html.Replace(
  '</head>',
  "  <link rel=""manifest"" href=""manifest.json"">`n</head>")
if ($siteHtml -eq $html) { throw 'Could not inject the manifest link; no </head> found.' }

# index.html so the site works at the bare folder URL
[System.IO.File]::WriteAllText((Join-Path $site 'index.html'), $siteHtml, $utf8)

Copy-Item (Join-Path $pwa 'manifest.json') $site
Copy-Item (Join-Path $pwa 'icon-192.png')  $site
Copy-Item (Join-Path $pwa 'icon-512.png')  $site

# Stamp the worker so redeploying actually invalidates the phone's cache.
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$sw = Get-Content (Join-Path $pwa 'sw.js') -Raw -Encoding UTF8
$sw = $sw.Replace('__BUILD__', $stamp)
if ($sw.Contains('__BUILD__')) { throw 'Failed to stamp the service worker build id.' }
[System.IO.File]::WriteAllText((Join-Path $site 'sw.js'), $sw, $utf8)

# Jekyll would otherwise ignore files it does not understand on GitHub Pages.
[System.IO.File]::WriteAllText((Join-Path $site '.nojekyll'), '', $utf8)

$kb = [math]::Round((Get-Item $out).Length / 1KB, 1)
$n  = (Get-ChildItem $site -Force).Count
Write-Host "AturinDuit.html siap - $kb KB (satu file, tanpa dependensi)."
Write-Host "docs\ siap - $n berkas, build $stamp."
