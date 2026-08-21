$all = @()
for ($page = 1; $page -le 20; $page++) {
  $u = "https://revibe.co.za/products.json?limit=250&page=$page"
  try { 
    $r = Invoke-WebRequest -Uri $u -TimeoutSec 60 -ErrorAction Stop
    $json = $r.Content | ConvertFrom-Json
    if ($json.products.Count -eq 0) { break }
    $all += $json.products
    Write-Host ("Page {0}: {1} products" -f $page, $json.products.Count)
  } catch { 
    Write-Host ("Page {0} failed: {1}" -f $page, $_.Exception.Message)
    break
  }
}
Write-Host ("Total: {0}" -f $all.Count)
$all | ForEach-Object {
  $img = if ($_.images.Count -gt 0) { $_.images[0].src } else { "none" }
  ("{{{0}}} | {{{1}}} | {2}" -f $_.title, $_.handle, $img)
} | Set-Content -Path "$env:TEMP\revibe-all-products.txt" -Encoding UTF8