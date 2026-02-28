'use client';

export default function SplitLayout({ children, testimonial }) {
    return (
        <div className="auth-split-layout">
            {/* Left Side - Testimonial */}
            <div className="auth-testimonial-section">
                <div className="testimonial-content">
                    <div className="testimonial-quote-icon">“</div>
                    <p className="testimonial-text">
                        {testimonial.text}
                    </p>
                    <div className="testimonial-author">
                        <div className="author-info">
                            <span className="author-name">{testimonial.author}</span>
                            <span className="verified-badge">✓</span>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="decorative-circle"></div>
                <div className="decorative-dots"></div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-section">
                <div className="auth-form-container">
                    {children}
                </div>
            </div>
        </div>
    );
}
