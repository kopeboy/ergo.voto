#!/bin/bash

# Load environment variables
export VITE_DIRECTUS_URL="http://localhost:8055"

# Run the seed script
npx tsx scripts/seed_test_data.ts
