#!/usr/bin/env bash
# set.sh – fixes OAuth flow in routes/auth.js
set -euo pipefail

FILE="routes/auth.js"
STAMP=$(date +"%Y%m%d%H%M%S")

if [[ ! -f "$FILE" ]]; then
  echo "❌ $FILE not found. Are you in the backend folder?"
  exit 1
fi

cp "$FILE" "${FILE}.bak-$STAMP"
echo "🗄️  Backup => ${FILE}.bak-$STAMP"

# Insert qsBase helper once
awk '
  /const { tokens } = await client\.getToken/ && !done {
    print;
    print "    const qsBase = (data) => new URLSearchParams(data).toString();";
    done=1; next
  }1' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

# Remove userinfo.get() call that fails if token not attached
perl -0777 -i -pe 's#// Get user profile[\\s\\S]*?userinfo.get.*?;
