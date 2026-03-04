import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { FirestoreService } from '../../firebase/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { StaffUser } from '../../types';
import { UserPlus, Users, Shield, User, X, Loader2, Eye, EyeOff, CheckCircle, Trash2 } from 'lucide-react';

export default function Staff() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [staffList, setStaffList] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'staff'>('staff');
    const [showPassword, setShowPassword] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null); // uid to delete
    const [isDeleting, setIsDeleting] = useState(false);

    // Admin guard
    useEffect(() => {
        if (user && user.role !== 'admin') navigate('/admin');
    }, [user, navigate]);

    const loadStaff = async () => {
        try {
            const list = await FirestoreService.getStaffUsers();
            setStaffList(list);
        } catch {
            console.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStaff(); }, []);

    const resetForm = () => {
        setName(''); setEmail(''); setPassword('');
        setRole('staff'); setCreateError(''); setCreateSuccess('');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) { setCreateError('All fields are required.'); return; }
        if (password.length < 6) { setCreateError('Password must be at least 6 characters.'); return; }

        setIsCreating(true);
        setCreateError('');
        try {
            // Create Firebase Auth user
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            // Save profile to Firestore
            await FirestoreService.createStaffProfile(cred.user.uid, {
                name,
                email,
                role,
                createdAt: new Date().toISOString(),
                createdBy: user?.id,
            });

            setCreateSuccess(`${name} (${email}) has been added as ${role}.`);
            await loadStaff();
            setTimeout(() => { setShowModal(false); resetForm(); }, 2000);
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? '';
            if (code === 'auth/email-already-in-use') setCreateError('This email is already registered.');
            else if (code === 'auth/weak-password') setCreateError('Password is too weak.');
            else setCreateError('Failed to create account. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (uid: string) => {
        setIsDeleting(true);
        try {
            await FirestoreService.deleteStaffProfile(uid);
            await loadStaff();
        } catch {
            alert('Failed to delete staff account.');
        } finally {
            setIsDeleting(false);
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage staff accounts that have access to the admin portal.
                    </p>
                </div>
                <button type="button" onClick={() => { setShowModal(true); resetForm(); }}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <UserPlus className="h-4 w-4" /> Add Staff
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading staff...
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {staffList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                            <Users className="h-10 w-10" />
                            <div className="text-center">
                                <p className="font-medium text-gray-600">No staff accounts yet</p>
                                <p className="text-sm">Click "Add Staff" to create the first account.</p>
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {staffList.map(s => (
                                    <tr key={s.uid} className="hover:bg-gray-50">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {s.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{s.email}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {s.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                                {s.role === 'admin' ? 'Admin' : 'Staff'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-400">
                                            {new Date(s.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button type="button"
                                                onClick={() => setDeleteConfirm(s.uid)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                                                title="Delete staff account">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Create Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-brand-600" /> Add Staff Account
                                </h3>
                                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {createSuccess ? (
                                <div className="flex flex-col items-center gap-3 py-6 text-center">
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                    <p className="text-green-700 font-medium">{createSuccess}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleCreate} className="space-y-4">
                                    {createError && (
                                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{createError}</div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                            placeholder="e.g. Ravi Kumar"
                                            className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            placeholder="staff@itjunction.com"
                                            className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} value={password}
                                                onChange={e => setPassword(e.target.value)} required minLength={6}
                                                placeholder="Min. 6 characters"
                                                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                                            <button type="button" onClick={() => setShowPassword(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" onClick={() => setRole('staff')}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                          ${role === 'staff' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                                <User className="h-4 w-4" /> Staff
                                            </button>
                                            <button type="button" onClick={() => setRole('admin')}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                          ${role === 'admin' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                                <Shield className="h-4 w-4" /> Admin
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1.5">
                                            {role === 'admin' ? 'Can manage staff and all jobs.' : 'Can create, view and edit jobs.'}
                                        </p>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setShowModal(false)}
                                            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={isCreating}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium">
                                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                            Create Account
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
                        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 z-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Staff Account?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                This will remove <span className="font-semibold text-gray-800">{staffList.find(s => s.uid === deleteConfirm)?.name}</span> from the admin portal. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="button" onClick={() => handleDelete(deleteConfirm)} disabled={isDeleting}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium">
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
