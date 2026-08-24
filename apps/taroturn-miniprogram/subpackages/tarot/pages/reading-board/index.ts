// subpackages/tarot/pages/reading-board/index.ts
import { MiniProgramTarotCore } from "../../../../core/card_deck";
import { HapticFeedback } from "../../../../utils/sound_manager";

Page({
  data: {
    spread: { nameZh: "牌阵推演", nameEn: "Divination Board", slots: [] } as any,
    placedCards: [] as any[]
  },

  onLoad(options: { spreadId?: string }) {
    const spreadId = options.spreadId || "three_cards_time";
    const spread = MiniProgramTarotCore.getSpreadById(spreadId);
    if (!spread) return;

    // 确定性模拟抽牌
    const mockCards = [
      { nameZh: "魔术师", nameEn: "The Magician", elementZh: "风", isUpright: true },
      { nameZh: "女祭司", nameEn: "The High Priestess", elementZh: "水", isUpright: true },
      { nameZh: "女皇", nameEn: "The Empress", elementZh: "土", isUpright: false },
      { nameZh: "皇帝", nameEn: "The Emperor", elementZh: "火", isUpright: true },
      { nameZh: "教皇", nameEn: "The Hierophant", elementZh: "土", isUpright: true }
    ];

    const placedCards = spread.slots.map((slot, idx) => {
      const card = mockCards[idx % mockCards.length];
      return {
        slot,
        ...card,
        isFlipped: false
      };
    });

    this.setData({ spread, placedCards });
  },

  handleCardTap(e: WechatMiniprogram.CustomEvent) {
    const index = e.currentTarget.dataset.index;
    const key = `placedCards[${index}].isFlipped`;
    const current = this.data.placedCards[index].isFlipped;
    HapticFeedback.trigger("heavy");
    this.setData({
      [key]: !current
    });
  },

  goToInterpretation() {
    HapticFeedback.trigger("medium");
    wx.navigateTo({
      url: "/subpackages/tarot/pages/interpretation/index"
    });
  }
});
