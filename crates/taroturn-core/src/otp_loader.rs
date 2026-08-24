// crates/taroturn-core/src/otp_loader.rs - Open Tarot Package Safe Loader

use std::sync::Arc;
use crate::deck_system::TarotDeckSystem;
use crate::error::{TarotError, TarotResult};
use crate::otp_deck::{OtpDynamicDeckSystem, OtpManifest};

pub struct OtpDeckLoader;

impl OtpDeckLoader {
    /// 验证并从 JSON 字符串直接加载 OTP 牌组定义
    pub fn load_from_manifest_json(json_str: &str) -> TarotResult<Arc<dyn TarotDeckSystem>> {
        let manifest: OtpManifest = serde_json::from_str(json_str)
            .map_err(|e| TarotError::OtpManifestInvalid(e.to_string()))?;

        let dynamic_deck = OtpDynamicDeckSystem::from_manifest(manifest)?;
        Ok(Arc::new(dynamic_deck))
    }

    /// 安全校验：路径是否存在 ZipSlip 越界穿越 (../)
    pub fn validate_safe_path(path_str: &str) -> bool {
        !path_str.contains("..") && !path_str.starts_with('/') && !path_str.starts_with('\\')
    }
}
