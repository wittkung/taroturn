// app.ts - Global Lifecycle & Audio/Auth Init
App<IAppOption>({
  globalData: {
    userInfo: null,
    isAudioMuted: false,
    activeReadingSession: null
  },
  onLaunch() {
    // 允许在物理静音模式下播放神谕提示音
    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      mixWithOther: true
    });
    console.log("[Taroturn] Sanctuary initialized");
  }
});
