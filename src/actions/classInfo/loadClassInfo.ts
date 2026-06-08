import { useClassInfoStore } from '@/store/classInfo';
import { useCourseStore } from '@/store/course';

/** 编排：拉班级信息 + 同步课程缓存到 course store */
export async function loadClassInfo(courseId: number) {
  const data = await useClassInfoStore.getState().load(courseId);

  if (data.course) {
    useCourseStore.getState().cacheCourseDetails({
      [courseId]: {
        name: data.course.name,
        teacher: data.course.teacher,
        school: '',
      },
    });
  }

  return data;
}
