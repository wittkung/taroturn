// components/tarot-card/index.ts
import { HapticFeedback } from "../../utils/sound_manager";

Component({
  properties: {
    nameZh: { type: String, value: "" },
    nameEn: { type: String, value: "" },
    elementZh: { type: String, value: "" },
    isUpright: { type: Boolean, value: true },
    isFlipped: { type: Boolean, value: false }
  },

  methods: {
    handleTap() {
      HapticFeedback.trigger("light");
      this.triggerEvent("cardtap");
    }
  }
});
