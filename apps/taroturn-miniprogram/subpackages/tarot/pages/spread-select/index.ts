// subpackages/tarot/pages/spread-select/index.ts
import { CANONICAL_SPREADS } from "../../../../core/card_deck";
import { HapticFeedback } from "../../../../utils/sound_manager";

Page({
  data: {
    spreads: CANONICAL_SPREADS
  },

  selectSpread(e: WechatMiniprogram.CustomEvent) {
    const spreadId = e.currentTarget.dataset.id;
    HapticFeedback.trigger("medium");
    wx.navigateTo({
      url: `/subpackages/tarot/pages/reading-board/index?spreadId=${spreadId}`
    });
  }
});
