// ReadingArtCardExporter.swift - Apple SwiftUI ImageRenderer 300DPI Exporter
import SwiftUI
import TaroturnCore

#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

public struct ReadingArtCardView: View {
    let session: ReadingSession

    public init(session: ReadingSession) {
        self.session = session
    }

    public var body: some View {
        VStack(spacing: 20) {
            Text("TAROTURN SANCTUARY")
                .font(.headline)
                .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))

            Text("牌阵: \(session.spreadId)")
                .font(.title3.bold())
                .foregroundStyle(.white)

            if let q = session.question {
                Text("议题: \(q)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Text("主导能量: \(session.dignitySummary.dominantElement)")
                .font(.headline)
                .foregroundStyle(Color.green)

            Text("种子指纹: \(session.rngSeed.prefix(24))...")
                .font(.caption2.monospaced())
                .foregroundStyle(.secondary)
        }
        .padding(32)
        .frame(width: 360, height: 540)
        .background(Color(red: 0.06, green: 0.03, blue: 0.12))
        .overlay {
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(Color(red: 0.85, green: 0.70, blue: 0.30), lineWidth: 2)
        }
    }
}

@MainActor
public struct ReadingArtCardExporter {
    #if os(iOS)
    public static func renderToImage(session: ReadingSession) -> UIImage? {
        let cardView = ReadingArtCardView(session: session)
        let renderer = ImageRenderer(content: cardView)
        renderer.scale = 3.0 // 3x Super-sampling
        return renderer.uiImage
    }
    #elseif os(macOS)
    public static func renderToImage(session: ReadingSession) -> NSImage? {
        let cardView = ReadingArtCardView(session: session)
        let renderer = ImageRenderer(content: cardView)
        renderer.scale = 3.0
        return renderer.nsImage
    }
    #endif
}
