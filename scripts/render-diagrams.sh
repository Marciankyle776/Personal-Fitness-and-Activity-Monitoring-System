#!/bin/sh
# Renders every docs/diagrams/src/*.dot to SVG and PNG in docs/diagrams/rendered/.
# Requires Graphviz (https://graphviz.org): `dot -V`. Edit the .dot files, never the rendered images.
set -e
cd "$(dirname "$0")/.."
mkdir -p docs/diagrams/rendered
for f in docs/diagrams/src/*.dot; do
  name=$(basename "$f" .dot)
  dot -Tsvg "$f" -o "docs/diagrams/rendered/$name.svg"
  dot -Tpng -Gdpi=130 "$f" -o "docs/diagrams/rendered/$name.png"
  echo "rendered $name"
done
