@echo off
echo ========================================
echo   Dashboard API Server Startup
echo ========================================
echo.
echo This will start the backend server that provides
echo the API endpoints for the Dashboard page.
echo.
echo The server will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo Starting server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the server
node backend-server.js

echo.
echo Server stopped.
pause
