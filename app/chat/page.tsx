'use client';

/**
 * Chat Page Route
 * AI-powered conversational assistant with privacy consent
 */

import { useState, useEffect } from 'react';
import { Chat } from '@/components/pages/Chat';
import { AppShell } from '@/components/AppShell';
import { PrivacyConsentModal } from '@/components/PrivacyConsentModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { mockNotifications } from '@/mocks/data';

export default function ChatPage() {
    const { user } = useCurrentUser();
    const [showConsentModal, setShowConsentModal] = useState(false);

    // Check if user needs to see consent modal
    useEffect(() => {
        if (user) {
            // Show modal if consent hasn't been given yet
            const hasConsent = (user as { settings?: { chatAnalyticsConsent?: boolean } })?.settings?.chatAnalyticsConsent;
            if (hasConsent === undefined) {
                setShowConsentModal(true);
            }
        }
    }, [user]);

    const handleConsentResponse = async (accepted: boolean) => {
        try {
            await fetch('/api/user/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatAnalyticsConsent: accepted }),
            });
            setShowConsentModal(false);
        } catch (error) {
            console.error('Failed to save consent:', error);
            setShowConsentModal(false);
        }
    };

    return (
        <AppShell user={user} notifications={mockNotifications}>
            <Chat />
            <PrivacyConsentModal
                isOpen={showConsentModal}
                onAccept={() => handleConsentResponse(true)}
                onDecline={() => handleConsentResponse(false)}
            />
        </AppShell>
    );
}
