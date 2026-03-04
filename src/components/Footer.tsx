import { MapPin, Phone, Mail, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">IT Junction</h3>
                        <p className="text-gray-400 mb-2">
                            Your trusted partner for computer repair, laptop services, and technical support.
                        </p>
                        <p className="text-xs text-gray-500">Established Since 2014</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Our Services</Link></li>
                            <li><Link to="/track" className="text-gray-400 hover:text-white transition-colors">Track Your Repair</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact Info</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 text-brand-500 mr-2 mt-1 flex-shrink-0" />
                                <span className="text-gray-400">
                                    Sai Chowk, Shastri Nagar, Pimpri Colony, Pune, Pimpri-Chinchwad, Maharashtra 411017
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0" />
                                <a href="tel:+918007199909" className="text-gray-400 hover:text-white transition-colors">+91 80071 99909</a>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0" />
                                <span className="text-gray-400">support@itjunction.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} IT Junction. All rights reserved.</p>
                    <p className="flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-brand-500" />
                        Developed by&nbsp;
                        <a href="mailto:arjunmore6673@gmail.com" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                            Arjun More
                        </a>
                        &nbsp;·&nbsp;
                        <a href="tel:+917066064461" className="text-gray-400 hover:text-white transition-colors">
                            +91 70660 64461
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
