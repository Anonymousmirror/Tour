// 约束条目（带备注的多选项）
export interface ConstraintItem {
  label: string;
  enabled: boolean;
  note: string;
}

// 基础信息
export interface BasicInfo {
  city: string;
  startDate: string;
  endDate: string;
  departure: string;
  returnTo: string;
  departureTime: string;
  returnTime: string;
}

// 餐饮需求
export interface DiningData {
  enabled: boolean;
  scenes: string[];
  cuisines: string[];
  dietary: string[];
}

// 交通方式
export interface TransportData {
  intercity: string[];
  intracity: string[];
}

// 行程风格
export interface StyleData {
  preferences: string[];
  stamina: string;
  timePreference: string;
}

// 游玩偏好
export interface AttractionData {
  scenicTypes: string[];
  activities: string[];
}

// 住宿要求
export interface AccommodationData {
  enabled: boolean;
  types: string[];
  preferences: string[];
}

// 预算+约束
export interface BudgetData {
  level: string;
  constraints: ConstraintItem[];
}

// 完整问卷数据
export interface SurveyData {
  basicInfo: BasicInfo;
  companion: string[];
  transport: TransportData;
  style: StyleData;
  dining: DiningData;
  attractions: AttractionData;
  accommodation: AccommodationData;
  budget: BudgetData;
  otherNotes: Record<string, string>;
}

// 步骤配置
export interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}
