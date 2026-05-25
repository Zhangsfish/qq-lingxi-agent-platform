const SCENE_LABELS: Record<string, string> = {
  anime_fandom_matching: "二次元同好 / 漫展交流",
  career_transition_matching: "转行探索 / 经验求助",
  food_group_matching: "美食探索 / 本地种草",
  geopolitics_chat_matching: "政治经济 / 时事讨论",
  long_term_community_matching: "长期共同体 / 同行者",
  moba_game_matching: "游戏开黑 / 队友匹配",
  philosophy_social_science_discussion_matching: "哲学社科 / 深度讨论",
  startup_founder_matching: "创业互助 / 项目共创",
};

const ROUTE_LABELS: Record<string, string> = {
  person_first: "优先匹配人 / 作者",
  people_first: "优先匹配人 / 作者",
  group_first: "优先匹配 QQ 群",
  content_first: "优先看内容",
  realm_first: "优先进入群域",
  realm_feed: "进入群域",
  group_match: "匹配 QQ 群",
  people_match: "匹配人 / 作者",
  mixed: "综合探索",
  uncertain: "继续了解需求",
};

const RECOMMENDATION_LEVEL_LABELS: Record<string, string> = {
  strong_recommend: "强烈推荐",
  recommend: "推荐",
  moderate: "可以考虑",
  medium: "可以考虑",
  low: "谨慎考虑",
  consider_with_caution: "谨慎考虑",
  not_recommend: "不推荐",
  not_recommended: "不推荐",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "高置信度",
  medium: "中等置信度",
  low: "低置信度",
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  group: "群聊",
  person: "人 / 作者",
  user_agent: "用户 Agent",
  group_agent: "群 Agent",
  person_agent: "人物 Agent",
};

const TECHNICAL_TAG_LABELS: Record<string, string> = {
  energy_source: "能量来源",
  information_style: "信息理解方式",
  decision_weight: "决策偏好",
  closure_style: "推进方式",
  core_theme: "核心母题",
  value_rank: "价值排序",
  not_to_do_list: "边界与不为",
  boundaries: "边界",
  energy_mechanism: "能量机制",
  capability_stack: "能力结构",
  world_model: "机会判断",
  risk_blindspots: "风险盲区",
  calibration: "结果校准",
};

export function formatSceneLabel(scene: string | undefined | null) {
  if (!scene) return "待确认场景";
  return SCENE_LABELS[scene] ?? formatTechnicalTag(scene);
}

export function formatRouteLabel(route: string | undefined | null) {
  if (!route) return "继续了解需求";
  return ROUTE_LABELS[route] ?? formatTechnicalTag(route);
}

export function formatRecommendationLevel(level: string | undefined | null) {
  if (!level) return "待判断";
  return RECOMMENDATION_LEVEL_LABELS[level] ?? formatTechnicalTag(level);
}

export function formatConfidenceLabel(confidence: string | undefined | null) {
  if (!confidence) return "待确认";
  return CONFIDENCE_LABELS[confidence] ?? formatTechnicalTag(confidence);
}

export function formatTargetTypeLabel(type: string | undefined | null) {
  if (!type) return "匹配对象";
  return TARGET_TYPE_LABELS[type] ?? formatTechnicalTag(type);
}

export function formatTechnicalTag(value: string | undefined | null) {
  if (!value) return "待确认";
  if (TECHNICAL_TAG_LABELS[value]) return TECHNICAL_TAG_LABELS[value];
  if (SCENE_LABELS[value]) return SCENE_LABELS[value];
  if (ROUTE_LABELS[value]) return ROUTE_LABELS[value];
  if (RECOMMENDATION_LEVEL_LABELS[value]) {
    return RECOMMENDATION_LEVEL_LABELS[value];
  }
  if (CONFIDENCE_LABELS[value]) return CONFIDENCE_LABELS[value];
  if (!/[_-]/.test(value)) return value;

  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((token) => TECHNICAL_TAG_LABELS[token] ?? token)
    .join(" / ");
}
