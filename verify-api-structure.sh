#!/bin/bash
# Verify API structure setup

echo "🔍 Verifying Next.js API Structure..."
echo ""

# Check required directories
dirs=(
  "app/api/health"
  "app/api/auth"
  "app/api/admin"
  "app/api/appointments"
  "app/api/doctors"
  "app/api/availability"
  "app/api/banners"
  "app/api/chat"
  "app/api/detection"
  "app/api/predictions"
  "app/api/profile"
  "app/api/reports"
  "app/api/xai"
  "lib"
)

missing=0
for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✓ $dir"
  else
    echo "✗ $dir (MISSING)"
    missing=$((missing + 1))
  fi
done

echo ""
echo "Checking required files..."

files=(
  "lib/api.ts"
  "lib/constants.ts"
  "lib/types.ts"
  "lib/api-helpers.ts"
  "API_STRUCTURE.md"
  "API_MIGRATION_GUIDE.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file (MISSING)"
    missing=$((missing + 1))
  fi
done

echo ""
if [ $missing -eq 0 ]; then
  echo "✅ All API structure components are in place!"
  echo ""
  echo "Next steps:"
  echo "1. Update .env.local with NEXT_PUBLIC_BACKEND_URL"
  echo "2. Review API_STRUCTURE.md for API documentation"
  echo "3. Follow API_MIGRATION_GUIDE.md to update components"
  echo "4. Run: npm run build"
  echo "5. Run: npm run dev"
else
  echo "⚠️  $missing missing components. Please check above."
fi
