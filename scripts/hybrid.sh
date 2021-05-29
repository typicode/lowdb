#!/bin/bash

# $1 = folder name
# $2 = package type
function create_package_json() {
cat > lib/$1/package.json << EOF
{
  "type": "$2"
}
EOF
}

create_package_json cjs commonjs
create_package_json esm module
