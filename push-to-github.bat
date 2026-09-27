@echo off
chcp 65001 >nul
title Đẩy ViralCrawl lên GitHub — 2TECH MN

set PATH=C:\Users\tranh\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd;%PATH%

echo ========================================================
echo   2TECH MN — CÔNG CỤ TỰ ĐỘNG ĐẨY CODE LÊN GITHUB
echo   Chủ quản: NGUYỄN MINH NHỰT
echo ========================================================
echo.

set /p REPO_URL="Nhập Link GitHub Repository (VD: https://github.com/username/viralcrawl.git): "

if "%REPO_URL%"=="" (
    echo Bạn chưa nhập link GitHub! Vui lòng chạy lại.
    pause
    exit /b
)

echo.
echo Đang cấu hình Remote GitHub...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Đang đẩy mã nguồn lên GitHub...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo [THÀNH CÔNG] Đã đẩy toàn bộ mã nguồn lên GitHub!
    echo Link repo của bạn: %REPO_URL%
) else (
    echo [LƯU Ý] Nếu gặp lỗi xác thực, bạn hãy kiểm tra lại Personal Access Token hoặc quyền truy cập.
)

pause
