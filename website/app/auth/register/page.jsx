import SplitLayout from '@/components/SplitLayout';
import ModernAuthForm from '@/components/ModernAuthForm';

export default function RegisterPage() {
    return (
        <SplitLayout
            testimonial={{
                text: "Join the ArthSetu community today. Whether you are looking to grow your wealth or find fair financing, we have a solution for you.",
                author: "Harshita"
            }}
        >
            <ModernAuthForm mode="register" />
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-400 mb-2">Want a faster way?</p>
                <a
                    href="/onboarding/fast"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-blue-300 text-sm hover:bg-slate-700 transition-colors border border-slate-700"
                >
                    🚀 Try Fast Track Onboarding
                </a>
            </div>
        </SplitLayout>
    );
}
