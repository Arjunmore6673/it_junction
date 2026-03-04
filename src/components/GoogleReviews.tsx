import { Star, MessageCircle } from 'lucide-react';

const mockReviews = [
    {
        id: 1,
        name: "Akshay P.",
        date: "2 weeks ago",
        content: "Excellent service! Fixed my laptop screen in just 2 hours. Very professional and transparent pricing.",
        rating: 5
    },
    {
        id: 2,
        name: "Siddharth K.",
        date: "1 month ago",
        content: "Got my PC assembled here. They guided me with the best parts for my budget and did a super clean cable management.",
        rating: 5
    },
    {
        id: 3,
        name: "Neha Joshi",
        date: "3 months ago",
        content: "Reliable shop in Pimpri area for computer repairs. Friendly staff and they don't overcharge like other places.",
        rating: 4
    }
];

export default function GoogleReviews() {
    return (
        <section className="bg-gray-50 py-16 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                            Customer Reviews
                        </h2>
                        <div className="flex items-center mt-2">
                            <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
                            </div>
                            <span className="ml-2 font-semibold text-gray-700">4.9/5 from 22 Google Reviews</span>
                        </div>
                    </div>

                    <a
                        href="https://google.com" // Placeholder for actual Google Maps Business link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Write a Review
                    </a>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {mockReviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center mb-4 text-yellow-500">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-600 italic mb-4">"{review.content}"</p>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                <span className="font-bold text-gray-900">{review.name}</span>
                                <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
