import { Laptop, Cpu, HardDrive, Cpu as Gpu, Battery, ShieldAlert } from 'lucide-react';

const services = [
    {
        title: 'Laptop Repair',
        description: 'Screen replacement, keyboard issues, battery replacements, and motherboard repairs for all major brands.',
        icon: Laptop
    },
    {
        title: 'PC Assembly',
        description: 'Custom desktop builds for gaming, professional workstations, and home office setups.',
        icon: Cpu
    },
    {
        title: 'Data Recovery',
        description: 'Secure retrieval of lost or deleted files from damaged hard drives, SSDs, and USB drives.',
        icon: HardDrive
    },
    {
        title: 'Hardware Upgrades',
        description: 'Boost your system performance with RAM upgrades, SSD installations, and GPU replacements.',
        icon: Gpu
    },
    {
        title: 'Component Sales',
        description: 'Genuine chargers, batteries, adapters, cables, and various computer accessories available.',
        icon: Battery
    },
    {
        title: 'Virus Removal',
        description: 'Comprehensive malware scanning, virus removal, and OS reinstallation to secure your data.',
        icon: ShieldAlert
    }
];

export default function Services() {
    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900">Our Services</h2>
                    <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                        Comprehensive tech solutions to keep your devices running smoothly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 border border-gray-100">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-50 text-brand-600 mb-6">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                <p className="text-gray-600 line-clamp-3">{service.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
