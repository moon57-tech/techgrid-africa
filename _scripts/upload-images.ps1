$ErrorActionPreference = "Stop"
$imgDir = "C:\Users\Hq1\Documents\Claude\Techgrid Africa\images"
$outCsv = "C:\Users\Hq1\Documents\Claude\Techgrid Africa\_scripts\image-urls.csv"
$done = @{}
if (Test-Path $outCsv) { Import-Csv $outCsv | ForEach-Object { $done[$_.slug] = $_.url } }
$files = Get-ChildItem -LiteralPath $imgDir -File -Filter *.png
$ok = 0; $fail = @()
foreach ($f in $files) {
  $slug = $f.BaseName
  if ($done.ContainsKey($slug)) { $ok++; continue }
  $url = $null
  for ($try = 1; $try -le 3; $try++) {
    try {
      $url = curl.exe -s --max-time 60 -F "reqtype=fileupload" -F "fileToUpload=@$($f.FullName)" https://catbox.moe/user/api.php
      if ($url -match '^https://files\.catbox\.moe/.+') { break }
      $url = $null
    } catch { $url = $null }
    Start-Sleep -Milliseconds 1500
  }
  if ($url) {
    $done[$slug] = $url
    Add-Content -LiteralPath $outCsv -Value "$slug,$url" -Encoding ASCII
    $ok++
    Write-Output "[OK] $slug"
  } else {
    $fail += $slug
    Write-Output "[FAIL] $slug"
  }
  Start-Sleep -Milliseconds 400
}
Write-Output "Uploaded: $ok / $($files.Count)"
if ($fail.Count) { Write-Output "FAILED: $($fail -join ', ')" }