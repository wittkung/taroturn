use std::process::Command;
use colored::Colorize;
use taroturn_core::{CardDeck, ReadingSession, Spread, TarotResult};
use taroturn_ui::TaroturnTheme;

pub struct AgyBridge;

impl AgyBridge {
    /// Builds the structured prompt envelope for LLM divination synthesis
    pub fn build_prompt(session: &ReadingSession) -> String {
        let spread = Spread::get_by_id(&session.spread_id).unwrap_or_else(|_| {
            Spread::canonical_spreads().into_iter().next().unwrap()
        });

        let mut prompt = String::new();
        prompt.push_str("【Taroturn 专业塔罗占卜深度解读请求】\n\n");
        prompt.push_str(&format!(
            "用户问题/焦点：{}\n",
            session.question.as_deref().unwrap_or("整体能量与未来指引")
        ));
        prompt.push_str(&format!(
            "所用牌阵：{} ({})\n\n",
            spread.name_zh, spread.name_en
        ));
        prompt.push_str("【牌面分布与槽位映射】：\n");

        for (idx, placed) in session.placed_cards.iter().enumerate() {
            let slot = &spread.slots[idx];
            let card = CardDeck::get_by_id(placed.drawn_card.card_id).unwrap();
            prompt.push_str(&format!(
                "- 位置 [{}] {} ({}) -> {} ({}) [{} | 元素: {}]\n",
                idx + 1,
                slot.title_zh,
                slot.meaning_prompt,
                card.name_zh,
                card.name_en,
                placed.drawn_card.orientation.name_zh(),
                card.element.name_zh()
            ));
        }

        prompt.push_str("\n【元素与灵数统计特征】：\n");
        prompt.push_str(&format!("- {}\n", session.dignity_summary.balance_description_zh));
        prompt.push_str(&format!(
            "- 主导能量：{}\n",
            session.dignity_summary.dominant_element.name_zh()
        ));

        if let Some(shadow_id) = session.dignity_summary.shadow_card_id {
            if let Ok(shadow_card) = CardDeck::get_by_id(shadow_id) {
                prompt.push_str(&format!(
                    "- 灵数底牌/隐秘根基：{} ({})\n",
                    shadow_card.name_zh, shadow_card.name_en
                ));
            }
        }

        prompt.push_str("\n请依据荣格心理学与经典塔罗原型，从多维度（现状根源、潜在盲区、具体行动建议、心理赋能）提供一份深度、非宿命论、富有洞察力与疗愈力量的解读报告。");

        prompt
    }

    /// Invokes `agy` CLI to stream or return the AI interpretation
    pub fn interpret_with_agy(session: &ReadingSession) -> TarotResult<String> {
        let gold = TaroturnTheme::KINTSUGI_GOLD.to_ansi_fg();
        let bamboo = TaroturnTheme::BAMBOO_GREEN.to_ansi_fg();

        println!(
            "{}",
            "⚡ 正在连接本地 AGY CLI 进行多维度 AI 原型深度解读...".custom_color(gold)
        );

        let prompt = Self::build_prompt(session);

        let output = Command::new("agy")
            .arg("query")
            .arg(&prompt)
            .output();

        match output {
            Ok(res) if res.status.success() => {
                let text = String::from_utf8_lossy(&res.stdout).to_string();
                println!();
                println!("{}", "═══ AGY AI 深度解读报告 ══════════════════════════════════════════════════".custom_color(bamboo));
                println!("{}", text.trim());
                println!("{}", "════════════════════════════════════════════════════════════════════════════".custom_color(bamboo));
                println!();
                Ok(text)
            }
            Ok(res) => {
                let err_msg = String::from_utf8_lossy(&res.stderr);
                // Fallback simulation if agy returns non-zero in sandbox
                println!(
                    "{}",
                    format!("⚠️ AGY CLI 响应提示 (沙箱或离线环境): {err_msg}").dimmed()
                );
                let fallback = format!(
                    "【本地启发式解读】：\n当前牌局处于{}。核心在于将{}的启示转化为实际行动，避免过度焦虑。",
                    session.dignity_summary.dominant_element.name_zh(),
                    session.spread_id
                );
                println!("{}", fallback.custom_color(bamboo));
                Ok(fallback)
            }
            Err(_) => {
                println!(
                    "{}",
                    "ℹ️ 未检测到本地 `agy` CLI 命令，展示本地规则启发式综合解读：".dimmed()
                );
                let fallback = format!(
                    "【本地启示】：\n所抽选的牌阵呈现{}。大牌比例为{:.0}%，表明此议题涉及重要生活转折，建议聚焦当下平衡。",
                    session.dignity_summary.dominant_element.name_zh(),
                    session.dignity_summary.major_ratio * 100.0
                );
                println!("{}", fallback.custom_color(bamboo));
                Ok(fallback)
            }
        }
    }
}
