import { useState, useEffect } from 'react';
import { FirestoreService } from '../../firebase/firestoreService';
import type { RepairJob, Customer } from '../../types';
import {
    Search, MonitorPlay, Phone, Edit, X, Save, Loader2,
    Calendar, Wrench, Package, CheckCircle, Clock, Truck, AlertCircle,
    Camera, RotateCcw, Laptop
} from 'lucide-react';

const STATUS_OPTIONS: RepairJob['status'][] = [
    'Pending Diagnosis', 'Parts Ordered', 'In Repair',
    'Ready for Pickup', 'Completed', 'Delivered',
];

const STATUS_COLORS: Record<RepairJob['status'], string> = {
    'Pending Diagnosis': 'bg-yellow-100 text-yellow-800',
    'Parts Ordered': 'bg-blue-100 text-blue-800',
    'In Repair': 'bg-orange-100 text-orange-800',
    'Ready for Pickup': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
    'Delivered': 'bg-gray-100 text-gray-700',
};

const STATUS_ICONS: Record<RepairJob['status'], React.ReactNode> = {
    'Pending Diagnosis': <AlertCircle className="h-4 w-4" />,
    'Parts Ordered': <Package className="h-4 w-4" />,
    'In Repair': <Wrench className="h-4 w-4" />,
    'Ready for Pickup': <CheckCircle className="h-4 w-4" />,
    'Completed': <CheckCircle className="h-4 w-4" />,
    'Delivered': <Truck className="h-4 w-4" />,
};

interface EditForm {
    status: RepairJob['status'];
    staffNotes: string;
    reportedProblem: string;
    configurationDetails: string;
    accessoriesReceived: string;
    deviceBrand: string;
    deviceModel: string;
    deviceType: string;
    estimatedDeliveryDays: string;
    loanerReturned: boolean;
}

export default function Customers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState<RepairJob[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<RepairJob[]>([]);
    const [customersMap, setCustomersMap] = useState<Record<string, Customer>>({});
    const [loading, setLoading] = useState(true);

    const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<EditForm | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

    const loadData = async () => {
        try {
            const jobsData = await FirestoreService.getRepairJobs();
            const customersData = await FirestoreService.getCustomers();
            const cMap: Record<string, Customer> = {};
            for (const c of customersData) {
                cMap[c.id] = c;
            }
            setCustomersMap(cMap);
            setJobs(jobsData);
            setFilteredJobs(jobsData);
        } catch {
            console.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (!searchTerm) { setFilteredJobs(jobs); return; }
        const lower = searchTerm.toLowerCase();
        setFilteredJobs(jobs.filter(j => {
            const c = customersMap[j.customerId];
            const customerStr = c ? `${c.name} ${c.mobile} ${c.email || ''}`.toLowerCase() : '';
            return j.id.toLowerCase().includes(lower) ||
                j.customerId.toLowerCase().includes(lower) ||
                customerStr.includes(lower) ||
                j.deviceBrand.toLowerCase().includes(lower) ||
                j.deviceModel.toLowerCase().includes(lower) ||
                j.reportedProblem.toLowerCase().includes(lower);
        }));
    }, [searchTerm, jobs, customersMap]);

    const buildEditForm = (job: RepairJob): EditForm => ({
        status: job.status,
        staffNotes: job.staffNotes || '',
        reportedProblem: job.reportedProblem,
        configurationDetails: job.configurationDetails || '',
        accessoriesReceived: (job.accessoriesReceived || []).join(', '),
        deviceBrand: job.deviceBrand,
        deviceModel: job.deviceModel,
        deviceType: job.deviceType,
        estimatedDeliveryDays: job.estimatedDeliveryDays?.toString() ?? '',
        loanerReturned: !!job.loanerDevice?.returnedAt,
    });

    const openDrawer = (job: RepairJob) => {
        setSelectedJob(job);
        setIsEditing(false);
        setSaveSuccess(false);
        setLightboxIdx(null);
        setEditForm(buildEditForm(job));
    };

    const closeDrawer = () => {
        setSelectedJob(null);
        setIsEditing(false);
        setEditForm(null);
        setLightboxIdx(null);
    };

    const handleSave = async () => {
        if (!selectedJob || !editForm) return;
        setIsSaving(true);
        try {
            const updates: Partial<RepairJob> = {
                status: editForm.status,
                staffNotes: editForm.staffNotes,
                reportedProblem: editForm.reportedProblem,
                configurationDetails: editForm.configurationDetails,
                accessoriesReceived: editForm.accessoriesReceived.split(',').map(a => a.trim()).filter(Boolean),
                deviceBrand: editForm.deviceBrand,
                deviceModel: editForm.deviceModel,
                deviceType: editForm.deviceType,
                estimatedDeliveryDays: editForm.estimatedDeliveryDays ? Number(editForm.estimatedDeliveryDays) : undefined,
            };

            // Handle loaner return
            if (selectedJob.loanerDevice?.provided && editForm.loanerReturned && !selectedJob.loanerDevice.returnedAt) {
                updates.loanerDevice = { ...selectedJob.loanerDevice, returnedAt: new Date().toISOString() };
            }

            await FirestoreService.updateJob(selectedJob.id, updates);
            await loadData();
            const refreshed = jobs.find(j => j.id === selectedJob.id);
            if (refreshed) { setSelectedJob({ ...refreshed, ...updates }); }
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch {
            alert('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const photos = selectedJob?.photos ?? [];

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading jobs...
        </div>
    );

    return (
        <div className="flex gap-6">
            {/* ── Job list ──────────────────────────────────────────────────── */}
            <div className={`flex-1 min-w-0 ${selectedJob ? 'hidden lg:block' : ''}`}>
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Jobs &amp; Customers</h1>
                    <p className="mt-1 text-sm text-gray-500">Click any row to view and update job details.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text"
                            className="block w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            placeholder="Search by Job ID, Mobile, Brand, Problem..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Customer</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Device</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredJobs.map(job => (
                                <tr key={job.id}
                                    className={`transition-colors cursor-pointer ${selectedJob?.id === job.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => openDrawer(job)}>
                                    <td className="px-5 py-4">
                                        <div className="text-sm font-semibold text-brand-600">{job.id}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Clock className="h-3 w-3" />
                                            {new Date(job.createdAt).toLocaleDateString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">
                                                {customersMap[job.customerId]?.name || 'Unknown'}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                                {customersMap[job.customerId]?.mobile || job.customerId}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <MonitorPlay className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{job.deviceBrand} {job.deviceModel}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{job.reportedProblem}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status]}`}>
                                            {STATUS_ICONS[job.status]} {job.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button type="button" onClick={e => { e.stopPropagation(); openDrawer(job); }}
                                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-medium">
                                            <Edit className="h-3.5 w-3.5" /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredJobs.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-14 text-center text-gray-400 text-sm">
                                    No jobs found{searchTerm ? ` for "${searchTerm}"` : ''}.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Detail panel ──────────────────────────────────────────────── */}
            {selectedJob && editForm && (
                <div className="w-full lg:w-[480px] flex-shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-0 max-h-screen overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-gray-900 text-lg">{selectedJob.id}</span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedJob.status]}`}>
                                        {STATUS_ICONS[selectedJob.status]} {selectedJob.status}
                                    </span>
                                    {selectedJob.loanerDevice?.provided && (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${selectedJob.loanerDevice.returnedAt ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-700'}`}>
                                            <Laptop className="h-3 w-3" />
                                            {selectedJob.loanerDevice.returnedAt ? 'Loaner Returned' : 'Loaner Out'}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(selectedJob.createdAt).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditing ? (
                                    <button type="button" onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg">
                                        <Edit className="h-4 w-4" /> Edit
                                    </button>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => { setIsEditing(false); setEditForm(buildEditForm(selectedJob)); }}
                                            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={handleSave} disabled={isSaving}
                                            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 rounded-lg">
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                                        </button>
                                    </>
                                )}
                                <button type="button" onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {saveSuccess && (
                            <div className="mx-5 mt-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg">
                                <CheckCircle className="h-4 w-4 flex-shrink-0" /> Changes saved successfully!
                            </div>
                        )}

                        <div className="px-5 py-4 space-y-6">

                            {/* Status */}
                            <section>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Job Status</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {STATUS_OPTIONS.map(s => (
                                        <button key={s} type="button"
                                            onClick={() => isEditing && setEditForm(f => f ? { ...f, status: s } : f)}
                                            disabled={!isEditing}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left
                        ${editForm.status === s
                                                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-400'
                                                    : 'border-gray-200 text-gray-600 ' + (isEditing ? 'hover:border-brand-300 cursor-pointer' : 'opacity-60 cursor-default')
                                                }`}>
                                            <span className={`${STATUS_COLORS[s]} p-1 rounded-md`}>{STATUS_ICONS[s]}</span>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Estimated delivery */}
                            <section>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Estimated Delivery</h4>
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input type="number" min={1} max={60} value={editForm.estimatedDeliveryDays}
                                            onChange={e => setEditForm(f => f ? { ...f, estimatedDeliveryDays: e.target.value } : f)}
                                            className="w-24 text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                                        <span className="text-sm text-gray-500">days</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        {selectedJob.estimatedDeliveryDays
                                            ? <><span className="font-medium">{selectedJob.estimatedDeliveryDays}</span> day{selectedJob.estimatedDeliveryDays !== 1 ? 's' : ''}</>
                                            : <span className="text-gray-400 italic">Not specified</span>}
                                    </div>
                                )}
                            </section>

                            {/* Customer */}
                            <section>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer</h4>
                                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {customersMap[selectedJob.customerId]?.name?.charAt(0)?.toUpperCase() || selectedJob.customerId.slice(0, 2)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {customersMap[selectedJob.customerId]?.name || 'Unknown Customer'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {customersMap[selectedJob.customerId]?.mobile || selectedJob.customerId}
                                            </span>
                                            {customersMap[selectedJob.customerId]?.email && (
                                                <span className="truncate max-w-[150px]" title={customersMap[selectedJob.customerId].email}>
                                                    • {customersMap[selectedJob.customerId].email}
                                                </span>
                                            )}
                                        </div>
                                        {customersMap[selectedJob.customerId]?.address && (
                                            <div className="text-xs text-gray-500 mt-1 truncate" title={customersMap[selectedJob.customerId].address}>
                                                {customersMap[selectedJob.customerId].address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Device */}
                            <section>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Device Information</h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['deviceType', 'deviceBrand', 'deviceModel'] as const).map((field, i) => (
                                            <div key={field}>
                                                <label className="block text-xs text-gray-500 mb-1">{['Type', 'Brand', 'Model'][i]}</label>
                                                {isEditing && field === 'deviceType' ? (
                                                    <select value={editForm.deviceType}
                                                        onChange={e => setEditForm(f => f ? { ...f, deviceType: e.target.value } : f)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500">
                                                        {['Laptop', 'Desktop', 'Printer', 'Tablet', 'Other Accessory'].map(t => <option key={t}>{t}</option>)}
                                                    </select>
                                                ) : isEditing ? (
                                                    <input type="text" value={editForm[field]}
                                                        onChange={e => setEditForm(f => f ? { ...f, [field]: e.target.value } : f)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500" />
                                                ) : (
                                                    <div className="text-sm font-medium text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                                        {selectedJob[field]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Configuration</label>
                                        {isEditing ? (
                                            <textarea rows={2} value={editForm.configurationDetails}
                                                onChange={e => setEditForm(f => f ? { ...f, configurationDetails: e.target.value } : f)}
                                                className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500" />
                                        ) : (
                                            <div className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2">
                                                {selectedJob.configurationDetails || <span className="text-gray-400 italic">Not specified</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Accessories</label>
                                        {isEditing ? (
                                            <input type="text" value={editForm.accessoriesReceived}
                                                onChange={e => setEditForm(f => f ? { ...f, accessoriesReceived: e.target.value } : f)}
                                                className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500" />
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {(selectedJob.accessoriesReceived || []).length > 0
                                                    ? selectedJob.accessoriesReceived.map((a, i) => (
                                                        <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">{a}</span>
                                                    ))
                                                    : <span className="text-gray-400 italic text-sm">None</span>
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Problem & Notes */}
                            <section>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Problem &amp; Notes</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Reported Problem</label>
                                        {isEditing ? (
                                            <textarea rows={3} value={editForm.reportedProblem}
                                                onChange={e => setEditForm(f => f ? { ...f, reportedProblem: e.target.value } : f)}
                                                className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500" />
                                        ) : (
                                            <div className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2">{selectedJob.reportedProblem}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Staff Notes (Internal)</label>
                                        {isEditing ? (
                                            <textarea rows={3} value={editForm.staffNotes}
                                                onChange={e => setEditForm(f => f ? { ...f, staffNotes: e.target.value } : f)}
                                                placeholder="Internal notes visible only to staff..."
                                                className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500" />
                                        ) : (
                                            <div className="text-sm text-gray-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 whitespace-pre-wrap min-h-[48px]">
                                                {selectedJob.staffNotes || <span className="text-gray-400 italic">No staff notes yet.</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Loaner Device */}
                            {selectedJob.loanerDevice?.provided && (
                                <section>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Loaner Device</h4>
                                    <div className={`rounded-lg p-3 border ${selectedJob.loanerDevice.returnedAt ? 'bg-gray-50 border-gray-200' : 'bg-orange-50 border-orange-200'}`}>
                                        <div className="flex items-start gap-2">
                                            <Laptop className={`h-5 w-5 mt-0.5 flex-shrink-0 ${selectedJob.loanerDevice.returnedAt ? 'text-gray-400' : 'text-orange-500'}`} />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">{selectedJob.loanerDevice.description || 'Loaner device provided'}</div>
                                                {selectedJob.loanerDevice.returnedAt
                                                    ? <div className="text-xs text-gray-500 mt-0.5">Returned: {new Date(selectedJob.loanerDevice.returnedAt).toLocaleDateString('en-IN')}</div>
                                                    : <div className="text-xs text-orange-600 mt-0.5 font-medium">Currently with customer</div>
                                                }
                                            </div>
                                        </div>
                                        {isEditing && !selectedJob.loanerDevice.returnedAt && (
                                            <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                                <input type="checkbox" checked={editForm.loanerReturned}
                                                    onChange={e => setEditForm(f => f ? { ...f, loanerReturned: e.target.checked } : f)}
                                                    className="rounded border-gray-300 text-brand-600" />
                                                <span className="text-sm text-gray-700">Mark loaner as returned</span>
                                            </label>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Photos */}
                            <section>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Camera className="h-3.5 w-3.5" /> Device Photos
                                    <span className="text-gray-300 font-normal">({photos.length})</span>
                                </h4>
                                {photos.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {photos.map((photo, idx) => (
                                            <button key={photo.id} type="button" onClick={() => setLightboxIdx(idx)}
                                                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={photo.dataUrl} alt={photo.label} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-1.5">
                                                    <span className="text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                                        {photo.label}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                                        <Camera className="h-6 w-6" />
                                        <span className="text-xs">No photos attached</span>
                                    </div>
                                )}
                            </section>

                            {/* Timestamps */}
                            <section className="border-t border-gray-100 pt-4">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Created: {new Date(selectedJob.createdAt).toLocaleString('en-IN')}</span>
                                    <span>Updated: {new Date(selectedJob.updatedAt).toLocaleString('en-IN')}</span>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Photo Lightbox ───────────────────────────────────────────── */}
            {lightboxIdx !== null && photos[lightboxIdx] && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setLightboxIdx(null)}>
                    <div className="flex items-center justify-between px-4 py-3 text-white">
                        <span className="text-sm font-medium">{photos[lightboxIdx].label}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-white/50">{lightboxIdx + 1}/{photos.length}</span>
                            <button type="button" onClick={() => setLightboxIdx(null)} className="bg-white/10 p-2 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-4" onClick={e => e.stopPropagation()}>
                        <img src={photos[lightboxIdx].dataUrl} alt={photos[lightboxIdx].label}
                            className="max-h-full max-w-full object-contain rounded-lg" />
                    </div>
                    {lightboxIdx > 0 && (
                        <button type="button" onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full">
                            <RotateCcw className="h-5 w-5 scale-x-[-1]" />
                        </button>
                    )}
                    {lightboxIdx < photos.length - 1 && (
                        <button type="button" onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full">
                            <RotateCcw className="h-5 w-5" />
                        </button>
                    )}
                    {photos.length > 1 && (
                        <div className="flex gap-2 px-4 pb-4 pt-2 overflow-x-auto" onClick={e => e.stopPropagation()}>
                            {photos.map((p, i) => (
                                <button key={p.id} type="button" onClick={() => setLightboxIdx(i)}
                                    className={`flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIdx ? 'border-white' : 'border-transparent opacity-50'}`}>
                                    <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
