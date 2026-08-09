// Plasma Pixel — design tokens (generated from tokens.json)
// Do not edit by hand; edit tokens.json and regenerate.

import SwiftUI

public enum PP {

    public enum Palette {
    static let void = Color(red: 0.0196, green: 0.0000, blue: 0.0549) // #05000E
    static let panel = Color(red: 0.0431, green: 0.0000, blue: 0.0941) // #0B0018
    static let border = Color(red: 0.1647, green: 0.1216, blue: 0.2667) // #2A1F44
    static let borderSoft = Color(red: 0.2275, green: 0.1725, blue: 0.3686) // #3A2C5E
    static let cyan = Color(red: 0.4980, green: 0.9765, blue: 1.0000) // #7FF9FF
    static let magenta = Color(red: 1.0000, green: 0.1765, blue: 0.4353) // #FF2D6F
    static let yellow = Color(red: 1.0000, green: 0.9020, blue: 0.0000) // #FFE600
    static let violet = Color(red: 0.6471, green: 0.4196, blue: 1.0000) // #A56BFF
    static let green = Color(red: 0.2157, green: 0.9608, blue: 0.6275) // #37F5A0
    static let orange = Color(red: 1.0000, green: 0.5412, blue: 0.0000) // #FF8A00
    static let textPrimary = Color(red: 0.9059, green: 0.8863, blue: 0.9608) // #E7E2F5
    static let textSecondary = Color(red: 0.5569, green: 0.5255, blue: 0.6588) // #8E86A8
    static let textTertiary = Color(red: 0.3686, green: 0.3333, blue: 0.5020) // #5E5580
    static let ultraAction = Color(red: 1.0000, green: 0.4784, blue: 0.1020) // #FF7A1A
    }

    /// The single gradient definition. First and last stop are identical so the
    /// tile is seamless when repeated. Do not change the locations.
    public static let gradientStops: [Gradient.Stop] = [
        .init(color: Palette.magenta, location: 0.00),
        .init(color: Palette.orange,  location: 0.17),
        .init(color: Palette.yellow,  location: 0.34),
        .init(color: Palette.green,   location: 0.50),
        .init(color: Palette.cyan,    location: 0.67),
        .init(color: Palette.violet,  location: 0.84),
        .init(color: Palette.magenta, location: 1.00),
    ]

    public enum Motion {
        /// Gradient travel speed. Constant across every surface.
        public static let pixelsPerSecond: Double = 10
        /// Tile height = 1.6 x rendered text block height.
        public static let tileRatio: Double = 1.6
        /// Below this the drift reads as flicker.
        public static let minDuration: Double = 3.0
        public static let ghostCycle: Double = 2.1
        public static let ghostPhaseOffset: Double = -1.05
        public static let ghostOpacity: Double = 0.75
        public static let skewDegrees: Double = -2.5
        public static let skewCycle: Double = 3.4
        /// Frames are not text: 1.6x does not apply.
        public static let frameTile: CGFloat = 58
        public static let frameDuration: Double = 5.8

        public static func tile(for size: CGFloat) -> CGFloat { (size * 1.6).rounded() }
        public static func duration(for tile: CGFloat) -> Double { Double(tile) / pixelsPerSecond }
        public static func ghostOffset(for size: CGFloat) -> CGFloat { max(1, (size / 16).rounded()) }

        /// Shared-field delay so a group of bars reads as one sheet of gradient.
        public static func sharedFieldDelay(containerHeight H: CGFloat, elementHeight h: CGFloat,
                                            tile T: CGFloat, duration D: Double) -> Double {
            -Double(((H - h).truncatingRemainder(dividingBy: T)) / T) * D
        }
    }

    public enum Shape {
        public static let radius: CGFloat = 0
        public static let popoverRadius: CGFloat = 12
        public static let chromeBorder: CGFloat = 1
        public static let hierarchyBorder: CGFloat = 2
        public static let spacing: [CGFloat] = [4,6,7,8,9,10,11,12,14,16,18,20,22,24,26]
    }

    public enum Typeface {
        public static let display = "Silkscreen"      // 400 / 700 — numbers, labels, marks
        public static let prose = "IBMPlexMono"       // 400 / 600 — anything read word by word
        public static let displayFloorMac: CGFloat = 8
        public static let displayFloorWatch: CGFloat = 8.5
        public static let proseFloor: CGFloat = 10
    }

    public enum AlertRule: String, CaseIterable {
        case wholeDollar, lowBalance, spike, dailySummary
        public var color: Color {
            switch self {
            case .wholeDollar:  return Palette.cyan
            case .lowBalance:   return Palette.yellow
            case .spike:        return Palette.magenta
            case .dailySummary: return Palette.violet
            }
        }
    }
}
