import { useEffect, useRef } from 'react';

import { EasySwitchProvider } from '@proton/activation';
import {
    FeatureCode,
    RebrandingFeedbackModal,
    getShouldOpenReferralModal,
    useFeature,
    useModalState,
    useRebrandingFeedback,
    useSubscription,
    useWelcomeFlags,
} from '@proton/components';
import { OPEN_OFFER_MODAL_EVENT } from '@proton/shared/lib/constants';
import { isElectronApp } from '@proton/shared/lib/helpers/desktop';

import MailOnboardingModal from '../components/onboarding/MailOnboardingModal';

interface Props {
    onboardingOpen: boolean;
}

const MailStartupModals = ({ onboardingOpen }: Props) => {
    // Onboarding modal
    const [onboardingModal, setOnboardingModal, renderOnboardingModal] = useModalState();

    // Referral modal
    const [subscription] = useSubscription();
    const seenReferralModal = useFeature<boolean>(FeatureCode.SeenReferralModal);
    const shouldOpenReferralModal = getShouldOpenReferralModal({ subscription, feature: seenReferralModal.feature });

    const [rebrandingFeedbackModal, setRebrandingFeedbackModal, renderRebrandingFeedbackModal] = useModalState();
    const handleRebrandingFeedbackModalDisplay = useRebrandingFeedback();
    const [, setWelcomeFlagsDone] = useWelcomeFlags();

    const onceRef = useRef(false);
    useEffect(() => {
        if (onceRef.current || isElectronApp) {
            return;
        }

        const openModal = (setModalOpen: (newValue: boolean) => void) => {
            onceRef.current = true;
            setModalOpen(true);
        };

        if (onboardingOpen) {
            openModal(setOnboardingModal);
        } else if (shouldOpenReferralModal.open) {
            onceRef.current = true;
            document.dispatchEvent(new CustomEvent(OPEN_OFFER_MODAL_EVENT));
        } else if (handleRebrandingFeedbackModalDisplay) {
            openModal(setRebrandingFeedbackModal);
        }
    }, [shouldOpenReferralModal.open, handleRebrandingFeedbackModalDisplay, onboardingOpen]);

    return (
        <>
            {renderOnboardingModal && (
                <EasySwitchProvider>
                    <MailOnboardingModal
                        hideDiscoverApps
                        onDone={() => {
                            setWelcomeFlagsDone();
                            onboardingModal.onClose();
                        }}
                        onExit={onboardingModal.onExit}
                        open={onboardingModal.open}
                    />
                </EasySwitchProvider>
            )}
            {renderRebrandingFeedbackModal && (
                <RebrandingFeedbackModal onMount={handleRebrandingFeedbackModalDisplay} {...rebrandingFeedbackModal} />
            )}
        </>
    );
};

export default MailStartupModals;
