use colored::Colorize;
use taroturn_core::{CardDeck, ReadingSession, Spread};
use taroturn_ui::TaroturnTheme;

pub struct TerminalRenderer;

impl TerminalRenderer {
    pub fn render_header(title: &str, subtitle: &str) {
        let gold = TaroturnTheme::KINTSUGI_GOLD.to_ansi_fg();
        let bamboo = TaroturnTheme::BAMBOO_GREEN.to_ansi_fg();

        println!();
        println!(
            "{}",
            "╔══════════════════════════════════════════════════════════════════════════════╗"
                .custom_color(gold)
        );
        println!(
            "{}  {:^72}  {}",
            "║".custom_color(gold),
            format!("TAROTURN :: {title}").bold().custom_color(gold),
            "║".custom_color(gold)
        );
        println!(
            "{}  {:^72}  {}",
            "║".custom_color(gold),
            subtitle.italic().custom_color(bamboo),
            "║".custom_color(gold)
        );
        println!(
            "{}",
            "╚══════════════════════════════════════════════════════════════════════════════╝"
                .custom_color(gold)
        );
        println!();
    }

    pub fn render_session(session: &ReadingSession) {
        let gold = TaroturnTheme::KINTSUGI_GOLD.to_ansi_fg();
        let bamboo = TaroturnTheme::BAMBOO_GREEN.to_ansi_fg();
        let cinnabar = TaroturnTheme::CINNABAR_RED.to_ansi_fg();

        let spread = Spread::get_by_id(&session.spread_id).unwrap();

        Self::render_header(
            &format!("{} ({})", spread.name_zh, spread.name_en),
            &session.question.clone().unwrap_or_else(|| "整体运势启示".into()),
        );

        println!(
            "  {} {}",
            "◆ 种子指纹:".bold().custom_color(gold),
            session.rng_seed.dimmed()
        );
        println!(
            "  {} {}",
            "◆ 元素平衡:".bold().custom_color(bamboo),
            session.dignity_summary.balance_description_zh
        );
        println!(
            "  {} {}",
            "◆ 主导能量:".bold().custom_color(gold),
            session.dignity_summary.dominant_element.name_zh()
        );

        if let Some(shadow_id) = session.dignity_summary.shadow_card_id {
            if let Ok(shadow_card) = CardDeck::get_by_id(shadow_id) {
                println!(
                    "  {} {} ({})",
                    "◆ 灵数底牌:".bold().custom_color(gold),
                    shadow_card.name_zh.bold(),
                    shadow_card.name_en.dimmed()
                );
            }
        }

        println!();
        println!("{}", "─── 牌阵卡位与解读 ──────────────────────────────────────────────────────────".dimmed());

        for (idx, placed) in session.placed_cards.iter().enumerate() {
            let slot = &spread.slots[idx];
            let card = CardDeck::get_by_id(placed.drawn_card.card_id).unwrap();

            let orient_str = if placed.drawn_card.orientation.is_upright() {
                placed.drawn_card.orientation.name_zh().bold().custom_color(bamboo)
            } else {
                placed.drawn_card.orientation.name_zh().bold().custom_color(cinnabar)
            };

            println!();
            println!(
                "  [{}] {} ({})",
                idx + 1,
                slot.title_zh.bold().custom_color(gold),
                slot.meaning_prompt.dimmed()
            );
            println!(
                "      ┌────────────────────────────────────────────────────────────┐"
            );
            println!(
                "      │  {} ({} of {}) - {}",
                card.name_zh.bold(),
                card.name_en.italic(),
                card.element.name_zh().custom_color(bamboo),
                orient_str
            );
            println!(
                "      │  关键词: {}",
                if placed.drawn_card.orientation.is_upright() {
                    card.facets.general_upright.join(", ").dimmed()
                } else {
                    card.facets.general_reversed.join(", ").custom_color(cinnabar)
                }
            );
            println!(
                "      │  启示: {}",
                if placed.drawn_card.orientation.is_upright() {
                    &card.facets.love_upright
                } else {
                    &card.facets.love_reversed
                }
            );
            println!(
                "      └────────────────────────────────────────────────────────────┘"
            );
        }

        if !session.dignity_summary.pairwise_dignities.is_empty() {
            println!();
            println!("{}", "─── 拓扑 DAG 关联与两两尊位张力 ──────────────────────────────────────────────".dimmed());
            for pd in &session.dignity_summary.pairwise_dignities {
                let status_str = match pd.dignity_status {
                    taroturn_core::DignityStatus::WellDignified => "和谐尊位 (+)".custom_color(bamboo),
                    taroturn_core::DignityStatus::IllDignified => "受克对立 (-)".custom_color(cinnabar),
                    taroturn_core::DignityStatus::NeutralDignified => "中性转化 (~)".dimmed(),
                };
                println!(
                    "  {} {} -> {}",
                    format!("{:?}", pd.relation).bold().custom_color(gold),
                    pd.dynamic_summary_zh,
                    status_str
                );
            }
            println!(
                "  {} {:.2}",
                "◆ 整体格局和谐度得分:".bold().custom_color(gold),
                session.dignity_summary.overall_harmony_score
            );
        }

        println!();
    }
}
