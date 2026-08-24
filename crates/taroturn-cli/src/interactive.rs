use colored::Colorize;
use taroturn_core::{ReadingSession, TarotResult};
use taroturn_ui::TaroturnTheme;
use crate::render::TerminalRenderer;

pub struct InteractiveWorkflow;

impl InteractiveWorkflow {
    pub fn run_draw(
        spread_id: &str,
        question: Option<String>,
        reversal_rate: f32,
        seed: Option<String>,
    ) -> TarotResult<ReadingSession> {
        let gold = TaroturnTheme::KINTSUGI_GOLD.to_ansi_fg();
        let bamboo = TaroturnTheme::BAMBOO_GREEN.to_ansi_fg();

        println!(
            "{}",
            "✨ 正在准备洗牌并初始化 ChaCha20 密码学熵源...".custom_color(gold)
        );

        let session = ReadingSession::create(spread_id, question, seed, reversal_rate)?;

        println!(
            "{}",
            format!("🎴 洗牌完成！成功生成 78 张卡牌流，抽取 {} 张卡位。", session.placed_cards.len())
                .custom_color(bamboo)
        );

        TerminalRenderer::render_session(&session);

        Ok(session)
    }
}
