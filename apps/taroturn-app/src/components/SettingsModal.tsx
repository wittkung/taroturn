import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Cpu,
  User,
  Sliders,
  Volume2,
  Check,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  Radio,
  BookOpen,
  HelpCircle,
  Target,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Edit2,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { UserSettings, CANONICAL_AI_PERSONAS } from '../types/settings';
import { UserSettingsService } from '../services/userSettingsService';
import { calculateSeekerProfile } from '../services/tarotCalculators';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'profile' | 'ritual' | 'audio'>('ai');
  const [settings, setSettings] = useState<UserSettings>(UserSettingsService.getSettings());
  const [showToken, setShowToken] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // Multi-Profile Management State
  const [profileViewMode, setProfileViewMode] = useState<'list' | 'edit' | 'create'>('list');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('自性化求问者');
  const [formBirthdate, setFormBirthdate] = useState<string>('1998-08-08');

  // Ping Test State
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    details?: string;
  } | null>(null);

  // QR Code & Pair State
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  // Feedback banner
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = UserSettingsService.getSettings();
      setSettings(current);
      setPingResult(null);
      setProfileViewMode('list');
      setEditingProfileId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleUpdate = (updater: (prev: UserSettings) => UserSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      UserSettingsService.saveSettings(next);
      onSettingsChange?.(next);
      return next;
    });
  };

  const handlePingTest = async () => {
    setIsPinging(true);
    setPingResult(null);

    const isRemote = settings.ai.providerMode === 'ttagy_remote';
    const endpoint = isRemote
      ? settings.ai.ttagy.remoteEndpoint
      : settings.ai.ttagy.localEndpoint;
    const token = settings.ai.ttagy.authToken;

    const res = await UserSettingsService.pingTtagyNode(endpoint, token);
    setIsPinging(false);
    setPingResult(res);
  };

  const handleCopyPairString = () => {
    const pairConfig = {
      endpoint: settings.ai.ttagy.remoteEndpoint || settings.ai.ttagy.localEndpoint,
      token: settings.ai.ttagy.authToken,
      model: settings.ai.ttagy.model,
      persona: settings.ai.persona,
    };
    navigator.clipboard.writeText(JSON.stringify(pairConfig));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
    showToast('TTAgy 配对配置已复制到剪贴板');
  };

  const handleExportBackup = () => {
    const jsonStr = UserSettingsService.exportFullBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taroturn-sanctuary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('圣所完整数据已成功导出');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const ok = UserSettingsService.importBackupJson(content);
      if (ok) {
        setSettings(UserSettingsService.getSettings());
        showToast('数据恢复成功！');
      } else {
        showToast('导入失败：文件格式不合规');
      }
    };
    reader.readAsText(file);
  };

  const renderPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'HelpCircle':
        return <HelpCircle className="w-4 h-4 text-emerald-400" />;
      case 'Target':
        return <Target className="w-4 h-4 text-blue-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-3xl bg-slate-900/95 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 to-slate-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-editorial font-bold text-slate-100 flex items-center gap-2">
                <span>圣所全景设置 · 认知中枢</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v1.2.0
                </span>
              </h3>
              <p className="text-[11px] font-editorial text-slate-400">
                配置 AI 私有节点、流派导师、求问者本命档案与仪式物理引擎
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-500/15 text-xs font-editorial font-bold bg-black/20 flex-shrink-0">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'ai'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI 接入与自建节点</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>求问者与本命灵数</span>
          </button>
          <button
            onClick={() => setActiveTab('ritual')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'ritual'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>占卜与仪式引擎</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'audio'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>禅意音效与数据</span>
          </button>
        </div>

        {/* Toast Banner */}
        {toastMsg && (
          <div className="bg-purple-600/90 text-white text-xs font-editorial text-center py-1.5 px-4 animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* ═══════════ TAB 1: AI 接入与自建节点 ═══════════ */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* 1. Provider Mode Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-editorial text-purple-300 uppercase tracking-wider">
                    AI 算力接入模式
                  </span>
                  <span className="text-[10px] font-editorial text-slate-400">
                    支持自建私有电脑直连、官方托管及公有云 BYOK
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* Mode: TTAgy Localhost */}
                  <div
                    onClick={() =>
                      handleUpdate((prev) => ({
                        ...prev,
                        ai: { ...prev.ai, providerMode: 'ttagy_local' },
                      }))
                    }
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      settings.ai.providerMode === 'ttagy_local'
                        ? 'bg-purple-500/15 border-purple-500/60 shadow-md ring-1 ring-purple-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-editorial font-bold text-slate-100">
                          TTAgy 电脑本地节点
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        127.0.0.1
                      </span>
                    </div>
                    <p className="text-[11px] font-editorial text-slate-400 leading-relaxed">
                      适合电脑浏览器端。直连本地运行的 TTAgy 守护服务，零延迟高智力。
                    </p>
                  </div>

                  {/* Mode: TTAgy Remote (IPv6 / Tailscale) */}
                  <div
                    onClick={() =>
                      handleUpdate((prev) => ({
                        ...prev,
                        ai: { ...prev.ai, providerMode: 'ttagy_remote' },
                      }))
                    }
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden ${
                      settings.ai.providerMode === 'ttagy_remote'
                        ? 'bg-purple-500/15 border-purple-500/60 shadow-md ring-1 ring-purple-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Radio className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-editorial font-bold text-slate-100">
                          TTAgy 远程私有节点
                        </span>
                      </div>
                      <span className="text-[9px] font-editorial px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        🌟 手机连电脑 (IPv6)
                      </span>
                    </div>
                    <p className="text-[11px] font-editorial text-slate-400 leading-relaxed">
                      手机或外网通过公网 IPv6 / Tailscale 直连家中电脑上的 TTAgy，随时随地享受免费高算力。
                    </p>
                  </div>

                  {/* Mode: BYOK Google Gemini */}
                  <div
                    onClick={() =>
                      handleUpdate((prev) => ({
                        ...prev,
                        ai: { ...prev.ai, providerMode: 'byok_gemini' },
                      }))
                    }
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      settings.ai.providerMode === 'byok_gemini'
                        ? 'bg-purple-500/15 border-purple-500/60 shadow-md ring-1 ring-purple-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-editorial font-bold text-slate-100">
                          Google Gemini API (BYOK)
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        原生直连
                      </span>
                    </div>
                    <p className="text-[11px] font-editorial text-slate-400 leading-relaxed">
                      使用个人 Google Gemini API 密钥，直接调用 Gemini 3.7 / 2.5 Flash 模型。
                    </p>
                  </div>

                  {/* Mode: BYOK OpenAI / DeepSeek */}
                  <div
                    onClick={() =>
                      handleUpdate((prev) => ({
                        ...prev,
                        ai: { ...prev.ai, providerMode: 'byok_openai' },
                      }))
                    }
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      settings.ai.providerMode === 'byok_openai'
                        ? 'bg-purple-500/15 border-purple-500/60 shadow-md ring-1 ring-purple-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-editorial font-bold text-slate-100">
                          OpenAI / DeepSeek (BYOK)
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        兼容协议
                      </span>
                    </div>
                    <p className="text-[11px] font-editorial text-slate-400 leading-relaxed">
                      接入 DeepSeek、Ollama、硅基流动或任何兼容 OpenAI 格式的自定义端点。
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Provider Detail Configuration Box */}
              {(settings.ai.providerMode === 'ttagy_local' ||
                settings.ai.providerMode === 'ttagy_remote') && (
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-editorial text-amber-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      <span>
                        {settings.ai.providerMode === 'ttagy_remote'
                          ? 'TTAgy 远程 IPv6 / Tailscale 私有节点配置'
                          : 'TTAgy 本地守护进程参数'}
                      </span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopyPairString}
                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-editorial text-slate-300 flex items-center space-x-1 border border-white/10 transition-colors"
                        title="复制配对配置"
                      >
                        {copiedConfig ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedConfig ? '已复制' : '复制配对配置'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Endpoint Input */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-editorial text-slate-300 flex items-center justify-between">
                        <span>
                          {settings.ai.providerMode === 'ttagy_remote'
                            ? '远程节点 Endpoint (IPv6 / Tailscale / DDNS 域名)'
                            : '本地监听 Endpoint'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {settings.ai.providerMode === 'ttagy_remote'
                            ? '示例: http://[240e:...]:8970'
                            : '默认: http://127.0.0.1:8970'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={
                          settings.ai.providerMode === 'ttagy_remote'
                            ? settings.ai.ttagy.remoteEndpoint
                            : settings.ai.ttagy.localEndpoint
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdate((prev) => ({
                            ...prev,
                            ai: {
                              ...prev.ai,
                              ttagy: {
                                ...prev.ai.ttagy,
                                [prev.ai.providerMode === 'ttagy_remote'
                                  ? 'remoteEndpoint'
                                  : 'localEndpoint']: val,
                              },
                            },
                          }));
                        }}
                        placeholder="http://[240e:3b7:...]:8970"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Node ID for Beacon self-healing */}
                    {settings.ai.providerMode === 'ttagy_remote' && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-editorial text-amber-300 flex items-center justify-between">
                          <span>🌐 Sovereign Node ID (信标自动保活 ID · 推荐)</span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            支持公网 IPv6 漂移时秒级静默重试
                          </span>
                        </label>
                        <input
                          type="text"
                          value={settings.ai.ttagy.nodeId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdate((prev) => ({
                              ...prev,
                              ai: {
                                ...prev.ai,
                                ttagy: {
                                  ...prev.ai.ttagy,
                                  nodeId: val,
                                },
                              },
                            }));
                          }}
                          placeholder="例如: node_7f8a9b2c (在电脑端 TTAgy 控制台右上角复制或扫码)"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-amber-500/30 text-xs font-mono text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {/* Auth Token Input */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-editorial text-slate-300 flex items-center justify-between">
                        <span>安全访问令牌 (Auth Token · 可选)</span>
                        <span className="text-[10px] font-editorial text-slate-500">
                          用于防止公网 IPv6 节点被恶意请求
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showToken ? 'text' : 'password'}
                          value={settings.ai.ttagy.authToken}
                          onChange={(e) =>
                            handleUpdate((prev) => ({
                              ...prev,
                              ai: {
                                ...prev.ai,
                                ttagy: { ...prev.ai.ttagy, authToken: e.target.value },
                              },
                            }))
                          }
                          placeholder="填入在电脑端设置的 Daemon Token..."
                          className="w-full pl-3 pr-10 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                        >
                          {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ping Test Trigger & Status */}
                  <div className="pt-2 border-t border-purple-500/10 flex items-center justify-between">
                    <button
                      onClick={handlePingTest}
                      disabled={isPinging}
                      className="px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs font-editorial flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                      <span>{isPinging ? '正在探测节点...' : '⚡ 测通诊断'}</span>
                    </button>

                    {pingResult && (
                      <div
                        className={`text-xs font-editorial flex items-center space-x-1.5 px-3 py-1 rounded-full border ${
                          pingResult.success
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {pingResult.success ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{pingResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BYOK Gemini Config Box */}
              {settings.ai.providerMode === 'byok_gemini' && (
                <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20 space-y-3">
                  <span className="text-xs font-bold font-editorial text-sky-300 block">
                    Google Gemini API 专属配置
                  </span>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-editorial text-slate-300">
                      Gemini API Key (保存在本地，绝不上报)
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.ai.byok.geminiApiKey}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            ai: {
                              ...prev.ai,
                              byok: { ...prev.ai.byok, geminiApiKey: e.target.value },
                            },
                          }))
                        }
                        placeholder="AIzaSy..."
                        className="w-full pl-3 pr-10 py-2 rounded-xl bg-black/40 border border-sky-500/20 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* BYOK OpenAI / DeepSeek Config Box */}
              {settings.ai.providerMode === 'byok_openai' && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <span className="text-xs font-bold font-editorial text-emerald-300 block">
                    OpenAI / DeepSeek 兼容端点配置
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-editorial text-slate-300">
                        Base URL (例如 https://api.deepseek.com/v1)
                      </label>
                      <input
                        type="text"
                        value={settings.ai.byok.openaiBaseUrl}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            ai: {
                              ...prev.ai,
                              byok: { ...prev.ai.byok, openaiBaseUrl: e.target.value },
                            },
                          }))
                        }
                        placeholder="https://api.deepseek.com/v1"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/20 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-editorial text-slate-300">
                        API Key (保存在本地)
                      </label>
                      <input
                        type="password"
                        value={settings.ai.byok.openaiApiKey}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            ai: {
                              ...prev.ai,
                              byok: { ...prev.ai.byok, openaiApiKey: e.target.value },
                            },
                          }))
                        }
                        placeholder="sk-..."
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/20 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. AI Persona Selection */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-editorial text-purple-300 uppercase tracking-wider">
                    推演导师流派 (Archetype Persona)
                  </span>
                  <span className="text-[10px] font-editorial text-slate-400">
                    决定 AI 的心智架构、符号体系与解读语调
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CANONICAL_AI_PERSONAS.map((p) => {
                    const isSelected = settings.ai.persona === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() =>
                          handleUpdate((prev) => ({
                            ...prev,
                            ai: { ...prev.ai, persona: p.id },
                          }))
                        }
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-purple-500/15 border-purple-500/60 shadow-md ring-1 ring-purple-500/30'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {renderPersonaIcon(p.iconName)}
                            <span className="text-xs font-editorial font-bold text-slate-100">
                              {p.nameZh}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-editorial text-amber-400/90 font-medium">
                          {p.taglineZh}
                        </div>
                        <p className="text-[11px] font-editorial text-slate-400 leading-relaxed line-clamp-2">
                          {p.descriptionZh}
                        </p>
                        <div className="text-[9px] font-editorial text-slate-500 pt-1 border-t border-white/5">
                          {p.focusZh}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Reasoning Effort & Thinking Chain */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold font-editorial text-purple-300 block">
                  思考预算与心智推演链
                </span>

                <div className="flex items-center justify-between text-xs font-editorial">
                  <span className="text-slate-300">展示深度思维推演链 (CoT Thinking Chain)</span>
                  <input
                    type="checkbox"
                    checked={settings.ai.showThinking}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        ai: { ...prev.ai, showThinking: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-editorial pt-2 border-t border-white/5">
                  <span className="text-slate-300">允许 AI 检索历史账本潜意识轨迹 (RAG Memory)</span>
                  <input
                    type="checkbox"
                    checked={settings.ai.enableLongitudinalRag}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        ai: { ...prev.ai, enableLongitudinalRag: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 2: 求问者档案库与本命灵数 ═══════════ */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {profileViewMode === 'list' && (
                <div className="space-y-4">
                  {/* Registry Top Bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold font-editorial text-purple-300 uppercase tracking-wider block">
                        求问者档案库 ({settings.profiles.length} 位)
                      </span>
                      <p className="text-[11px] font-editorial text-slate-400">
                        保存多位求问者本命盘，点击即可切换当前活跃人物
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setFormName('');
                        setFormTitle('自性化求问者');
                        setFormBirthdate('1998-08-08');
                        setEditingProfileId(null);
                        setProfileViewMode('create');
                      }}
                      className="px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-editorial flex items-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新建求问者档案</span>
                    </button>
                  </div>

                  {/* Profile Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {settings.profiles.map((p) => {
                      const isSelected = p.id === settings.activeProfileId;
                      const cardCalc = calculateSeekerProfile(p.birthdate);
                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                            isSelected
                              ? 'bg-purple-500/15 border-purple-500/60 shadow-md ring-1 ring-purple-500/30'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-start space-x-3.5">
                            {/* Card Thumbnail */}
                            <div className="w-12 h-18 rounded-xl overflow-hidden border border-purple-500/40 flex-shrink-0 bg-black shadow-sm">
                              <img
                                src={`/cards/${cardCalc.soulCardId}.jpg`}
                                alt={cardCalc.soulCardNameZh}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Profile Meta */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-editorial font-bold text-slate-100 truncate">
                                  {p.name || p.nickname}
                                </h4>
                                {isSelected ? (
                                  <span className="text-[9px] font-editorial px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>当前激活</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      UserSettingsService.setActiveProfile(p.id);
                                      const next = UserSettingsService.getSettings();
                                      setSettings(next);
                                      onSettingsChange?.(next);
                                      showToast(`已切换为「${p.name || p.nickname}」`);
                                    }}
                                    className="text-[10px] font-editorial px-2 py-0.5 rounded-full bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 transition-colors"
                                  >
                                    设为激活
                                  </button>
                                )}
                              </div>

                              <div className="text-[10px] font-editorial text-purple-300/90 font-medium truncate">
                                {p.title}
                              </div>

                              <div className="flex flex-wrap gap-1 pt-0.5">
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                                  #{cardCalc.soulCardId} {cardCalc.soulCardNameZh}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  灵数 {cardCalc.lifePathNumber}
                                </span>
                                <span className="text-[9px] font-editorial px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                                  {p.birthdate}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Action Footer */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-editorial">
                            <span className="text-[10px] text-slate-500">
                              {cardCalc.dominantZodiac.split(' ')[0]} · {cardCalc.dominantElement}元素
                            </span>

                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => {
                                  setFormName(p.name || p.nickname);
                                  setFormTitle(p.title);
                                  setFormBirthdate(p.birthdate);
                                  setEditingProfileId(p.id);
                                  setProfileViewMode('edit');
                                }}
                                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center space-x-1 text-[11px] transition-colors"
                                title="编辑此档案"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>编辑</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (settings.profiles.length <= 1) {
                                    showToast('无法删除：系统中必须保留至少一位求问者档案');
                                    return;
                                  }
                                  if (confirm(`确认删除求问者档案「${p.name || p.nickname}」？此操作不可逆。`)) {
                                    const ok = UserSettingsService.deleteProfile(p.id);
                                    if (ok) {
                                      const next = UserSettingsService.getSettings();
                                      setSettings(next);
                                      onSettingsChange?.(next);
                                      showToast(`已删除档案「${p.name || p.nickname}」`);
                                    }
                                  }
                                }}
                                disabled={settings.profiles.length <= 1}
                                className={`px-2 py-1 rounded-lg flex items-center space-x-1 text-[11px] transition-colors ${
                                  settings.profiles.length <= 1
                                    ? 'opacity-30 cursor-not-allowed text-slate-600'
                                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                                }`}
                                title={settings.profiles.length <= 1 ? '至少保留一个档案' : '删除此档案'}
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>删除</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Editor / Creation Sub-view */}
              {(profileViewMode === 'create' || profileViewMode === 'edit') && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-purple-500/15">
                    <button
                      onClick={() => {
                        setProfileViewMode('list');
                        setEditingProfileId(null);
                      }}
                      className="text-xs font-editorial text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>返回档案库列表</span>
                    </button>

                    <span className="text-xs font-bold font-editorial text-slate-200">
                      {profileViewMode === 'create' ? '新建求问者本命档案' : '编辑求问者本命档案'}
                    </span>
                  </div>

                  {/* Realtime Calculated Hero */}
                  {(() => {
                    const previewCalc = calculateSeekerProfile(formBirthdate || '1998-08-08');
                    return (
                      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center space-x-4">
                        <div className="w-16 h-24 rounded-xl overflow-hidden border border-purple-500/50 flex-shrink-0 bg-black shadow-md">
                          <img
                            src={`/cards/${previewCalc.soulCardId}.jpg`}
                            alt={previewCalc.soulCardNameZh}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                            实时推演 · SOUL ARCANUM
                          </div>
                          <h4 className="text-base font-editorial font-bold text-slate-100 flex items-center gap-2">
                            <span>
                              本命灵魂牌 · {previewCalc.soulCardNameZh} ({previewCalc.soulCardNameEn})
                            </span>
                          </h4>
                          <p className="text-xs font-editorial text-amber-300 font-medium">
                            {previewCalc.archetypeTitle}
                          </p>
                          <p className="text-[11px] font-editorial text-slate-400 italic line-clamp-1">
                            “{previewCalc.soulMotto}”
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Edit Form Inputs */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!formName.trim() || !formBirthdate) return;

                      if (profileViewMode === 'create') {
                        UserSettingsService.createProfile({
                          name: formName.trim(),
                          nickname: formName.trim(),
                          title: formTitle.trim() || '自性化求问者',
                          birthdate: formBirthdate,
                        });
                        showToast('已新建求问者档案并设为激活');
                      } else if (profileViewMode === 'edit' && editingProfileId) {
                        UserSettingsService.updateProfile(editingProfileId, {
                          name: formName.trim(),
                          nickname: formName.trim(),
                          title: formTitle.trim() || '自性化求问者',
                          birthdate: formBirthdate,
                        });
                        showToast('求问者档案已更新');
                      }

                      const next = UserSettingsService.getSettings();
                      setSettings(next);
                      onSettingsChange?.(next);
                      setProfileViewMode('list');
                      setEditingProfileId(null);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-editorial text-slate-300">
                          求问者姓名 / 标识备注 (必填)
                        </label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="例如: 我自己 / 林澈 (伴侣) / 客户王总"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-editorial text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-editorial text-slate-300">
                          身份称号 / 心智契约
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="例如: 星轨观测者 / 潜意识漫游者"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-editorial text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-editorial text-slate-300 flex items-center justify-between">
                          <span>公历出生年月日 (系统将精确演算生命灵数与本命灵魂牌)</span>
                          {(() => {
                            const c = calculateSeekerProfile(formBirthdate || '1998-08-08');
                            return (
                              <span className="text-[10px] font-mono text-purple-400 font-bold">
                                灵数: {c.lifePathNumber} 数 · {c.dominantZodiac.split(' ')[0]} (
                                {c.dominantElement}元素)
                              </span>
                            );
                          })()}
                        </label>
                        <input
                          type="date"
                          required
                          value={formBirthdate}
                          onChange={(e) => setFormBirthdate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Archetype Strengths & Shadows Preview */}
                    {(() => {
                      const c = calculateSeekerProfile(formBirthdate || '1998-08-08');
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                            <span className="text-[11px] font-bold font-editorial text-emerald-400 block">
                              本命心智优势潜能:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {c.coreStrengths.map((str, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-editorial px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                >
                                  {str}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
                            <span className="text-[11px] font-bold font-editorial text-rose-400 block">
                              潜意识阴影盲区与功课:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {c.shadowChallenges.map((sh, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-editorial px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                >
                                  {sh}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Submit Actions */}
                    <div className="pt-3 border-t border-purple-500/15 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileViewMode('list');
                          setEditingProfileId(null);
                        }}
                        className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-editorial transition-colors"
                      >
                        取消
                      </button>

                      <button
                        type="submit"
                        className="px-5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-editorial flex items-center space-x-1.5 transition-colors shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{profileViewMode === 'create' ? '保存并设为激活' : '保存修改'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB 3: 占卜与仪式引擎 ═══════════ */}
          {activeTab === 'ritual' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold font-editorial text-purple-300 block">
                  逆位牌出现概率 (Reversal Probability)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: '纯正位 (0%)', val: 0.0, desc: '专注正向能量' },
                    { label: '适度逆位 (30%)', val: 0.3, desc: '现代心理学推荐' },
                    { label: '古典对半 (50%)', val: 0.5, desc: '古典传统物理概率' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() =>
                        handleUpdate((prev) => ({
                          ...prev,
                          ritual: { ...prev.ritual, reversalProbability: item.val },
                        }))
                      }
                      className={`p-3 rounded-xl border text-center transition-all ${
                        settings.ritual.reversalProbability === item.val
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-sm'
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-editorial">{item.label}</div>
                      <div className="text-[10px] font-editorial opacity-70 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold font-editorial text-purple-300 block">
                  卡牌图鉴视觉主题 (Deck Themes)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'rws_1909', name: '1909 经典原版', desc: 'Pamela Smith 原作' },
                    { id: 'midnight_violet', name: '午夜紫罗兰', desc: '沉浸暗夜禅修' },
                    { id: 'kintsugi_gold', name: '金缮黑金典藏', desc: 'WSJ 杂志质感' },
                  ].map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() =>
                        handleUpdate((prev) => ({
                          ...prev,
                          ritual: { ...prev.ritual, deckTheme: deck.id as any },
                        }))
                      }
                      className={`p-3 rounded-xl border text-center transition-all ${
                        settings.ritual.deckTheme === deck.id
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-sm'
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-editorial">{deck.name}</div>
                      <div className="text-[10px] font-editorial opacity-70 mt-0.5">{deck.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 4: 禅意音效与数据主权 ═══════════ */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold font-editorial text-purple-300 block">
                  Zen Audio 禅意音效引擎
                </span>

                <div className="flex items-center justify-between text-xs font-editorial">
                  <span className="text-slate-300">翻牌与抽牌触感音效</span>
                  <input
                    type="checkbox"
                    checked={settings.audio.soundEffectsEnabled}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        audio: { ...prev.audio, soundEffectsEnabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-editorial pt-2 border-t border-white/5">
                  <span className="text-slate-300">揭示时刻西藏颂钵共振声</span>
                  <input
                    type="checkbox"
                    checked={settings.audio.singingBowlEnabled}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        audio: { ...prev.audio, singingBowlEnabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Data Sovereignty */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold font-editorial text-purple-300 block">
                  数据主权与归档管理 (Data Sovereignty)
                </span>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleExportBackup}
                    className="px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-editorial text-purple-300 flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>导出全量圣所档案 (JSON)</span>
                  </button>

                  <label className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-editorial text-slate-300 flex items-center space-x-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>导入档案备份</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      if (confirm('确认清空所有历史占卜记录与推演报告？此操作不可逆。')) {
                        localStorage.removeItem('taroturn_reading_journal');
                        showToast('历史账本已清空');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-editorial text-rose-400 flex items-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清空历史记录</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
