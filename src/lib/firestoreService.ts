import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  getDocFromServer
} from "firebase/firestore";
import { db, auth } from "./firebase";
import {
  Student,
  Teacher,
  Staff,
  FeeInvoice,
  FeeStructure,
  AttendanceRecord,
  ExamSchedule,
  GradeRecord,
  Homework,
  HomeworkSubmission,
  TimetableItem,
  LibraryBook,
  BookIssue,
  TransportRoute,
  HostelRoom,
  InventoryItem,
  Payslip,
  LeaveRequest,
  Holiday,
  SchoolConfig
} from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check test
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firestore connection offline or initializing.");
    }
  }
}

// Generic real-time subscription helper with automatic initial seed if empty
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (data: T[]) => void,
  initialDataIfEmpty?: T[]
): () => void {
  let isSeeding = false;
  const colRef = collection(db, collectionName);

  const unsubscribe = onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty && initialDataIfEmpty && initialDataIfEmpty.length > 0 && !isSeeding) {
        isSeeding = true;
        try {
          const batch = writeBatch(db);
          initialDataIfEmpty.forEach((item) => {
            const docId = item.id || doc(colRef).id;
            const docRef = doc(db, collectionName, docId);
            batch.set(docRef, { ...item, id: docId });
          });
          await batch.commit();
        } catch (err) {
          console.error(`Error seeding initial data for ${collectionName}:`, err);
        } finally {
          isSeeding = false;
        }
        return;
      }

      const items: T[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as T[];

      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );

  return unsubscribe;
}

// Generic Single Document Subscription (e.g., School Config)
export function subscribeToDoc<T>(
  collectionName: string,
  docId: string,
  onData: (data: T) => void,
  initialDataIfEmpty?: T
): () => void {
  let isSeeding = false;
  const docRef = doc(db, collectionName, docId);

  const unsubscribe = onSnapshot(
    docRef,
    async (docSnap) => {
      if (!docSnap.exists() && initialDataIfEmpty && !isSeeding) {
        isSeeding = true;
        try {
          await setDoc(docRef, initialDataIfEmpty as any);
        } catch (err) {
          console.error(`Error seeding document ${collectionName}/${docId}:`, err);
        } finally {
          isSeeding = false;
        }
        return;
      }

      if (docSnap.exists()) {
        onData(docSnap.data() as T);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
    }
  );

  return unsubscribe;
}

// CRUD Operations

// --- Students ---
export async function saveStudent(student: Student): Promise<void> {
  const path = "students";
  try {
    const studentId = student.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, studentId);
    await setDoc(docRef, { ...student, id: studentId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudent(studentId: string): Promise<void> {
  const path = `students/${studentId}`;
  try {
    await deleteDoc(doc(db, "students", studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Teachers ---
export async function saveTeacher(teacher: Teacher): Promise<void> {
  const path = "teachers";
  try {
    const teacherId = teacher.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, teacherId);
    await setDoc(docRef, { ...teacher, id: teacherId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTeacher(teacherId: string): Promise<void> {
  const path = `teachers/${teacherId}`;
  try {
    await deleteDoc(doc(db, "teachers", teacherId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Staff ---
export async function saveStaff(staff: Staff): Promise<void> {
  const path = "staff";
  try {
    const staffId = staff.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, staffId);
    await setDoc(docRef, { ...staff, id: staffId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStaff(staffId: string): Promise<void> {
  const path = `staff/${staffId}`;
  try {
    await deleteDoc(doc(db, "staff", staffId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Fee Invoices ---
export async function saveFeeInvoice(invoice: FeeInvoice): Promise<void> {
  const path = "feeInvoices";
  try {
    const invoiceId = invoice.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, invoiceId);
    await setDoc(docRef, { ...invoice, id: invoiceId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFeeInvoice(invoiceId: string): Promise<void> {
  const path = `feeInvoices/${invoiceId}`;
  try {
    await deleteDoc(doc(db, "feeInvoices", invoiceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Fee Structures ---
export async function saveFeeStructure(feeStruct: FeeStructure): Promise<void> {
  const path = "feeStructures";
  try {
    const feeId = feeStruct.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, feeId);
    await setDoc(docRef, { ...feeStruct, id: feeId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Attendance ---
export async function saveAttendanceBatch(records: AttendanceRecord[]): Promise<void> {
  const path = "attendance";
  try {
    const batch = writeBatch(db);
    records.forEach((rec) => {
      const recId = rec.id || `${rec.date}_${rec.entityId}`;
      const docRef = doc(db, path, recId);
      batch.set(docRef, { ...rec, id: recId }, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Grades ---
export async function saveGradeRecord(grade: GradeRecord): Promise<void> {
  const path = "grades";
  try {
    const gradeId = grade.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, gradeId);
    await setDoc(docRef, { ...grade, id: gradeId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGradeRecord(gradeId: string): Promise<void> {
  const path = `grades/${gradeId}`;
  try {
    await deleteDoc(doc(db, "grades", gradeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Exam Schedules ---
export async function saveExamSchedule(schedule: ExamSchedule): Promise<void> {
  const path = "examSchedules";
  try {
    const schedId = schedule.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, schedId);
    await setDoc(docRef, { ...schedule, id: schedId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExamSchedule(schedId: string): Promise<void> {
  const path = `examSchedules/${schedId}`;
  try {
    await deleteDoc(doc(db, "examSchedules", schedId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Homework ---
export async function saveHomework(hw: Homework): Promise<void> {
  const path = "homeworks";
  try {
    const hwId = hw.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, hwId);
    await setDoc(docRef, { ...hw, id: hwId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteHomework(hwId: string): Promise<void> {
  const path = `homeworks/${hwId}`;
  try {
    await deleteDoc(doc(db, "homeworks", hwId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Library Books ---
export async function saveBook(book: LibraryBook): Promise<void> {
  const path = "books";
  try {
    const bookId = book.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, bookId);
    await setDoc(docRef, { ...book, id: bookId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBook(bookId: string): Promise<void> {
  const path = `books/${bookId}`;
  try {
    await deleteDoc(doc(db, "books", bookId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Transport Routes ---
export async function saveTransportRoute(route: TransportRoute): Promise<void> {
  const path = "transportRoutes";
  try {
    const routeId = route.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, routeId);
    await setDoc(docRef, { ...route, id: routeId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTransportRoute(routeId: string): Promise<void> {
  const path = `transportRoutes/${routeId}`;
  try {
    await deleteDoc(doc(db, "transportRoutes", routeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Hostel Rooms ---
export async function saveHostelRoom(room: HostelRoom): Promise<void> {
  const path = "hostelRooms";
  try {
    const roomId = room.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, roomId);
    await setDoc(docRef, { ...room, id: roomId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteHostelRoom(roomId: string): Promise<void> {
  const path = `hostelRooms/${roomId}`;
  try {
    await deleteDoc(doc(db, "hostelRooms", roomId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Inventory ---
export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  const path = "inventory";
  try {
    const itemId = item.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, itemId);
    await setDoc(docRef, { ...item, id: itemId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  const path = `inventory/${itemId}`;
  try {
    await deleteDoc(doc(db, "inventory", itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Payroll ---
export async function savePayslip(payslip: Payslip): Promise<void> {
  const path = "payroll";
  try {
    const payId = payslip.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, payId);
    await setDoc(docRef, { ...payslip, id: payId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Leave Requests ---
export async function saveLeaveRequest(request: LeaveRequest): Promise<void> {
  const path = "leaveRequests";
  try {
    const reqId = request.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, reqId);
    await setDoc(docRef, { ...request, id: reqId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Holidays ---
export async function saveHoliday(holiday: Holiday): Promise<void> {
  const path = "holidays";
  try {
    const holId = holiday.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, holId);
    await setDoc(docRef, { ...holiday, id: holId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteHoliday(holidayId: string): Promise<void> {
  const path = `holidays/${holidayId}`;
  try {
    await deleteDoc(doc(db, "holidays", holidayId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- School Config ---
export async function saveSchoolConfig(config: SchoolConfig): Promise<void> {
  const path = "schoolConfig/main";
  try {
    await setDoc(doc(db, "schoolConfig", "main"), config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
