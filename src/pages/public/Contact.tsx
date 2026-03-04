import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';

const SHOP_WHATSAPP = '918007199909';

type FormState = { name: string; phone: string; message: string };
type Errors = Partial<FormState>;

export default function Contact() {
    const [form, setForm] = useState<FormState>({ name: '', phone: '', message: '' });
    const [errors, setErrors] = useState<Errors>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = (): boolean => {
        const e: Errors = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10)
            e.phone = 'Enter a valid 10-digit phone number';
        if (!form.message.trim()) e.message = 'Message is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const text = `Hello IT Junction,\n\nMy name is *${form.name}*.\nMy contact number: ${form.phone}\n\n*Message:*\n${form.message}`;
        const url = `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        setSubmitted(true);
    };

    const handleChange = (key: keyof FormState, value: string) => {
        setForm(f => ({ ...f, [key]: value }));
        if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
    };

    const inputClass = (hasError?: string) =>
        `mt-1 block w-full rounded-md shadow-sm sm:text-sm p-3 border focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

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
                        <h3 className="text-2xl font-bold mb-2 text-gray-900">Send us a message</h3>
                        <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
                            <MessageCircle className="h-4 w-4 text-green-500" />
                            Your message will be sent to us via WhatsApp.
                        </p>

                        {submitted ? (
                            <div className="flex flex-col items-center gap-4 py-10 text-center">
                                <CheckCircle className="h-14 w-14 text-green-500" />
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">Message sent via WhatsApp!</p>
                                    <p className="text-sm text-gray-500 mt-1">We'll get back to you as soon as possible.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', message: '' }); }}
                                    className="mt-2 text-sm text-brand-600 hover:text-brand-800 font-medium underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                                    <input
                                        type="text" id="name"
                                        value={form.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        placeholder="e.g. Rahul Sharma"
                                        className={inputClass(errors.name)}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                    <input
                                        type="tel" id="phone"
                                        value={form.phone}
                                        onChange={e => handleChange('phone', e.target.value)}
                                        placeholder="+91 99999 99999"
                                        className={inputClass(errors.phone)}
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message *</label>
                                    <textarea
                                        id="message" rows={4}
                                        value={form.message}
                                        onChange={e => handleChange('message', e.target.value)}
                                        placeholder="How can we help you?"
                                        className={inputClass(errors.message)}
                                    />
                                    {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                                >
                                    <Send className="h-4 w-4" /> Send via WhatsApp
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Details & Map */}
                    <div>
                        <div className="flex bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
                            <MapPin className="h-6 w-6 text-brand-500 mt-1 flex-shrink-0" />
                            <div className="ml-4">
                                <h4 className="text-lg font-bold text-gray-900">Our Location</h4>
                                <p className="mt-1 text-gray-600">
                                    Sai Chowk, Shastri Nagar, Pimpri Colony,<br />
                                    Pune, Pimpri-Chinchwad, Maharashtra 411017
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <a href="tel:+918007199909"
                                className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors group">
                                <Phone className="h-6 w-6 text-brand-500 mb-4 group-hover:text-brand-600" />
                                <h4 className="text-lg font-bold text-gray-900">Phone</h4>
                                <p className="mt-1 text-gray-600">+91 80071 99909</p>
                            </a>
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <Clock className="h-6 w-6 text-brand-500 mb-4" />
                                <h4 className="text-lg font-bold text-gray-900">Business Hours</h4>
                                <p className="mt-1 text-gray-600 text-sm">Mon–Sat: 10am – 8pm<br />Sun: Closed</p>
                            </div>
                        </div>

                        <a href={`mailto:support@itjunction.com`}
                            className="flex items-center gap-3 bg-gray-50 rounded-lg p-5 border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors mb-6">
                            <Mail className="h-5 w-5 text-brand-500 flex-shrink-0" />
                            <span className="text-gray-700 text-sm font-medium">support@itjunction.com</span>
                        </a>

                        {/* Google Map */}
                        <div className="w-full h-56 bg-gray-200 rounded-xl overflow-hidden shadow-sm">
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
