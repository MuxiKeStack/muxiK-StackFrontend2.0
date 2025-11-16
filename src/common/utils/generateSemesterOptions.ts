import { get } from '../api/get';

export interface semesterOptionsType {
  yearOptions: string[];
  //   semesterOptions: string[];
  currentSemester: { year: string; sem: string };
}

export const generateSemesterOptions = async (): Promise<semesterOptionsType> => {
  const response = (await get('/users/profile')) as ResponseUser;
  const { studentId } = response.data;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const firstOfUserYear = Number(studentId?.slice(0, 4) ?? new Date().getFullYear());

  const yearOptions: string[] = [];
  //   const semesterOptions: string[] = [];
  const currentSemester: { year: string; sem: string } = {} as {
    year: string;
    sem: string;
  };
  const currentSemesterNumber = currentMonth >= 3 ? 1 : currentMonth >= 6 ? 2 : 3;

  for (let year = firstOfUserYear; year <= currentYear; year++) {
    if (year === currentYear) {
      if (currentMonth >= 6) yearOptions.push(`${year}-${year + 1}学年`);
    } else {
      yearOptions.push(`${year}-${year + 1}学年`);
    }
  }

  if (currentSemesterNumber === 1) currentSemester.sem = '第一学期';
  else if (currentSemesterNumber === 2) currentSemester.sem = '第二学期';
  else if (currentSemesterNumber === 3) currentSemester.sem = '第三学期';

  currentSemester.year = yearOptions[yearOptions.length - 1];

  return {
    yearOptions,
    // semesterOptions,
    currentSemester,
  };
};
