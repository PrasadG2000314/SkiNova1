@echo off
REM Verify Next.js API Structure
setlocal enabledelayedexpansion

echo.
echo ======================================================
echo  Next.js API Structure Verification
echo ======================================================
echo.

set missing=0

echo Checking directories...
echo.

for %%d in (
  "app\api\health"
  "app\api\auth"
  "app\api\admin"
  "app\api\appointments"
  "app\api\doctors"
  "app\api\availability"
  "app\api\banners"
  "app\api\chat"
  "app\api\detection"
  "app\api\predictions"
  "app\api\profile"
  "app\api\reports"
  "app\api\xai"
  "lib"
) do (
  if exist "%%d" (
    echo [OK] %%d
  ) else (
    echo [MISSING] %%d
    set /a missing=!missing!+1
  )
)

echo.
echo Checking files...
echo.

for %%f in (
  "lib\api.ts"
  "lib\constants.ts"
  "lib\types.ts"
  "lib\api-helpers.ts"
  "API_STRUCTURE.md"
  "API_MIGRATION_GUIDE.md"
) do (
  if exist "%%f" (
    echo [OK] %%f
  ) else (
    echo [MISSING] %%f
    set /a missing=!missing!+1
  )
)

echo.
echo ======================================================
echo.

if %missing% equ 0 (
  echo [SUCCESS] All API structure components are in place!
  echo.
  echo Next steps:
  echo 1. Update .env.local with NEXT_PUBLIC_BACKEND_URL
  echo 2. Review API_STRUCTURE.md for API documentation
  echo 3. Follow API_MIGRATION_GUIDE.md to update components
  echo 4. Run: npm run build
  echo 5. Run: npm run dev
) else (
  echo [WARNING] Found %missing% missing components!
  echo Please check above for details.
)

echo.
echo ======================================================
pause
