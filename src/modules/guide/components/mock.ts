interface CourseGuide {
  id: string;
  title: string;
  year: string; // "2022", "2023", "2024" 等
  term: string; // "第一学期", "第二学期", "第三学期"
}

// 生成所有手册数据
export const generateAllGuides = (): CourseGuide[] => {
  const guides: CourseGuide[] = [];
  const startYear = 2022;
  const currentYear = new Date().getFullYear();

  // 为每学年每学期生成一些手册
  for (let year = startYear; year <= currentYear; year++) {
    const terms = ['第一学期', '第二学期', '第三学期'];

    terms.forEach((term, termIndex) => {
      // 每个学期生成 3-5 个手册
      const count = 3 + Math.floor(Math.random() * 3);

      for (let i = 1; i <= count; i++) {
        guides.push({
          id: `${year}-${term}-${i}`,
          title: `${year}年${term}选课手册${i > 1 ? `(${i})` : ''}`,
          year: year.toString(),
          term: term,
        });
      }
    });
  }

  return guides;
};

// 获取筛选后的手册
export const getFilteredGuides = (
  allGuides: CourseGuide[],
  selectedYear: string,
  selectedTerm: string
): CourseGuide[] => {
  return allGuides.filter((guide) => {
    const yearMatch = selectedYear === '全部' || guide.year === selectedYear;
    const termMatch = selectedTerm === '全部' || guide.term === selectedTerm;
    return yearMatch && termMatch;
  });
};

// 预生成的数据
export const MOCK_GUIDES = generateAllGuides();
