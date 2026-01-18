'use client';

/**
 * Chat Page Route
 * AI-powered conversational assistant with privacy consent
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Chat } from '@/components/pages/Chat';
import { AppShell } from '@/components/AppShell';
import { PrivacyConsentModal } from '@/components/PrivacyConsentModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { mockNotifications } from '@/mocks/data';

export default function ChatPage() {
    const { user, chatAnalyticsConsent } = useCurrentUser();
    const router = useRouter();
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Track if we've already checked consent to prevent repeated triggers
    const consentChecked = useRef(false);

    // Check if user needs to see consent modal (only once per page load)
    useEffect(() => {
        if (user && !consentChecked.current) {
            consentChecked.current = true;
            // Show modal if consent is not explicitly true
            if (chatAnalyticsConsent !== true) {
                setShowConsentModal(true);
            }
        }
    }, [user, chatAnalyticsConsent]);

    const handleAccept = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setShowConsentModal(false);

        try {
            // Save consent to database - will never show popup again
            await fetch('/api/user/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatAnalyticsConsent: true }),
            });
        } catch (error) {
            console.error('Failed to save consent:', error);
        }
    };

    const handleDecline = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setShowConsentModal(false);
        // Just redirect - don't save to database so popup shows again next time
        router.push('/dashboard');
    };

    return (
        <AppShell user={user} notifications={mockNotifications}>
            <Chat />
            <PrivacyConsentModal
                isOpen={showConsentModal}
                onAccept={handleAccept}
                onDecline={handleDecline}
            />
        </AppShell>
    );
}
