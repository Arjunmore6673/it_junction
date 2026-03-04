import type { Customer, RepairJob } from '../types';

// Initial Mock Data
let customers: Customer[] = [
    {
        id: '9876543210',
        name: 'Rahul Sharma',
        mobile: '9876543210',
        email: 'rahul.s@example.com',
        createdAt: new Date().toISOString()
    },
    {
        id: '9988776655',
        name: 'Priya Patel',
        mobile: '9988776655',
        createdAt: new Date().toISOString()
    }
];

let repairJobs: RepairJob[] = [
    {
        id: 'RJ-1001',
        customerId: '9876543210',
        deviceType: 'Laptop',
        deviceBrand: 'Dell',
        deviceModel: 'Inspiron 15',
        configurationDetails: 'i5 10th Gen, 8GB RAM, 512GB SSD',
        accessoriesReceived: ['Charger', 'Laptop Bag'],
        reportedProblem: 'Screen flickering and battery drains fast',
        staffNotes: 'Needs screen replacement and new battery ordered',
        status: 'Parts Ordered',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'RJ-1002',
        customerId: '9988776655',
        deviceType: 'Desktop',
        deviceBrand: 'Assembled',
        deviceModel: 'Custom PC',
        configurationDetails: 'Ryzen 5, 16GB RAM, RTX 3060',
        accessoriesReceived: ['Power Cable'],
        reportedProblem: 'PC randomly restarts during gaming',
        staffNotes: 'Suspect PSU issue, currently running diagnostics',
        status: 'Pending Diagnosis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Methods
export const MockService = {
    // ---- Customers ----
    async getCustomerByMobile(mobile: string): Promise<Customer | null> {
        await delay(600);
        return customers.find(c => c.mobile === mobile) || null;
    },

    async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
        await delay(800);
        const newCustomer: Customer = {
            ...data,
            id: data.mobile, // using mobile as ID for simplicity
            createdAt: new Date().toISOString()
        };
        customers.push(newCustomer);
        return newCustomer;
    },

    // ---- Repair Jobs ----
    async getRepairJobs(): Promise<RepairJob[]> {
        await delay(700);
        return [...repairJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async getJobsByCustomerId(customerId: string): Promise<RepairJob[]> {
        await delay(500);
        return repairJobs.filter(j => j.customerId === customerId);
    },

    async getJobById(jobId: string): Promise<RepairJob | null> {
        await delay(400);
        return repairJobs.find(j => j.id === jobId) || null;
    },

    async getJobStatusByMobile(mobile: string): Promise<RepairJob | null> {
        await delay(800);
        // Find customer
        const customer = customers.find(c => c.mobile === mobile);
        if (!customer) return null;
        // Get their most recent job
        const jobs = repairJobs.filter(j => j.customerId === customer.id);
        if (jobs.length === 0) return null;
        jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return jobs[0];
    },

    async createRepairJob(data: Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<RepairJob> {
        await delay(1000);
        const newJob: RepairJob = {
            ...data,
            id: `RJ-${1000 + repairJobs.length + 1}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        repairJobs.push(newJob);
        return newJob;
    },

    async updateJobStatus(jobId: string, status: RepairJob['status'], staffNotes?: string): Promise<RepairJob> {
        await delay(800);
        const index = repairJobs.findIndex(j => j.id === jobId);
        if (index === -1) throw new Error('Job not found');

        repairJobs[index] = {
            ...repairJobs[index],
            status,
            ...(staffNotes ? { staffNotes } : {}),
            updatedAt: new Date().toISOString()
        };
        return repairJobs[index];
    },

    async updateJob(jobId: string, updates: Partial<Omit<RepairJob, 'id' | 'createdAt'>>): Promise<RepairJob> {
        await delay(600);
        const index = repairJobs.findIndex(j => j.id === jobId);
        if (index === -1) throw new Error('Job not found');
        repairJobs[index] = {
            ...repairJobs[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return repairJobs[index];
    }
};
