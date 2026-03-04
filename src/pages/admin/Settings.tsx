import { useState } from 'react';
import { Settings as SettingsIcon, MessageSquare, Store, Info, Save, CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'itjunction_settings';

interface ShopSettings {
    shopName: string;
    phone: string;
    address: string;
    whatsappCountryCode: string;
}

const DEFAULT_SETTINGS: ShopSettings = {
    shopName: 'IT Junction',
    phone: '',
    address: '',
    whatsappCountryCode: '91',
};

function loadSettings(): ShopSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings: ShopSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getSettings(): ShopSettings {
    return loadSettings();
}

export default function Settings() {
    const [form, setForm] = useState<ShopSettings>(loadSettings);
    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveSettings(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const field = (label: string, key: keyof ShopSettings, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <SettingsIcon className="h-6 w-6 text-brand-600" /> Settings
                </h1>
                <p className="mt-1 text-sm text-gray-500">Configure your shop information and app preferences.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Shop Profile */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Store className="h-4 w-4 text-brand-600" /> Shop Profile
                    </h2>
                    {field('Shop Name', 'shopName', 'text', 'e.g. IT Junction')}
                    {field('Contact Phone', 'phone', 'tel', 'e.g. 9876543210')}
                    {field('Address', 'address', 'text', 'e.g. 123, Main St, Chennai')}
                </div>

                {/* WhatsApp Settings */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp Settings
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm font-medium">+</span>
                            <input
                                type="text"
                                value={form.whatsappCountryCode}
                                onChange={e => setForm(f => ({ ...f, whatsappCountryCode: e.target.value.replace(/\D/g, '') }))}
                                placeholder="91"
                                maxLength={4}
                                className="w-24 text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            />
                            <span className="text-xs text-gray-400">Used for WhatsApp messages sent to customers</span>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-xs text-green-700">
                        When a new job is saved, WhatsApp will open with a pre-filled message to the customer's mobile (+ country code above).
                    </div>
                </div>

                {/* About */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-gray-500" /> About
                    </h2>
                    <dl className="text-sm text-gray-600 space-y-1">
                        <div className="flex gap-2"><dt className="font-medium text-gray-500 w-28">App Version</dt><dd>1.0.0</dd></div>
                        <div className="flex gap-2"><dt className="font-medium text-gray-500 w-28">Built with</dt><dd>React + Firebase + Vite</dd></div>
                    </dl>
                </div>

                <div className="flex justify-end gap-3">
                    {saved && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" /> Settings saved!
                        </span>
                    )}
                    <button type="submit"
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                        <Save className="h-4 w-4" /> Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
