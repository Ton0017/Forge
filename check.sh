#!/bin/bash
cd ~/mine
echo "=== ПРОВЕРКА СИНТАКСИСА ==="
for file in core.js bootstrap.js loader.js mods/*.js; do
  if [ -f "$file" ]; then
    error=$(node --check "$file" 2>&1)
    if [ -z "$error" ]; then
      lines=$(wc -l < "$file")
      echo "✅ OK: $file ($lines строк)"
    else
      echo "❌ ОШИБКА В: $file"
      echo "$error"
    fi
  fi
done
echo "=== ПРОВЕРКА ЗАВЕРШЕНА ==="
