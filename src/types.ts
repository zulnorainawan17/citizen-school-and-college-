export interface Student {
  id: string;
  admissionNo: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
  dob: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  address: string;
  admissionDate: string;
  medicalRecord: string;
  photoUrl?: string;
  qrCode?: string;
  status: "Active" | "Transferred" | "Withdrawn" | "Suspended";
  monthlyFee?: number;
  admissionFee?: number;
  examFee?: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  experience: string;
  salary: number;
  dob: string;
  joiningDate: string;
  status: "Active" | "On Leave" | "Resigned";
  photoUrl?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: "Office Staff" | "Driver" | "Security Guard" | "Peon" | "Cleaner" | "Librarian" | "Receptionist";
  email: string;
  phone: string;
  salary: number;
  status: "Active" | "Inactive";
}

export interface AttendanceRecord {
  id: string;
  date: string;
  entityId: string; // Student ID, Teacher ID, or Staff ID
  entityType: "student" | "teacher" | "staff";
  status: "Present" | "Absent" | "Late";
  remarks?: string;
}

export interface FeeStructure {
  id: string;
  className: string;
  monthlyFee: number;
  admissionFee: number;
  examFee: number;
  transportFee: number;
  hostelFee: number;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  className: string;
  month: string;
  amount: number;
  discount: number;
  fine: number;
  total: number;
  status: "Paid" | "Pending" | "Overdue";
  paymentDate?: string;
  paymentMethod?: string;
  receiptNo?: string;
}

export interface ExamSchedule {
  id: string;
  examName: string; // e.g. Mid Term, Final Term
  className: string;
  subject: string;
  examDate: string;
  time: string;
  room: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  examName: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
}

export interface Homework {
  id: string;
  className: string;
  section?: string;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  teacherId?: string;
  submissionsCount?: number;
  status?: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  marks?: number;
  feedback?: string;
  status: "Submitted" | "Checked";
}

export interface ClassRoutine {
  id: string;
  className: string;
  section: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  timeSlot: string;
  subject: string;
  teacherName: string;
  roomNo: string;
  startTime?: string;
  endTime?: string;
  room?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category?: string;
  stock?: number;
  issuedCount?: number;
  quantity?: number;
  borrowed?: number;
}

export interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  issuedToId: string; // Student ID or Teacher ID
  issuedToName: string;
  issuedToType: "student" | "teacher";
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  status: "Issued" | "Returned" | "Overdue";
}

export interface TransportRoute {
  id: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  route?: string;
  capacity?: number;
  allocatedCount?: number;
  fee: number;
  routeName?: string;
}

export interface HostelRoom {
  id: string;
  hostelName: string;
  roomNo: string;
  type: "Single" | "Double" | "Triple" | "Dormitory";
  capacity: number;
  allocatedCount: number;
  fee: number;
  block?: string;
  occupied?: number;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: "Furniture" | "Computers" | "Lab Equipment" | "Stationery" | "General Assets";
  stock: number;
  supplier: string;
  purchaseDate: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "Paid" | "Pending";
  paidDate?: string;
}

export interface LeaveRequest {
  id: string;
  applicantId: string;
  applicantName: string;
  role: "Teacher" | "Staff";
  leaveType: "Casual" | "Sick" | "Maternity" | "Paternity" | "Unpaid";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // "All", specific ID, or role-based
  content: string;
  timestamp: string;
  type: "Internal" | "SMS" | "Email" | "Announcement";
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: "National" | "Religious" | "Seasonal" | "Other";
}

export interface SchoolConfig {
  schoolName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  academicYear: string;
  currentSemester: string;
  logoUrl?: string;
  primaryColor?: string;
}

export type TimetableItem = ClassRoutine;
export type LibraryBook = Book;

export const GRADE_LEVELS = [
  "Play Group",
  "Nursery",
  "Prep",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "1st Year",
  "2nd Year",
];

export const TEACHER_DEPARTMENTS = [
  "Early Years (Playgroup/Nursery)",
  "Primary School (Classes 1-5)",
  "Middle School (Classes 6-8)",
  "Secondary School (Classes 9-10)",
  "Higher Secondary (1st & 2nd Year)",
  "Islamic & Pakistan Studies",
  "Languages (Urdu & English Literature)",
  "Science & Mathematics"
];

