/** 火力等级 */
export type FireLevel = '文火' | '中火' | '武火';

/** 炮制方法类别 */
export type MethodName =
  | '清炒'
  | '麸炒'
  | '酒炙'
  | '醋炙'
  | '盐炙'
  | '蜜炙'
  | '蒸'
  | '煮'
  | '燀'
  | '煅';

/** 辅料 */
export type Auxiliary = '无' | '黄酒' | '米醋' | '食盐' | '蜂蜜' | '麦麸' | '灶心土';

/** 判断标准维度 */
export type CriterionDimension = '色泽' | '气味' | '断面';

/** 派生时记录的基础方法关键标准快照（用于判断“基础方法已改”） */
export interface DerivedBaseline {
  /** 每 100kg 药材辅料用量（kg） */
  auxRatio: number;
  /** 温度区间（℃），[下限, 上限] */
  tempRange: [number, number];
  /** 炮制时间（min） */
  duration: number;
  /** 判断标准 */
  criterion: string;
}

/** 炮制方法（辅料比例 / 火候 / 判断标准） */
export interface ProcessingMethod {
  id: string;
  /** 方法名 */
  name: MethodName;
  /** 辅料 */
  auxiliary: Auxiliary;
  /** 每 100kg 药材辅料用量（kg） */
  auxRatio: number;
  /** 火力 */
  fireLevel: FireLevel;
  /** 温度区间（℃），[下限, 上限] */
  tempRange: [number, number];
  /** 炮制时间（min） */
  duration: number;
  /** 判断标准：色泽 / 气味 / 断面 */
  criterion: string;
  /** 判断标准侧重维度 */
  criterionDimension: CriterionDimension;
  /** 适用药材说明 */
  applicable: string;
  /** 是否为派生方法（由某个基础方法复制派生而来） */
  derivedFrom?: string;
  /** 派生（或上次复核）时基础方法的关键标准快照，与基础方法现行值不一致即待复核 */
  derivedBaseline?: DerivedBaseline;
  /** 上次复核时间（ISO） */
  derivedReviewedAt?: string;
}

export const FIRE_LEVELS: FireLevel[] = ['文火', '中火', '武火'];
export const METHOD_NAMES: MethodName[] = [
  '清炒',
  '麸炒',
  '酒炙',
  '醋炙',
  '盐炙',
  '蜜炙',
  '蒸',
  '煮',
  '燀',
  '煅',
];
export const AUXILIARIES: Auxiliary[] = ['无', '黄酒', '米醋', '食盐', '蜂蜜', '麦麸', '灶心土'];
export const CRITERION_DIMENSIONS: CriterionDimension[] = ['色泽', '气味', '断面'];
