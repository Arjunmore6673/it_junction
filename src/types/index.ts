export type Role = 'admin' | 'staff';

export interface User {
    id: string;
    email: string;
    role: Role;
    name: string;
}

export interface StaffUser {
    uid: string;
    email: string;
    name: string;
    role: Role;
    createdAt: string;
    createdBy?: string; // admin uid
}

export type JobStatus =
    | 'Pending Diagnosis'
    | 'Parts Ordered'
    | 'In Repair'
    | 'Ready for Pickup'
    | 'Completed'
    | 'Delivered';

export interface Customer {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    createdAt: string;
}

export interface JobPhoto {
    id: string;
    dataUrl: string;
    label: string;
    source: 'camera' | 'gallery';
}

export interface LoanerDevice {
    provided: boolean;
    description?: string; // e.g. "HP Latitude 3410, SN: XYZ"
    returnedAt?: string | null;
}

export interface RepairJob {
    id: string;
    customerId: string;
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    configurationDetails: string;
    accessoriesReceived: string[];
    reportedProblem: string;
    staffNotes: string;
    status: JobStatus;
    estimatedCost?: number;
    estimatedDeliveryDays?: number;
    photos?: JobPhoto[];
    loanerDevice?: LoanerDevice;
    createdAt: string;
    updatedAt: string;
    assignedTo?: string;
}
