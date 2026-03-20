import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SurveyData,
  BasicInfo,
  DiningData,
  TransportData,
  StyleData,
  AttractionData,
  AccommodationData,
  BudgetData,
} from "./types";

interface SurveyStore {
  // 当前步骤 (1-8, 9=结果页)
  currentStep: number;
  // 问卷数据
  data: SurveyData;
  // 导航
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  goToResult: () => void;
  // 数据更新
  updateBasicInfo: (info: Partial<BasicInfo>) => void;
  setCompanion: (companion: string[]) => void;
  updateTransport: (transport: Partial<TransportData>) => void;
  updateStyle: (style: Partial<StyleData>) => void;
  updateDining: (dining: Partial<DiningData>) => void;
  updateAttractions: (attractions: Partial<AttractionData>) => void;
  updateAccommodation: (accommodation: Partial<AccommodationData>) => void;
  updateBudget: (budget: Partial<BudgetData>) => void;
  // 标签切换辅助
  toggleTag: (
    field: keyof SurveyData,
    subField: string,
    value: string
  ) => void;
  // 约束管理
  toggleConstraint: (label: string) => void;
  updateConstraintNote: (label: string, note: string) => void;
  // 其他备注
  setOtherNote: (key: string, note: string) => void;
  // 重置
  reset: () => void;
}

const initialData: SurveyData = {
  basicInfo: {
    city: "",
    startDate: "",
    endDate: "",
    departure: "",
    returnTo: "",
    departureTime: "",
    returnTime: "",
  },
  companion: [],
  transport: { intercity: [], intracity: [] },
  style: { preferences: [], stamina: "", timePreference: "" },
  dining: { enabled: false, scenes: [], cuisines: [], dietary: [] },
  attractions: { scenicTypes: [], activities: [] },
  accommodation: { enabled: false, types: [], preferences: [] },
  budget: { level: "", constraints: [] },
  otherNotes: {},
};

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: { ...initialData },

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 9),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      goToStep: (step: number) => set({ currentStep: step }),

      goToResult: () => set({ currentStep: 9 }),

      updateBasicInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            basicInfo: { ...state.data.basicInfo, ...info },
          },
        })),

      setCompanion: (companion) =>
        set((state) => ({
          data: { ...state.data, companion },
        })),

      updateTransport: (transport) =>
        set((state) => ({
          data: {
            ...state.data,
            transport: { ...state.data.transport, ...transport },
          },
        })),

      updateStyle: (style) =>
        set((state) => ({
          data: {
            ...state.data,
            style: { ...state.data.style, ...style },
          },
        })),

      updateDining: (dining) =>
        set((state) => ({
          data: {
            ...state.data,
            dining: { ...state.data.dining, ...dining },
          },
        })),

      updateAttractions: (attractions) =>
        set((state) => ({
          data: {
            ...state.data,
            attractions: { ...state.data.attractions, ...attractions },
          },
        })),

      updateAccommodation: (accommodation) =>
        set((state) => ({
          data: {
            ...state.data,
            accommodation: { ...state.data.accommodation, ...accommodation },
          },
        })),

      updateBudget: (budget) =>
        set((state) => ({
          data: {
            ...state.data,
            budget: { ...state.data.budget, ...budget },
          },
        })),

      toggleTag: (field, subField, value) =>
        set((state) => {
          const fieldData = state.data[field] as unknown as Record<string, unknown>;
          const arr = (fieldData[subField] as string[]) || [];
          const newArr = arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value];
          return {
            data: {
              ...state.data,
              [field]: { ...fieldData, [subField]: newArr },
            },
          };
        }),

      toggleConstraint: (label) =>
        set((state) => {
          const constraints = [...state.data.budget.constraints];
          const idx = constraints.findIndex((c) => c.label === label);
          if (idx >= 0) {
            constraints.splice(idx, 1);
          } else {
            constraints.push({ label, enabled: true, note: "" });
          }
          return {
            data: {
              ...state.data,
              budget: { ...state.data.budget, constraints },
            },
          };
        }),

      updateConstraintNote: (label, note) =>
        set((state) => {
          const constraints = state.data.budget.constraints.map((c) =>
            c.label === label ? { ...c, note } : c
          );
          return {
            data: {
              ...state.data,
              budget: { ...state.data.budget, constraints },
            },
          };
        }),

      setOtherNote: (key, note) =>
        set((state) => ({
          data: {
            ...state.data,
            otherNotes: { ...state.data.otherNotes, [key]: note },
          },
        })),

      reset: () => set({ currentStep: 1, data: { ...initialData } }),
    }),
    {
      name: "tour-survey-storage",
      partialize: (state) => ({ data: state.data }),
    }
  )
);
