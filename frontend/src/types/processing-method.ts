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

/** 基础方法关键参数快照：派生/复核时记录，用于识别「基础方法已改」 */
export interface MethodSnapshot {
  /** 每 100kg 药材辅料用量（kg） */
  auxRatio: number;
  /** 温度区间（℃），[下限, 上限] */
  tempRange: [number, number];
  /** 炮制时间（min） */
  duration: number;
  /** 判断标准 */
  criterion: string;
  /** 判断标准侧重维度 */
  criterionDimension: CriterionDimension;
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
  /** 派生/最近复核时基础方法的关键参数快照；与基础方法当前值不一致即「待复核」 */
  baseSnapshot?: MethodSnapshot;
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

/** 提取方法的关键参数快照（辅料比例 / 温度区间 / 时长 / 判断标准） */
export function snapshotOf(method: ProcessingMethod): MethodSnapshot {
  return {
    auxRatio: method.auxRatio,
    tempRange: [method.tempRange[0], method.tempRange[1]],
    duration: method.duration,
    criterion: method.criterion,
    criterionDimension: method.criterionDimension,
  };
}

/** 派生方法快照与基础方法当前值的差异行（空数组表示一致） */
export function baseDiffLines(method: ProcessingMethod, base: ProcessingMethod): string[] {
  const snapshot = method.baseSnapshot;
  if (!snapshot) {
    return [];
  }
  const lines: string[] = [];
  if (snapshot.tempRange[0] !== base.tempRange[0] || snapshot.tempRange[1] !== base.tempRange[1]) {
    lines.push(`温度区间 ${snapshot.tempRange[0]}~${snapshot.tempRange[1]}℃ → ${base.tempRange[0]}~${base.tempRange[1]}℃`);
  }
  if (snapshot.duration !== base.duration) {
    lines.push(`时长 ${snapshot.duration}min → ${base.duration}min`);
  }
  if (snapshot.criterion !== base.criterion) {
    lines.push(`判断标准「${snapshot.criterion}」→「${base.criterion}」`);
  }
  if (snapshot.criterionDimension !== base.criterionDimension) {
    lines.push(`判断侧重 ${snapshot.criterionDimension} → ${base.criterionDimension}`);
  }
  if (snapshot.auxRatio !== base.auxRatio) {
    lines.push(`辅料比例 ${snapshot.auxRatio}kg → ${base.auxRatio}kg（每 100kg 药材）`);
  }
  return lines;
}

/** 基础方法自派生/最近复核后是否有变动（有变动即待复核） */
export function isBaseChanged(method: ProcessingMethod, base: ProcessingMethod | undefined): boolean {
  if (!base) {
    return false;
  }
  return baseDiffLines(method, base).length > 0;
}
