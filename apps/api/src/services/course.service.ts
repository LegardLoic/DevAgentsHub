import type { LessonProgressInput } from '@devagentshub/validation';

import { AppError } from '../utils/app-error';
import { courseRepository, type CourseRepository } from '../repositories/course.repository';

export class CourseService {
  constructor(private readonly courses: CourseRepository = courseRepository) {}

  async listCourses() {
    return this.courses.listPublished();
  }

  async getCourse(slug: string, userId?: string) {
    const course = await this.courses.findPublishedBySlug(slug, userId);

    if (!course) {
      throw new AppError('The requested course could not be found.', 404, 'COURSE_NOT_FOUND');
    }

    return course;
  }

  async getLesson(slug: string, userId?: string) {
    const lesson = await this.courses.findLessonBySlug(slug, userId);

    if (!lesson) {
      throw new AppError('The requested lesson could not be found.', 404, 'LESSON_NOT_FOUND');
    }

    return lesson;
  }

  async updateLessonProgress(userId: string, lessonId: string, input: LessonProgressInput) {
    const lesson = await this.courses.findLessonRecordById(lessonId);

    if (!lesson || !lesson.course.isPublished) {
      throw new AppError('The requested lesson could not be found.', 404, 'LESSON_NOT_FOUND');
    }

    return this.courses.saveLessonProgress(userId, lessonId, input.completed);
  }
}

export const courseService = new CourseService();

