import { create } from 'zustand';
import { db } from '../utils/db';
import { uid } from '../utils/id';
import { snapshotBaseline } from '../utils/derive';
import type { Auxiliary, CriterionDimension, DerivedBaseline, FireLevel, MethodName, ProcessingMethod } from '../types/processing-method';

export interface MethodInput {
  name: MethodName;
  auxiliary: Auxiliary;
  auxRatio: number;
  fireLevel: FireLevel;
  tempRange: [number, number];
  duration: number;
  criterion: string;
  criterionDimension: CriterionDimension;
  applicable: string;
  derivedFrom?: string;
  derivedBaseline?: DerivedBaseline;
  derivedReviewedAt?: string;
}

interface MethodState {
  methods: ProcessingMethod[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addMethod: (input: MethodInput) => Promise<ProcessingMethod>;
  updateMethod: (id: string, patch: Partial<MethodInput>) => Promise<void>;
  removeMethod: (id: string) => Promise<void>;
  /** 复制派生：以已有方法为模板生成新方法（可改辅料比例），并记录基础方法当前标准作基准 */
  deriveMethod: (sourceId: string, name: MethodName, auxRatio?: number) => Promise<ProcessingMethod | undefined>;
  /** 复核派生方法：按基础方法现行标准重记基准，撤掉“待复核”标记 */
  reviewDerived: (id: string) => Promise<void>;
  /** 选择方法即带出辅料比例、火候与判断标准 */
  describe: (id: string) => { auxiliary: Auxiliary; auxRatio: number; fireLevel: FireLevel; tempRange: [number, number]; duration: number; criterion: string } | undefined;
}

export const useMethodStore = create<MethodState>()((set, get) => ({
  methods: [],
  hydrated: false,

  hydrate: async () => {
    const methods = await db.methods.toArray();
    set({ methods, hydrated: true });
  },

  addMethod: async (input) => {
    const method: ProcessingMethod = {
      id: uid('method'),
      name: input.name,
      auxiliary: input.auxiliary,
      auxRatio: Number(input.auxRatio) || 0,
      fireLevel: input.fireLevel,
      tempRange: input.tempRange,
      duration: Number(input.duration) || 0,
      criterion: input.criterion.trim(),
      criterionDimension: input.criterionDimension,
      applicable: input.applicable.trim(),
      derivedFrom: input.derivedFrom,
      derivedBaseline: input.derivedBaseline,
      derivedReviewedAt: input.derivedReviewedAt,
    };
    await db.methods.put(method);
    set({ methods: [...get().methods, method] });
    return method;
  },

  updateMethod: async (id, patch) => {
    const current = get().methods.find((m) => m.id === id);
    if (!current) {
      return;
    }
    const next: ProcessingMethod = { ...current, ...patch };
    await db.methods.put(next);
    set({ methods: get().methods.map((m) => (m.id === id ? next : m)) });
  },

  removeMethod: async (id) => {
    await db.methods.delete(id);
    set({ methods: get().methods.filter((m) => m.id !== id) });
  },

  deriveMethod: async (sourceId, name, auxRatio) => {
    const source = get().methods.find((m) => m.id === sourceId);
    if (!source) {
      return undefined;
    }
    return get().addMethod({
      name,
      auxiliary: source.auxiliary,
      auxRatio: auxRatio ?? source.auxRatio,
      fireLevel: source.fireLevel,
      tempRange: source.tempRange,
      duration: source.duration,
      criterion: source.criterion,
      criterionDimension: source.criterionDimension,
      applicable: `${source.applicable}（派生）`,
      derivedFrom: source.id,
      derivedBaseline: snapshotBaseline(source),
    });
  },

  reviewDerived: async (id) => {
    const current = get().methods.find((m) => m.id === id);
    if (!current?.derivedFrom) {
      return;
    }
    const base = get().methods.find((m) => m.id === current.derivedFrom);
    if (!base) {
      return;
    }
    const next: ProcessingMethod = {
      ...current,
      derivedBaseline: snapshotBaseline(base),
      derivedReviewedAt: new Date().toISOString(),
    };
    await db.methods.put(next);
    set({ methods: get().methods.map((m) => (m.id === id ? next : m)) });
  },

  describe: (id) => {
    const method = get().methods.find((m) => m.id === id);
    if (!method) {
      return undefined;
    }
    return {
      auxiliary: method.auxiliary,
      auxRatio: method.auxRatio,
      fireLevel: method.fireLevel,
      tempRange: method.tempRange,
      duration: method.duration,
      criterion: method.criterion,
    };
  },
}));
