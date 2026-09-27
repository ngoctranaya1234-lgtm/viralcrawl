$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  $fallbackGit = 'C:\Users\tranh\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd'
  if (Test-Path (Join-Path $fallbackGit 'git.exe')) { $env:PATH = "$fallbackGit;$env:PATH" }
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Cần cài Git và đăng nhập GitHub qua Git Credential Manager.' }
$remote = git remote get-url origin
if ($LASTEXITCODE -ne 0 -or $remote -notmatch '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?$') { throw 'Origin phải là URL GitHub HTTPS không chứa thông tin đăng nhập.' }
$branch = git branch --show-current
if ($branch -ne 'main') { throw 'Chỉ xuất bản nhánh main sau khi đã kiểm tra và commit.' }
$pending = git status --porcelain
if ($pending) { throw 'Còn thay đổi chưa commit. Kiểm tra và commit trước khi xuất bản.' }
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'GitHub chưa nhận mã nguồn. Kiểm tra quyền truy cập và lịch sử nhánh; không dùng force push.' }
Write-Host "Đã đẩy commit lên $remote. Xem kết quả GitHub Actions trước khi kết luận Pages đã hoạt động."
