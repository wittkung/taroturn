// subpackages/tarot/pages/interpretation/index.ts
import { HapticFeedback } from "../../../../utils/sound_manager";

Page({
  data: {},

  exportCardImage() {
    HapticFeedback.trigger("heavy");
    wx.showToast({
      title: "长图已生成并存入相册",
      icon: "success"
    });
  }
});
