import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Shield, Clock, Monitor, Printer, Laptop } from 'lucide-react';
import GoogleReviews from '../../components/GoogleReviews';

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero / Banner Section — styled after the real shop sign */}
            <section className="relative bg-brand-600 text-white overflow-hidden">
                {/* Subtle diagonal texture overlay */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundColor: "red"
                    }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
                    <div className="grid md:grid-cols-[auto_1fr_auto] items-center gap-8">

                        {/* Left badges */}
                        <div className="hidden md:flex flex-col gap-2">
                            {['SALES', 'SERVICE', 'REPAIRS'].map(s => (
                                <div key={s} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm font-bold tracking-widest">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                                    {s}
                                </div>
                            ))}
                        </div>

                        {/* Centre: brand + tagline + CTA */}
                        <div className="text-center md:text-left">
                            {/* Logo-style wordmark */}
                            <div className="inline-block mb-4">
                                <span className="text-5xl md:text-6xl font-black tracking-tight leading-none"
                                    style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
                                    !t junct!on
                                </span>
                                <div className="text-xs font-semibold tracking-[0.3em] text-red-200 mt-1 text-center">
                                    SINCE 2014
                                </div>
                            </div>

                            <h1 className="text-xl md:text-2xl font-bold text-white/90 mb-2 max-w-lg">
                                Expert Computer &amp; Laptop Repair in Pimpri-Chinchwad
                            </h1>
                            <p className="text-brand-100 text-sm md:text-base mb-8 max-w-md">
                                Professional, fast, and reliable tech support. From hardware fixes to data recovery, we get your devices running like new again.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link
                                    to="/services"
                                    className="inline-flex justify-center items-center px-6 py-3 border-2 border-white text-base font-bold rounded-md text-brand-700 bg-white hover:bg-red-50 transition-colors shadow-md"
                                >
                                    Our Services
                                </Link>
                                <Link
                                    to="/track"
                                    className="inline-flex justify-center items-center px-6 py-3 border-2 border-white/60 text-base font-bold rounded-md text-white hover:bg-white/20 transition-colors"
                                >
                                    Track Your Repair <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>

                        {/* Right badges */}
                        <div className="hidden md:flex flex-col gap-2">
                            {[
                                { label: 'LAPTOP', Icon: Laptop },
                                { label: 'DESKTOP', Icon: Monitor },
                                { label: 'PRINTERS', Icon: Printer },
                            ].map(({ label, Icon }) => (
                                <div key={label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm font-bold tracking-widest">
                                    <Icon className="h-4 w-4 opacity-80" />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile service pills */}
                    <div className="md:hidden mt-6 flex flex-wrap gap-2 justify-center">
                        {['SALES', 'SERVICE', 'REPAIRS', 'LAPTOP', 'DESKTOP', 'PRINTERS'].map(s => (
                            <span key={s} className="bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-bold tracking-widest">{s}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900">Why Choose IT Junction?</h2>
                        <p className="mt-4 text-lg text-gray-500">We provide top-notch service with a focus on customer satisfaction.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brand-600 text-white mb-4">
                                <Wrench className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Expert Technicians</h3>
                            <p className="text-gray-600">Skilled professionals with years of experience handling all major brands.</p>
                        </div>

                        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brand-600 text-white mb-4">
                                <Clock className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Fast Turnaround</h3>
                            <p className="text-gray-600">Quick diagnosis and efficient repairs to get you back to work quickly.</p>
                        </div>

                        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brand-600 text-white mb-4">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Trusted Service</h3>
                            <p className="text-gray-600">Genuine parts and transparent pricing with no hidden costs.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Google Reviews */}
            <GoogleReviews />
        </div>
    );
}
