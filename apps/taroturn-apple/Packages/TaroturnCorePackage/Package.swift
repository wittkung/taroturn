// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "TaroturnCorePackage",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "TaroturnCore",
            targets: ["TaroturnCore"]
        ),
    ],
    targets: [
        .binaryTarget(
            name: "TaroturnCoreFFI",
            path: "Frameworks/TaroturnCoreFFI.xcframework"
        ),
        .target(
            name: "TaroturnCore",
            dependencies: [
                .target(name: "TaroturnCoreFFI")
            ],
            path: "Sources/TaroturnCore",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency")
            ]
        ),
        .testTarget(
            name: "TaroturnCoreTests",
            dependencies: ["TaroturnCore"],
            path: "Tests/TaroturnCoreTests"
        )
    ]
)
