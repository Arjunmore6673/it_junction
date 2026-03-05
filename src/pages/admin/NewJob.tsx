import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FirestoreService } from '../../firebase/firestoreService';
import { Search, Loader2, Save, Laptop, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PhotoCapture from '../../components/admin/PhotoCapture';
import type { CapturedPhoto } from '../../components/admin/PhotoCapture';
import { generateWhatsAppLink } from '../../utils/whatsapp';

type NewJobFormInputs = {
    mobile: string;
    name: string;
    email: string;
    address: string;
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    configurationDetails: string;
    accessoriesReceived: string;
    reportedProblem: string;
    estimatedDeliveryDays: number;
    loanerDescription: string;
};

export default function NewJob() {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NewJobFormInputs>({
        defaultValues: { deviceType: 'Laptop', estimatedDeliveryDays: 3 }
    });

    const [isLookingUp, setIsLookingUp] = useState(false);
    const [lookupMessage, setLookupMessage] = useState({ text: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
    const [loanerProvided, setLoanerProvided] = useState(false);

    const navigate = useNavigate();
    const { user } = useAuth();
    const mobileValue = watch('mobile');

    const handleLookup = async () => {
        if (!mobileValue || mobileValue.length < 10) {
            setLookupMessage({ text: 'Enter a valid 10-digit mobile number', type: 'error' });
            return;
        }
        setIsLookingUp(true);
        setLookupMessage({ text: '', type: '' });
        try {
            const customer = await FirestoreService.getCustomerByMobile(mobileValue);
            if (customer) {
                setValue('name', customer.name);
                if (customer.email) setValue('email', customer.email);
                if (customer.address) setValue('address', customer.address);
                setLookupMessage({ text: 'Customer found! Details auto-filled.', type: 'success' });
            } else {
                setLookupMessage({ text: 'New customer. Please fill in details below.', type: 'info' });
            }
        } catch {
            setLookupMessage({ text: 'Lookup failed. Check your connection.', type: 'error' });
        } finally {
            setIsLookingUp(false);
        }
    };

    const onSubmit: SubmitHandler<NewJobFormInputs> = async (data) => {
        setIsSubmitting(true);
        try {
            // 1. Get or create customer
            let customer = await FirestoreService.getCustomerByMobile(data.mobile);
            if (!customer) {
                customer = await FirestoreService.createCustomer({
                    name: data.name,
                    mobile: data.mobile,
                    email: data.email,
                    address: data.address,
                });
            }

            // 2. Create job with all new fields
            const newJob = await FirestoreService.createRepairJob({
                customerId: customer.id,
                deviceType: data.deviceType,
                deviceBrand: data.deviceBrand,
                deviceModel: data.deviceModel,
                configurationDetails: data.configurationDetails,
                accessoriesReceived: data.accessoriesReceived
                    .split(',').map(a => a.trim()).filter(Boolean),
                reportedProblem: data.reportedProblem,
                staffNotes: '',
                status: 'Pending Diagnosis',
                estimatedDeliveryDays: Number(data.estimatedDeliveryDays) || undefined,
                photos: photos.map(p => ({
                    id: p.id,
                    dataUrl: p.dataUrl,
                    label: p.label,
                    source: p.source,
                })),
                loanerDevice: loanerProvided
                    ? { provided: true, description: data.loanerDescription, returnedAt: null }
                    : { provided: false },
                assignedTo: user?.id,
            });

            // 3. Generate WhatsApp link and open it
            const origin = window.location.origin;
            const waLink = generateWhatsAppLink(customer, newJob, origin);
            window.location.href = waLink;

            navigate('/admin/customers');
        } catch {
            alert('Failed to create job. Check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">New Repair Job</h1>
                <p className="mt-1 text-sm text-gray-500">Log a new device for repair or service.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200 bg-white p-8 rounded-lg shadow-sm border border-gray-100">

                {/* ── Customer ─────────────────────────────────────────── */}
                <div className="space-y-6 sm:space-y-5">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Details</h3>
                        <p className="mt-1 text-sm text-gray-500">Enter mobile to lookup existing or create new customer.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="tel" id="mobile"
                                    {...register('mobile', { required: 'Mobile is required', minLength: 10 })}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-brand-500 focus:border-brand-500 sm:text-sm border-gray-300 border"
                                />
                                <button type="button" onClick={handleLookup} disabled={isLookingUp}
                                    className="inline-flex items-center space-x-2 px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                                    {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    <span>Lookup</span>
                                </button>
                            </div>
                            {errors.mobile && <p className="mt-2 text-sm text-red-600">{errors.mobile.message}</p>}
                            {lookupMessage.text && (
                                <p className={`mt-2 text-sm ${lookupMessage.type === 'success' ? 'text-green-600' : lookupMessage.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                                    {lookupMessage.text}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                            <div className="mt-1">
                                <input type="text" id="name" {...register('name', { required: 'Name is required' })}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1">
                                <input type="email" id="email" {...register('email')}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <div className="mt-1">
                                <input type="text" id="address" {...register('address')}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Device ─────────────────────────────────────────────── */}
                <div className="pt-8 space-y-6 sm:space-y-5">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Device Information</h3>
                        <p className="mt-1 text-sm text-gray-500">Details about the device brought in for repair.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700">Device Type *</label>
                            <select id="deviceType" {...register('deviceType', { required: true })}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md border">
                                <option>Laptop</option>
                                <option>Desktop</option>
                                <option>Printer</option>
                                <option>Tablet</option>
                                <option>Other Accessory</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="deviceBrand" className="block text-sm font-medium text-gray-700">Brand *</label>
                            <div className="mt-1">
                                <input type="text" id="deviceBrand" placeholder="e.g. Dell, HP, Lenovo"
                                    {...register('deviceBrand', { required: 'Brand is required' })}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                            {errors.deviceBrand && <p className="mt-2 text-sm text-red-600">{errors.deviceBrand.message}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700">Model *</label>
                            <div className="mt-1">
                                <input type="text" id="deviceModel" placeholder="e.g. Inspiron 15"
                                    {...register('deviceModel', { required: 'Model is required' })}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                            {errors.deviceModel && <p className="mt-2 text-sm text-red-600">{errors.deviceModel.message}</p>}
                        </div>
                        <div className="sm:col-span-6">
                            <label htmlFor="configurationDetails" className="block text-sm font-medium text-gray-700">Configuration Details</label>
                            <div className="mt-1">
                                <textarea id="configurationDetails" rows={2}
                                    placeholder="Processor, RAM, HDD/SSD capacity, Serial Number..."
                                    {...register('configurationDetails')}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2" />
                            </div>
                        </div>
                        <div className="sm:col-span-4">
                            <label htmlFor="accessoriesReceived" className="block text-sm font-medium text-gray-700">Accessories Received</label>
                            <div className="mt-1">
                                <input type="text" id="accessoriesReceived"
                                    placeholder="Charger, Bag, Mouse (comma separated)"
                                    {...register('accessoriesReceived')}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="estimatedDeliveryDays" className="block text-sm font-medium text-gray-700">Estimated Delivery (days)</label>
                            <div className="mt-1">
                                <input type="number" id="estimatedDeliveryDays" min={1} max={60}
                                    {...register('estimatedDeliveryDays', { min: 1 })}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                        </div>
                        <div className="sm:col-span-6">
                            <label htmlFor="reportedProblem" className="block text-sm font-medium text-gray-700">Reported Problem *</label>
                            <div className="mt-1">
                                <textarea id="reportedProblem" rows={4}
                                    {...register('reportedProblem', { required: 'Problem description is required' })}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2" />
                            </div>
                            {errors.reportedProblem && <p className="mt-2 text-sm text-red-600">{errors.reportedProblem.message}</p>}
                        </div>
                    </div>
                </div>

                {/* ── Loaner Device ──────────────────────────────────────── */}
                <div className="pt-8 space-y-4">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Loaner / Alternative Device</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Lend an alternative device to the customer while their device is being repaired.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setLoanerProvided(v => !v)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                            ${loanerProvided
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
                    >
                        {loanerProvided
                            ? <ToggleRight className="h-6 w-6 text-brand-600" />
                            : <ToggleLeft className="h-6 w-6 text-gray-400" />
                        }
                        <Laptop className="h-5 w-5" />
                        {loanerProvided ? 'Loaner device will be provided' : 'No loaner device — click to enable'}
                    </button>
                    {loanerProvided && (
                        <div>
                            <label htmlFor="loanerDescription" className="block text-sm font-medium text-gray-700">Loaner Device Details *</label>
                            <input
                                type="text" id="loanerDescription"
                                placeholder="e.g. HP Laptop 14s, S/N: ABC1234"
                                {...register('loanerDescription', { required: loanerProvided ? 'Please describe the loaner device' : false })}
                                className="mt-1 shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                            {errors.loanerDescription && <p className="mt-2 text-sm text-red-600">{errors.loanerDescription.message}</p>}
                        </div>
                    )}
                </div>

                {/* ── Photos ──────────────────────────────────────────────── */}
                <div className="pt-8 space-y-4">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Device Photos</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Capture or upload photos (front, back, damage areas, serial number).
                        </p>
                    </div>
                    <PhotoCapture photos={photos} onChange={setPhotos} maxPhotos={8} />
                    {photos.length > 0 && (
                        <p className="text-xs text-green-600">
                            ✓ {photos.length} photo{photos.length > 1 ? 's' : ''} will be saved with this job.
                        </p>
                    )}
                </div>

                {/* ── Submit ─────────────────────────────────────────────── */}
                <div className="pt-5">
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => navigate('/admin')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-70">
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Save Job
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
