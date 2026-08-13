/**
 * Rich mock data store (Offline-First)
 * - Rich demo seed data matching the backend shape
 * - Persisted in localStorage so additions (patients, appointments, ...) survive app restarts
 * - Reactive via a tiny event-based store replacement hook is handled by consumers (useMockData)
 */

export interface MockPatient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  bloodGroup: string;
  phoneNumber: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  chronicDiseases: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  status: "INPATIENT" | "OUTPATIENT" | "EMERGENCY";
  createdAt: string;
}

export interface MockDoctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
  status: "AVAILABLE" | "BUSY" | "OFF_DUTY";
}

export interface MockAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  type: "CONSULTATION" | "FOLLOWUP";
  date: string; // ISO
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

export interface MockRoom {
  id: string;
  roomNumber: string;
  type: "PRIVATE" | "SHARED" | "ICU" | "EMERGENCY";
  beds: number;
  occupied: number;
  status: "AVAILABLE" | "OCCUPIED" | "CLEANING";
  floor: number;
}

export interface MockMedicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  stockQuantity: number;
  reorderLevel: number;
  unitPrice: number;
}

export interface MockLabTest {
  id: string;
  patientName: string;
  testName: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  orderedAt: string;
}

export interface MockInvoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "PAID" | "PARTIALLY_PAID" | "UNPAID" | "OVERDUE";
  date: string;
}

export interface MockEmergencyVisit {
  id: string;
  patientName: string;
  complaint: string;
  triage: "CRITICAL" | "URGENT" | "NORMAL";
  arrivedAt: string;
  status: "ACTIVE" | "TRANSFERRED" | "CLOSED";
}

const LS_KEY = "hms-mock-data-v1";

interface MockStore {
  patients: MockPatient[];
  doctors: MockDoctor[];
  appointments: MockAppointment[];
  rooms: MockRoom[];
  medicines: MockMedicine[];
  labTests: MockLabTest[];
  invoices: MockInvoice[];
  emergencyVisits: MockEmergencyVisit[];
}

/* ---------------- Seed ---------------- */
const today = new Date();
const d = (offset: number) => new Date(today.getTime() + offset * 86400000).toISOString();

const seedPatients: MockPatient[] = [
  { id: "p1", patientNumber: "HMS-1001", firstName: "أحمد", lastName: "العتيبي", gender: "MALE", dateOfBirth: d(-4500), bloodGroup: "A+", phoneNumber: "0501234567", email: "ahmed@example.com", address: "الرياض - حي الملقا", emergencyContactName: "فهد العتيبي", emergencyContactPhone: "0507654321", allergies: "بنسلين", chronicDiseases: "سكري النوع الثاني", insuranceProvider: "بupa العربية", insurancePolicyNumber: "INS-8821", status: "INPATIENT", createdAt: d(-30) },
  { id: "p2", patientNumber: "HMS-1002", firstName: "سارة", lastName: "القحطاني", gender: "FEMALE", dateOfBirth: d(-7300), bloodGroup: "O-", phoneNumber: "0552233445", email: "sara@example.com", address: "جدة - حي الصفا", emergencyContactName: "محمد القحطاني", emergencyContactPhone: "0551122334", allergies: "لا يوجد", chronicDiseases: "لا يوجد", insuranceProvider: "التعاونية", insurancePolicyNumber: "INS-9044", status: "OUTPATIENT", createdAt: d(-22) },
  { id: "p3", patientNumber: "HMS-1003", firstName: "خالد", lastName: "المطيري", gender: "MALE", dateOfBirth: d(-12800), bloodGroup: "B+", phoneNumber: "0543334455", email: "khalid@example.com", address: "الدمام - حي الفيحاء", emergencyContactName: "نورة المطيري", emergencyContactPhone: "0549988776", allergies: "أسبرين", chronicDiseases: "ضغط الدم", insuranceProvider: "ميدغلف", insurancePolicyNumber: "INS-7712", status: "EMERGENCY", createdAt: d(-3) },
  { id: "p4", patientNumber: "HMS-1004", firstName: "فاطمة", lastName: "الزهراني", gender: "FEMALE", dateOfBirth: d(-10000), bloodGroup: "AB+", phoneNumber: "0561112233", email: "fatima@example.com", address: "مكة - حي الشوقية", emergencyContactName: "عبدالله الزهراني", emergencyContactPhone: "0567766554", allergies: "لا يوجد", chronicDiseases: "ربو", insuranceProvider: "بupa العربية", insurancePolicyNumber: "INS-6633", status: "OUTPATIENT", createdAt: d(-15) },
  { id: "p5", patientNumber: "HMS-1005", firstName: "عبدالرحمن", lastName: "الحربي", gender: "MALE", dateOfBirth: d(-20000), bloodGroup: "A-", phoneNumber: "0577889900", email: "abdulrahman@example.com", address: "المدينة - حي العوالي", emergencyContactName: "سلطان الحربي", emergencyContactPhone: "0571239876", allergies: "سلفا", chronicDiseases: "كلى مزمن", insuranceProvider: "الدرع العربي", insurancePolicyNumber: "INS-5501", status: "INPATIENT", createdAt: d(-8) },
  { id: "p6", patientNumber: "HMS-1006", firstName: "نوف", lastName: "الشهري", gender: "FEMALE", dateOfBirth: d(-9200), bloodGroup: "O+", phoneNumber: "0533445566", email: "nouf@example.com", address: "أبها - حي المنسك", emergencyContactName: "هيفاء الشهري", emergencyContactPhone: "0539876543", allergies: "لا يوجد", chronicDiseases: "لا يوجد", insuranceProvider: "التعاونية", insurancePolicyNumber: "INS-4488", status: "OUTPATIENT", createdAt: d(-1) },
];

const seedDoctors: MockDoctor[] = [
  { id: "d1", firstName: "د. منى", lastName: "السبيعي", specialty: "باطنية", phone: "0112345671", status: "AVAILABLE" },
  { id: "d2", firstName: "د. يوسف", lastName: "الحارثي", specialty: "جراحة عامة", phone: "0112345672", status: "BUSY" },
  { id: "d3", firstName: "د. ريم", lastName: "الغامدي", specialty: "أطفال", phone: "0112345673", status: "AVAILABLE" },
  { id: "d4", firstName: "د. سعد", lastName: "العنزي", specialty: "طوارئ", phone: "0112345674", status: "AVAILABLE" },
  { id: "d5", firstName: "د. هند", lastName: "الربيعان", specialty: "قلب وأوعية", phone: "0112345675", status: "OFF_DUTY" },
];

function seedAppointments(): MockAppointment[] {
  const list: MockAppointment[] = [
    { id: "a1", patientName: "أحمد العتيبي", doctorName: "د. منى السبيعي", doctorSpecialty: "باطنية", type: "FOLLOWUP", date: d(0), status: "SCHEDULED" },
    { id: "a2", patientName: "سارة القحطاني", doctorName: "د. ريم الغامدي", doctorSpecialty: "أطفال", type: "CONSULTATION", date: d(0), status: "COMPLETED" },
    { id: "a3", patientName: "فاطمة الزهراني", doctorName: "د. يوسف الحارثي", doctorSpecialty: "جراحة عامة", type: "FOLLOWUP", date: d(0), status: "SCHEDULED" },
    { id: "a4", patientName: "نوف الشهري", doctorName: "د. منى السبيعي", doctorSpecialty: "باطنية", type: "CONSULTATION", date: d(1), status: "SCHEDULED" },
    { id: "a5", patientName: "عبدالرحمن الحربي", doctorName: "د. هند الربيعان", doctorSpecialty: "قلب وأوعية", type: "FOLLOWUP", date: d(1), status: "SCHEDULED" },
    { id: "a6", patientName: "خالد المطيري", doctorName: "د. سعد العنزي", doctorSpecialty: "طوارئ", type: "CONSULTATION", date: d(-1), status: "COMPLETED" },
  ];
  return list;
}

const seedRooms: MockRoom[] = [
  { id: "r1", roomNumber: "101", type: "PRIVATE", beds: 1, occupied: 1, status: "OCCUPIED", floor: 1 },
  { id: "r2", roomNumber: "102", type: "SHARED", beds: 3, occupied: 2, status: "OCCUPIED", floor: 1 },
  { id: "r3", roomNumber: "201", type: "ICU", beds: 2, occupied: 2, status: "OCCUPIED", floor: 2 },
  { id: "r4", roomNumber: "202", type: "PRIVATE", beds: 1, occupied: 0, status: "AVAILABLE", floor: 2 },
  { id: "r5", roomNumber: "301", type: "SHARED", beds: 3, occupied: 0, status: "CLEANING", floor: 3 },
  { id: "r6", roomNumber: "E1", type: "EMERGENCY", beds: 4, occupied: 1, status: "OCCUPIED", floor: 0 },
];

const seedMedicines: MockMedicine[] = [
  { id: "m1", name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "مسكنات", stockQuantity: 1200, reorderLevel: 200, unitPrice: 12 },
  { id: "m2", name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "مضادات حيوية", stockQuantity: 180, reorderLevel: 100, unitPrice: 34 },
  { id: "m3", name: "Metformin 850mg", genericName: "Metformin", category: "سكري", stockQuantity: 85, reorderLevel: 150, unitPrice: 22 },
  { id: "m4", name: "Amlodipine 5mg", genericName: "Amlodipine", category: "ضغط", stockQuantity: 320, reorderLevel: 100, unitPrice: 28 },
  { id: "m5", name: "Salbutamol Inhaler", genericName: "Salbutamol", category: "جهاز تنفسي", stockQuantity: 45, reorderLevel: 60, unitPrice: 55 },
  { id: "m6", name: "Omeprazole 20mg", genericName: "Omeprazole", category: "جهاز هضمي", stockQuantity: 560, reorderLevel: 120, unitPrice: 18 },
];

const seedLabTests: MockLabTest[] = [
  { id: "l1", patientName: "أحمد العتيبي", testName: "تحليل سكر تراكمي HbA1c", status: "PENDING", orderedAt: d(0) },
  { id: "l2", patientName: "عبدالرحمن الحربي", testName: "وظائف كلى CBC", status: "IN_PROGRESS", orderedAt: d(0) },
  { id: "l3", patientName: "خالد المطيري", testName: "تحليل إنزيمات قلب Troponin", status: "PENDING", orderedAt: d(0) },
  { id: "l4", patientName: "فاطمة الزهراني", testName: "وظائف كبد LFT", status: "COMPLETED", orderedAt: d(-1) },
];

const seedInvoices: MockInvoice[] = [
  { id: "i1", invoiceNumber: "INV-2026-001", patientName: "أحمد العتيبي", totalAmount: 4500, paidAmount: 3000, dueAmount: 1500, status: "PARTIALLY_PAID", date: d(-5) },
  { id: "i2", invoiceNumber: "INV-2026-002", patientName: "سارة القحطاني", totalAmount: 750, paidAmount: 750, dueAmount: 0, status: "PAID", date: d(-4) },
  { id: "i3", invoiceNumber: "INV-2026-003", patientName: "خالد المطيري", totalAmount: 12800, paidAmount: 5000, dueAmount: 7800, status: "OVERDUE", date: d(-12) },
  { id: "i4", invoiceNumber: "INV-2026-004", patientName: "نوف الشهري", totalAmount: 320, paidAmount: 0, dueAmount: 320, status: "UNPAID", date: d(-2) },
  { id: "i5", invoiceNumber: "INV-2026-005", patientName: "فاطمة الزهراني", totalAmount: 1950, paidAmount: 1950, dueAmount: 0, status: "PAID", date: d(-8) },
];

const seedEmergency: MockEmergencyVisit[] = [
  { id: "e1", patientName: "خالد المطيري", complaint: "ألم حاد في الصدر وضيق تنفس", triage: "CRITICAL", arrivedAt: d(0), status: "ACTIVE" },
  { id: "e2", patientName: "زائر (لم يُسجل)", complaint: "إصابة كسر في الذراع", triage: "URGENT", arrivedAt: d(0), status: "ACTIVE" },
  { id: "e3", patientName: "طفل (7 سنوات)", complaint: "حمى مرتفعة وتشنجات", triage: "URGENT", arrivedAt: d(0), status: "TRANSFERRED" },
];

/* ---------------- Store ---------------- */
export function loadMockData(): MockStore {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // fill defaults for any keys added later
      return { ...emptyStore(), ...parsed };
    }
  } catch { /* fall through */ }
  const seed = {
    patients: seedPatients,
    doctors: seedDoctors,
    appointments: seedAppointments(),
    rooms: seedRooms,
    medicines: seedMedicines,
    labTests: seedLabTests,
    invoices: seedInvoices,
    emergencyVisits: seedEmergency,
  };
  saveMockData(seed);
  return seed;
}

function emptyStore(): MockStore {
  return { patients: [], doctors: [], appointments: [], rooms: [], medicines: [], labTests: [], invoices: [], emergencyVisits: [] };
}

export function saveMockData(data: MockStore) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch { /* storage full */ }
}

export function mergeMockData(patch: Partial<MockStore>) {
  const data = loadMockData();
  const merged = { ...data } as MockStore;
  for (const key of Object.keys(patch) as (keyof MockStore)[]) {
    (merged as any)[key] = (patch as any)[key];
  }
  saveMockData(merged);
  window.dispatchEvent(new CustomEvent("hms-mock-data-changed"));
  return merged;
}

export function genId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function resetMockData() {
  localStorage.removeItem(LS_KEY);
  window.dispatchEvent(new CustomEvent("hms-mock-data-changed"));
}

export type { MockStore };
