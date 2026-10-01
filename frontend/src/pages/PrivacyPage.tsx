import { useNavigate } from 'react-router-dom';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  Content,
  Breadcrumb,
  BreadcrumbItem,
  Tile,
  Stack,
} from '@carbon/react';

function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header aria-label="Privacy Policy Header">
        <HeaderName href="/" prefix="">
          Library Management System
        </HeaderName>
        <HeaderNavigation aria-label="Header Navigation">
          <HeaderMenuItem onClick={() => navigate('/terms')}>
            Terms of Conditions
          </HeaderMenuItem>
          <HeaderMenuItem onClick={() => navigate('/privacy')}>
            Privacy
          </HeaderMenuItem>
          <HeaderMenuItem onClick={() => navigate('/login')}>
            Login
          </HeaderMenuItem>
        </HeaderNavigation>
      </Header>

      <Content>
        <Breadcrumb>
          <BreadcrumbItem href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Privacy Policy</BreadcrumbItem>
        </Breadcrumb>

        <Stack gap={7}>
          <div>
            <h1 className="cds--type-productive-heading-06">Privacy Policy</h1>
            <p className="cds--type-body-01" style={{ color: 'var(--cds-text-secondary)' }}>
              Last updated: November 2, 2025
            </p>
          </div>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Introduction</h2>
            <p className="cds--type-body-01">
              Library Management System ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our Library 
              Management System (LMS) service. Please read this privacy policy carefully. If you do not agree 
              with the terms of this privacy policy, please do not access the service.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Information We Collect</h2>
            <p className="cds--type-body-01">We collect information that you provide directly to us when you:</p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Create an account and use our services</li>
              <li className="cds--list__item">Update your profile information</li>
              <li className="cds--list__item">Interact with books, members, and library operations</li>
              <li className="cds--list__item">Communicate with us for support or feedback</li>
            </ul>
            
            <h3 className="cds--type-productive-heading-03">Personal Information</h3>
            <p className="cds--type-body-01">
              This may include your name, email address, username, phone number, and any other information 
              you choose to provide.
            </p>
            
            <h3 className="cds--type-productive-heading-03">Usage Information</h3>
            <p className="cds--type-body-01">
              We automatically collect certain information about your device and how you interact with our 
              service, including IP address, browser type, operating system, access times, and pages viewed.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">How We Use Your Information</h2>
            <p className="cds--type-body-01">We use the information we collect to:</p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Provide, maintain, and improve our services</li>
              <li className="cds--list__item">Manage your account and provide customer support</li>
              <li className="cds--list__item">Process transactions and send related information</li>
              <li className="cds--list__item">Send administrative information, updates, and security alerts</li>
              <li className="cds--list__item">Monitor and analyze usage patterns and trends</li>
              <li className="cds--list__item">Detect, prevent, and address technical issues and security threats</li>
              <li className="cds--list__item">Comply with legal obligations</li>
            </ul>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Information Sharing and Disclosure</h2>
            <p className="cds--type-body-01">
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information in the following circumstances:
            </p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">
                <strong>With your consent:</strong> We may share your information when you give us permission to do so
              </li>
              <li className="cds--list__item">
                <strong>Service providers:</strong> We may share information with third-party service providers who 
                perform services on our behalf
              </li>
              <li className="cds--list__item">
                <strong>Legal requirements:</strong> We may disclose information if required by law or in response 
                to legal process
              </li>
              <li className="cds--list__item">
                <strong>Protection of rights:</strong> We may disclose information to protect our rights, property, 
                or safety, or that of others
              </li>
            </ul>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Data Security</h2>
            <p className="cds--type-body-01">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Encryption of data in transit and at rest</li>
              <li className="cds--list__item">Regular security assessments and updates</li>
              <li className="cds--list__item">Access controls and authentication mechanisms</li>
              <li className="cds--list__item">Monitoring and logging of system activities</li>
            </ul>
            <p className="cds--type-body-01">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
              strive to use commercially acceptable means to protect your information, we cannot guarantee its 
              absolute security.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Your Rights</h2>
            <p className="cds--type-body-01">You have the right to:</p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Access and receive a copy of your personal information</li>
              <li className="cds--list__item">Rectify inaccurate or incomplete personal information</li>
              <li className="cds--list__item">Request deletion of your personal information</li>
              <li className="cds--list__item">Object to or restrict the processing of your personal information</li>
              <li className="cds--list__item">Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="cds--type-body-01">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Cookies and Tracking Technologies</h2>
            <p className="cds--type-body-01">
              We use cookies and similar tracking technologies to track activity on our service and hold certain 
              information. Cookies are files with a small amount of data that are sent to your browser from a 
              website and stored on your device.
            </p>
            <p className="cds--type-body-01">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
              However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Children's Privacy</h2>
            <p className="cds--type-body-01">
              Our service is not intended for use by children under the age of 13. We do not knowingly collect 
              personally identifiable information from children under 13. If you become aware that a child has 
              provided us with personal information, please contact us.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Changes to This Privacy Policy</h2>
            <p className="cds--type-body-01">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy 
              Policy.
            </p>
            <p className="cds--type-body-01">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy 
              Policy are effective when they are posted on this page.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Contact Us</h2>
            <p className="cds--type-body-01">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Email: privacy@library-demo.local</li>
              <li className="cds--list__item">Website: https://library-demo.local</li>
            </ul>
          </Tile>
        </Stack>
      </Content>
    </>
  );
}

export default PrivacyPage;
