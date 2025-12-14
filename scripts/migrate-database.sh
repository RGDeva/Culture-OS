#!/bin/bash

# Database Migration Script
# Safely migrates from existing schema to extended schema with new features

set -e

echo "🔄 NoCulture OS - Database Migration"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if schema-extended.prisma exists
if [ ! -f "prisma/schema-extended.prisma" ]; then
    echo -e "${RED}✗ schema-extended.prisma not found${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will update your database schema${NC}"
echo ""
echo "New features being added:"
echo "  - Stem Separation (vocals, drums, bass, other)"
echo "  - DSP Distribution (Spotify, Apple Music, etc.)"
echo "  - Marketplace & Bookings"
echo "  - Platform Integrations"
echo "  - Enhanced User profiles"
echo ""
echo -e "${YELLOW}Backup your database before proceeding!${NC}"
echo ""
read -p "Continue with migration? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Step 1: Backing up current schema..."
cp prisma/schema.prisma prisma/schema.backup.prisma
echo -e "${GREEN}✓ Backup created: prisma/schema.backup.prisma${NC}"

echo ""
echo "Step 2: Replacing schema with extended version..."
cp prisma/schema-extended.prisma prisma/schema.prisma
echo -e "${GREEN}✓ Schema updated${NC}"

echo ""
echo "Step 3: Generating Prisma client..."
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

echo ""
echo "Step 4: Creating migration..."
echo -e "${YELLOW}You'll be prompted to name this migration${NC}"
npx prisma migrate dev --name add_stem_separation_and_marketplace

echo ""
echo -e "${GREEN}✓ Migration complete!${NC}"
echo ""
echo "New database models available:"
echo "  - Asset (vault files)"
echo "  - Project (organize assets)"
echo "  - AssetAnalysis (AI analysis results)"
echo "  - StemSeparation & Stem (stem splitting)"
echo "  - Distribution (DSP distribution)"
echo "  - Booking (service bookings)"
echo "  - Review (ratings & reviews)"
echo "  - PlatformIntegration (Dreamster, etc.)"
echo "  - Notification (user notifications)"
echo ""
echo "To rollback if needed:"
echo "  1. cp prisma/schema.backup.prisma prisma/schema.prisma"
echo "  2. npx prisma migrate dev"
echo ""
echo -e "${GREEN}Database is ready! Start the platform with: npm run dev${NC}"
