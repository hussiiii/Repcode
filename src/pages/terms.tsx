import React from 'react';
import NavBar from '@/components/home/NavBar';
import Footer from '@/components/home/Footer';
import "../app/globals.css";

export default function Terms() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <NavBar />
            <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 text-foreground">
                <h1 className="text-4xl font-bold text-center mb-8">Terms</h1>
                <div className="max-w-4xl text-center space-y-6">
                    <h2 className="text-2xl font-semibold mt-8">Terms</h2>
                    <p className="text-lg">By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws, and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</p>
                    <h2 className="text-2xl font-semibold mt-8">Content Copyright Policy</h2>
                    <p className="text-lg">The site design, logo, video content subject to copyright © 2024-present | Repcode.io</p>
                    <h2 className="text-2xl font-semibold mt-8">Memberships</h2>
                    <p className="text-lg">Billing: Currently Repcode is completely free to use, and users will not be charged in any capacity for using the services provided by Repcode, nor will existing users be charged if said services do end up behind a paywall in the future. </p>
                    {/* <p className="text-lg">Billing: Fees for the Repcode Lifetime Membership are charged once, and membership begins upon successful payment. Subscription fees for the Repcode Pro Monthly Membership are recurring payments. Your subscription begins upon payment of the first installment of subscription fees. The subscription renews at the specified interval upon the payment of automatically recurring subscription fees. Fees are charged on the same day of the month that the subscription began.</p> */}
                    {/* <p className="text-lg">Refunds: We offer no-questions-asked refunds up to 14 days after the initial successful payment, for both the Monthly Pro Membership and Lifetime Membership purchases. For inquiries relating to refunds, please contact repcode.io@gmail.com.</p> */}
                    <p className="text-lg">Sign-up: By signing up for Repcode, you grant Repcode permission to send email communications to the email address associated with your account provider. If you receive promotional emails from Repcode, you can unsubscribe by clicking the bottom Unsubscribe or Opt-Out link at the bottom of every email.</p>
                    {/* <p className="text-lg">Cancellations: You can cancel your Repcode Monthly Membership at any time but this will not result in a refund. If you purchase a subscription that automatically renews, you may cancel the subscription any time before the end of the current billing period, and the cancellation will take effect at the end of the current billing period.</p> */}
                    <h2 className="text-2xl font-semibold mt-8">Disclaimer</h2>
                    <p className="text-lg">The materials on the Repcode.io website are provided “as is”. Repcode.io makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. Further, Repcode.io does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet website or otherwise relating to such materials or on any sites linked to this site.</p>
                    <h2 className="text-2xl font-semibold mt-8">Limitations</h2>
                    <p className="text-lg">In no event shall Repcode.io be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Repcode.io Internet site, even if Repcode.io or a Repcode.io authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>
                    <h2 className="text-2xl font-semibold mt-8">Intellectual Property Rights</h2>
                    <p className="text-lg">Repcode.io is committed to protecting intellectual property rights. Repcode.io strictly follows DMCA guidelines for unauthorized use of copyrighted material. Any inquiries regarding the reproduction of the content on this site must be directed to the party holding the proprietary rights to the specified content. You shall not distribute, publish, transmit, modify, display or create derivative works from material obtained with this service. To file a notice of copyright infringement with Repcode.io, you will need to provide a written communication that follows the guidelines set in Section 512(c)(3) of the Digital Millennium Copyright Act (the “DMCA”).</p>
                    <h2 className="text-2xl font-semibold mt-8">Governing Law</h2>
                    <p className="text-lg">Any claim relating to the Repcode.io website shall be governed by the laws of the State of California without regard to its conflict of law provisions. General Terms and Conditions apply to the Use of a Web Site.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}