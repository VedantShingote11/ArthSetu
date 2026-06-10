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
        </SplitLayout>
    );
}
