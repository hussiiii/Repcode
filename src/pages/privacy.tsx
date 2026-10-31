import { Prose, Heading } from '@/components/ui/typography';
import React from 'react';
import { PublicShell } from '@/components/layout/public-shell';

export default function Privacy() {
    return (
        <PublicShell inset>
            <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 text-foreground">
                <Heading as="h1" size="4xl" weight="bold" className="text-center mb-8">Privacy</Heading>
                <Prose variant="legal">
                    <p>Last Updated: 07/01/2024</p>
                    <p>Repcode.io (“Repcode” “we” or “us”) is committed to protecting your privacy. This Privacy Policy explains the methods and reasons we collect, use, disclose, transfer, and store your information. If you have any questions about the contents of this policy, please contact us.</p>
                    <p>If you do not consent to the collection and use of information from or about you in accordance with this Privacy Policy, then you are not permitted to use Repcode or any services provided on https://repcode.io.</p>
                    <h2>Applicable Law</h2>
                    <p>Repcode is headquartered in the United States of America in the state of California. By viewing any content or otherwise using the services offered by Repcode, you consent to the transfer of information to the United States of America to the extent applicable, and the collection, storage, and processing of information under California, USA law.</p>
                    <h2>Information We Collect</h2>
                    <p>Information you Submit: We store information you provide on this site via forms, surveys, or any other interactive content. This information commonly includes, but is not limited to, name and email address.</p>
                    <p>Log Files: We collect information when you use services provided on our site. This information may include your IP address, device and software characteristics (such as type and operating system), page views, referral URLs, device identifiers or other unique identifiers such as advertising identifiers (e.g., “ad-ID” or “IDFA”), and carrier information. Log files are primarily used for the purpose of enhancing the user experience.</p>
                    <p>Cookies: We use cookies and related technologies to keep track of user preferences and activity. Cookies are small text files created by a web server, delivered through a web browser, and stored on your computer. Most Internet browsers automatically accept cookies. You can instruct your browser, by changing its settings, to stop accepting cookies or to prompt you before accepting a cookie from the websites you visit.</p>
                    <h2>Third Party Services</h2>
                    <p>This site contains links to other websites not owned by Repcode. In general, the third-party services used by us will only collect, use and disclose your information to the extent necessary to allow them to perform their intended services. Please be aware that we are not responsible for the privacy policies of third-party services.</p>
                    <h2>Children and COPPA</h2>
                    <p>Repcode is committed to complying with the Childrens Online Privacy Protection Act (COPPA). We do not use our services to intentionally solicit data from or market to children under the age of 13. We encourage parents and guardians to report any suspicions that a child has provided us with information without their consent. We will take reasonable action to remove this information.</p>
                    <h2>Your Choices</h2>
                    <p>Do Not Track Browser settings: If you enable Do Not Track settings in the browser you are using, Repcode will not use information about websites you visit, other than our site. Learn more about Do Not Track by visiting https://allaboutdnt.com. Email Communication Opt-Out: If you receive promotional emails from Repcode, you can unsubscribe by clicking the bottom Unsubscribe or Opt-Out link at the bottom of every email.</p>
                    <h2>Contact Us</h2>
                    <p>At Repcode, we believe our talented customer service staff will be able to resolve any issues you may have using the our services. If you would like additional information about this privacy policy, please visit our homepage at https://Repcode.io or contact us at repcode.io@gmail.com.</p>
                </Prose>
            </div>
        </PublicShell>
    );
}
