# 1. Project Identity

- What is the full project name (confirm: Student Management System) and the short tagline?

Solo, managing your students made easy with us

- What is the project vision / mission?

The goal of this project is to establish communication between students, teachers, and parents, make student management easier, allow parents to stay informed about their students’ progress, and also enable students to use online features for academic growth in private classes.

- What is the approximate launch date and initial target market?

The project will launch in 1 month. The target market is teachers who provide private tutoring.

# 2. Goals and Success Metrics

- What are the 5 main business goals of the project? (For example: reducing administrative time, increasing student retention, etc.)

- Better student evaluation
- Better class management
- Better student management with proper planning
- More student follow-up by teachers
- More student follow-up by parents
- Conducting ready-made exams at every level
- Defining different teaching levels for each semester
- Setting multiple semesters for each class
- Ability for teachers in any academic field and level from beginner to advanced
- Conducting exams with different question types
- Keeping all student information in one platform
- Defining class times for each student and checking teacher free slots for additional classes
- Tracking student progress for parents
- Showing class schedule for parents
- Attendance registration for each session by teacher
- Registering homework completion status by teacher for each session
- Writing and completing homework by student for each session
- Defining homework for each session by teacher
- Defining semester, midterm, and session exams for each student by teacher
- Student and parent registration by teacher
- SMS reminder before class starts for teacher, parents, and student
- SMS notification to parents after attendance or absence registration
- Teacher can add meeting link and send it via SMS and student panel
- Automatic semester certificate generation for students based on grades using a predefined template and showing it in student and parent panel
- Ability to create lesson plan list for each session
- Ability for each teacher to register multiple teachable subjects (for example one teacher can teach Math, Physics, Chemistry or any other lesson), have a switcher between them, have a section to view all classes in all subjects in one schedule table to prevent conflicts, and prevent class registration if another class already exists in that time
- Ability to register available teacher time slots for each day and hour so external activities do not conflict
- Ability to register complete schedule of classes and exams for each student and filter completed or upcoming classes with both Jalali and Gregorian calendar
- Ability for students to have multiple classes with different teachers and switcher between subjects
- Subject switcher for parents
- In Pro version for teachers, each teacher can have a personal profile with personal info, photo, address, phone number, description, student count, certificates and licenses, academic achievements, research files, enable public student list, upload teaching demo videos, introduction video, image gallery, and we automatically handle SEO optimization for better teacher visibility based on entered information, allow publishing educational files and personal articles. Based on number of students and student progress charts we rank teachers higher in teacher listing pages.

- What are 3 to 5 measurable KPIs with numeric goals?

- Student grades from 0 to the number defined by teacher in panel
- Monthly student progress from 0 to 10
- Session activity score from 0 to 10 for each session

# 3. Target Users and Personas

For each role (Admin, Teacher, Parent, Student, Support):

- What are their main goals and pain points?

## Teacher

- Easier student management
- Easier semester grade management
- Attendance management
- Classroom activity management
- Exam management
- Creating ready-made exams for each semester
- Creating lesson plans before sessions and teaching based on them
- Class reminders for students and parents
- Exam reminders for students and parents
- Monthly, weekly, and daily teacher class schedule view
- Showing all subjects a teacher can teach
- Showing teacher availability and registering classes based on free slots
- Registering classes outside platform/private classes to prevent scheduling conflicts
- Creating multi-mode exams (descriptive, multiple choice)
- Creating single mode exams
- Registering correct answers for multiple choice exams to show score immediately after exam
- Organizational chat with students or parents
- Registering homework and reviewing it
- Viewing session summaries written by students
- Viewing student progress statistics
- Registering student personal information and phone number then sending login link after registration
- Registering cost for each session or semester only for display in standard version
- Changing payment status for each session or semester in standard version
- Sending payment reminder SMS for each session or semester (Pro)
- Automatically blocking class access, file download, or semester exams if payment is incomplete (Pro)
- Providing payment link in student and parent panel and showing payment status (Pro)
- Requesting personal profile creation and editing information (Pro)
- Showing educational files in personal profile (Pro)
- Showing article editor with SEO features in personal profile (Pro)

## Student

- Showing class list
- Showing grades list
- Class and exam reminders
- Online exam with 3 modes (multiple choice, descriptive)
- Class statistics
- Showing class list for each teacher
- Displaying and downloading final exam license PDF for each subject
- Homework submission
- Session summary submission
- Chat with teacher

## Parent

- Showing student class list
- Showing student grades list
- Class and exam reminders
- Class statistics
- Showing classes with each teacher
- Displaying and downloading final exam license PDF for each subject
- Viewing homework status and teacher approval/rejection
- Viewing session summary based on student submission
- Chat with teacher
- Viewing all children and switching between them

## Admin / Support

- Teacher list management, edit/delete/sort
- Subject list management, edit/delete/sort
- Student list management, edit/delete/sort
- Parent list management, edit/delete/sort
- Teacher information management
- Teacher subjects management
- Teacher ready exam management
- Teacher lesson plan management
- Student subject management
- Student exam management
- Student information management
- Parent information management
- Parent’s student management
- Plan list management, create/edit/delete plans and pricing
- Transaction list
- Revenue statistics, registrations, non-renewals
- Rejection reasons
- Support chat with teacher, student, parent
- Create admin/support with custom permissions
- Approve teacher personal profile creation
- Ban teacher, parent, or student
- Login as teacher/student/parent
- View all chat rooms

- What is their comfort level with technology?

- Teacher = Relatively comfortable
- Student = Average
- Parent = Very difficult
- Admin / Support = Very comfortable

- What size are the target schools or institutions?

This platform is currently only for private classes, but later it may be used by large schools or institutions. In that case institution/school role will be added with permission to control all sections except admin/support, while admin can manage schools and institutions as well.

# 4. Main Features (Module by Module)

List main features of each section and specify which are MVP and which come later.

## Authentication and User Management

- Student registration by teacher with first name, last name, and phone number
- Teacher registration with username, last name, phone number, mandatory address, OTP verification sent by system
- Teacher can fill student personal information and optionally add parent information for each student
- Teacher registration must happen inside teacher panel layout but all features stay disabled until registration completes. After registration, 14-day free access to all features is activated. After 14 days teacher must purchase a plan. There are Standard and Pro plans. Pro only unlocks personal profile, file manager, and payment features. Plans can be monthly, 3-month, 6-month, or 12-month.

## Session/Class Management

- Register date and time for each session/class by teacher
- Attendance registration by teacher
- Upload session files by teacher
- Upload meeting link by teacher
- Create exams with date/time for each subject and student (multiple exams allowed)
- Chat inside each session and general chat

## Homework

- Register homework for each session
- Homework can require image upload or completion directly in panel
- Homework approval by teacher
- Homework status visible to parents

## Exams

- Timed exams
- Create exams before exam date and maintain ready exam lists for each semester and subject
- Auto grading for multiple choice exams
- Manual grading for descriptive exams with score per question and automatic total calculation
- Score weight per question
- Question bank creation

## Messaging and Notifications

- Admin defines SMS templates
- Teacher can enable/disable each SMS type
- Automatic SMS before class/exam starts (30 minutes before)
- SMS notification after exam correction to student and parent

## Student Profile / Registration / Progress

- Subject or teacher switcher
- Full schedule and subject schedule
- Homework list
- Homework submission
- Previous class list
- Grade progress analytics
- Session details, files, and entry links
- Upcoming exams
- Take exam and show result
- Disable copy/paste and inspect during exam
- Show blank white screen when screenshot is attempted during exam

## Admin Panel

- Teacher list management
- Subject list management
- Student list management
- Parent list management
- Personal information management for all roles
- Add new roles and permissions
- Plan list and permissions management
- Transactions list
- Files management
- Profile management

## Dashboard and Analytics

### Teacher

- Student growth
- Revenue growth (Pro)
- Upcoming classes
- Student list
- Class calendar
- Subject switcher in navbar if multiple subjects

### Student

- Class calendar
- Exam calendar
- Subject switcher
- Homework list
- Payment notifications
- Upcoming class notifications

### Parent

- Child class list if multiple children registered
- Class calendar filtered by child or subject
- Exam calendar filtered by child or subject
- Payment list
- Payment notifications
- Upcoming class notifications

### Admin

- Teacher growth stats
- Student growth stats
- Revenue growth stats
- Teacher list
- Student list
- Subject list

## Third Party Integrations

- Iranian payment gateways
- Iranian SMS provider panels

# 5. Roles and Permissions

- Full role list and access table

All permissions for every role are already mentioned above.

# 6. Important Workflows

- Teacher registration → Enter panel → 14-day free access → Register student → Register class → Register exam → Class list → Start class
- Teacher login → Buy plan after 14 days → Restore previous access
- Teacher login → Enter class → Finish class → Register homework → Confirm attendance
- Student login via link → Enter phone number and OTP → Show classes → Attend class
- Student login via link → Enter phone number and OTP → Start class → Finish class → Complete homework
- Student login via link → Enter phone number and OTP → Start exam → Finish exam → View result for multiple choice exam
- Student login via link → Enter phone number and OTP → Start chat with teacher
- Parent login via link → Enter phone number and OTP → View class list
- Parent login via link → Enter phone number and OTP → Start chat with teacher
- Parent login via link → Enter phone number and OTP → View exam list and results

# 7. Business Rules and Edge Cases

- Each question must have a defined score weight
- Each semester must have an exam
- Exams must be designed before starting
- Multiple choice questions must have correct option defined
- Rich text editor required for question creation
- Attendance required for each session
- Semester or class fee is optional
- Teacher can have file bank in Pro version
- Teacher can have personal profile in Pro version
- Teacher can receive tuition payments in Pro version
- After 14 days teacher must purchase a plan to keep access, previous data stays محفوظ
- Copying, screenshotting, or opening source code during exam must be blocked
- Main admin has full access to all sections and all accounts
- Secondary admins only have permissions explicitly granted by main admin

# 8. Data and Privacy

- Which data is sensitive? Privacy rules?

All personal information of members with any role inside the platform is inaccessible and cannot be used outside the platform. All members must keep it confidential.

# 9. Technical Details

- Preferred backend?

- NestJS

- Database, hosting, third-party services?

- PostgreSQL
- Linux Server

# 10. Design and Branding

- Brand name, colors, logo, tone of voice?

- Brand name: Solo

- Colors

- Primary: oklch(0.72 0.14 240)
- Secondary: oklch(0.87 0.09 340)
- Warning: oklch(0.93 0.12 95)
- Danger: oklch(0.72 0.18 20)
- Disabled: oklch(0.93 0.005 240)

- No logo currently
- Tone: Friendly with slight formality

# 11. Marketing and Sales

- Revenue model, target customers, competitive advantage

- 14 days free with full access
- Standard Plan (1 month, 3 months, 6 months, 12 months) → fake prices initially and editable from admin panel
- Pro Plan (1 month, 3 months, 6 months, 12 months) → includes payments, personal profile, file manager, blog writing. Fake prices initially and editable from admin panel
- Target customers: private teachers → future schools and institutes
- Competitive advantage: There is no platform in Iran specifically designed for managing this educational sector, solving teacher management problems while also acting as a showcase for attracting students and creating competition among teachers.

# 12. Investor Presentation

- How much investment is needed? For what? Important pitch points?

The required capital to start this project, market it, and bring it to sales stage should be at least 1 billion Tomans.

# 13. Documentation Preferences

- Do you want separate bilingual files (EN and FA) or one file?

Separate bilingual files.
