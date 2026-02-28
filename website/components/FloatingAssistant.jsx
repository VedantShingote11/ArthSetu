'use client';

import { Mic, X, Send, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function FloatingAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState(null);
    const [conversationState, setConversationState] = useState('initial');
    const [loanData, setLoanData] = useState({
        amount: null,
        purpose: null,
        duration: null,
        repaymentFrequency: null,
        description: null,
    });
    const [currentStep, setCurrentStep] = useState(0);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize speech recognition
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one sentence
            recognitionRef.current.interimResults = true; // Show results as they speak

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInput(transcript);

                // If it's a final result, we could auto-send or just stop listening
                if (event.results[0].isFinal) {
                    setIsListening(false);
                    // Optional: auto-send
                    // handleSend(); 
                }
            };

            recognitionRef.current.onerror = (event) => {
                setIsListening(false);
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setError('Microphone access denied. Please enable permissions.');
                } else if (event.error === 'no-speech') {
                    setError('No speech detected. Please try again.');
                } else {
                    setError(`Error: ${event.error}`);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [language]); // Re-initialize if language changes (optional, but good practice if we were recreating)

    // Initial greeting when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addMessage('assistant', 'Please select your preferred language: English, Hindi, or Marathi.');
        }
    }, [isOpen]);

    const addMessage = (role, content) => {
        setMessages((prev) => [...prev, { role, content, timestamp: new Date() }]);
    };

    const startListening = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            return;
        }

        setError(null);

        // Set language for recognition
        if (language === 'hindi') {
            recognitionRef.current.lang = 'hi-IN';
        } else if (language === 'marathi') {
            recognitionRef.current.lang = 'mr-IN';
        } else {
            recognitionRef.current.lang = 'en-IN';
        }

        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error('Failed to start recognition:', err);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        addMessage('user', userMessage);
        setInput('');

        // Process the message
        const response = await processMessage(userMessage);
        addMessage('assistant', response);
    };

    const processMessage = async (message) => {
        const lowerMessage = message.toLowerCase();

        // Language selection should be handled via buttons now
        if (!language) {
            return 'Please select a language from the options above.';
        }

        // Detect loan application intent
        const loanIntents = {
            english: ['loan', 'apply', 'need money', 'borrow', 'credit'],
            hindi: ['लोन', 'कर्ज', 'पैसे चाहिए', 'उधार'],
            marathi: ['कर्ज', 'लोन', 'पैसे हवे', 'उसने'],
        };

        const isLoanRequest = loanIntents[language]?.some(intent => lowerMessage.includes(intent));

        if (isLoanRequest && conversationState === 'ready') {
            setConversationState('loan_application');
            setCurrentStep(1);
            return getQuestion(1);
        }

        // Loan application flow
        if (conversationState === 'loan_application') {
            return handleLoanApplicationStep(message);
        }

        // Check loan status
        if (lowerMessage.includes('status') || lowerMessage.includes('स्थिति') || lowerMessage.includes('स्टेटस')) {
            return getStatusResponse();
        }

        // View past loans
        if (lowerMessage.includes('past') || lowerMessage.includes('previous') || lowerMessage.includes('पुराने') || lowerMessage.includes('जुने')) {
            return getPastLoansResponse();
        }

        // Default helpful response
        return getHelpResponse();
    };

    const handleLoanApplicationStep = (message) => {
        const step = currentStep;

        switch (step) {
            case 1: // Amount
                const amount = parseFloat(message.replace(/[^0-9.]/g, ''));
                if (amount && amount >= 1000) {
                    setLoanData({ ...loanData, amount });
                    setCurrentStep(2);
                    return getQuestion(2);
                }
                return getErrorResponse(1);

            case 2: // Purpose
                setLoanData({ ...loanData, purpose: message });
                setCurrentStep(3);
                return getQuestion(3);

            case 3: // Duration
                const duration = parseInt(message.replace(/[^0-9]/g, ''));
                if (duration && duration >= 1 && duration <= 60) {
                    setLoanData({ ...loanData, duration });
                    setCurrentStep(4);
                    return getQuestion(4);
                }
                return getErrorResponse(3);

            case 4: // Repayment frequency
                const freq = message.toLowerCase();
                let repaymentFrequency = 'monthly';
                if (freq.includes('month') || freq.includes('महीने') || freq.includes('महिना')) {
                    repaymentFrequency = 'monthly';
                } else if (freq.includes('quarter') || freq.includes('तिमाही')) {
                    repaymentFrequency = 'quarterly';
                } else if (freq.includes('flex') || freq.includes('लचीला')) {
                    repaymentFrequency = 'monthly'; // Default to monthly
                }
                setLoanData({ ...loanData, repaymentFrequency });
                setCurrentStep(5);
                return getQuestion(5);

            case 5: // Additional details
                setLoanData({ ...loanData, description: message });
                setCurrentStep(6);
                return getSummary();

            case 6: // Confirmation
                if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('हां') || message.toLowerCase().includes('हो')) {
                    return submitLoanRequest();
                } else {
                    setConversationState('ready');
                    setCurrentStep(0);
                    setLoanData({});
                    return getCancelResponse();
                }

            default:
                return getHelpResponse();
        }
    };

    const getQuestion = (step) => {
        const questions = {
            english: [
                '',
                'What is the loan amount you need? (Minimum ₹1,000)',
                'What is the purpose of this loan? (e.g., business, education, medical)',
                'For how many months do you need this loan? (1-60 months)',
                'How would you like to repay? Say "monthly" or "flexible"',
                'Any additional details you would like to add? (Optional - you can say "no" to skip)',
            ],
            hindi: [
                '',
                'आपको कितनी राशि का लोन चाहिए? (न्यूनतम ₹1,000)',
                'इस लोन का उद्देश्य क्या है? (जैसे: व्यवसाय, शिक्षा, चिकित्सा)',
                'आपको यह लोन कितने महीनों के लिए चाहिए? (1-60 महीने)',
                'आप कैसे चुकाना चाहेंगे? "महीने" या "लचीला" बोलें',
                'कोई अतिरिक्त जानकारी जोड़ना चाहेंगे? (वैकल्पिक - "नहीं" बोलें छोड़ने के लिए)',
            ],
            marathi: [
                '',
                'तुम्हाला किती रकमेचे कर्ज हवे आहे? (किमान ₹1,000)',
                'या कर्जाचा उद्देश काय आहे? (उदा: व्यवसाय, शिक्षण, वैद्यकीय)',
                'तुम्हाला हे कर्ज किती महिन्यांसाठी हवे आहे? (1-60 महिने)',
                'तुम्ही कसे परतफेड करू इच्छिता? "महिना" किंवा "लवचिक" म्हणा',
                'काही अतिरिक्त माहिती जोडायची आहे का? (पर्यायी - वगळण्यासाठी "नाही" म्हणा)',
            ],
        };

        return questions[language]?.[step] || questions.english[step];
    };

    const getErrorResponse = (step) => {
        const errors = {
            english: {
                1: 'Please enter a valid amount (minimum ₹1,000)',
                3: 'Please enter a valid duration between 1 and 60 months',
            },
            hindi: {
                1: 'कृपया एक वैध राशि दर्ज करें (न्यूनतम ₹1,000)',
                3: 'कृपया 1 से 60 महीनों के बीच एक वैध अवधि दर्ज करें',
            },
            marathi: {
                1: 'कृपया वैध रक्कम प्रविष्ट करा (किमान ₹1,000)',
                3: 'कृपया 1 ते 60 महिन्यांदरम्यान वैध कालावधी प्रविष्ट करा',
            },
        };

        return errors[language]?.[step] || errors.english[step];
    };

    const getSummary = () => {
        if (language === 'hindi') {
            return `कृपया अपने लोन की जानकारी की पुष्टि करें:\n\n• राशि: ₹${loanData.amount?.toLocaleString()}\n• उद्देश्य: ${loanData.purpose}\n• अवधि: ${loanData.duration} महीने\n• भुगतान: ${loanData.repaymentFrequency === 'monthly' ? 'मासिक' : 'तिमाही'}\n• विवरण: ${loanData.description || 'कोई नहीं'}\n\nक्या आप यह लोन आवेदन जमा करना चाहते हैं? (हां/नहीं)`;
        } else if (language === 'marathi') {
            return `कृपया तुमच्या कर्जाची माहिती तपासा:\n\n• रक्कम: ₹${loanData.amount?.toLocaleString()}\n• उद्देश: ${loanData.purpose}\n• कालावधी: ${loanData.duration} महिने\n• परतफेड: ${loanData.repaymentFrequency === 'monthly' ? 'मासिक' : 'तिमाही'}\n• तपशील: ${loanData.description || 'काहीही नाही'}\n\nतुम्ही हा कर्ज अर्ज सबमिट करू इच्छिता का? (हो/नाही)`;
        }
        return `Please confirm your loan details:\n\n• Amount: ₹${loanData.amount?.toLocaleString()}\n• Purpose: ${loanData.purpose}\n• Duration: ${loanData.duration} months\n• Repayment: ${loanData.repaymentFrequency}\n• Description: ${loanData.description || 'None'}\n\nDo you want to submit this loan request? (yes/no)`;
    };

    const submitLoanRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/borrower/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: loanData.amount,
                    purpose: loanData.purpose,
                    duration: loanData.duration,
                    repaymentFrequency: loanData.repaymentFrequency,
                    description: loanData.description,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setConversationState('ready');
                setCurrentStep(0);
                setLoanData({});

                if (language === 'hindi') {
                    return `✅ बढ़िया! आपका लोन आवेदन सफलतापूर्वक जमा हो गया है।\n\nआवेदन संख्या: ${data.loan._id.slice(-8)}\nसुझाई गई ब्याज दर: ${data.suggestedInterestRate}%\n\nआप अपने डैशबोर्ड पर स्थिति देख सकते हैं।`;
                } else if (language === 'marathi') {
                    return `✅ छान! तुमचा कर्ज अर्ज यशस्वीरित्या सबमिट झाला आहे।\n\nअर्ज क्रमांक: ${data.loan._id.slice(-8)}\nसुचवलेला व्याज दर: ${data.suggestedInterestRate}%\n\nतुम्ही तुमच्या डॅशबोर्डवर स्थिती पाहू शकता।`;
                }
                return `✅ Great! Your loan request has been submitted successfully.\n\nRequest ID: ${data.loan._id.slice(-8)}\nSuggested Interest Rate: ${data.suggestedInterestRate}%\n\nYou can check the status on your dashboard.`;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            if (language === 'hindi') {
                return `❌ क्षमा करें, कुछ गलत हो गया। कृपया बाद में पुनः प्रयास करें।\nत्रुटि: ${error.message}`;
            } else if (language === 'marathi') {
                return `❌ माफ करा, काहीतरी चूक झाली. कृपया नंतर पुन्हा प्रयत्न करा.\nत्रुटी: ${error.message}`;
            }
            return `❌ Sorry, something went wrong. Please try again later.\nError: ${error.message}`;
        }
    };

    const getCancelResponse = () => {
        if (language === 'hindi') return 'ठीक है, लोन आवेदन रद्द कर दिया गया। मैं आपकी और कैसे मदद कर सकता हूं?';
        if (language === 'marathi') return 'ठीक आहे, कर्ज अर्ज रद्द केला. मी तुम्हाला आणखी कशी मदत करू शकतो?';
        return 'Okay, loan application cancelled. How else can I help you?';
    };

    const getStatusResponse = () => {
        if (language === 'hindi') return 'आपके लोन की स्थिति देखने के लिए, कृपया अपने डैशबोर्ड पर जाएं या "मेरे लोन" कहें।';
        if (language === 'marathi') return 'तुमच्या कर्जाची स्थिती पाहण्यासाठी, कृपया तुमच्या डॅशबोर्डवर जा किंवा "माझे कर्ज" म्हणा.';
        return 'To check your loan status, please visit your dashboard or say "my loans".';
    };

    const getPastLoansResponse = () => {
        if (language === 'hindi') return 'आपके पुराने लोन देखने के लिए, कृपया अपने डैशबोर्ड पर जाएं।';
        if (language === 'marathi') return 'तुमचे जुने कर्ज पाहण्यासाठी, कृपया तुमच्या डॅशबोर्डवर जा.';
        return 'To view your past loans, please visit your dashboard.';
    };

    const getHelpResponse = () => {
        if (language === 'hindi') {
            return 'मैं आपकी मदद कर सकता हूं:\n• लोन के लिए आवेदन करें\n• लोन की स्थिति देखें\n• पुराने लोन देखें\n\nआप क्या करना चाहेंगे?';
        } else if (language === 'marathi') {
            return 'मी तुम्हाला मदत करू शकतो:\n• कर्जासाठी अर्ज करा\n• कर्जाची स्थिती पहा\n• जुने कर्ज पहा\n\nतुम्हाला काय करायचे आहे?';
        }
        return 'I can help you with:\n• Apply for a loan\n• Check loan status\n• View past loans\n\nWhat would you like to do?';
    };

    return (
        <>
            {/* Assistant Popup Window */}
            {isOpen && (
                <div
                    className="fade-in"
                    style={{
                        position: 'fixed',
                        bottom: '7rem', // Above the button
                        right: '2rem',
                        width: '380px',
                        height: '550px',
                        maxWidth: 'calc(100vw - 4rem)',
                        maxHeight: 'calc(80vh - 8rem)',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        zIndex: 1000,
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1rem',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}></span>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '0.25rem'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--background)' }}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius)',
                                        background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                        whiteSpace: 'pre-wrap',
                                        boxShadow: 'var(--shadow-sm)',
                                        border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {!language && messages.length > 0 && (
                            <div className="flex flex-col gap-2 mt-2 fade-in">
                                <button
                                    onClick={() => {
                                        setLanguage('english');
                                        setConversationState('ready');
                                        addMessage('user', 'English');
                                        setTimeout(() => addMessage('assistant', 'Great! I will assist you in English. How can I help you today? You can:\n• Apply for a loan\n• Check loan status\n• View past loans\n• Get help with repayment'), 500);
                                    }}
                                    className="btn btn-outline"
                                    style={{ width: '100%', textAlign: 'left' }}
                                >
                                    🇺🇸 English
                                </button>
                                <button
                                    onClick={() => {
                                        setLanguage('hindi');
                                        setConversationState('ready');
                                        addMessage('user', 'Hindi');
                                        setTimeout(() => addMessage('assistant', 'बढ़िया! मैं आपकी हिंदी में सहायता करूंगा। आज मैं आपकी कैसे मदद कर सकता हूं? आप:\n• लोन के लिए आवेदन कर सकते हैं\n• लोन की स्थिति देख सकते हैं\n• पुराने लोन देख सकते हैं\n• भुगतान में मदद ले सकते हैं'), 500);
                                    }}
                                    className="btn btn-outline"
                                    style={{ width: '100%', textAlign: 'left' }}
                                >
                                    🇮🇳 Hindi (हिंदी)
                                </button>
                                <button
                                    onClick={() => {
                                        setLanguage('marathi');
                                        setConversationState('ready');
                                        addMessage('user', 'Marathi');
                                        setTimeout(() => addMessage('assistant', 'छान! मी तुम्हाला मराठीत मदत करेन. आज मी तुम्हाला कशी मदत करू शकतो? तुम्ही:\n• कर्जासाठी अर्ज करू शकता\n• कर्जाची स्थिती पाहू शकता\n• जुने कर्ज पाहू शकता\n• परतफेडीसाठी मदत घेऊ शकता'), 500);
                                    }}
                                    className="btn btn-outline"
                                    style={{ width: '100%', textAlign: 'left' }}
                                >
                                    🚩 Marathi (मराठी)
                                </button>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '1rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                        {error && (
                            <div style={{
                                fontSize: '0.8rem',
                                color: 'var(--danger)',
                                marginBottom: '0.5rem',
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 'var(--radius)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                {error}
                                <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                            </div>
                        )}
                        <style jsx>{`
                            @keyframes ripple {
                                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                            }
                            .mic-ripple {
                                position: absolute;
                                top: 0; left: 0; right: 0; bottom: 0;
                                border-radius: 50%;
                                animation: ripple 1.5s infinite linear;
                                pointer-events: none;
                            }
                        `}</style>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="form-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={isListening ? 'Listening...' : (language ? 'Type message...' : 'Select language above...')}
                                disabled={!language && !isListening}
                                style={{ flex: 1, padding: '0.5rem' }}
                            />
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`btn ${isListening ? 'btn-danger pulsing-mic' : 'btn-secondary'}`}
                                disabled={!language}
                                style={{
                                    padding: '0.5rem',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'visible'
                                }}
                                title="Voice Input"
                            >
                                {isListening ? (
                                    <>
                                        <div className="mic-ripple" />
                                        <Mic size={20} className="mic-icon-active" />
                                    </>
                                ) : (
                                    <Mic size={20} />
                                )}
                            </button>
                            <button
                                onClick={handleSend}
                                className="btn btn-primary"
                                disabled={!input.trim() || !language}
                                style={{ padding: '0.5rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="floating-assistant"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                    zIndex: 1000,
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.4)';
                }}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                <span className="sr-only">🤖</span>
            </button>
        </>
    );
}
