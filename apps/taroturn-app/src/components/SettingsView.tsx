// src/components/SettingsView.tsx - Fullscreen Sanctuary Settings & Cognitive AI Gateway
import React, { useState, useEffect } from 'react';
import {
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

export interface SettingsViewProps {
  onSettingsChange?: (newSettings: UserSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSettingsChange }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'profile' | 'ritual' | 'audio'>('ai');
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

  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const current = UserSettingsService.getSettings();
    setSettings(current);
  }, []);

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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900/40 border border-purple-500/20 backdrop-blur-xl shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-sm flex-shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-editorial font-bold text-slate-100 flex items-center gap-2">
              <span>圣所全景设置 · 认知中枢</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                v1.2.0
              </span>
            </h2>
            <p className="text-xs font-editorial text-slate-400 mt-0.5">
              配置 AI 私有算力节点、四大流派导师、多求问者本命档案与仪式物理引擎
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="bg-purple-600 text-white text-xs font-editorial text-center py-2 px-4 rounded-2xl shadow-md animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-purple-500/15 text-xs font-editorial font-bold bg-black/20 rounded-2xl p-1">
        <button
          onClick={() => setActiveSubTab('ai')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeSubTab === 'ai'
              ? 'text-white bg-purple-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI 接入与私有节点</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeSubTab === 'profile'
              ? 'text-white bg-purple-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>求问者档案库管理</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ritual')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeSubTab === 'ritual'
              ? 'text-white bg-purple-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>占卜与仪式引擎</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audio')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeSubTab === 'audio'
              ? 'text-white bg-purple-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>禅意音效与数据主权</span>
        </button>
      </div>

      {/* Sub Tab Content Panels */}
      <div className="p-6 rounded-3xl bg-black/25 border border-purple-500/20 backdrop-blur-xl space-y-6">
        {/* SUBTAB 1: AI */}
        {activeSubTab === 'ai' && (
          <div className="space-y-6">
            <div className="space-y-2.5">
              <span className="text-xs font-bold font-editorial text-purple-300 uppercase tracking-wider block">
                AI 算力接入模式
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Localhost */}
                <div
                  onClick={() =>
                    handleUpdate((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, providerMode: 'ttagy_local' },
                    }))
                  }
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
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
                  <p className="text-[11px] font-editorial text-slate-400">
                    适合电脑端。直连本地运行的 TTAgy 守护服务，零延迟高智力。
                  </p>
                </div>

                {/* Remote */}
                <div
                  onClick={() =>
                    handleUpdate((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, providerMode: 'ttagy_remote' },
                    }))
                  }
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
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
                  <p className="text-[11px] font-editorial text-slate-400">
                    手机或外网通过公网 IPv6 / Tailscale 直连电脑端 TTAgy 服务。
                  </p>
                </div>

                {/* Gemini BYOK */}
                <div
                  onClick={() =>
                    handleUpdate((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, providerMode: 'byok_gemini' },
                    }))
                  }
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
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
                  <p className="text-[11px] font-editorial text-slate-400">
                    使用个人 Google Gemini API Key 调用 3.7 / 2.5 Flash 模型。
                  </p>
                </div>

                {/* OpenAI / DeepSeek BYOK */}
                <div
                  onClick={() =>
                    handleUpdate((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, providerMode: 'byok_openai' },
                    }))
                  }
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
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
                  <p className="text-[11px] font-editorial text-slate-400">
                    接入 DeepSeek、Ollama 或任何兼容 OpenAI 的 API 端点。
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Details & Ping */}
            {(settings.ai.providerMode === 'ttagy_local' ||
              settings.ai.providerMode === 'ttagy_remote') && (
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-editorial text-amber-300">
                    {settings.ai.providerMode === 'ttagy_remote'
                      ? 'TTAgy 远程节点配置'
                      : 'TTAgy 本地监听参数'}
                  </span>
                  <button
                    onClick={handleCopyPairString}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-editorial text-slate-300 flex items-center space-x-1 border border-white/10"
                  >
                    {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedConfig ? '已复制' : '复制配对配置'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-editorial text-slate-300 block">
                    Endpoint 地址
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
                    placeholder="http://127.0.0.1:8970"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handlePingTest}
                    disabled={isPinging}
                    className="px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-editorial flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? '正在探测...' : '⚡ 测通诊断'}</span>
                  </button>

                  {pingResult && (
                    <div
                      className={`text-xs font-editorial px-3 py-1 rounded-full border ${
                        pingResult.success
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {pingResult.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Persona Selection */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold font-editorial text-purple-300 uppercase tracking-wider block">
                推演导师流派 (Archetype Persona)
              </span>
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
                        {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                      </div>
                      <div className="text-[10px] font-editorial text-amber-400/90 font-medium">
                        {p.taglineZh}
                      </div>
                      <p className="text-[11px] font-editorial text-slate-400 line-clamp-2">
                        {p.descriptionZh}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: PROFILES REGISTRY */}
        {activeSubTab === 'profile' && (
          <div className="space-y-4">
            {profileViewMode === 'list' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-editorial text-purple-300 uppercase tracking-wider">
                    已保存求问者档案 ({settings.profiles.length} 位)
                  </span>
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
                          <div className="w-12 h-18 rounded-xl overflow-hidden border border-purple-500/40 flex-shrink-0 bg-black shadow-sm">
                            <img
                              src={`/cards/${cardCalc.soulCardId}.jpg`}
                              alt={cardCalc.soulCardNameZh}
                              className="w-full h-full object-cover"
                            />
                          </div>

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
                                  className="text-[10px] font-editorial px-2 py-0.5 rounded-full bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10"
                                >
                                  设为激活
                                </button>
                              )}
                            </div>

                            <div className="text-[10px] font-editorial text-purple-300 truncate">
                              {p.title}
                            </div>

                            <div className="flex flex-wrap gap-1 pt-0.5">
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                                #{cardCalc.soulCardId} {cardCalc.soulCardNameZh}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                灵数 {cardCalc.lifePathNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-editorial">
                          <span className="text-[10px] text-slate-500">
                            {p.birthdate} · {cardCalc.dominantZodiac.split(' ')[0]}
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
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center space-x-1 text-[11px]"
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
                              className={`px-2 py-1 rounded-lg flex items-center space-x-1 text-[11px] ${
                                settings.profiles.length <= 1
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                              }`}
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

            {(profileViewMode === 'create' || profileViewMode === 'edit') && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/15">
                  <button
                    onClick={() => {
                      setProfileViewMode('list');
                      setEditingProfileId(null);
                    }}
                    className="text-xs font-editorial text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>返回档案库列表</span>
                  </button>
                  <span className="text-xs font-bold font-editorial text-slate-200">
                    {profileViewMode === 'create' ? '新建求问者本命档案' : '编辑求问者本命档案'}
                  </span>
                </div>

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
                      showToast('已新建档案并设为激活');
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
                        placeholder="例如: 我自己 / 林澈 (伴侣)"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-editorial text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-editorial text-slate-300">
                        身份称号
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="例如: 星轨观测者"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-editorial text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-editorial text-slate-300">
                        公历出生年月日
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

                  <div className="pt-3 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileViewMode('list');
                        setEditingProfileId(null);
                      }}
                      className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-editorial"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-editorial flex items-center space-x-1.5 shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{profileViewMode === 'create' ? '保存并激活' : '保存修改'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: RITUAL */}
        {activeSubTab === 'ritual' && (
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

        {/* SUBTAB 4: AUDIO & DATA */}
        {activeSubTab === 'audio' && (
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

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-xs font-bold font-editorial text-purple-300 block">
                数据主权与归档管理 (Data Sovereignty)
              </span>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-editorial text-purple-300 flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出全量圣所档案 (JSON)</span>
                </button>

                <label className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-editorial text-slate-300 flex items-center space-x-1.5 cursor-pointer">
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
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-editorial text-rose-400 flex items-center space-x-1.5"
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
  );
};
