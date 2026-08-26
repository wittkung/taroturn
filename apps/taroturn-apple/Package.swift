// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "TaroturnApp",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    products: [
        .executable(name: "Taroturn", targets: ["TaroturnApp"])
    ],
    dependencies: [
        .package(path: "Packages/TaroturnCorePackage")
    ],
    targets: [
        .target(
            name: "TaroturnShared",
            dependencies: [
                .product(name: "TaroturnCore", package: "TaroturnCorePackage")
            ],
            path: "Shared",
            exclude: [
                "TaroturnShared.entitlements",
                "Info.plist"
            ],
            resources: [
                .process("Resources"),
                .process("Infrastructure/Background/FluidBackground.metal")
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency")
            ]
        ),
        .executableTarget(
            name: "TaroturnApp",
            dependencies: [
                "TaroturnShared",
                .product(name: "TaroturnCore", package: "TaroturnCorePackage")
            ],
            path: "macOS",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency")
            ],
            linkerSettings: [
                .unsafeFlags(["-Xlinker", "-w"])
            ]
        )
    ]
)
