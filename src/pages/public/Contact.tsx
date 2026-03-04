import { MapPin, Phone, Clock } from 'lucide-react';

export default function Contact() {
    return (
        <div className="py-16 bg-white shrink-0 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900">Contact Us</h2>
                    <p className="mt-4 text-xl text-gray-500">
                        We're here to help! Reach out to us or visit our shop.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">Send us a message</h3>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="name" className="mt-1 flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-3 border" placeholder="John Doe" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" id="phone" className="mt-1 flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-3 border" placeholder="+91 99999 99999" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea id="message" rows={4} className="mt-1 flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-3 border" placeholder="How can we help you?"></textarea>
                            </div>
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Details & Map */}
                    <div>
                        <div className="flex bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
                            <MapPin className="h-6 w-6 text-brand-500 mt-1 flex-shrink-0" />
                            <div className="ml-4">
                                <h4 className="text-lg font-bold text-gray-900">Our Location</h4>
                                <p className="mt-1 text-gray-600">
                                    Sai Chowk, Shastri Nagar, Pimpri Colony,<br />
                                    Pune, Pimpri-Chinchwad, Maharashtra 411017
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <Phone className="h-6 w-6 text-brand-500 mb-4" />
                                <h4 className="text-lg font-bold text-gray-900">Phone</h4>
                                <p className="mt-1 text-gray-600">+91 00000 00000</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <Clock className="h-6 w-6 text-brand-500 mb-4" />
                                <h4 className="text-lg font-bold text-gray-900">Business Hours</h4>
                                <p className="mt-1 text-gray-600">Mon-Sat: 10am - 8pm<br />Sun: Closed</p>
                            </div>
                        </div>

                        {/* Google Map Mock - Uses a placeholder map embed to Sai Chowk since exact Maps API Key is not available */}
                        <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.9103061265893!2d73.80164891489437!3d18.623199887352824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b88f36a5a413%3A0xe5426610fb1c8631!2sSai%20Chowk%2C%20Shastri%20Nagar%2C%20Pimpri%20Colony%2C%20Pimpri-Chinchwad%2C%20Maharashtra%20411017!5e0!3m2!1sen!2sin!4v1683212854378!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="IT Junction Location"
                            ></iframe>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
