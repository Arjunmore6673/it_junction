import { useState, useEffect } from 'react';
import { FirestoreService } from '../../firebase/firestoreService';
import type { RepairJob } from '../../types';
import {
    Wrench,
    CheckCircle,
    PackageSearch,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [jobs, setJobs] = useState<RepairJob[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await FirestoreService.getRepairJobs();
                setJobs(data);
            } catch (error) {
                console.error("Failed to fetch jobs");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) {
        return <div className="h-64 flex items-center justify-center">Loading dashboard data...</div>;
    }

    const statCards = [
        {
            name: 'Pending Diagnosis',
            count: jobs.filter(j => j.status === 'Pending Diagnosis').length,
            icon: AlertCircle,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100'
        },
        {
            name: 'In Repair',
            count: jobs.filter(j => j.status === 'In Repair').length,
            icon: Wrench,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            name: 'Ready for Pickup',
            count: jobs.filter(j => j.status === 'Ready for Pickup').length,
            icon: PackageSearch,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            name: 'Delivered',
            count: jobs.filter(j => j.status === 'Delivered').length,
            icon: CheckCircle,
            color: 'text-brand-600',
            bg: 'bg-brand-100'
        },
    ];

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
                    )
                })}
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Jobs</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {jobs.slice(0, 5).map((job) => (
                        <li key={job.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="truncate">
                                    <p className="text-sm font-medium text-brand-600 truncate">{job.id}</p>
                                    <p className="mt-1 text-sm text-gray-500 truncate">{job.deviceBrand} {job.deviceModel}</p>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${job.status === 'Delivered' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}
                  `}>
                                        {job.status}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                        {job.reportedProblem}
                                    </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>
                                        Updated <time dateTime={job.updatedAt}>{new Date(job.updatedAt).toLocaleDateString()}</time>
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                    {jobs.length === 0 && (
                        <li className="px-4 py-6 text-center text-gray-500 sm:px-6">No recent jobs found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
