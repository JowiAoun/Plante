'use client'

/**
 * PrivacyConsentModal Component
 * Displays privacy notice about chat data usage for analytics
 */

import React from 'react';
import './PrivacyConsentModal.css';

export interface PrivacyConsentModalProps {
    /** Whether modal is open */
    isOpen: boolean;
    /** Callback when user accepts consent */
    onAccept: () => void;
    /** Callback when user declines consent */
    onDecline: () => void;
}

/**
 * PrivacyConsentModal - Privacy notice for chat data analytics
 */
export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
    isOpen,
    onAccept,
    onDecline,
}) => {
    if (!isOpen) return null;

    return (
        <div className="privacy-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
            <div className="privacy-modal">
                <div className="privacy-modal__header">
                    <span className="privacy-modal__icon">🔒</span>
                    <h2 id="privacy-modal-title" className="privacy-modal__title">
                        Privacy Notice
                    </h2>
                </div>

                <div className="privacy-modal__content">
                    <p className="privacy-modal__intro">
                        To provide you with the best plant care experience, we analyze your chat conversations. Here's what we do:
                    </p>

                    <ul className="privacy-modal__list">
                        <li>
                            <span className="privacy-modal__list-icon">🤖</span>
                            <span><strong>Improve AI Responses</strong> — Your questions help us provide better plant care advice</span>
                        </li>
                        <li>
                            <span className="privacy-modal__list-icon">📊</span>
                            <span><strong>Weekly Insights</strong> — Generate personalized weekly plant health reports based on your concerns</span>
                        </li>
                        <li>
                            <span className="privacy-modal__list-icon">📈</span>
                            <span><strong>Service Improvement</strong> — Anonymous feedback helps us enhance our features</span>
                        </li>
                    </ul>

                    <div className="privacy-modal__note">
                        <strong>🛡️ Your Privacy</strong>
                        <p>
                            We never share your personal information with third parties.
                            All data is anonymized before any analysis.
                            You can change this preference anytime in Settings.
                        </p>
                    </div>
                </div>

                <div className="privacy-modal__actions">
                    <button
                        className="privacy-modal__btn privacy-modal__btn--decline"
                        onClick={onDecline}
                    >
                        No Thanks
                    </button>
                    <button
                        className="privacy-modal__btn privacy-modal__btn--accept"
                        onClick={onAccept}
                    >
                        I Agree ✓
                    </button>
                </div>

                <p className="privacy-modal__footer">
                    By clicking "I Agree", you consent to our data practices as described above.
                </p>
            </div>
        </div>
    );
};

export default PrivacyConsentModal;
