// src/services/tarotCalculators.ts - Classical Numerology & Astrological Tarot Calculator

export interface CalculatedProfile {
  lifePathNumber: number;
  soulCardId: number;
  personalityCardId: number;
  dominantZodiac: string;
  dominantElement: 'Fire' | 'Water' | 'Air' | 'Earth';
  soulCardNameZh: string;
  soulCardNameEn: string;
  archetypeTitle: string;
  soulMotto: string;
  coreStrengths: string[];
  shadowChallenges: string[];
}

const MAJOR_ARCANA_NAMES: { id: number; nameZh: string; nameEn: string; archetype: string; motto: string; strengths: string[]; shadows: string[] }[] = [
  {
    id: 0,
    nameZh: '愚者',
    nameEn: 'The Fool',
    archetype: '纯粹潜能与原初漫游者',
    motto: '怀抱对未知的敬畏与勇气，踏出信任自性的一步。',
    strengths: ['纯真直觉', '无畏开创', '无限潜能', '摆脱教条'],
    shadows: ['鲁莽盲目', '逃避责任', '缺乏落地计划'],
  },
  {
    id: 1,
    nameZh: '魔术师',
    nameEn: 'The Magician',
    archetype: '四要素显化与意志引导者',
    motto: '心念所至，如其在上，如其在下，万物皆可显化。',
    strengths: ['意志专注', '资源整合', '沟通表达', '开创显化'],
    shadows: ['操纵他人', '好大喜功', '言行脱节'],
  },
  {
    id: 2,
    nameZh: '女祭司',
    nameEn: 'The High Priestess',
    archetype: '潜意识圣所与直觉守护者',
    motto: '静默中蕴藏深邃真知，聆听内在潜意识的低语。',
    strengths: ['深层直觉', '洞察本质', '沉静智慧', '玄秘直觉'],
    shadows: ['孤立冷漠', '被动压抑', '过度防御'],
  },
  {
    id: 3,
    nameZh: '女皇',
    nameEn: 'The Empress',
    archetype: '丰饶大地与滋养创造之母',
    motto: '在丰盛与爱中孕育生命与创造力。',
    strengths: ['创造丰饶', '共情滋养', '审美感知', '生命力旺盛'],
    shadows: ['过度溺爱', '沉溺享乐', '情绪依附'],
  },
  {
    id: 4,
    nameZh: '皇帝',
    nameEn: 'The Emperor',
    archetype: '现实秩序与理性基石之父',
    motto: '以稳固的秩序与意志，筑造坚不可摧的现实疆界。',
    strengths: ['战略定力', '组织建构', '责任担当', '权威领导'],
    shadows: ['控制欲过强', '僵化死板', '拒绝脆弱'],
  },
  {
    id: 5,
    nameZh: '教皇',
    nameEn: 'The Hierophant',
    archetype: '精神传承与神圣导师',
    motto: '连接凡俗与神圣，在真理传承中找到心智归宿。',
    strengths: ['精神指引', '道德凝聚', '系统教学', '传统智慧'],
    shadows: ['教条宗派', '盲从权威', '扼杀独创'],
  },
  {
    id: 6,
    nameZh: '恋人',
    nameEn: 'The Lovers',
    archetype: '内在对立整合与神圣抉择',
    motto: '以真诚契约拥抱爱与对立，做出契合灵魂的选择。',
    strengths: ['价值抉择', '深度联结', '对立融合', '真诚同理'],
    shadows: ['选择瘫痪', '依赖讨好', '价值迷失'],
  },
  {
    id: 7,
    nameZh: '战车',
    nameEn: 'The Chariot',
    archetype: '对立力量驾驭与凯旋意志',
    motto: '统合内在黑白双狮，以坚毅意志冲破一切阻碍。',
    strengths: ['专注意志', '克服困境', '目标导向', '自律掌控'],
    shadows: ['好勇斗狠', '情绪失控', '不择手段'],
  },
  {
    id: 8,
    nameZh: '力量',
    nameEn: 'Strength',
    archetype: '内在慈悲与本能驯服',
    motto: '真正的强大源于柔韧与慈悲，而非强权暴力。',
    strengths: ['温柔恒心', '情绪疗愈', '勇气与宽容', '接纳本能'],
    shadows: ['自我怀疑', '压抑愤怒', '过度忍耐'],
  },
  {
    id: 9,
    nameZh: '隐士',
    nameEn: 'The Hermit',
    archetype: '独处内省与心智引路人',
    motto: '高举真理明灯，在内省中照亮自己与他人的夜路。',
    strengths: ['深度自省', '独立智慧', '专注探寻', '耐得孤独'],
    shadows: ['孤僻逃避', '傲慢自闭', '脱离现实'],
  },
  {
    id: 10,
    nameZh: '命运之轮',
    nameEn: 'Wheel of Fortune',
    archetype: '周期演化与共时契机',
    motto: '顺应宇宙周期流转，在变动枢纽中把握共时机遇。',
    strengths: ['洞悉周期', '适应变化', '抓准时机', '豁达超然'],
    shadows: ['宿命论消极', '赌徒心态', '随波逐流'],
  },
  {
    id: 11,
    nameZh: '正义',
    nameEn: 'Justice',
    archetype: '因果法则与客观裁决',
    motto: '手持天平与利剑，直面因果真相与内心良知。',
    strengths: ['客观公正', '逻辑清明', '因果责任', '明辨是非'],
    shadows: ['冷酷苛责', '非黑即白', '吹毛求疵'],
  },
  {
    id: 12,
    nameZh: '倒吊人',
    nameEn: 'The Hanged Man',
    archetype: '臣服换位与灵性觉醒',
    motto: '放下执念与控制，在视角逆转中看见终极真实。',
    strengths: ['换位洞察', '自愿臣服', '精神突破', '超越功利'],
    shadows: ['受害者情结', '无谓牺牲', '拖延逃避'],
  },
  {
    id: 13,
    nameZh: '死神',
    nameEn: 'Death',
    archetype: '彻底蜕变与旧结构瓦解',
    motto: '告别腐朽旧我，唯有深刻的凋零方能迎来重生。',
    strengths: ['决绝断舍离', '深刻蜕变', '去伪存真', '向死而生'],
    shadows: ['恐惧变动', '紧抓过去', '毁灭倾向'],
  },
  {
    id: 14,
    nameZh: '节制',
    nameEn: 'Temperance',
    archetype: '心智炼金与中庸调和',
    motto: '在对立两极间平缓倾倒生命之水，达成动态和谐。',
    strengths: ['情绪调和', '炼金升华', '耐性平衡', '整合分歧'],
    shadows: ['妥协平庸', '缺乏激情', '停滞不前'],
  },
  {
    id: 15,
    nameZh: '恶魔',
    nameEn: 'The Devil',
    archetype: '阴影盲区与物质锁链觉察',
    motto: '直面压抑的欲望与盲区，斩断自我设限的虚妄锁链。',
    strengths: ['物质洞察', '欲望驱动力', '看破虚伪', '强大的现实感'],
    shadows: ['执迷成瘾', '权力诱惑', '自我物化'],
  },
  {
    id: 16,
    nameZh: '高塔',
    nameEn: 'The Tower',
    archetype: '虚假幻象的闪电瓦解',
    motto: '当虚妄的防御崩塌，灵魂方能重获自由。',
    strengths: ['击碎伪装', '突破僵局', '危机觉醒', '根本性重构'],
    shadows: ['突发创伤', '惊慌失措', '抗拒崩塌'],
  },
  {
    id: 17,
    nameZh: '星星',
    nameEn: 'The Star',
    archetype: '希望疗愈与纯净灵感',
    motto: '洗尽铅华，跟随永恒星光的指引灌溉未来。',
    strengths: ['纯真希望', '灵感充沛', '疗愈安抚', '无私分享'],
    shadows: ['不切实际', '空中楼阁', '过度理想化'],
  },
  {
    id: 18,
    nameZh: '月亮',
    nameEn: 'The Moon',
    archetype: '潜意识幻象与暗夜穿越',
    motto: '穿越迷雾与恐惧的暗夜，信任潜意识的深层导航。',
    strengths: ['敏锐潜意识', '艺术通感', '梦境连接', '直面幻影'],
    shadows: ['焦虑疑神疑鬼', '自欺欺人', '情绪漩涡'],
  },
  {
    id: 19,
    nameZh: '太阳',
    nameEn: 'The Sun',
    archetype: '光明真理与自性圆满',
    motto: '在明澈的阳光下绽放生命，喜悦且全然真实。',
    strengths: ['明澈自信', '生命活力', '成功显化', '赤子之心'],
    shadows: ['盲目自大', '灼伤他人', '掩盖阴影'],
  },
  {
    id: 20,
    nameZh: '审判',
    nameEn: 'Judgement',
    archetype: '高维觉醒与灵魂召唤',
    motto: '回应来自灵魂深处的号角，全面复苏与重构人生。',
    strengths: ['深度觉醒', '清晰天命', '赦免与救赎', '历史整合'],
    shadows: ['严苛批判', '迟疑不决', '抗拒召唤'],
  },
  {
    id: 21,
    nameZh: '世界',
    nameEn: 'The World',
    archetype: '大周天圆满与全息整合',
    motto: '在天地宇宙的曼陀罗中，完成自性整合与大圆满。',
    strengths: ['全息整合', '圆满完成', '全球视野', '内在自由'],
    shadows: ['画地为牢', '迟迟不敢启程', '完美主义拖延'],
  },
];

/**
 * 经典毕达哥拉斯与黄金黎明生命灵数与本命塔罗计算法
 */
export function calculateSeekerProfile(birthdateStr: string): CalculatedProfile {
  // 默认兜底：2000-01-01
  const date = new Date(birthdateStr || '2000-01-01');
  const year = isNaN(date.getFullYear()) ? 2000 : date.getFullYear();
  const month = isNaN(date.getMonth()) ? 0 : date.getMonth() + 1;
  const day = isNaN(date.getDate()) ? 1 : date.getDate();

  // 1. 生命灵数计算（逐位求和直至单位数或卓越数 11, 22, 33）
  const digits = `${year}${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}`
    .split('')
    .map(Number);
  let sum = digits.reduce((acc, curr) => acc + curr, 0);

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum
      .toString()
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }
  const lifePathNumber = sum;

  // 2. 本命塔罗牌计算（基于出生年月日加和折算至大阿尔卡那 1-22）
  // 古典黄金黎明法：Year + Month + Day，若 > 22 则将各个数字相加
  const rawSum = year + month + day;
  let tarotSum = rawSum;
  while (tarotSum > 22) {
    tarotSum = tarotSum
      .toString()
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }

  // 塔罗大阿尔卡那：22 折算为 0 (愚者) 或 22 作为 4 (皇帝) 辅助
  const soulCardId = tarotSum === 22 ? 0 : tarotSum === 0 ? 0 : tarotSum;
  
  // 人格牌（二级折算）
  let personalityCardId = soulCardId;
  if (soulCardId > 9) {
    personalityCardId = soulCardId
      .toString()
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }

  // 3. 黄道十二宫与主导元素
  const { zodiac, element } = getZodiacAndElement(month, day);

  const meta = MAJOR_ARCANA_NAMES.find((c) => c.id === soulCardId) || MAJOR_ARCANA_NAMES[0];

  return {
    lifePathNumber,
    soulCardId,
    personalityCardId,
    dominantZodiac: zodiac,
    dominantElement: element,
    soulCardNameZh: meta.nameZh,
    soulCardNameEn: meta.nameEn,
    archetypeTitle: meta.archetype,
    soulMotto: meta.motto,
    coreStrengths: meta.strengths,
    shadowChallenges: meta.shadows,
  };
}

function getZodiacAndElement(
  month: number,
  day: number
): { zodiac: string; element: 'Fire' | 'Water' | 'Air' | 'Earth' } {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { zodiac: '白羊座 (Aries)', element: 'Fire' };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { zodiac: '金牛座 (Taurus)', element: 'Earth' };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) {
    return { zodiac: '双子座 (Gemini)', element: 'Air' };
  } else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) {
    return { zodiac: '巨蟹座 (Cancer)', element: 'Water' };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { zodiac: '狮子座 (Leo)', element: 'Fire' };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { zodiac: '处女座 (Virgo)', element: 'Earth' };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) {
    return { zodiac: '天秤座 (Libra)', element: 'Air' };
  } else if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) {
    return { zodiac: '天蝎座 (Scorpio)', element: 'Water' };
  } else if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) {
    return { zodiac: '射手座 (Sagittarius)', element: 'Fire' };
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { zodiac: '摩羯座 (Capricorn)', element: 'Earth' };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { zodiac: '水瓶座 (Aquarius)', element: 'Air' };
  } else {
    return { zodiac: '双鱼座 (Pisces)', element: 'Water' };
  }
}
