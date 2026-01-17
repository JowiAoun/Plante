'use client';

/**
 * Chat Page Route
 * AI-powered conversational assistant
 */

import { Chat } from '@/components/pages/Chat';
import { AppShell } from '@/components/AppShell';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { mockNotifications } from '@/mocks/data';

export default function ChatPage() {
    const { user } = useCurrentUser();

    return (
        <AppShell user={user} notifications={mockNotifications}>
            <Chat />
        </AppShell>
    );
}
