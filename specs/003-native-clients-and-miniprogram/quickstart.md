# Quickstart & Verification Guide: Native Clients & WeChat Mini Program

- **Feature ID**: `003-native-clients-and-miniprogram`
- **Specification**: [spec.md](./spec.md)
- **Status**: `READY FOR IMPLEMENTATION`

---

## 1. Prerequisites

1. **Rust Toolchain (with Apple Targets)**:
   ```bash
   rustup target add aarch64-apple-darwin x86_64-apple-darwin
   rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios-sim
   ```
2. **Node.js 20+ & WeChat Developer Tools**:
   ```bash
   node --version # >= 20.0.0
   ```
3. **Xcode 15+ / Swift 6**:
   ```bash
   swift --version # Swift 6.0+
   ```

---

## 2. Verification Scenarios

### Scenario 1: Apple UniFFI XCFramework Packaging & Swift 6 Test
```bash
# Build Universal XCFramework for macOS & iOS
bash scripts/build_apple_xcframework.sh

# Run Swift Package tests with Strict Concurrency
cd apps/taroturn-apple/Packages/TaroturnCorePackage
swift test
```

### Scenario 2: WeChat Mini Program Build & Package Inspection
```bash
cd apps/taroturn-miniprogram
npm install
npm run build

# Verify main package size (< 1.5MB budget)
ls -lh dist/
```

### Scenario 3: Cross-Platform Parity Verification
```bash
# Verify identical seed produces identical card outputs across all platforms
cargo test --test cross_platform_seed_test
```
