import { ILookupItem, LookupModel } from "@/apiClient/data-contracts";
import React, { ReactNode } from "react";

export default class LookupClass {
  lookup: LookupModel;
  record: Record<number, ILookupItem>;

  constructor(lookup: LookupModel) {
    this.lookup = lookup;
    this.record = {};
    lookup.items.forEach((i) => {
      this.record[i.id] = i;
    });
  }

  get active(): ILookupItem[] {
    return this.lookup.items.filter((i) => i.active);
  }

  get inactive(): ILookupItem[] {
    return this.lookup.items.filter((i) => !i.active);
  }

  get all(): ILookupItem[] {
    return this.lookup.items;
  }

  byParent(parentId: number): ILookupItem[] {
    return this.lookup.items.filter((i) => i.active && i.parentId === parentId);
  }

  allByParent(parentId: number): ILookupItem[] {
    return this.lookup.items.filter((i) => i.parentId === parentId);
  }

  display(id?: number | null): ReactNode {
    if (id === null || id === undefined)
      return <em className="text-muted">- none -</em>;

    const item = this.record[id];
    if (item) {
      if (item.active) return <>{item.name}</>;
      else return <em className="text-warning strike-through">{item.name}</em>;
    } else {
      return <em className="text-danger">- not found -</em>;
    }
  }
}
