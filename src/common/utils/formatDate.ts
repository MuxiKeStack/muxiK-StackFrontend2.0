type DateInput = string | number | Date;

const toDate = (input: DateInput = new Date().toISOString()): Date => {
  if (input instanceof Date) return input;
  return new Date(input);
};

export const formatDate = (
  input?: DateInput,
  format: string = 'yyyy年MM月dd日'
): string => {
  const date = toDate(input);

  const map: Record<string, string> = {
    yyyy: date.getFullYear().toString(),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    M: (date.getMonth() + 1).toString(),
    dd: date.getDate().toString().padStart(2, '0'),
    d: date.getDate().toString(),
    hh: date.getHours().toString().padStart(2, '0'),
    h: date.getHours().toString(),
    mm: date.getMinutes().toString().padStart(2, '0'),
    m: date.getMinutes().toString(),
    ss: date.getSeconds().toString().padStart(2, '0'),
    s: date.getSeconds().toString(),
  };

  return format.replace(/yyyy|MM|M|dd|d|hh|h|mm|m|ss|s/g, (match) => {
    return map[match] || match;
  });
};

export const formatIMTime = (
  input: DateInput | undefined,
  mustIncludeTime: boolean = true
): string => {
  const src = toDate(input);
  const now = new Date();
  const timePart = `${formatDate(src, 'hh:mm')}`;

  const oneDay = 24 * 60 * 60 * 1000;

  const currYear = now.getFullYear();
  const currMonth = now.getMonth() + 1;
  const currDate = now.getDate();

  const srcYear = src.getFullYear();
  const srcMonth = src.getMonth() + 1;
  const srcDate = src.getDate();

  // 同年
  if (currYear === srcYear) {
    // 同月
    if (currMonth === srcMonth) {
      // 同日
      if (currDate === srcDate) {
        const diff = now.getTime() - src.getTime();

        if (diff < 60 * 1000) {
          return '刚刚';
        }
        return timePart;
      }

      // 昨天
      const yesterday = new Date(now.getTime() - oneDay);
      if (srcDate === yesterday.getDate()) {
        return `昨天${mustIncludeTime ? ` ${timePart}` : ''}`;
      }

      // 前天
      const beforeYesterday = new Date(now.getTime() - 2 * oneDay);
      if (srcDate === beforeYesterday.getDate()) {
        return `前天${mustIncludeTime ? ` ${timePart}` : ''}`;
      }

      // 七天内
      const diff = now.getTime() - src.getTime();
      if (diff <= 7 * oneDay) {
        const weekdays = [
          '星期日',
          '星期一',
          '星期二',
          '星期三',
          '星期四',
          '星期五',
          '星期六',
        ];
        return `${weekdays[src.getDay()]}${mustIncludeTime ? ` ${timePart}` : ''}`;
      }
    }

    // 同年但非同月
    return formatDate(src, `M月d日${mustIncludeTime ? ' hh:mm' : ''}`);
  }

  // 跨年
  return formatDate(src, `yyyy年M月d日${mustIncludeTime ? ' hh:mm' : ''}`);
};
