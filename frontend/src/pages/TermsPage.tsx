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

function TermsPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header aria-label="Terms of Conditions Header">
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
          <BreadcrumbItem isCurrentPage>Terms of Conditions</BreadcrumbItem>
        </Breadcrumb>

        <Stack gap={7}>
          <div>
            <h1 className="cds--type-productive-heading-06">Terms of Conditions</h1>
            <p className="cds--type-body-01" style={{ color: 'var(--cds-text-secondary)' }}>
              Last updated: November 2, 2025
            </p>
          </div>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Agreement to Terms</h2>
            <p className="cds--type-body-01">
              These Terms of Conditions ("Terms") constitute a legally binding agreement between you and 
              Library Management System ("Company," "we," "us," or "our") concerning your access to and use of the Library 
              Management System (LMS) service. By accessing or using our service, you agree that you have read, 
              understood, and agree to be bound by these Terms.
            </p>
            <p className="cds--type-body-01">
              If you do not agree with all of these Terms, then you are expressly prohibited from using the 
              service and you must discontinue use immediately.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Acceptable Use</h2>
            <p className="cds--type-body-01">
              You agree to use the service only for lawful purposes and in accordance with these Terms. You agree 
              not to use the service:
            </p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">In any way that violates any applicable federal, state, local, or international law or regulation</li>
              <li className="cds--list__item">To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li className="cds--list__item">To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
              <li className="cds--list__item">To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the service</li>
              <li className="cds--list__item">In any manner that could disable, overburden, damage, or impair the service or interfere with any other party's use of the service</li>
            </ul>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">User Accounts</h2>
            <p className="cds--type-body-01">
              When you create an account with us, you must provide information that is accurate, complete, and 
              current at all times. Failure to do so constitutes a breach of the Terms, which may result in 
              immediate termination of your account.
            </p>
            <p className="cds--type-body-01">You are responsible for:</p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Safeguarding your password and for any activities or actions under your account</li>
              <li className="cds--list__item">Notifying us immediately upon becoming aware of any breach of security or unauthorized use of your account</li>
              <li className="cds--list__item">Ensuring that you exit from your account at the end of each session</li>
            </ul>
            <p className="cds--type-body-01">
              We will not be liable for any loss or damage arising from your failure to comply with these requirements.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Intellectual Property Rights</h2>
            <p className="cds--type-body-01">
              The service and its entire contents, features, and functionality (including but not limited to all 
              information, software, text, displays, images, video, and audio, and the design, selection, and 
              arrangement thereof) are owned by the Company, its licensors, or other providers of such material 
              and are protected by copyright, trademark, patent, trade secret, and other intellectual property or 
              proprietary rights laws.
            </p>
            <p className="cds--type-body-01">You must not:</p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Modify copies of any materials from this service</li>
              <li className="cds--list__item">Use any illustrations, photographs, video or audio sequences, or any graphics separately from the accompanying text</li>
              <li className="cds--list__item">Delete or alter any copyright, trademark, or other proprietary rights notices from copies of materials from this service</li>
            </ul>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Library Services</h2>
            <p className="cds--type-body-01">Our Library Management System provides tools for managing library operations including:</p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Book cataloging and management</li>
              <li className="cds--list__item">Member registration and management</li>
              <li className="cds--list__item">Book issue and return operations</li>
              <li className="cds--list__item">Fine calculation and payment tracking</li>
              <li className="cds--list__item">Reporting and analytics</li>
            </ul>
            <p className="cds--type-body-01">
              You acknowledge that the availability and functionality of these services may vary and that we 
              reserve the right to modify, suspend, or discontinue any aspect of the service at any time without 
              prior notice.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">User-Generated Content</h2>
            <p className="cds--type-body-01">
              The service may allow you to create, submit, post, or display content including but not limited to 
              book information, member data, and transaction records. By providing any such content, you grant us 
              a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content 
              in connection with providing the service.
            </p>
            <p className="cds--type-body-01">You represent and warrant that:</p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">You own or control all rights to the content you provide</li>
              <li className="cds--list__item">The content is accurate and not misleading</li>
              <li className="cds--list__item">Use and posting of the content does not violate these Terms and will not violate any rights of or cause injury to any person or entity</li>
            </ul>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Prohibited Activities</h2>
            <p className="cds--type-body-01">
              You may not access or use the service for any purpose other than that for which we make the service 
              available. Prohibited activities include but are not limited to:
            </p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Attempting to bypass any measures designed to prevent or restrict access to the service</li>
              <li className="cds--list__item">Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers</li>
              <li className="cds--list__item">Taking any action that imposes an unreasonable or disproportionately large load on our infrastructure</li>
              <li className="cds--list__item">Uploading or transmitting viruses, worms, or any code of a destructive nature</li>
              <li className="cds--list__item">Using any automated system to access the service in a manner that sends more request messages than a human can reasonably produce</li>
            </ul>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Disclaimer of Warranties</h2>
            <p className="cds--type-body-01">
              THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. YOU AGREE THAT YOUR USE OF THE 
              SERVICE WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL 
              WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICE AND YOUR USE THEREOF.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Limitation of Liability</h2>
            <p className="cds--type-body-01">
              TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO EVENT WILL THE COMPANY, ITS AFFILIATES, OR THEIR 
              LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF 
              ANY KIND ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Termination</h2>
            <p className="cds--type-body-01">
              We may terminate or suspend your account and bar access to the service immediately, without prior 
              notice or liability, under our sole discretion, for any reason whatsoever and without limitation, 
              including but not limited to a breach of the Terms.
            </p>
            <p className="cds--type-body-01">
              Upon termination, your right to use the service will immediately cease. If you wish to terminate 
              your account, you may simply discontinue using the service.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Governing Law</h2>
            <p className="cds--type-body-01">
              These Terms shall be governed and construed in accordance with the laws applicable in your 
              jurisdiction, without regard to its conflict of law provisions.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Changes to Terms</h2>
            <p className="cds--type-body-01">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
              revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p className="cds--type-body-01">
              By continuing to access or use our service after any revisions become effective, you agree to be 
              bound by the revised terms.
            </p>
          </Tile>

          <Tile>
            <h2 className="cds--type-productive-heading-04">Contact Us</h2>
            <p className="cds--type-body-01">
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul className="cds--list--unordered">
              <li className="cds--list__item">Email: legal@library-demo.local</li>
              <li className="cds--list__item">Website: https://library-demo.local</li>
            </ul>
          </Tile>
        </Stack>
      </Content>
    </>
  );
}

export default TermsPage;
