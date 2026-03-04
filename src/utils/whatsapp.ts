import type { RepairJob, Customer } from '../types';

/**
 * Generates a WhatsApp wa.me link with a pre-filled message for a new repair job.
 * Default country code is set to +91 (India) if the mobile number doesn't include one.
 * 
 * @param customer The customer who owns the repair job
 * @param job The newly created repair job
 * @param origin The window.location.origin to build the tracking link
 * @returns An encoded WhatsApp URL
 */
export const generateWhatsAppLink = (
    customer: Customer,
    job: Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'> & { id: string },
    origin: string
): string => {
    // Basic formatting for mobile number (strip non-digits)
    let formattedMobile = customer.mobile.replace(/\D/g, '');

    // Prefix with +91 if length is 10 (assuming standard Indian mobile without country code)
    if (formattedMobile.length === 10) {
        formattedMobile = `91${formattedMobile}`;
    }

    const trackingLink = `${origin}/track`;

    const message = `Hello ${customer.name},

Your device (${job.deviceBrand} ${job.deviceModel}) has been registered for repair at IT Junction.
*Job ID:* ${job.id}
*Reported Issue:* ${job.reportedProblem}
${job.estimatedDeliveryDays ? `*Estimated Delivery:* ${job.estimatedDeliveryDays} days\n` : ''}
Track your repair status here:
${trackingLink}

Thank you for choosing IT Junction!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedMobile}?text=${encodedMessage}`;
};
