# fix-getSession.ps1
# Adds 'await ' before every getSession() call that doesn't already have it.
# Skips node_modules and .next automatically.

$files = Get-ChildItem -Recurse -Include *.ts,*.tsx |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\\.next\\' }

$changedCount = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($null -eq $content) { continue }

    $newContent = [regex]::Replace($content, '(?<!await )\bgetSession\(\)', 'await getSession()')

    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.FullName)"
        $changedCount++
    }
}

Write-Host ""
Write-Host "Done. $changedCount file(s) updated."