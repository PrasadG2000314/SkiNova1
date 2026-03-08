@echo off
REM Next.js Folder Structure Repair Script for Windows
REM Run this script from the frontend directory to auto-repair the structure

setlocal enabledelayedexpansion

echo.
echo ==================================================
echo  Next.js Folder Structure Repair Script
echo ==================================================
echo.

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo [ERROR] package.json not found.
    echo Please run this script from the frontend directory.
    pause
    exit /b 1
)

echo [✓] Found package.json
echo.

REM Step 1: Create route groups if they don't exist
echo [PHASE 1] Creating route groups...
echo.

if not exist "app\(auth)" (
    mkdir "app\(auth)"
    echo [✓] Created app\(auth)
)

if not exist "app\(dashboard)" (
    mkdir "app\(dashboard)"
    echo [✓] Created app\(dashboard)
)

if not exist "app\(features)" (
    mkdir "app\(features)"
    echo [✓] Created app\(features)
)

echo.
echo [PHASE 2] Additional checks...
echo.

REM Check for duplicate components
if exist "app\components" (
    echo [WARNING] Found duplicate app\components folder
    echo          Move unique components to root\components before deleting
    echo.
)

REM Format complete
echo ==================================================
echo.
echo [✓] Auto-repairs completed!
echo.
echo NEXT STEPS (Manual):
echo.
echo 1. Move authentication pages to app\(auth)\
echo    - login\
echo    - signup\
echo    - forgot-password\
echo    - reset-password\
echo.
echo 2. Move dashboard pages to app\(dashboard)\
echo    - dashboard\
echo    - patient\
echo    - doctor\
echo    - admin\
echo.
echo 3. Move feature pages to app\(features)\
echo    - skin-cancer\
echo    - psoriasis\
echo    - leprosy\
echo    - tinea\
echo    - chat\
echo    - appointments\
echo.
echo 4. Remove duplicate app\components folder
echo.
echo 5. Update import paths to use @\ aliases
echo.
echo 6. Run: npm run build
echo    Then: npm run dev
echo.
echo For detailed guide, see NEXT_JS_REPAIR_GUIDE.md in parent folder
echo.
echo ==================================================

pause
