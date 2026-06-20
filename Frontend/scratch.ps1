
$files = Get-ChildItem -Path d:\Cortex_IT_Projects\Buc_India\Frontend\src -Recurse -Filter *.jsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Replace exact `className="text-transparent outline-title"`
    $content = $content -replace 'className="text-transparent outline-title"', 'className="text-copper"'

    # Replace `text-transparent outline-title` within other classes
    $content = $content -replace '\btext-transparent\s+outline-title\b', 'text-copper'

    # Replace specific case in Safety.jsx
    $content = $content -replace 'text-white(.*?)outline-title', 'text-copper$1'

    # Catch any remaining `outline-title`
    $content = $content -replace '\boutline-title\b', 'text-copper'

    # Cleanup duplicate text-copper if created
    $content = $content -replace '\btext-copper\s+text-copper\b', 'text-copper'

    if ($content -cne $original) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated: $($file.Name)"
    }
}

