#!/usr/bin/env sh
# Regenerates the standalone preview page (index.html) from the WordPress
# fragment (embed.html). embed.html is the single source of truth.
set -e
cd "$(dirname "$0")"

{
  cat <<'HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Type-Test Programme — 28 Scenarios</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  html{background:#fff}
  body{margin:0;padding:40px 20px 64px;background:#fff;color:#3d3d3d}
</style>
</head>
<body>

<!-- ============================================================
     GENERATED FILE — do not edit.
     Edit embed.html and run ./build.sh to regenerate.
     ============================================================ -->

HEAD

  cat embed.html

  cat <<'FOOT'

</body>
</html>
FOOT
} > index.html

echo "index.html regenerated from embed.html"
