import {
    collection, doc, getDoc, getDocs, addDoc, updateDoc,
    query, where, orderBy, Timestamp, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import type { Customer, RepairJob, StaffUser } from '../types';

// ── helpers ─────────────────────────────────────────────────────────────────
const toIso = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (val instanceof Timestamp) return val.toDate().toISOString();
    return String(val);
};

const jobFromDoc = (id: string, data: Record<string, unknown>): RepairJob => ({
    id,
    customerId: String(data.customerId ?? ''),
    deviceType: String(data.deviceType ?? ''),
    deviceBrand: String(data.deviceBrand ?? ''),
    deviceModel: String(data.deviceModel ?? ''),
    configurationDetails: String(data.configurationDetails ?? ''),
    accessoriesReceived: (data.accessoriesReceived as string[]) ?? [],
    reportedProblem: String(data.reportedProblem ?? ''),
    staffNotes: String(data.staffNotes ?? ''),
    status: data.status as RepairJob['status'],
    estimatedCost: data.estimatedCost as number | undefined,
    estimatedDeliveryDays: data.estimatedDeliveryDays as number | undefined,
    photos: (data.photos as RepairJob['photos']) ?? [],
    loanerDevice: (data.loanerDevice as RepairJob['loanerDevice']) ?? undefined,
    assignedTo: data.assignedTo as string | undefined,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
});

const customerFromDoc = (id: string, data: Record<string, unknown>): Customer => ({
    id,
    name: String(data.name ?? ''),
    mobile: String(data.mobile ?? ''),
    email: data.email as string | undefined,
    address: data.address as string | undefined,
    createdAt: toIso(data.createdAt),
});

// ── FirestoreService ─────────────────────────────────────────────────────────
export const FirestoreService = {

    // ── Customers ──────────────────────────────────────────────────────────────
    async getCustomerByMobile(mobile: string): Promise<Customer | null> {
        const q = query(collection(db, 'customers'), where('mobile', '==', mobile));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        const d = snap.docs[0];
        return customerFromDoc(d.id, d.data() as Record<string, unknown>);
    },

    async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
        const docRef = await addDoc(collection(db, 'customers'), {
            ...data,
            createdAt: serverTimestamp(),
        });
        return { ...data, id: docRef.id, createdAt: new Date().toISOString() };
    },

    async getCustomers(): Promise<Customer[]> {
        const snap = await getDocs(collection(db, 'customers'));
        return snap.docs.map(d => customerFromDoc(d.id, d.data() as Record<string, unknown>));
    },

    // ── Repair Jobs ────────────────────────────────────────────────────────────
    async getRepairJobs(): Promise<RepairJob[]> {
        const q = query(collection(db, 'repairJobs'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => jobFromDoc(d.id, d.data() as Record<string, unknown>));
    },

    async getJobById(jobId: string): Promise<RepairJob | null> {
        const snap = await getDoc(doc(db, 'repairJobs', jobId));
        if (!snap.exists()) return null;
        return jobFromDoc(snap.id, snap.data() as Record<string, unknown>);
    },

    async getJobStatusByMobile(mobile: string): Promise<RepairJob | null> {
        const customer = await this.getCustomerByMobile(mobile);
        if (!customer) return null;
        const q = query(
            collection(db, 'repairJobs'),
            where('customerId', '==', customer.id)
        );
        const snap = await getDocs(q);
        if (snap.empty) return null;

        const jobs = snap.docs.map(d => jobFromDoc(d.id, d.data() as Record<string, unknown>));
        jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return jobs[0];
    },

    async createRepairJob(data: Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<RepairJob> {
        const now = serverTimestamp();
        const docRef = await addDoc(collection(db, 'repairJobs'), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        const ts = new Date().toISOString();
        return { ...data, id: docRef.id, createdAt: ts, updatedAt: ts };
    },

    async updateJob(jobId: string, updates: Partial<Omit<RepairJob, 'id' | 'createdAt'>>): Promise<void> {
        await updateDoc(doc(db, 'repairJobs', jobId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    },

    // ── Staff / Users ───────────────────────────────────────────────────────────
    async getStaffUsers(): Promise<StaffUser[]> {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map(d => ({ uid: d.id, ...(d.data() as Omit<StaffUser, 'uid'>) }));
    },

    async createStaffProfile(uid: string, data: Omit<StaffUser, 'uid'>): Promise<void> {
        await setDoc(doc(db, 'users', uid), data);
    },

    async getUserProfile(uid: string): Promise<StaffUser | null> {
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return null;
        return { uid: snap.id, ...(snap.data() as Omit<StaffUser, 'uid'>) };
    },

    async deleteStaffProfile(uid: string): Promise<void> {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', uid));
    },
};
