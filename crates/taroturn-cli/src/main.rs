mod args;
mod agy_bridge;
mod interactive;
mod render;

use clap::Parser;
use colored::Colorize;
use taroturn_core::{CardDeck, ReadingSession, Spread, TarotResult};
use taroturn_ui::TaroturnTheme;
use args::{Cli, Commands, OutputFormat};
use agy_bridge::AgyBridge;
use interactive::InteractiveWorkflow;
use render::TerminalRenderer;

fn main() -> TarotResult<()> {
    let cli = Cli::parse();
    let gold = TaroturnTheme::KINTSUGI_GOLD.to_ansi_fg();

    match cli.command {
        Commands::Draw(args) => {
            let session = InteractiveWorkflow::run_draw(
                &args.spread,
                args.question,
                args.reversal_rate,
                args.seed,
            )?;

            if args.ai {
                let _ = AgyBridge::interpret_with_agy(&session);
            }
        }
        Commands::Interpret(args) => {
            let session = ReadingSession::create(
                &args.spread,
                args.question,
                Some(args.seed),
                args.reversal_rate,
            )?;

            match args.format {
                OutputFormat::Ansi => {
                    TerminalRenderer::render_session(&session);
                }
                OutputFormat::Json => {
                    println!("{}", session.to_json()?);
                }
                OutputFormat::Markdown => {
                    let prompt = AgyBridge::build_prompt(&session);
                    println!("{prompt}");
                }
            }

            if args.ai {
                let _ = AgyBridge::interpret_with_agy(&session);
            }
        }
        Commands::ListSpreads => {
            TerminalRenderer::render_header("牌阵图谱", "Canonical Spread Topologies");
            for (idx, spread) in Spread::canonical_spreads().iter().enumerate() {
                println!(
                    "  [{}] {:<20} {:<18} ({} 张牌)",
                    idx + 1,
                    spread.id.bold().custom_color(gold),
                    spread.name_zh,
                    spread.slot_count()
                );
                println!("      {}", spread.description.dimmed());
            }
            println!();
        }
        Commands::ListCards(args) => {
            TerminalRenderer::render_header("卡牌图鉴", "78-Card Rider-Waite-Smith Catalog");
            let deck = CardDeck::standard_78();
            let mut displayed = 0;

            for card in deck {
                if args.major && card.arcana != taroturn_core::ArcanaType::Major {
                    continue;
                }
                if let Some(ref suit_filter) = args.suit {
                    if let Some(suit) = card.suit {
                        if !suit.name_en().eq_ignore_ascii_case(suit_filter) {
                            continue;
                        }
                    } else {
                        continue;
                    }
                }

                println!(
                    "  [#{:02}] {:<24} {:<10} 元素: {}",
                    card.id,
                    card.name_en.bold(),
                    card.name_zh.custom_color(gold),
                    card.element.name_zh()
                );
                displayed += 1;
            }
            println!();
            println!("  共展示 {} 张卡牌。", displayed);
        }
    }

    Ok(())
}
