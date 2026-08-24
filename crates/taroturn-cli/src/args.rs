use clap::{Args, Parser, Subcommand, ValueEnum};

#[derive(Parser, Debug)]
#[command(name = "taroturn")]
#[command(author = "Taroturn Engineering Team")]
#[command(version = "0.1.0")]
#[command(about = "Zen-grade, deterministic Tarot divination microkernel and terminal inspector", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Perform an interactive card draw and spread divination
    Draw(DrawArgs),

    /// Replay and interpret a deterministic reading from seed and spread
    Interpret(InterpretArgs),

    /// List all built-in and canonical spreads
    ListSpreads,

    /// Inspect the 78-card catalog and archetypes
    ListCards(ListCardsArgs),
}

#[derive(Args, Debug)]
pub struct DrawArgs {
    /// Spread identifier (e.g. daily_single, three_cards_time, holy_triangle, four_elements, two_choices, hexagram_7, celtic_cross)
    #[arg(default_value = "three_cards_time")]
    pub spread: String,

    /// User question or contemplation focus
    #[arg(short, long)]
    pub question: Option<String>,

    /// Reversal rate between 0.0 (no reversals) and 1.0 (all reversed). Default 0.5.
    #[arg(short, long, default_value_t = 0.5)]
    pub reversal_rate: f32,

    /// Explicit 64-char Hex seed for deterministic replay
    #[arg(short, long)]
    pub seed: Option<String>,

    /// Perform desktop AI interpretation via AGY CLI
    #[arg(long)]
    pub ai: bool,

    /// AI provider (e.g. agy)
    #[arg(long, default_value = "agy")]
    pub provider: String,
}

#[derive(Args, Debug)]
pub struct InterpretArgs {
    /// Spread identifier
    #[arg(short, long, default_value = "three_cards_time")]
    pub spread: String,

    /// 64-character Hex seed of the reading
    #[arg(short, long)]
    pub seed: String,

    /// User question or contemplation focus
    #[arg(short, long)]
    pub question: Option<String>,

    /// Reversal rate used during draw (default 0.5)
    #[arg(short, long, default_value_t = 0.5)]
    pub reversal_rate: f32,

    /// Output format
    #[arg(short, long, value_enum, default_value_t = OutputFormat::Ansi)]
    pub format: OutputFormat,

    /// Perform desktop AI interpretation via AGY CLI
    #[arg(long)]
    pub ai: bool,

    /// AI provider (e.g. agy)
    #[arg(long, default_value = "agy")]
    pub provider: String,
}

#[derive(Args, Debug)]
pub struct ListCardsArgs {
    /// Filter by suit (wands, cups, swords, pentacles)
    #[arg(short, long)]
    pub suit: Option<String>,

    /// Filter to Major Arcana only
    #[arg(short, long)]
    pub major: bool,
}

#[derive(ValueEnum, Clone, Copy, Debug, PartialEq, Eq)]
pub enum OutputFormat {
    Ansi,
    Json,
    Markdown,
}
