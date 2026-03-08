#!/bin/bash
# Next.js Folder Structure Repair Script
# Run this script from the frontend directory to auto-repair the structure

set -e

echo "🔧 Starting Next.js Folder Structure Repair..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the frontend directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found package.json${NC}"
echo ""

# Step 1: Create route groups if they don't exist
echo "📁 Phase 1: Creating route groups..."

if [ ! -d "app/(auth)" ]; then
    mkdir -p "app/(auth)"
    echo -e "${GREEN}✓ Created app/(auth)${NC}"
fi

if [ ! -d "app/(dashboard)" ]; then
    mkdir -p "app/(dashboard)"
    echo -e "${GREEN}✓ Created app/(dashboard)${NC}"
fi

if [ ! -d "app/(features)" ]; then
    mkdir -p "app/(features)"
    echo -e "${GREEN}✓ Created app/(features)${NC}"
fi

echo ""
echo "📝 Phase 2: Manual steps required..."
echo ""
echo -e "${YELLOW}Please complete the following steps:${NC}"
echo ""
echo "1. Move authentication pages to app/(auth)/"
echo "   - app/(auth)/login/"
echo "   - app/(auth)/signup/"
echo "   - app/(auth)/forgot-password/"
echo "   - app/(auth)/reset-password/"
echo ""
echo "2. Move dashboard pages to app/(dashboard)/"
echo "   - app/(dashboard)/dashboard/"
echo "   - app/(dashboard)/patient/"
echo "   - app/(dashboard)/doctor/"
echo "   - app/(dashboard)/admin/"
echo ""
echo "3. Move feature pages to app/(features)/"
echo "   - app/(features)/skin-cancer/"
echo "   - app/(features)/psoriasis/"
echo "   - app/(features)/leprosy/"
echo "   - app/(features)/tinea/"
echo "   - app/(features)/chat/"
echo "   - app/(features)/appointments/"
echo ""
echo "4. Remove duplicate app/components folder:"
echo "   - rm -r app/components"
echo ""
echo "5. Copy any unique components to root components/"
echo ""

# Step 2: Update image names to follow conventions
echo -e "${YELLOW}Optional: Rename files to follow conventions${NC}"
echo ""
echo "Current lowercase files (consider renaming):"
ls -la components/ | grep "^-" | awk '{print $NF}' | tr '[:lower:]' '[:upper:]' | grep "\.tsx$" || true
echo ""

# Step 3: Check for imports that need updating
echo "✅ Checking for imports that use relative paths..."
echo ""

# Count files with relative imports (this is just informational)
RELATIVE_IMPORTS=$(grep -r "from \"\.\./" app components --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || true)

if [ "$RELATIVE_IMPORTS" -gt 0 ]; then
    echo -e "${YELLOW}Found ${RELATIVE_IMPORTS} potential relative import issues${NC}"
    echo "Consider using @/ path aliases instead"
    echo ""
fi

# Final steps
echo -e "${GREEN}✅ Automatic repairs completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Complete the manual steps listed above"
echo "2. Run: npm run build"
echo "3. Run: npm run dev"
echo ""
echo "For more details, see NEXT_JS_REPAIR_GUIDE.md"
