import { Event } from "../event/event.type";
import { Todo } from "../todo/todo.type";

export interface Syllabus {
  id?: string;
  courseId: string;
  semester: string;
  // instructor: string;
  syllabusUploadPath: string;
  events: Event[];
  // todos: Todo[];
  // gradingPolicy: Map<string, number>;
}
