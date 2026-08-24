//! Design Tokens adhering strictly to TTZip Zen / WSJ Editorial / Kintsugi Gold Architecture.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RgbColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl RgbColor {
    pub const fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }

    pub fn to_hex(&self) -> String {
        format!("#{:02X}{:02X}{:02X}", self.r, self.g, self.b)
    }

    pub fn to_ansi_fg(&self) -> colored::CustomColor {
        colored::CustomColor::new(self.r, self.g, self.b)
    }
}

pub struct TaroturnTheme;

impl TaroturnTheme {
    /// Kintsugi Gold: #D4AF37 (212, 175, 55) - Highlights, Golden Rules, Pro Badges
    pub const KINTSUGI_GOLD: RgbColor = RgbColor::new(212, 175, 55);

    /// Bamboo Green: #2E8B57 (46, 139, 87) - Action Confirmation, Elemental Growth, Sync Success
    pub const BAMBOO_GREEN: RgbColor = RgbColor::new(46, 139, 87);

    /// Cinnabar Red: #C84B31 (200, 75, 49) - Reversed Alerts, Destructive Operations
    pub const CINNABAR_RED: RgbColor = RgbColor::new(200, 75, 49);

    /// Deep Graphite: #1C1C1E (28, 28, 30) - Dark Canvas & Sidebar Background
    pub const DEEP_GRAPHITE: RgbColor = RgbColor::new(28, 28, 30);

    /// Ink Black: #0B0B0C (11, 11, 12) - Zen Night Mode Background
    pub const INK_BLACK: RgbColor = RgbColor::new(11, 11, 12);

    /// Washi Paper: #FBFBFD (251, 251, 253) - Light Mode Canvas
    pub const WASHI_PAPER: RgbColor = RgbColor::new(251, 251, 253);

    /// Standard Header Bar Height (pt)
    pub const HEADER_BAR_HEIGHT_PT: f32 = 52.0;

    /// Golden Rule Line Y-Axis Alignment (pt)
    pub const GOLDEN_RULE_Y_ALIGN_PT: f32 = 90.0;

    /// Floating Glass Island Corner Radius (pt)
    pub const GLASS_ISLAND_CORNER_RADIUS_PT: f32 = 16.0;

    /// Hairline Border Width (pt)
    pub const HAIRLINE_BORDER_WIDTH_PT: f32 = 0.8;
}
