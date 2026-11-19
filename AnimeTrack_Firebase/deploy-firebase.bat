@echo off
setlocal
cd /d "%~dp0"

echo ================================
echo OtakuLog Firebase deployment
echo Project: anime-maker-d2725
echo ================================

where firebase >nul 2>nul
if errorlevel 1 (
  echo Firebase CLI not found. Installing it now...
  call npm install -g firebase-tools
  if errorlevel 1 goto failed
)

echo.
echo Sign in to Firebase if prompted.
firebase login
if errorlevel 1 goto failed

echo.
echo Deploying OtakuLog Hosting and Firestore rules...
firebase deploy
if errorlevel 1 goto failed

echo.
echo Deployment complete. Open https://anime-maker-d2725.web.app in Chrome.
pause
exit /b 0

:failed
echo.
echo Deployment did not complete. Check the error above and confirm Node.js is installed and you have access to anime-maker-d2725.
pause
exit /b 1
