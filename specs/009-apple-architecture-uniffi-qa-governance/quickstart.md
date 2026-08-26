# Quickstart: Apple Governance & Test Verification Guide

- **Feature ID**: `009-apple-architecture-uniffi-qa-governance`

---

## 1. Verification Commands

### Step 1: 验证唯一 SSOT 与构建
```bash
# 验证 Sources 目录已不存在且单点构建成功
ls apps/taroturn-apple/Sources # 预期: No such file or directory
swift build --package-path apps/taroturn-apple # 预期: Build complete! (0 warnings)
```

### Step 2: 验证测试套件与无 Darwin 26.0 警告
```bash
# 验证 UniFFI 测试全部通过且无版本冲突警告
swift test --package-path apps/taroturn-apple/Packages/TaroturnCorePackage
```
