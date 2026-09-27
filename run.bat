@echo off
title ViralCrawl - Desktop App
cd /d "%~dp0"

:: Tìm đường dẫn Microsoft Edge hoặc Google Chrome để mở chế độ cửa sổ phần mềm độc lập (App Mode)
set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_PATH%" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

set "TARGET_URL=file:///%~dp0index.html"
set "TARGET_URL=%TARGET_URL:\=/%"

set "PROFILE_DIR=%LOCALAPPDATA%\ViralCrawl_Profile"

:: Ưu tiên mở bằng Edge App Mode (cửa sổ độc lập, không thanh URL, không tab)
if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="%TARGET_URL%" --user-data-dir="%PROFILE_DIR%" --window-size=1400,900
    exit /b
)

:: Nếu không có Edge, thử Chrome App Mode
if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" --app="%TARGET_URL%" --user-data-dir="%PROFILE_DIR%" --window-size=1400,900
    exit /b
)

:: Mặc định mở file HTML
start "" "%~dp0index.html"
