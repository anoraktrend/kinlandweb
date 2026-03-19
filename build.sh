#!/usr/bin/env bash

#------------------------------------------------------------------------------
# @file
# Builds a Hugo site with Webpack and Cloudflare Worker.
#------------------------------------------------------------------------------

main() {

  DART_SASS_VERSION=1.98.0
  HUGO_VERSION=0.157.0
  NODE_VERSION=22.22.1

  export TZ=Europe/Oslo

  # Install Dart Sass
  echo "Installing Dart Sass ${DART_SASS_VERSION}..."
  curl -sLJO "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  mkdir -p "${HOME}/.local/bin"
  tar -C "${HOME}/.local" -xf "dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  rm "dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  export PATH="${HOME}/.local/dart-sass:${PATH}"

  # Install Hugo
  echo "Installing Hugo ${HUGO_VERSION}..."
  curl -sLJO "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
  mkdir -p "${HOME}/.local/hugo"
  tar -C "${HOME}/.local/hugo" -xf "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
  rm "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
  export PATH="${HOME}/.local/hugo:${PATH}"

  # Install Node.js
  echo "Installing Node.js ${NODE_VERSION}..."
  curl -sLJO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz"
  tar -C "${HOME}/.local" -xf "node-v${NODE_VERSION}-linux-x64.tar.xz"
  rm "node-v${NODE_VERSION}-linux-x64.tar.xz"
  export PATH="${HOME}/.local/node-v${NODE_VERSION}-linux-x64/bin:${PATH}"

  # Corepack for Yarn
  echo "Enabling Corepack for Yarn..."
  corepack enable
  corepack prepare yarn@4.13.0 --activate

  # Verify installations
  echo "Verifying installations..."
  echo Dart Sass: "$(sass --version)"
  echo Hugo: "$(hugo version)"
  echo Node.js: "$(node --version)"
  echo Yarn: "$(yarn --version)"

  # Install dependencies
  echo "Installing dependencies..."
  yarn install --immutable

  # Build the site
  echo "Building the site..."
  yarn run build:all

}

set -euo pipefail
main "$@"
