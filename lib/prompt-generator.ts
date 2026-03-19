import type { SurveyData } from "./types";

function formatTagsWithOther(tags: string[], noteKey: string, otherNotes: Record<string, string>): string {
  return tags.map((t) => {
    if (t === "其他" && otherNotes[noteKey]) {
      return `其他（${otherNotes[noteKey]}）`;
    }
    return t;
  }).join("、");
}

/**
 * Generate the full LLM prompt from survey data.
 * @param data - structured survey data
 * @param weatherContext - pre-formatted weather text (from weather.ts), or empty string
 */
export function generatePrompt(data: SurveyData, weatherContext: string = ""): string {
  const { basicInfo, companion, transport, style, dining, attractions, accommodation, budget, otherNotes } = data;

  // === 【角色设定】 ===
  let prompt = `【角色设定】
你是一名专业的本地旅行规划助手。请基于用户提供的结构化旅行需求、天气信息、候选地点信息与路线约束，输出一份"可执行、时间合理、交通顺路、符合偏好"的旅行规划。

【用户需求】`;

  // 基础信息
  prompt += `\n基础信息`;
  if (basicInfo.city) prompt += `\n- 目的地城市：${basicInfo.city}`;
  if (basicInfo.startDate && basicInfo.endDate) {
    prompt += `\n- 旅行日期：${basicInfo.startDate} 至 ${basicInfo.endDate}`;
  }
  if (basicInfo.departure) prompt += `\n- 出发地：${basicInfo.departure}`;
  if (basicInfo.returnTo) prompt += `\n- 返回地：${basicInfo.returnTo}`;
  if (basicInfo.departureTime) prompt += `\n- 出发时间：${basicInfo.departureTime}`;
  if (basicInfo.returnTime) prompt += `\n- 返回时间：${basicInfo.returnTime}`;

  // 天气信息
  if (weatherContext) {
    prompt += `\n\n天气信息`;
    prompt += `\n${weatherContext}`;
  }

  // 出行成员（必填项，不会为空）
  prompt += `\n\n出行成员`;
  const companionText = formatTagsWithOther(companion, "companion", otherNotes);
  prompt += `\n- 同行人：${companionText}`;

  // 交通偏好
  prompt += `\n\n交通偏好`;
  if (transport.intercity.length > 0) {
    prompt += `\n- 城际交通：${formatTagsWithOther(transport.intercity, "transport.intercity", otherNotes)}`;
  } else {
    prompt += `\n- 城际交通：无特别偏好`;
  }
  if (transport.intracity.length > 0) {
    prompt += `\n- 市内交通：${formatTagsWithOther(transport.intracity, "transport.intracity", otherNotes)}`;
  } else {
    prompt += `\n- 市内交通：无特别偏好`;
  }

  // 行程风格
  prompt += `\n\n行程风格`;
  if (style.preferences.length > 0) {
    prompt += `\n- 体验偏好：${style.preferences.join("、")}`;
  } else {
    prompt += `\n- 体验偏好：无特别偏好`;
  }
  if (style.stamina) {
    prompt += `\n- 体力接受度：${style.stamina}`;
  } else {
    prompt += `\n- 体力接受度：无特别偏好`;
  }
  if (style.timePreference) {
    prompt += `\n- 时间节奏：${style.timePreference}`;
  } else {
    prompt += `\n- 时间节奏：无特别偏好`;
  }

  // 餐饮需求
  prompt += `\n\n餐饮需求`;
  if (dining.enabled) {
    if (dining.scenes.length > 0) {
      prompt += `\n- 用餐场景偏好：${formatTagsWithOther(dining.scenes, "dining.scenes", otherNotes)}`;
    }
    if (dining.cuisines.length > 0) {
      prompt += `\n- 餐饮品类偏好：${formatTagsWithOther(dining.cuisines, "dining.cuisines", otherNotes)}`;
    }
    if (dining.dietary.length > 0) {
      prompt += `\n- 忌口/饮食限制：${formatTagsWithOther(dining.dietary, "dining.dietary", otherNotes)}`;
    }
    if (dining.scenes.length === 0 && dining.cuisines.length === 0 && dining.dietary.length === 0) {
      prompt += `\n- 需要安排餐食推荐，无特别偏好`;
    }
  } else {
    prompt += `\n- 不需要安排餐食（用户自行解决）`;
  }

  // 游玩偏好
  prompt += `\n\n游玩偏好`;
  if (attractions.scenicTypes.length > 0) {
    prompt += `\n- 景区/目的地类型：${formatTagsWithOther(attractions.scenicTypes, "attractions.scenicTypes", otherNotes)}`;
  } else {
    prompt += `\n- 景区/目的地类型：无特别偏好`;
  }
  if (attractions.activities.length > 0) {
    prompt += `\n- 活动体验：${formatTagsWithOther(attractions.activities, "attractions.activities", otherNotes)}`;
  } else {
    prompt += `\n- 活动体验：无特别偏好`;
  }

  // 住宿要求
  prompt += `\n\n住宿要求`;
  if (accommodation.enabled) {
    if (accommodation.types.length > 0) {
      prompt += `\n- 住宿类型：${formatTagsWithOther(accommodation.types, "accommodation.types", otherNotes)}`;
    }
    if (accommodation.preferences.length > 0) {
      prompt += `\n- 住宿偏好：${formatTagsWithOther(accommodation.preferences, "accommodation.preferences", otherNotes)}`;
    }
    if (accommodation.types.length === 0 && accommodation.preferences.length === 0) {
      prompt += `\n- 需要住宿安排，无特别偏好`;
    }
  } else {
    prompt += `\n- 不需要住宿安排（用户自行解决）`;
  }

  // 硬约束条件
  const activeConstraints = budget.constraints.filter((c) => c.enabled);
  prompt += `\n\n硬约束条件（必须满足）`;
  if (activeConstraints.length > 0) {
    activeConstraints.forEach((c) => {
      prompt += `\n- ${c.label}${c.note ? `：${c.note}` : ""}`;
    });
  } else {
    prompt += `\n- 无特殊约束`;
  }

  // 预算
  if (budget.level) {
    prompt += `\n- 预算偏好：${budget.level}`;
  }

  // === 【任务目标】 ===
  prompt += `

【任务目标】
请为用户生成一份详细旅行路线，要求：
1. 严格结合用户的出行日期、时间窗、出发地、返回地、交通偏好、餐饮偏好、游玩偏好、住宿需求、预算偏好与强约束；
2. 根据天气信息合理安排室内外活动比例——有真实预报数据的日期请严格参考，仅有季节推断的日期请合理预估；
3. 优先保证行程真实可行，而不是堆砌推荐点；
4. 尽量减少折返和不必要的长距离移动；
5. 用餐安排在合理时段（午餐 11:30-13:00，晚餐 17:30-19:00 为宜）；
6. 若信息不足或候选点冲突，优先选择最稳妥、最易执行的方案；
7. 如适合，提供1个简短备选方案。

【规划原则】
- 硬约束条件优先于一般偏好
- "无特别偏好"表示该项用户未指定，你可以根据实际情况合理安排，但不要过度补全
- "不需要...（用户自行解决）"表示明确不需要此类安排，不要出现在行程中
- 相邻地点优先选择距离近、转场顺路的组合
- 有真实天气预报的日期：雨天优先室内，高温注意避暑，低温注意保暖
- 仅有季节推断的日期：根据季节特征做合理预估，注明"天气为季节推断，建议出行前复查"
- 若用户有忌口，餐厅安排必须避开相关菜品
- 根据用户的体力接受度和行程风格调整每日点位数量和停留时长

【输出要求】
1. 输出必须为中文；
2. 输出必须严格按固定模板；
3. 每个地点后面给出简短推荐理由；
4. 每段交通写明"方式 + 预计时长"；
5. 备注中必须包含天气提示、交通提醒、排队/预约提醒、携带物提醒；
6. 不得虚构明显不存在的地点或极不合理的时间安排；
7. 若部分信息无法确认，请使用"建议/预计/优先考虑"等表述。

【固定输出模板】

【行程总览】
旅行城市：{{destination_city}}
出行日期：{{date_range}}
天气概况：{{weather_summary}}
行程风格：{{trip_style_summary}}
体力强度：{{energy_level_summary}}
预算倾向：{{budget_summary}}

【详细行程】

【Day {{day_index}}｜{{date}}｜{{day_theme}}】
当日天气：{{day_weather}}（标注数据来源：实时预报/季节推断）
出发地：{{day_origin}}

{{start_time}}-{{end_time}}：{{place_name}}
类型：{{place_type}}
推荐理由：{{reason}}
停留时长：{{stay_duration}}
前往方式：{{transport_mode}}（预计{{transport_duration}}）
预计花费：{{estimated_cost}}

【当日用餐】
{{meal_time}}：{{restaurant_name}}
类型：{{restaurant_type}}
推荐理由：{{meal_reason}}
预计人均：{{per_capita_cost}}
到达方式：{{transport_mode}}（预计{{transport_duration}}）

【当日住宿】（如用户不需要住宿则省略此节）
住宿区域：{{lodging_area}}
住宿类型：{{lodging_type}}
推荐理由：{{lodging_reason}}
预计价格区间：{{lodging_price_range}}

返回/收尾地点：{{day_end_location}}

【当日备注】
1. {{day_weather_note}}
2. {{day_traffic_note}}
3. {{day_reservation_note}}
4. {{day_special_note}}`;

  return prompt;
}
