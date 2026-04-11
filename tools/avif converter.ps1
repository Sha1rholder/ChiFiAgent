# AVIF 转换器 N卡硬件加速
Add-Type -AssemblyName System.Windows.Forms

$dlg = New-Object System.Windows.Forms.OpenFileDialog
$dlg.Filter = "图片文件|*.jpg;*.jpeg;*.png;*.webp"
$dlg.Title = "选择要转换的图片"
if ($dlg.ShowDialog() -ne 'OK')
{ exit
}

$inFile  = $dlg.FileName
$outFile = [System.IO.Path]::ChangeExtension($inFile, '.avif')

Write-Host "`n=== AVIF 转换 (av1_nvenc · RTX 5090) ===" -ForegroundColor Cyan
Write-Host "输入: $inFile`n"

Write-Host "是否限制图片最长边？直接回车不缩放，输入数字则最长边不超过该像素（等比缩小，不会放大原图）"
$maxLongSide = Read-Host "最长边限制"
$scaleFilter = $null
if (-not [string]::IsNullOrWhiteSpace($maxLongSide))
{
	if ($maxLongSide -match '^\d+$' -and [int]$maxLongSide -gt 0)
	{
		$maxLongSide = [int]$maxLongSide
		# 替换为FFmpeg原生兼容写法：自动等比、仅缩小不放大、自动对齐偶数分辨率、lanczos高质量采样
		$scaleFilter = "scale=w=${maxLongSide}:h=${maxLongSide}:force_original_aspect_ratio=decrease:flags=lanczos"
		Write-Host "✅ 已启用长边限制：≤ ${maxLongSide}px`n" -ForegroundColor Cyan
	} else
	{
		Write-Host "⚠️ 输入无效，不启用长边限制`n" -ForegroundColor Yellow
	}
}

# ── CQ 质量 ──
$cq = Read-Host "CQ 质量 (0-51, 越低越好, 建议 20-35) [28]"
if ([string]::IsNullOrWhiteSpace($cq))
{ $cq = "28"
}

# ── 编码预设 ──
Write-Host "`n预设: p1(最快) → p7(最慢·最好)"
$preset = Read-Host "编码预设 [p7]"
if ([string]::IsNullOrWhiteSpace($preset))
{ $preset = "p7"
}

# ── 色深 ──
Write-Host "`n1) 8-bit  yuv420p`n2) 10-bit p010le"
$bit = Read-Host "色深 [1]"
$pix = if ($bit -eq "2")
{ "p010le"
} else
{ "yuv420p"
}

# ── 执行 ──
Write-Host "`n转换中..." -ForegroundColor Yellow

$ffargs = @(
	'-hide_banner',
	'-i', $inFile,
	$(if ($scaleFilter)
		{ '-vf', $scaleFilter
		}), # 有缩放需求才加滤镜参数
	'-c:v', 'av1_nvenc',
	'-cq', $cq,
	'-b:v', '0',
	'-preset', $preset,
	'-spatial-aq', '1',
	'-pix_fmt', $pix,
	'-y', $outFile
)
& ffmpeg @ffargs

if ($LASTEXITCODE -eq 0)
{
	$si = [math]::Round((Get-Item $inFile).Length / 1KB, 1)
	$so = [math]::Round((Get-Item $outFile).Length / 1KB, 1)
	Write-Host "`n✓ 完成  ${si} KB → ${so} KB" -ForegroundColor Green
	Write-Host "  $outFile"
} else
{
	Write-Host "`n✗ 转换失败" -ForegroundColor Red
}
