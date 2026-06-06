export type AvatarFrame = 'default' | 'colorful';

// 以此致敬blg战队于2024季中邀请赛中对战gen.g战队，被gen.g peyz 打出 28/2/7，泉水五杀的精彩表现
const EASTER_EGG_MAP: Record<string, AvatarFrame> = {
  '28275': 'colorful',
};

export function resolveAvatarFrame(nickname?: string): AvatarFrame {
  if (nickname && EASTER_EGG_MAP[nickname]) {
    return EASTER_EGG_MAP[nickname];
  }
  return 'default';
}
