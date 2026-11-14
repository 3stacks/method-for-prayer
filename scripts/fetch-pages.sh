#!/bin/sh
# Downloads the page images of the scan to source/pages/ (not in git), for proofreading.
#   sh scripts/fetch-pages.sh [first leaf] [last leaf]
# A leaf is a page of the scan, from 1 (see source/pages.txt). The script asks for
# two images a second at most, and skips an image that is already there.
cd "$(dirname "$0")/.." || exit 1
mkdir -p source/pages
first=${1:-9}
last=${2:-277}
leaf=$first
while [ "$leaf" -le "$last" ]; do
  n=$((leaf - 1))
  f="source/pages/n$n.jpg"
  if [ ! -s "$f" ]; then
    curl -sfL -o "$f" "https://archive.org/download/methodforprayerw0000henr/page/n${n}_w800.jpg" || echo "failed: leaf $leaf"
    sleep 0.5
  fi
  leaf=$((leaf + 1))
done
