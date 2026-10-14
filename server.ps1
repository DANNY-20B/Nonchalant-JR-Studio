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
        # API ROUTE: /api/public-url
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

        # -----------------------------------------------------------------
        # API ROUTE: /api/tournament (GET & POST)
        # -----------------------------------------------------------------
        $syncFile = Join-Path $rootDir "tournament_sync.json"

        if ($urlPath -eq "/api/tournament") {
            if ($method -eq "POST") {
                if ($body) {
                    [System.IO.File]::WriteAllText($syncFile, $body, [System.Text.Encoding]::UTF8)
                }
                $resp = '{"success":true}'
            } else {
                $resp = "{}"
                if (Test-Path $syncFile) {
                    try { $resp = Get-Content $syncFile -Raw -Encoding UTF8 } catch {}
                }
            }
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($resp)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $writer.Write([System.Text.Encoding]::ASCII.GetBytes($header))
            $writer.Write($bytes)
            $writer.Flush()
            $client.Close()
            continue
        }

        # -----------------------------------------------------------------
        # API ROUTE: /api/join (POST friend gamer tag into tournament)
        # -----------------------------------------------------------------
        if ($urlPath -eq "/api/join" -and ($method -eq "POST" -or $method -eq "GET")) {
            $friendName = ""
            if ($queryParams.ContainsKey("gamertag")) {
                $friendName = $queryParams["gamertag"]
            } elseif ($queryParams.ContainsKey("name")) {
                $friendName = $queryParams["name"]
            }

            if (-not $friendName -and $body) {
                if ($body -match '["\x27]?gamerTag["\x27]?\s*[:=]\s*["\x27]?([^"\x27,&}\r\n]+)') {
                    $friendName = $matches[1]
                } elseif ($body -match '["\x27]?name["\x27]?\s*[:=]\s*["\x27]?([^"\x27,&}\r\n]+)') {
                    $friendName = $matches[1]
                } else {
                    try {
                        $parsed = $body | ConvertFrom-Json
                        $friendName = $parsed.gamerTag
                        if (-not $friendName) { $friendName = $parsed.name }
                    } catch {}
                }
            }

            $friendName = ("" + $friendName).Trim()

            if ($friendName) {
                $tourneyObj = $null
                if (Test-Path $syncFile) {
                    try { $tourneyObj = (Get-Content $syncFile -Raw -Encoding UTF8) | ConvertFrom-Json } catch {}
                }

                if (-not $tourneyObj) {
                    $tourneyObj = [PSCustomObject]@{
                        id           = "tourney_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                        name         = "NONCHALANT JR Championship"
                        format       = "knockout"
                        status       = "In Progress"
                        champion     = $null
                        matchLog     = @()
                        championsHistory = @()
                        participants = @(
                            [PSCustomObject]@{ id = "p0"; name = "NONCHALANT JR"; team = "NONCHALANT JR" },
                            [PSCustomObject]@{ id = "p1"; name = $friendName; team = $friendName },
                            [PSCustomObject]@{ id = "p2"; name = "Friend 2"; team = "Friend 2" },
                            [PSCustomObject]@{ id = "p3"; name = "Friend 3"; team = "Friend 3" }
                        )
                        standings    = @(
                            [PSCustomObject]@{ rank = 1; team = "NONCHALANT JR"; played = 0; won = 0; drawn = 0; lost = 0; gf = 0; ga = 0; gd = 0; pts = 0 },
                            [PSCustomObject]@{ rank = 2; team = $friendName; played = 0; won = 0; drawn = 0; lost = 0; gf = 0; ga = 0; gd = 0; pts = 0 },
                            [PSCustomObject]@{ rank = 3; team = "Friend 2"; played = 0; won = 0; drawn = 0; lost = 0; gf = 0; ga = 0; gd = 0; pts = 0 },
                            [PSCustomObject]@{ rank = 4; team = "Friend 3"; played = 0; won = 0; drawn = 0; lost = 0; gf = 0; ga = 0; gd = 0; pts = 0 }
                        )
                        bracket      = [PSCustomObject]@{
                            rounds = @(
                                [PSCustomObject]@{
                                    name = "Quarter-Finals"
                                    matches = @(
                                        [PSCustomObject]@{ team1 = "NONCHALANT JR"; score1 = $null; team2 = $friendName; score2 = $null; winner = $null },
                                        [PSCustomObject]@{ team1 = "Friend 2"; score1 = $null; team2 = "Friend 3"; score2 = $null; winner = $null }
                                    )
                                },
                                [PSCustomObject]@{
                                    name = "Semi-Finals"
                                    matches = @(
                                        [PSCustomObject]@{ team1 = "Winner QF 1"; score1 = $null; team2 = "Winner QF 2"; score2 = $null; winner = $null }
                                    )
                                }
                            )
                            grandFinal = [PSCustomObject]@{ team1 = $null; score1 = $null; team2 = $null; score2 = $null; winner = $null; completed = $false }
                        }
                    }
                    $updatedJson = ($tourneyObj | ConvertTo-Json -Depth 10)
                    [System.IO.File]::WriteAllText($syncFile, $updatedJson, [System.Text.Encoding]::UTF8)
                } else {
                    if (-not $tourneyObj.participants) { $tourneyObj | Add-Member -MemberType NoteProperty -Name "participants" -Value @() }
                    if (-not $tourneyObj.standings) { $tourneyObj | Add-Member -MemberType NoteProperty -Name "standings" -Value @() }

                    $alreadyIn = $false
                    foreach ($p in $tourneyObj.participants) {
                        if ($p.name.ToLower() -eq $friendName.ToLower()) { $alreadyIn = $true; break }
                    }

                    if (-not $alreadyIn) {
                        $pItem = [PSCustomObject]@{
                            id   = "p_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                            name = $friendName
                            team = $friendName
                        }
                        $tourneyObj.participants = @($tourneyObj.participants) + $pItem

                        $sItem = [PSCustomObject]@{
                            rank   = ($tourneyObj.standings.Count + 1)
                            team   = $friendName
                            played = 0
                            won    = 0
                            drawn  = 0
                            lost   = 0
                            gf     = 0
                            ga     = 0
                            gd     = 0
                            pts    = 0
                        }
                        $tourneyObj.standings = @($tourneyObj.standings) + $sItem

                        # Slot friend into knockout bracket round 1 if there is a placeholder
                        if ($tourneyObj.bracket -and $tourneyObj.bracket.rounds -and $tourneyObj.bracket.rounds.Count -gt 0) {
                            $r0 = $tourneyObj.bracket.rounds[0]
                            if ($r0.matches) {
                                foreach ($m in $r0.matches) {
                                    if (-not $m.team1 -or $m.team1.StartsWith("Friend ") -or $m.team1 -eq "BYE") {
                                        $m.team1 = $friendName
                                        break
                                    } elseif (-not $m.team2 -or $m.team2.StartsWith("Friend ") -or $m.team2 -eq "BYE") {
                                        $m.team2 = $friendName
                                        break
                                    }
                                }
                            }
                        }

                        $updatedJson = ($tourneyObj | ConvertTo-Json -Depth 10)
                        [System.IO.File]::WriteAllText($syncFile, $updatedJson, [System.Text.Encoding]::UTF8)
                    }
                }
            }

            $respObj = @{ success = $true; gamerTag = $friendName }
            $respJson = ($respObj | ConvertTo-Json -Compress)
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
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
