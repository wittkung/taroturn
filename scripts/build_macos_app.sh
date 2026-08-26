#!/usr/bin/env bash
set -e

export MACOSX_DEPLOYMENT_TARGET=14.0
export RUSTFLAGS="-C link-arg=-mmacosx-version-min=14.0"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
APPLE_APP_DIR="$PROJECT_ROOT/apps/taroturn-apple"

SHOULD_OPEN=false
for arg in "$@"; do
    if [ "$arg" == "--open" ] || [ "$arg" == "-o" ]; then
        SHOULD_OPEN=true
    fi
done

echo "============================================================"
echo "  🔮 构建 Taroturn macOS 原生应用程序 (Taroturn.app)"
echo "  架构: 纯 Rust 微内核 (taroturn-core) + Swift 6 原生 App"
echo "============================================================"

# 0. 终止运行中的旧实例并自动清理系统与构建目录中的旧版本 Taroturn.app
echo ">>> [0/5] 终止旧实例并清理历史构建目录..."
killall Taroturn 2>/dev/null || true
pkill -9 -x Taroturn 2>/dev/null || true
pkill -9 -f "Taroturn.app" 2>/dev/null || true
pkill -9 -f "taroturn-cli" 2>/dev/null || true
pkill -9 -f "taroturn-server" 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
sleep 0.3

LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister"

OLD_APP_LOCATIONS=(
    "$APPLE_APP_DIR/build/Release/Taroturn.app"
    "$APPLE_APP_DIR/build/Debug/Taroturn.app"
    "$PROJECT_ROOT/build/Taroturn.app"
    "$HOME/Desktop/Taroturn.app"
    "$HOME/Applications/Taroturn.app"
)

for old_app in "${OLD_APP_LOCATIONS[@]}"; do
    if [ -d "$old_app" ]; then
        echo "  🧹 发现并自动注销/清理旧版本: $old_app"
        $LSREGISTER -u "$old_app" 2>/dev/null || true
        rm -rf "$old_app"
    fi
done

# 1. 编译 Rust 微内核与独立 CLI
echo ">>> [1/5] 编译 Rust 算法内核与独立 CLI (taroturn-core, taroturn-cli)..."
cd "$PROJECT_ROOT"
if command -v cargo &> /dev/null; then
    cargo build --release -p taroturn-core -p taroturn-cli
    mkdir -p "$PROJECT_ROOT/build"
    cp -f "$PROJECT_ROOT/target/release/taroturn-cli" "$PROJECT_ROOT/build/taroturn-cli" 2>/dev/null || true
fi

# 2. 生成并配置 UniFFI XCFramework
echo ">>> [2/5] 校验并打包 UniFFI XCFramework..."
bash "$PROJECT_ROOT/scripts/build_apple_xcframework.sh"

# 同步最新 Shared 与 macOS 源码到 SPM 目录
mkdir -p "$APPLE_APP_DIR/Sources/TaroturnShared"
mkdir -p "$APPLE_APP_DIR/Sources/TaroturnApp"
cp -R "$APPLE_APP_DIR/Shared/"* "$APPLE_APP_DIR/Sources/TaroturnShared/"
cp -R "$APPLE_APP_DIR/macOS/"* "$APPLE_APP_DIR/Sources/TaroturnApp/"

# 3. 编译 Swift 6 原生宿主程序 (SPM Release)
echo ">>> [3/5] 编译 Swift 6 原生宿主程序 (SPM Release)..."
cd "$APPLE_APP_DIR"
swift build -c release

BUILD_DIR="$APPLE_APP_DIR/build/Release"
mkdir -p "$BUILD_DIR"

EXECUTABLE_PATH=""
if [ -f "$APPLE_APP_DIR/.build/arm64-apple-macosx/release/Taroturn" ]; then
    EXECUTABLE_PATH="$APPLE_APP_DIR/.build/arm64-apple-macosx/release/Taroturn"
elif [ -f "$APPLE_APP_DIR/.build/release/Taroturn" ]; then
    EXECUTABLE_PATH="$APPLE_APP_DIR/.build/release/Taroturn"
else
    EXECUTABLE_PATH="$(find "$APPLE_APP_DIR/.build" -type f -name "Taroturn" -perm +111 | head -n 1)"
fi

if [ -z "$EXECUTABLE_PATH" ] || [ ! -f "$EXECUTABLE_PATH" ]; then
    echo "❌ 错误: 未找到编译后的 Taroturn 二进制文件！"
    exit 1
fi

cp -f "$EXECUTABLE_PATH" "$BUILD_DIR/Taroturn"
chmod +x "$BUILD_DIR/Taroturn"

# 4. 组装标准 macOS .app Bundle 目录结构
echo ">>> [4/5] 组装 Taroturn.app Bundle..."
APP_BUNDLE="$BUILD_DIR/Taroturn.app"
rm -rf "$APP_BUNDLE"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

cp -f "$BUILD_DIR/Taroturn" "$APP_BUNDLE/Contents/MacOS/Taroturn"
chmod +x "$APP_BUNDLE/Contents/MacOS/Taroturn"

# 嵌入独立 CLI 二进制 (命名为 taroturn-cli)
if [ -f "$PROJECT_ROOT/target/release/taroturn-cli" ]; then
    cp -f "$PROJECT_ROOT/target/release/taroturn-cli" "$APP_BUNDLE/Contents/MacOS/taroturn-cli"
    chmod +x "$APP_BUNDLE/Contents/MacOS/taroturn-cli"
elif [ -f "$PROJECT_ROOT/build/taroturn-cli" ]; then
    cp -f "$PROJECT_ROOT/build/taroturn-cli" "$APP_BUNDLE/Contents/MacOS/taroturn-cli"
    chmod +x "$APP_BUNDLE/Contents/MacOS/taroturn-cli"
fi

if [ -f "$APPLE_APP_DIR/Shared/Info.plist" ]; then
    cp -f "$APPLE_APP_DIR/Shared/Info.plist" "$APP_BUNDLE/Contents/Info.plist"
fi

# 复制触觉与资源
if [ -d "$APPLE_APP_DIR/Shared/Resources" ]; then
    cp -R "$APPLE_APP_DIR/Shared/Resources"/* "$APP_BUNDLE/Contents/Resources/"
fi

# 复制 Web 生产构建产物至 Resources/dist (如果存在)
if [ -d "$PROJECT_ROOT/apps/taroturn-app/dist" ]; then
    cp -R "$PROJECT_ROOT/apps/taroturn-app/dist" "$APP_BUNDLE/Contents/Resources/dist"
fi

# 5. 执行 Ad-hoc 签名与系统图标缓存刷新
echo ">>> [5/5] 执行代码签名 (Code Signing) 与 LaunchServices 图标索引刷新..."
codesign --force --deep --sign - "$APP_BUNDLE"

touch "$APP_BUNDLE"
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -f "$APP_BUNDLE" 2>/dev/null || true

echo "============================================================"
echo "  ✅ Taroturn.app 构建成功！"
echo "  产物路径: $APP_BUNDLE"
echo "============================================================"

if [ "$SHOULD_OPEN" = true ] || [ "$AUTO_OPEN" = "1" ]; then
    echo ">>> 正在关闭旧实例并自动启动最新构建的 Taroturn.app..."
    killall Taroturn 2>/dev/null || true
    pkill -9 -x Taroturn 2>/dev/null || true
    pkill -9 -f "Taroturn.app" 2>/dev/null || true
    sleep 0.5
    open "$APP_BUNDLE"
    echo "  🎉 已在桌面呈现最新 Taroturn 客户端窗口！"
fi
