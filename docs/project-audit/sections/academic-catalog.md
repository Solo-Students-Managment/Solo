# Section: Subjects, Courses, Classes & Curriculum

## Purpose

Define teachable subjects, terms, courses/classes, curriculum and lesson plans.

## Used By Roles

Owner, academic manager, org teacher, teacher and enrolled students.

## Current Pages

Org subjects, courses, curriculum, lesson plans and teacher plans.

## Expected Pages

Assigned teacher/class views, course detail/edit/archive, publish/version workflows and student catalog context.

## Current Features

Mock creation, class/term/clone operations, curriculum and lesson-plan authoring.

## Missing Features

Consistent update/delete/archive, assignments to teachers/students, version/publish rules and consumer views.

## API

Typed clients default to in-memory; incomplete CRUD on several entities.

## Database

Missing Subject, Term, Course, Class, TeacherAssignment, Curriculum/Module/Unit/Lesson and version relations.

## Permissions

Mostly reuses `students.manage`; academic-manager/teacher action boundaries are undefined.

## UI Components

Rich org mock views, but no cross-page context/breadcrumbs and limited mobile workflow validation.

## Business Flows

Create course → assign teacher/students → teach/consume is partial and not durable.

## Problems

No source-of-truth lifecycle or role scope.

## Required Improvements

Establish academic entity ownership/versioning and capability keys.

## Implementation Checklist

- [ ] Finalize academic schema and lifecycle
- [ ] Add scoped CRUD/publish APIs
- [ ] Connect teacher and student views
