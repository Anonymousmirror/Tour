import { StepConfig } from "./types";

// 步骤配置
export const STEPS: StepConfig[] = [
  { id: 1, title: "基础信息", subtitle: "告诉我们你的旅行计划", icon: "map-pin" },
  { id: 2, title: "出行成员", subtitle: "谁和你一起出发？", icon: "users" },
  { id: 3, title: "出行方式", subtitle: "你喜欢怎样的交通方式？", icon: "car" },
  { id: 4, title: "行程风格", subtitle: "定义你的旅行节奏", icon: "compass" },
  { id: 5, title: "餐饮需求", subtitle: "探索当地美食", icon: "utensils" },
  { id: 6, title: "游玩偏好", subtitle: "发现旅途中的精彩", icon: "camera" },
  { id: 7, title: "住宿要求", subtitle: "选择理想的落脚点", icon: "bed" },
  { id: 8, title: "预算与约束", subtitle: "最后的细节调整", icon: "wallet" },
];

// Step 2: 同行人类型
export const COMPANION_OPTIONS = [
  "一人",
  "情侣/伴侣",
  "朋友结伴",
  "亲子",
  "带老人",
  "同事/商务",
  "其他",
];

// Step 3: 城际到达方式
export const INTERCITY_OPTIONS = [
  "自驾",
  "高铁/火车",
  "飞机",
  "大巴",
  "其他",
];

// Step 3: 市内交通方式
export const INTRACITY_OPTIONS = [
  "步行",
  "打车/网约车",
  "公交",
  "地铁",
  "骑行/共享单车",
  "小电驴",
  "自驾",
  "其他",
];

// Step 4: 出行体验偏好
export const STYLE_PREFERENCE_OPTIONS = [
  "休闲慢游型",
  "经典均衡型",
  "紧凑充实型",
  "深度体验型",
  "美食优先型",
  "拍照出片型",
  "低体力友好型",
];

// Step 4: 体力接受度
export const STAMINA_OPTIONS = ["低", "中", "高"];

// Step 4: 时间偏好
export const TIME_PREFERENCE_OPTIONS = [
  "早起型",
  "正常节奏",
  "晚起型",
  "夜生活优先",
];

// Step 5: 用餐场景偏好
export const DINING_SCENE_OPTIONS = [
  "平价高性价比",
  "学生党小吃饮品",
  "亲子友好",
  "网红出片",
  "本地老店",
  "环境安静适合聊天",
  "其他",
];

// Step 5: 餐饮品类偏好
export const CUISINE_OPTIONS = [
  "咖啡奶茶",
  "地方菜",
  "烧烤烤肉",
  "小吃简餐",
  "日式料理",
  "自助餐",
  "火锅",
  "川湘菜",
  "西餐",
  "甜品蛋糕",
  "鱼鲜海鲜",
  "粤菜",
  "东南亚菜",
  "云贵菜",
  "食品生鲜",
  "江浙菜",
  "西北菜",
  "其他",
];

// Step 5: 忌口
export const DIETARY_OPTIONS = [
  "不吃辣",
  "不要生食",
  "不吃香菜",
  "不碰坚果",
  "乳糖不耐",
  "素食主义",
  "其他",
];

// Step 6: 景区/目的地偏好
export const SCENIC_TYPE_OPTIONS = [
  "自然景观",
  "名胜古迹",
  "特色街区",
  "小众景点",
  "博物馆/美术馆",
  "商圈购物",
  "夜景夜市",
  "城市地标",
  "校园/文艺街区",
  "其他",
];

// Step 6: 活动体验偏好
export const ACTIVITY_OPTIONS = [
  "足疗按摩",
  "洗浴汗蒸",
  "KTV",
  "剧本杀",
  "密室",
  "棋牌室",
  "茶馆",
  "文化艺术",
  "电影演出",
  "DIY手作",
  "台球/球类运动",
  "儿童乐园",
  "露营",
  "农家采摘",
  "酒吧",
  "商场",
  "其他",
];

// Step 7: 住宿类型
export const ACCOMMODATION_TYPE_OPTIONS = [
  "酒店",
  "民宿",
  "青旅",
  "钟点房",
  "其他",
];

// Step 7: 住宿偏好
export const ACCOMMODATION_PREFERENCE_OPTIONS = [
  "市中心方便",
  "景点附近",
  "地铁站附近",
  "停车方便",
  "安静",
  "性价比高",
  "高品质",
  "其他",
];

// Step 8: 预算偏好
export const BUDGET_LEVEL_OPTIONS = [
  "省钱优先",
  "性价比优先",
  "体验优先",
  "高品质优先",
];

// Step 8: 备注约束选项
export const CONSTRAINT_OPTIONS = [
  { label: "必去地点", hasNote: true },
  { label: "必吃店", hasNote: true },
  { label: "不想去的地方", hasNote: true },
  { label: "必须几点前返回", hasNote: true },
  { label: "不接受排队", hasNote: true },
  { label: "不想走太多路", hasNote: true },
  { label: "需要午休", hasNote: false },
  { label: "需要方便停车", hasNote: false },
  { label: "需要宠物友好", hasNote: true },
  { label: "需要婴儿车友好", hasNote: false },
  { label: "需要无障碍", hasNote: false },
  { label: "其他要求", hasNote: true },
];
