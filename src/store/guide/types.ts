import type { DataSource } from '@/store/types';

export interface GuideLabelItem {
  name: string;
  content: string;
  labels: { year?: string; term?: string; type?: string };
}

export interface GuideStore {
  labels: GuideLabelItem[];
  source: DataSource | null;

  loadLabels: () => Promise<GuideLabelItem[]>;
  filterLabels: (year: string, term: string) => { name: string; content: string }[];
}
