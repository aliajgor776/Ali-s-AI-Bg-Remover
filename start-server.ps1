$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$prefix = "http://127.0.0.1:8080/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
} catch {
  Write-Host "Could not start the local server." -ForegroundColor Red
  Write-Host $_.Exception.Message
  Write-Host "Try closing another CleanCut window and run START WEBSITE.bat again."
  pause
  exit 1
}
Write-Host ""
Write-Host "CleanCut AI is running: $prefix" -ForegroundColor Green
Write-Host "Keep this window open while using the website."
Start-Process $prefix

$mime = @{
  ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".json"="application/json"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".webp"="image/webp";
  ".svg"="image/svg+xml"; ".ico"="image/x-icon"
}
try {
  while ($listener.IsListening) {
    $ctx=$listener.GetContext()
    $path=[Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if($path -eq "/"){$path="/index.html"}
    $file=Join-Path $root ($path.TrimStart("/") -replace "/","\")
    $rootFull=(Resolve-Path $root).Path
    if((Test-Path $file -PathType Leaf) -and ((Resolve-Path $file).Path.StartsWith($rootFull,[StringComparison]::OrdinalIgnoreCase))){
      $data=[IO.File]::ReadAllBytes($file);$ext=[IO.Path]::GetExtension($file).ToLower()
      $ctx.Response.StatusCode=200;$ctx.Response.ContentType=$(if($mime.ContainsKey($ext)){$mime[$ext]}else{"application/octet-stream"});$ctx.Response.ContentLength64=$data.Length
      $ctx.Response.OutputStream.Write($data,0,$data.Length)
    }else{
      $data=[Text.Encoding]::UTF8.GetBytes("404 Not Found");$ctx.Response.StatusCode=404;$ctx.Response.ContentLength64=$data.Length;$ctx.Response.OutputStream.Write($data,0,$data.Length)
    }
    $ctx.Response.OutputStream.Close()
  }
} finally {$listener.Stop();$listener.Close()}
