// pages/index/index.ts
import { HapticFeedback } from "../../utils/sound_manager";

Page({
  data: {
    isDailyFlipped: false,
    todayCard: {
      nameZh: "愚者",
      nameEn: "The Fool",
      elementZh: "风 (Air)",
      isUpright: true
    }
  },

  handleFlipDaily() {
    HapticFeedback.trigger("heavy");
    this.setData({
      isDailyFlipped: !this.data.isDailyFlipped
    });
  },

  goToSpreadSelect() {
    HapticFeedback.trigger("medium");
    wx.navigateTo({
      url: "/subpackages/tarot/pages/spread-select/index"
    });
  }
});
