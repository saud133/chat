@echo off
echo ========================================
echo   Deploy Dashboard API to Vercel
echo ========================================
echo.
echo This will commit and push changes to trigger
echo automatic Vercel deployment.
echo.
echo Changes being deployed:
echo - Vercel serverless functions for /api/usage
echo - Dynamic API base URL in usageTracker.js
echo - Vercel configuration file
echo - Updated DashboardPage.js
echo.

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH
    echo Please install Git and try again
    pause
    exit /b 1
)

REM Add all changes
echo Adding changes to git...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Fix Dashboard API for Vercel deployment

- Add Vercel serverless functions for /api/usage endpoints
- Update usageTracker.js with dynamic API base URL  
- Create vercel.json configuration
- Add comprehensive API testing
- Fix 404 errors on Dashboard page"

REM Push to origin
echo Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo.
    echo Vercel will automatically deploy the changes.
    echo.
    echo Test the deployment:
    echo 1. Open: https://chat-m3jt9enzm-saudgs-projects.vercel.app
    echo 2. Go to Dashboard page
    echo 3. Verify it loads without errors
    echo.
    echo Or test API directly:
    echo - Health: https://chat-m3jt9enzm-saudgs-projects.vercel.app/api/health
    echo - Usage: https://chat-m3jt9enzm-saudgs-projects.vercel.app/api/usage
    echo - Users: https://chat-m3jt9enzm-saudgs-projects.vercel.app/api/usage/users
) else (
    echo.
    echo ❌ Failed to push to GitHub
    echo Please check your git configuration and try again
)

echo.
pause
