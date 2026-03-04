export default function About() {
    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center mb-12">
                    <h2 className="text-base text-brand-600 font-semibold tracking-wide uppercase">About Us</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Your Local Tech Experts
                    </p>
                </div>

                <div className="prose prose-lg text-gray-500 mx-auto max-w-3xl">
                    <p className="mb-6 text-lg">
                        Located in the heart of Pimpri Colony, Pune, <strong>IT Junction</strong> has been serving the local community with reliable and professional computer repair services. We understand how important your devices are to your daily life and work.
                    </p>
                    <p className="mb-6 text-lg">
                        Our team of skilled technicians is dedicated to providing efficient solutions for all your laptop and desktop needs—whether it’s a broken screen, a slow system, or a custom PC build.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-8 mt-10 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Our Commitment</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Honest assessments and transparent pricing.</li>
                            <li>High-quality replacement parts.</li>
                            <li>Timely delivery and status updates on your repairs.</li>
                            <li>Friendly and approachable customer support.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
