import type {
  AdminArticleInput,
  AdminCourseInput,
  AdminLessonInput,
} from '@devagentshub/validation';

import { articleRepository, type ArticleRepository } from '../repositories/article.repository';
import { courseRepository, type CourseRepository } from '../repositories/course.repository';
import { AppError } from '../utils/app-error';

export class AdminContentService {
  constructor(
    private readonly articles: ArticleRepository = articleRepository,
    private readonly courses: CourseRepository = courseRepository,
  ) {}

  async listArticles() {
    return this.articles.listAll();
  }

  async getArticle(id: string) {
    const article = await this.articles.findById(id);

    if (!article) {
      throw new AppError('The requested article could not be found.', 404, 'ARTICLE_NOT_FOUND');
    }

    return article;
  }

  async createArticle(input: AdminArticleInput) {
    await this.ensureArticleSlugAvailable(input.slug);
    return this.articles.createArticle(input);
  }

  async updateArticle(id: string, input: AdminArticleInput) {
    await this.getArticle(id);
    await this.ensureArticleSlugAvailable(input.slug, id);
    return this.articles.updateArticle(id, input);
  }

  async listCourses() {
    return this.courses.listAll();
  }

  async getCourse(id: string) {
    const course = await this.courses.findById(id);

    if (!course) {
      throw new AppError('The requested course could not be found.', 404, 'COURSE_NOT_FOUND');
    }

    return course;
  }

  async createCourse(input: AdminCourseInput) {
    await this.ensureCourseSlugAvailable(input.slug);
    return this.courses.createCourse(input);
  }

  async updateCourse(id: string, input: AdminCourseInput) {
    await this.getCourse(id);
    await this.ensureCourseSlugAvailable(input.slug, id);
    return this.courses.updateCourse(id, input);
  }

  async createLesson(courseId: string, input: AdminLessonInput) {
    await this.getCourse(courseId);
    await this.ensureLessonSlugAvailable(input.slug);
    await this.ensureLessonOrderAvailable(courseId, input.order);
    return this.courses.createLesson(courseId, input);
  }

  async updateLesson(id: string, input: AdminLessonInput) {
    const lesson = await this.courses.findLessonById(id);

    if (!lesson) {
      throw new AppError('The requested lesson could not be found.', 404, 'LESSON_NOT_FOUND');
    }

    await this.ensureLessonSlugAvailable(input.slug, id);
    await this.ensureLessonOrderAvailable(lesson.courseId, input.order, id);

    return this.courses.updateLesson(id, input);
  }

  private async ensureArticleSlugAvailable(slug: string, currentId?: string) {
    const existingArticle = await this.articles.findBySlug(slug);

    if (existingArticle && existingArticle.id !== currentId) {
      throw new AppError('An article with this slug already exists.', 409, 'ARTICLE_SLUG_CONFLICT');
    }
  }

  private async ensureCourseSlugAvailable(slug: string, currentId?: string) {
    const existingCourse = await this.courses.findCourseBySlug(slug);

    if (existingCourse && existingCourse.id !== currentId) {
      throw new AppError('A course with this slug already exists.', 409, 'COURSE_SLUG_CONFLICT');
    }
  }

  private async ensureLessonSlugAvailable(slug: string, currentId?: string) {
    const existingLesson = await this.courses.findLessonBySlugForAdmin(slug);

    if (existingLesson && existingLesson.id !== currentId) {
      throw new AppError('A lesson with this slug already exists.', 409, 'LESSON_SLUG_CONFLICT');
    }
  }

  private async ensureLessonOrderAvailable(courseId: string, order: number, currentId?: string) {
    const existingLesson = await this.courses.findLessonByCourseAndOrder(courseId, order);

    if (existingLesson && existingLesson.id !== currentId) {
      throw new AppError(
        'A lesson already uses this order inside the selected course.',
        409,
        'LESSON_ORDER_CONFLICT',
      );
    }
  }
}

export const adminContentService = new AdminContentService();
