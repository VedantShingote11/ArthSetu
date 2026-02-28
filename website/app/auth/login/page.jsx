import SplitLayout from '@/components/SplitLayout';
import ModernAuthForm from '@/components/ModernAuthForm';

export default function LoginPage() {
    return (
        <SplitLayout
            testimonial={{
                text: "We are excited to welcome you to our growing ArthSetu tribe. Please keep your Aadhaar, PAN and Bank details handy to complete our swift KYC process and start earning!",
                author: "Vivek"
            }}
        >
            <ModernAuthForm mode="login" />
        </SplitLayout>
    );
}
