import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FirestoreService } from '../firebase/firestoreService';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let profile = await FirestoreService.getUserProfile(firebaseUser.uid);
                // Bootstrap: first login with no Firestore profile → create admin profile
                if (!profile) {
                    const defaultProfile = {
                        name: firebaseUser.displayName ?? (firebaseUser.email?.split('@')[0] ?? 'Admin'),
                        email: firebaseUser.email ?? '',
                        role: 'admin' as const,
                        createdAt: new Date().toISOString(),
                    };
                    await FirestoreService.createStaffProfile(firebaseUser.uid, defaultProfile);
                    profile = { uid: firebaseUser.uid, ...defaultProfile };
                }
                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email ?? '',
                    role: profile.role,
                    name: profile.name,
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will update user state automatically
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
