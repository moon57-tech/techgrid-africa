$rows = Import-Csv -Path "C:\Users\Hq1\Documents\Claude\Techgrid Africa\_scripts\image-map.csv"
$ok = 0; $miss = @()
foreach ($r in $rows) {
  $dest = "C:\Users\Hq1\Documents\Claude\Techgrid Africa\images\$($r.slug).png"
  if (Test-Path -LiteralPath $dest) { $ok++; continue }
  if (Test-Path -LiteralPath $r.source) {
    Copy-Item -LiteralPath $r.source -Destination $dest -Force
    $ok++
  } else {
    $miss += "$($r.slug) => $($r.source)"
  }
}
Write-Output "Copied: $ok / $($rows.Count)"
if ($miss.Count) { Write-Output "MISSING:"; $miss | ForEach-Object { Write-Output $_ } }