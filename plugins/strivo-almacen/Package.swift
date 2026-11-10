// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "StrivoAlmacen",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "StrivoAlmacen",
            targets: ["StrivoAlmacenPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "StrivoAlmacenPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/StrivoAlmacenPlugin"),
        .testTarget(
            name: "StrivoAlmacenPluginTests",
            dependencies: [
                "StrivoAlmacenPlugin",
                .product(name: "Capacitor", package: "capacitor-swift-pm")
            ],
            path: "ios/Tests/StrivoAlmacenPluginTests")
    ]
)
