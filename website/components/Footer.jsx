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
                            <li><Link href="/arth-sahayak">Assistant Demo</Link></li>
                            <li><Link href="/careers">Careers</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/affiliates">Affiliates & Partners</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div className="footer-col">
                        <h3>HELP</h3>
                        <ul>
                            <li><Link href="/faq/borrowers">FAQ Borrowers</Link></li>
                            <li><Link href="/faq/lenders">FAQ Lenders</Link></li>
                            <li><Link href="/glossary">Glossary</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="footer-col">
                        <h3>LEGAL</h3>
                        <ul>
                            <li><Link href="/terms">Terms of Use</Link></li>
                            <li><Link href="/privacy">Privacy & Security Policy</Link></li>
                            <li><Link href="/security-hub">Security Hub</Link></li>
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
                    <h5>ArthSetu is a marketplace platform facilitating lending between registered users. It does not:
                    </h5>
                    <p className="fraud-alert">
                        •	Guarantee returns to lenders
                        •	Guarantee loan approval to borrowers
                        •	Provide investment advice
                        •	Assume credit risk on behalf of users
                    </p>
                    <p>
                        All lending decisions are made at the discretion of lenders. Borrowers are contractually obligated to repay as per agreed terms.
                        Users are advised to evaluate risks carefully before participating.                    </p>
                </div>

                <div className="footer-bottom">
                    <p>Copyright © ArthSetu 2026. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
