#!/bin/bash
VERSION="1.0.3-test"
PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

if [ -z "$PREV_TAG" ]; then
  LOG=$(git log --pretty=format:"--ENTRY--%n%B")
else
  LOG=$(git log "$PREV_TAG"..HEAD --pretty=format:"--ENTRY--%n%B")
fi

echo "## $VERSION"
echo ""

echo "$LOG" | awk '
  BEGIN { entry = "" }
  /^--ENTRY--/ {
    if (entry != "") {
      print "- " entry
    }
    entry = ""
    next
  }
  {
    if (entry != "") entry = entry $0
    else entry = $0
  }
  END {
    if (entry != "") {
      print "- " entry
    }
  }
'
