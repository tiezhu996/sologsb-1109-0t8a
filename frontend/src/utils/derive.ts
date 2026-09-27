import type { DerivedBaseline, ProcessingMethod } from '../types/processing-method';

/** 基础方法变动后需要派生方法跟着复核的关键标准字段 */
export type DerivationWatchKey = 'auxRatio' | 'tempRange' | 'duration' | 'criterion';

export interface DerivationDiff {
  key: DerivationWatchKey;
  label: string;
  /** 派生（或上次复核）时基础方法的值 */
  baselineValue: string;
  /** 基础方法现行值 */
  baseValue: string;
}

export type DerivationStatus =
  | { kind: 'none' }
  | { kind: 'missing' }
  | { kind: 'pending'; diffs: DerivationDiff[]; hasBaseline: boolean }
  | { kind: 'synced' };

/** 记录基础方法当前的关键标准快照（派生时 / 复核时调用） */
export function snapshotBaseline(method: ProcessingMethod): DerivedBaseline {
  return {
    auxRatio: method.auxRatio,
    tempRange: [method.tempRange[0], method.tempRange[1]],
    duration: method.duration,
    criterion: method.criterion,
  };
}

export function formatTempRange(range: [number, number]): string {
  return `${range[0]}~${range[1]}℃`;
}

/** 对比派生基准与基础方法现行标准，逐项列出变动 */
export function baselineDiffs(derived: ProcessingMethod, base: ProcessingMethod): DerivationDiff[] {
  const baseline = derived.derivedBaseline;
  if (!baseline) {
    return [];
  }
  const diffs: DerivationDiff[] = [];
  if (baseline.auxRatio !== base.auxRatio) {
    diffs.push({ key: 'auxRatio', label: '辅料比例', baselineValue: `${baseline.auxRatio}kg/100kg`, baseValue: `${base.auxRatio}kg/100kg` });
  }
  if (baseline.tempRange[0] !== base.tempRange[0] || baseline.tempRange[1] !== base.tempRange[1]) {
    diffs.push({ key: 'tempRange', label: '温度区间', baselineValue: formatTempRange(baseline.tempRange), baseValue: formatTempRange(base.tempRange) });
  }
  if (baseline.duration !== base.duration) {
    diffs.push({ key: 'duration', label: '时长', baselineValue: `${baseline.duration}min`, baseValue: `${base.duration}min` });
  }
  if (baseline.criterion !== base.criterion) {
    diffs.push({ key: 'criterion', label: '判断标准', baselineValue: baseline.criterion, baseValue: base.criterion });
  }
  return diffs;
}

/** 派生方法相对基础方法的联动状态（无基准的旧数据一律按待复核处理） */
export function derivationStatus(method: ProcessingMethod, methods: ProcessingMethod[]): DerivationStatus {
  if (!method.derivedFrom) {
    return { kind: 'none' };
  }
  const base = methods.find((m) => m.id === method.derivedFrom);
  if (!base) {
    return { kind: 'missing' };
  }
  if (!method.derivedBaseline) {
    return { kind: 'pending', diffs: [], hasBaseline: false };
  }
  const diffs = baselineDiffs(method, base);
  return diffs.length > 0 ? { kind: 'pending', diffs, hasBaseline: true } : { kind: 'synced' };
}

/** 仍在引用某个基础方法的派生方法（删除基础方法前拦截用） */
export function findDerivedUsers(methods: ProcessingMethod[], baseId: string): ProcessingMethod[] {
  return methods.filter((m) => m.derivedFrom === baseId);
}
