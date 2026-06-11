import type { DataSource } from '@/common/types/loadType';

export interface UserProfile {
  nickname: string;
  avatar: string;
  using_title: string;
  title_ownership: Record<string, boolean>;
  new: boolean;
  studentId: string;
}

export interface UserPoints {
  level: number;
  points: number;
  next_level_points: number;
}

export interface UserStore {
  profile: UserProfile | null;
  points: UserPoints | null;
  profileSource: DataSource | null;
  pointsSource: DataSource | null;

  ensureProfile: (options?: { force?: boolean }) => Promise<UserProfile | null>;
  ensurePoints: (options?: { force?: boolean }) => Promise<UserPoints | null>;
  updateProfile: (body: {
    nickname?: string;
    avatar?: string;
    using_title?: string;
  }) => Promise<UserProfile | null>;
  invalidateProfile: () => void;
  invalidateAll: () => void;
  reset: () => void;
}
