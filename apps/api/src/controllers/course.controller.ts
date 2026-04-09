import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';
import { courseService, type CourseService } from '../services/course.service';

export class CourseController {
  constructor(private readonly courses: CourseService = courseService) {}

  list = asyncHandler(async (_req, res) => {
    const courses = await this.courses.listCourses();

    res.status(200).json({
      data: courses,
    });
  });

  getBySlug = asyncHandler(async (req, res) => {
    const course = await this.courses.getCourse(req.params.slug as string, req.authUser?.id);

    res.status(200).json({
      data: course,
    });
  });

  getLessonBySlug = asyncHandler(async (req, res) => {
    const lesson = await this.courses.getLesson(req.params.slug as string, req.authUser?.id);

    res.status(200).json({
      data: lesson,
    });
  });

  updateProgress = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const progress = await this.courses.updateLessonProgress(
      req.authUser.id,
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      data: progress,
    });
  });
}

export const courseController = new CourseController();
