'use client';

import Link from 'next/link';
import { Facebook, Twitter, Youtube, Linkedin, Heading4 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-top grid grid-4">
                    {/* Contact Us */}
                    <div className="footer-col">
                        <h3>CONTACT US</h3>
                        <ul>
                            <li><Link href="/about-us">About Us</Link></li>
                            <li><Link href="/careers">Careers</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/affiliates">Affiliates & Partners</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div className="footer-col">
                        <h3>HELP</h3>
                        <ul>
                            <li><Link href="/borrowers/faqs">FAQ Borrowers</Link></li>
                            <li><Link href="/lenders/faqs">FAQ Lenders</Link></li>
                            <li><Link href="/glossary">Glossary</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="footer-col">
                        <h3>LEGAL</h3>
                        <ul>
                            <li><Link href="/terms">Terms of Use</Link></li>
                            <li><Link href="/privacy">Privacy & Security Policy</Link></li>
                            <li><Link href="/fair-practices">Fair Practices Code</Link></li>
                            <li><Link href="/grievance">Grievance Redressal Policy</Link></li>
                            <li><Link href="/csr">Corporate Social Responsibility (CSR)</Link></li>
                            <li><Link href="/disclosures">Regulatory & Statutory Disclosures</Link></li>
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div className="footer-col">
                        <h3>FOLLOW US</h3>
                        <div className="social-links">
                            <a href="#" className="social-icon facebook"><Facebook size={20} fill="white" /></a>
                            <a href="#" className="social-icon twitter"><Twitter size={20} fill="white" /></a>
                            <a href="#" className="social-icon youtube"><Youtube size={20} fill="white" /></a>
                            <a href="#" className="social-icon linkedin"><Linkedin size={20} fill="white" /></a>
                        </div>
                    </div>
                </div>

                <div className="footer-disclaimer">
                    <h4>DISCLAIMER</h4>
                    <p>
                        ArthSetu is a technology intermediary platform facilitating peer-to-peer lending between registered, KYC-verified individuals. It is not a bank, NBFC, or financial institution and does not accept deposits or lend from its own balance sheet.
                    </p>
                    <p className="fraud-alert">ArthSetu does NOT:</p>
                    <ul className="fraud-alert">
                        <li>Guarantee returns to lenders</li>
                        <li>Guarantee loan approval to borrowers</li>
                        <li>Provide investment or financial advice</li>
                        <li>Assume or absorb credit risk on behalf of any user</li>
                        <li>Hold user funds outside of a regulated, Trustee-operated Escrow account</li>
                    </ul>
                    <p>
                        All lending decisions are made solely at the discretion of individual lenders. Borrowers are contractually and legally obligated to repay all loans as per the agreed terms. Participation in peer-to-peer lending involves real financial risk, including partial or total loss of invested capital in the event of borrower default. Users are strongly advised to understand and evaluate these risks carefully before participating.
                    </p>
                    <p>
                        All financial transactions — including loan applications, fund disbursements, and EMI repayments — are conducted exclusively through the ArthSetu mobile application via a regulated Escrow structure. This website does not process any financial transactions.
                    </p>
                    <p>
                        ArthSetu operates in alignment with the Reserve Bank of India&apos;s Master Directions for NBFC-P2P Lending Platforms. This platform is currently in development/prototype stage. Regulatory approvals are in process.
                    </p>
                </div>

                <div className="footer-bottom">
                    <p>Copyright © ArthSetu 2026. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
