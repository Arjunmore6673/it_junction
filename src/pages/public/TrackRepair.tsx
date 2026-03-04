import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { FirestoreService } from '../../firebase/firestoreService';
import type { RepairJob } from '../../types';

export default function TrackRepair() {
    const [mobile, setMobile] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [job, setJob] = useState<RepairJob | null>(null);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile || mobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }

        setIsLoading(true);
        setError('');
        setSearched(true);

        try {
            const result = await FirestoreService.getJobStatusByMobile(mobile);
            if (result) {
                setJob(result);
            } else {
                setJob(null);
                setError('No recent repair jobs found for this number.');
            }
        } catch (err) {
            console.error('Error fetching job status:', err);
            setError('An error occurred while tracking. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending Diagnosis': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Parts Ordered': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'In Repair': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Ready for Pickup': return 'bg-green-100 text-green-800 border-green-200';
            case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Delivered': return 'bg-brand-100 text-brand-800 border-brand-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="py-20 bg-gray-50 min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Track Your Repair</h2>
                        <p className="text-gray-500 text-lg">
                            Enter your registered mobile number to check the real-time status of your device repair.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-4 mb-4">
                        <div className="flex-grow">
                            <label htmlFor="mobile" className="sr-only">Mobile Number</label>
                            <input
                                id="mobile"
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="Enter 10-digit mobile number"
                                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-4 bg-brand-600 text-white font-medium text-lg rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center disabled:opacity-70 min-w-[120px]"
                        >
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Search className="h-5 w-5 mr-2" /> Track</>}
                        </button>
                    </form>

                    {error && (
                        <div className="max-w-xl mx-auto p-4 bg-red-50 text-red-700 rounded-lg text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    {job && !isLoading && (
                        <div className="mt-12 bg-gray-50 rounded-xl p-8 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Job ID: {job.id}</h3>
                                    <p className="text-gray-500 mt-1">{job.deviceBrand} {job.deviceModel} ({job.deviceType})</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full font-medium border ${getStatusColor(job.status)}`}>
                                    {job.status}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Reported Issue</h4>
                                    <p className="text-gray-900">{job.reportedProblem}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Last Updated</h4>
                                    <p className="text-gray-900">{new Date(job.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {job.status === 'Ready for Pickup' && (
                                <div className="mt-8 p-4 bg-brand-50 text-brand-800 rounded-lg border border-brand-200 flex items-center">
                                    <span className="font-semibold mr-2">Great news!</span>
                                    Your device is repaired and ready for pickup within our business hours.
                                </div>
                            )}
                        </div>
                    )}

                    {searched && !job && !error && !isLoading && (
                        <div className="mt-10 max-w-xl mx-auto p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
                            <p className="text-gray-600">No active repair jobs found for <span className="font-semibold">{mobile}</span>.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
