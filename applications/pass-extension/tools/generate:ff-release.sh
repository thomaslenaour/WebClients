#!/usr/bin/env bash

# FIREFOX RELEASE GENERATOR
# This shell script is responsible for building the
# Pass firefox add-on and creating the necessary source
# files required for the AMO reviewers to re-build the
# extension. It will create the release and do a checksum
# integrity check by comparing a temporary build created
# from the reviewable sources to the released build.
# https://extensionworkshop.com/documentation/publish/source-code-submission/

OUT="$1"
BRANCH="$2"
COMMIT="$3"

# fallback to current commit if none specified
# fallback to pass-extension branch if none specified
if [ -z "$OUT" ]; then
    echo "usage $0 /tmp/out/dir {branch-name} {commit-hash}"
    exit 0
fi

# fallback to current commit if none specified
# fallback to pass-extension branch if none specified
if [ -z "$BRANCH" ]; then
    BRANCH="pass-extension"
fi

if [ -z "$COMMIT" ]; then
    COMMIT=$(git rev-parse --short HEAD)
fi

ORIGIN=$(git remote get-url origin)
CLONE_DEPTH=50
VERSION=$(cat ./manifest-firefox.json | jq -r .version)
BUILD_ID="ProtonPass-${VERSION}-${COMMIT}-FF"

mkdir -p $OUT/$BUILD_ID
OUT_DIR=$(realpath $OUT)
SOURCE_DIR=$(realpath .)
TARGET_DIR=$(realpath "$OUT/$BUILD_ID")

IGNORE=(
    .git
    .github
    .gitlab
    .gitlab-ci.yml
    .husky
    .publishignore
    ACTIONS.md
    ci
    utilities
    tests
    applications/account
    applications/admin
    applications/calendar
    applications/drive
    applications/mail
    applications/storybook
    applications/verify
    applications/vpn-settings
    packages/config
    sonar-project.properties
)

# delete target directory if already exists
if [ -d "$TARGET_DIR" ]; then
    rm -Rf "$TARGET_DIR"
fi

# Build and zip release for FF
echo "📄 Generating release for $BUILD_ID"
NODE_ENV=production BUILD_TARGET=firefox yarn run build >/dev/null
echo "  ↳ Built production release [BUILD_TARGET=firefox]"
(cd dist && zip -vr $OUT_DIR/$BUILD_ID.zip * -x "*.DS_Store" >/dev/null)
echo "  ↳ Compressed release : \"$OUT_DIR/$BUILD_ID.zip\""

# Clone monorepo
# Git clone depth is set to CLONE_DEPTH=50 to
# speed up download. If the commit hash for the
# release is older : increase the value
echo "🧬 Cloning monorepo on branch $BRANCH..."
git clone -b $BRANCH --depth $CLONE_DEPTH --single-branch $ORIGIN $TARGET_DIR --quiet || exit 1
echo "  ↳ Cloned to \"${TARGET_DIR}\""
cd $TARGET_DIR

# Checkout the to commit hash
git checkout ${COMMIT} --quiet || exit 1
echo "  ↳ Checked out to \"${COMMIT}\""

# Filter out repo for firefox reviewers
# create a minimal working monorepo with
# only the files required to build Pass
echo "🧹 Filtering repo for reviewers..."
for ignore in "${IGNORE[@]}"; do
    if [ -d "${ignore}/" ]; then
        rm -rf "$ignore" || true
    else
        rm -f "$ignore" || true
    fi
    echo "  ↳ Removed \"${ignore}\""
done

echo "🔍 Verifying build $BUILD_ID integrity..."
# install node_modules
yarn >/dev/null
echo "  ↳ Installed dependencies"

# Re-build firefox release from source :
# copy the config used for building the production
# release to the firefox release sources.
cd "applications/pass-extension"
yarn run config
cp $SOURCE_DIR/src/app/config.ts ./src/app/config.ff-release.ts
echo "  ↳ Created config.ff-release.ts"
yarn run build:ff >/dev/null
echo "  ↳ $BUILD_ID successfuly built from reviewable sources"

CHECKSUM_SOURCE=$(find -s "$SOURCE_DIR/dist" -type f ! -name ".DS_Store" -exec openssl md5 {} \; | awk '{ print $2 }' | openssl md5)
CHECKSUM_TARGET=$(find -s "./dist" -type f ! -name ".DS_Store" -exec openssl md5 {} \; | awk '{ print $2 }' | openssl md5)

echo "  ↳ checksum source : \"$CHECKSUM_SOURCE\""
echo "  ↳ checksum target : \"$CHECKSUM_TARGET\""

if [ "$CHECKSUM_SOURCE" == "$CHECKSUM_TARGET" ]; then
    # remove node_modules
    (cd $TARGET_DIR && rm -rf $(find . -type d -name node_modules))

    # remove dist from sources
    (cd $TARGET_DIR/applications/pass-extension && rm -rf dist)
    echo "✅ Checksums matched"

    # zip final source files
    (cd $OUT_DIR && zip -vr $OUT_DIR/$BUILD_ID-sources.zip $BUILD_ID/* -x "*.DS_Store" >/dev/null)

    echo "  ↳ ready to submit for review :"
    echo "  ↳ $OUT_DIR/$BUILD_ID.zip"
    echo "  ↳ $OUT_DIR/$BUILD_ID-sources.zip"
else
    echo "⛔️ Checksums do not match"
    echo "  ↳ fix conflicts before submitting for review"
fi
