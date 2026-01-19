#!/bin/bash
# Script om alle TODO stubs in de codebase te vinden
# Gebruik: ./scripts/list-todos.sh

echo "=============================================="
echo "TODO STUBS IN HUGOHERBOTS.AI CODEBASE"
echo "=============================================="
echo ""

echo "=== HOOFD TODO's (afgebakende taken) ==="
grep -rn "TODO:" server/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -E "^\s*\*?\s*TODO: [A-Z]" | \
  sed 's/.*TODO:/TODO:/' | \
  sort -u

echo ""
echo "=== ALLE TODO's per bestand ==="
echo ""

for file in $(grep -rl "TODO:" server/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null | sort -u); do
  count=$(grep -c "TODO:" "$file" 2>/dev/null || echo 0)
  if [ "$count" -gt 0 ]; then
    echo "📄 $file ($count TODO's)"
    grep -n "TODO:" "$file" 2>/dev/null | head -5 | sed 's/^/   /'
    if [ "$count" -gt 5 ]; then
      echo "   ... en $(($count - 5)) meer"
    fi
    echo ""
  fi
done

echo "=============================================="
echo "Totaal aantal TODO's: $(grep -r "TODO:" server/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)"
echo "=============================================="
