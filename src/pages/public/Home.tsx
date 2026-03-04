import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Shield, Clock } from 'lucide-react';
import GoogleReviews from '../../components/GoogleReviews';

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="bg-brand-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="md:w-2/3">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Expert Computer & Laptop Repair in Pimpri-Chinchwad
                        </h1>
                        <p className="text-xl text-brand-100 mb-8 max-w-2xl">
                            Professional, fast, and reliable tech support. From hardware fixes to data recovery, we get your devices running like new again.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/services"
                                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-brand-900 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Our Services
                            </Link>
                            <Link
                                to="/track"
                                className="inline-flex justify-center items-center px-6 py-3 border border-brand-200 text-base font-medium rounded-md text-white hover:bg-brand-800 transition-colors"
                            >
                                Track Your Repair <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
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
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-brand-500 text-white mb-4">
                                <Wrench className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Expert Technicians</h3>
                            <p className="text-gray-600">Skilled professionals with years of experience handling all major brands.</p>
                        </div>

                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-brand-500 text-white mb-4">
                                <Clock className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Fast Turnaround</h3>
                            <p className="text-gray-600">Quick diagnosis and efficient repairs to get you back to work quickly.</p>
                        </div>

                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-brand-500 text-white mb-4">
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
