import { useState, useEffect } from 'react';
import { FirestoreService } from '../../firebase/firestoreService';
import type { RepairJob, Customer } from '../../types';
import { Wrench, CheckCircle, PackageSearch, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [jobs, setJobs] = useState<RepairJob[]>([]);
    const [customersMap, setCustomersMap] = useState<Record<string, Customer>>({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsData, customersData] = await Promise.all([
                    FirestoreService.getRepairJobs(),
                    FirestoreService.getCustomers(),
                ]);
                setJobs(jobsData);
                const cMap: Record<string, Customer> = {};
                for (const c of customersData) cMap[c.id] = c;
                setCustomersMap(cMap);
            } catch (error) {
                console.error('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="h-64 flex items-center justify-center text-gray-400">Loading dashboard data...</div>;
    }

    const statCards = [
        {
            name: 'Pending Diagnosis',
            count: jobs.filter(j => j.status === 'Pending Diagnosis').length,
            icon: AlertCircle,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
        },
        {
            name: 'In Repair',
            count: jobs.filter(j => j.status === 'In Repair').length,
            icon: Wrench,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            name: 'Ready for Pickup',
            count: jobs.filter(j => j.status === 'Ready for Pickup').length,
            icon: PackageSearch,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            name: 'Delivered',
            count: jobs.filter(j => j.status === 'Delivered').length,
            icon: CheckCircle,
            color: 'text-brand-600',
            bg: 'bg-brand-100',
        },
    ];

    const STATUS_COLORS: Record<string, string> = {
        'Pending Diagnosis': 'bg-yellow-100 text-yellow-800',
        'Parts Ordered': 'bg-blue-100 text-blue-800',
        'In Repair': 'bg-orange-100 text-orange-800',
        'Ready for Pickup': 'bg-purple-100 text-purple-800',
        'Completed': 'bg-green-100 text-green-800',
        'Delivered': 'bg-gray-100 text-gray-700',
    };

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Overview of current repair jobs and shop status.</p>
                </div>
                <Link
                    to="/admin/new-job"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
                >
                    New Repair Job
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Jobs */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Jobs</h3>
                    <Link to="/admin/customers" className="text-sm text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1">
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <ul className="divide-y divide-gray-200">
                    {jobs.slice(0, 8).map((job) => {
                        const customer = customersMap[job.customerId];
                        return (
                            <li key={job.id}>
                                <button
                                    type="button"
                                    className="w-full text-left px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
                                    onClick={() => navigate(`/admin/customers?job=${job.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="truncate flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-brand-600 truncate">{job.id}</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_COLORS[job.status]}`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-700 font-medium">
                                                {customer ? customer.name : 'Unknown'}
                                                {customer && <span className="text-gray-400 font-normal ml-1">· {customer.mobile}</span>}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{job.deviceBrand} {job.deviceModel} — {job.reportedProblem}</p>
                                        </div>
                                        <div className="ml-4 flex items-center gap-2 flex-shrink-0 text-xs text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            {new Date(job.updatedAt).toLocaleDateString('en-IN')}
                                            <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                    {jobs.length === 0 && (
                        <li className="px-4 py-6 text-center text-gray-500 sm:px-6">No recent jobs found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
