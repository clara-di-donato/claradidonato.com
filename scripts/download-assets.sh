#!/usr/bin/env bash
# Downloads every photo/file listed in scripts/assets.txt that isn't in the repo yet.
# Safe to run as often as you like: files that already exist are skipped.
set -euo pipefail
cd "$(dirname "$0")/.."

missing=0
failed=0
while read -r path url; do
  [[ -z "${path:-}" || "$path" == \#* ]] && continue
  if [[ -s "$path" ]]; then continue; fi
  missing=$((missing + 1))
  mkdir -p "$(dirname "$path")"
  echo "Downloading $path"
  if ! curl -fsSL --retry 3 -H "Accept: image/jpeg,image/png,image/gif,application/pdf,*/*;q=0.1" -o "$path" "$url"; then
    echo "  !! could not download $url" >&2
    rm -f "$path"
    failed=$((failed + 1))
  fi
done < scripts/assets.txt

echo "Done: $missing missing, $failed failed."
[[ $failed -eq 0 ]]
