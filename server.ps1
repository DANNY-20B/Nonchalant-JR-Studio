param(
    [int]$Port = 5500
)

$rootDir = $PSScriptRoot
if (-not $rootDir -or -not (Test-Path $rootDir)) {
    $rootDir = "c:\Users\DANIEL\Desktop\nonchalant-jr-studio"
}

$mimeTypes = @{
    ".html"    = "text/html; charset=utf-8"
    ".css"     = "text/css; charset=utf-8"
    ".js"      = "application/javascript; charset=utf-8"
    ".json"    = "application/json; charset=utf-8"
    ".jpg"     = "image/jpeg"
    ".jpeg"    = "image/jpeg"
    ".png"     = "image/png"
    ".gif"     = "image/gif"
    ".svg"     = "image/svg+xml"
    ".ico"     = "image/x-icon"
    ".webp"    = "image/webp"
    ".mp4"     = "video/mp4"
    ".webm"    = "video/webm"
    ".woff"    = "font/woff"
    ".woff2"   = "font/woff2"
    ".ttf"     = "font/ttf"
    ".otf"     = "font/otf"
    ".map"     = "application/json"
    ".txt"     = "text/plain; charset=utf-8"
}

# Clean any previous port conflicts or orphaned processes
try {
    $existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $existing) {
        if ($c.OwningProcess -and $c.OwningProcess -ne $PID) {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Stop-Process -Name "cloudflared" -Force -ErrorAction SilentlyContinue
} catch {}

# Detect local Wi-Fi / Ethernet IPv4 for phone access
$localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*', 'Ethernet*' -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike '169.254*' -and $_.IPAddress -notlike '127.*' } | Select-Object -ExpandProperty IPAddress -First 1)
if (-not $localIp) { $localIp = "192.168.0.3" }

# Cloudflare Public Tunnel Integration
$urlFile = Join-Path $rootDir "public_url.txt"
$cloudflaredPath = Join-Path $rootDir "cloudflared.exe"

# Start Cloudflare Tunnel in background if binary exists
if (Test-Path $cloudflaredPath) {
    # Clean previous URL file
    if (Test-Path $urlFile) { Remove-Item $urlFile -Force -ErrorAction SilentlyContinue }

    # Launch background job to run cloudflared and extract public URL
    Start-Job -ScriptBlock {
        param($cfPath, $p, $uFile)
        $tunnelLog = Join-Path (Split-Path $uFile) "tunnel.log"
        if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force -ErrorAction SilentlyContinue }

        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $cfPath
        $psi.Arguments = "tunnel --url http://127.0.0.1:$p"
        $psi.RedirectStandardError = $true
        $psi.UseShellExecute = $false
        $psi.CreateNoWindow = $true

        $proc = [System.Diagnostics.Process]::Start($psi)

        while (-not $proc.HasExited) {
            $line = $proc.StandardError.ReadLine()
            if ($line) {
                Add-Content -Path $tunnelLog -Value $line -Encoding UTF8
                if ($line -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
                    $found = $matches[0]
                    [System.IO.File]::WriteAllText($uFile, $found, [System.Text.Encoding]::UTF8)
                }
            } else {
                Start-Sleep -Milliseconds 150
            }
        }
    } -ArgumentList $cloudflaredPath, $Port, $urlFile | Out-Null
}

# Bind to 0.0.0.0 using native Sockets TcpListener (Works for standard non-admin users!)
$endpoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, $Port)
$listener = New-Object System.Net.Sockets.TcpListener($endpoint)
$listener.Start()

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host " NONCHALANT JR STUDIO - LIVE GAMING CONTROL CENTRE" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "-> Local PC Access:     http://localhost:$Port/" -ForegroundColor Green
Write-Host "-> Home WiFi Access:    http://${localIp}:$Port/" -ForegroundColor Cyan
Write-Host "-> Public Cloud Tunnel: Initializing Cloudflare Tunnel..." -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Yellow

while ($true) {
    $client = $null
    try {
        $client = $listener.AcceptTcpClient()
        $client.ReceiveTimeout = 4000
        $client.SendTimeout = 4000
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $writer = New-Object System.IO.BinaryWriter($stream)

        $requestLine = $reader.ReadLine()
        if (-not $requestLine) {
            continue
        }

        # Parse request line e.g. GET /index.html HTTP/1.1
        $parts = $requestLine.Split(" ")
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }
        $method = $parts[0].ToUpper()
        $urlPath = $parts[1]

        # Read remaining HTTP headers and detect Content-Length
        $contentLength = 0
        while ($line = $reader.ReadLine()) {
            if ([string]::IsNullOrWhiteSpace($line)) { break }
            if ($line.ToLower().StartsWith("content-length:")) {
                try {
                    $contentLength = [int]($line.Split(":")[1].Trim())
                } catch {}
            }
        }

        # Handle CORS preflight OPTIONS
        if ($method -eq "OPTIONS") {
            $header = "HTTP/1.1 204 No Content`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nConnection: close`r`n`r`n"
            $writer.Write([System.Text.Encoding]::ASCII.GetBytes($header))
            $writer.Flush()
            $client.Close()
            continue
        }

        # Read POST body if present
        $body = ""
        if ($contentLength -gt 0) {
            $buffer = New-Object char[] $contentLength
            $readChars = 0
            while ($readChars -lt $contentLength) {
                $read = $reader.Read($buffer, $readChars, $contentLength - $readChars)
                if ($read -le 0) { break }
                $readChars += $read
            }
            $body = New-Object string ($buffer, 0, $readChars)
        }

        $rawUrl = $urlPath
        # Strip query parameters
        if ($urlPath.Contains("?")) {
            $urlPath = $urlPath.Substring(0, $urlPath.IndexOf("?"))
        }

        # Extract query params if present
        $queryParams = @{}
        if ($rawUrl.Contains("?")) {
            $qStr = $rawUrl.Substring($rawUrl.IndexOf("?") + 1)
            foreach ($pair in $qStr.Split("&")) {
                $kv = $pair.Split("=")
                if ($kv.Length -ge 2) {
                    $queryParams[$kv[0].ToLower()] = [System.Uri]::UnescapeDataString($kv[1])
                }
            }
        }

        # -----------------------------------------------------------------
        # API ROUTE: /api/public-url (Tunnel status)
        # -----------------------------------------------------------------
        if ($urlPath -eq "/api/public-url") {
            $pubUrl = ""
            if (Test-Path $urlFile) {
                try { $pubUrl = (Get-Content $urlFile -Raw -Encoding UTF8).Trim() } catch {}
            }
            $respObj = @{ url = $pubUrl; localWifi = "http://${localIp}:$Port/" }
            $respJson = ($respObj | ConvertTo-Json -Compress)
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $writer.Write([System.Text.Encoding]::ASCII.GetBytes($header))
            $writer.Write($bytes)
            $writer.Flush()
            $client.Close()
            continue
        }
            $writer.Write([System.Text.Encoding]::ASCII.GetBytes($header))
            $writer.Write($bytes)
            $writer.Flush()
            $client.Close()
            continue
        }

        # -----------------------------------------------------------------
        # STATIC FILE SERVING
        # -----------------------------------------------------------------
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        # Decode URL-encoded characters (spaces, etc.)
        $urlPath = [System.Uri]::UnescapeDataString($urlPath)

        $relPath = $urlPath.TrimStart("/").Replace("/", "\")
        $filePath = Join-Path $rootDir $relPath

        # Path traversal guard
        try {
            $fullPath = [System.IO.Path]::GetFullPath($filePath)
            if (-not $fullPath.StartsWith($rootDir, [System.StringComparison]::OrdinalIgnoreCase)) {
                $filePath = Join-Path $rootDir "index.html"
            }
        } catch {}

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $contentType = $mimeTypes[$ext]
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)

            $writer.Write($headerBytes)
            if ($method -ne "HEAD") {
                $writer.Write($bytes)
            }
            $writer.Flush()
        } else {
            $msg = "404 Not Found"
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($msg.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $msgBytes = [System.Text.Encoding]::ASCII.GetBytes($msg)

            $writer.Write($headerBytes)
            if ($method -ne "HEAD") {
                $writer.Write($msgBytes)
            }
            $writer.Flush()
        }
    } catch {
        # Prevent tight CPU spinning if socket error repeats
        Start-Sleep -Milliseconds 25
    } finally {
        if ($client) {
            try { $client.Client.Shutdown([System.Net.Sockets.SocketShutdown]::Both) } catch {}
            try { $client.Close() } catch {}
        }
    }
}
