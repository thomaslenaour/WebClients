import React from 'react';

import { c } from 'ttag';

import { FeatureCode, useFeature } from '@proton/features';
import { baseUseSelector } from '@proton/redux-shared-store';

import AccountSecurityCard from './AccountSecurityCard';
import AccountSecuritySuccess from './AccountSecuritySuccess';
import { selectAccountSecurityElements, selectAccountSecurityIssuesCount } from './slice/accountSecuritySlice';

const AccountSecurity = () => {
    const { accountRecoverySet, dataRecoverySet, twoFactorAuthSetOrDismissed, twoFactorAuthSet } =
        baseUseSelector(selectAccountSecurityElements);
    const issuesCount = baseUseSelector(selectAccountSecurityIssuesCount);
    const dismissed2FACardFeature = useFeature(FeatureCode.AccountSecurityDismissed2FACard);

    return (
        <div className="w-full">
            <h3 className="text-rg text-bold mt-1 mb-2">{c('Title').t`Account security`}</h3>

            {issuesCount === 0 ? (
                <AccountSecuritySuccess twoFactorAuthSet={twoFactorAuthSet} />
            ) : (
                <div className="flex flex-column flex-nowrap gap-2 w-full">
                    {!accountRecoverySet && (
                        <AccountSecurityCard
                            title={c('Title').t`Account recovery`}
                            description={c('Description')
                                .t`Set a recovery method to prevent losing access to your account.`}
                            state="critical"
                            path="/recovery#account"
                        />
                    )}
                    {!dataRecoverySet && (
                        <AccountSecurityCard
                            title={c('Title').t`Data recovery`}
                            description={c('Description').t`Set a data recovery method to prevent data loss.`}
                            state="critical"
                            path="/recovery#data"
                        />
                    )}
                    {!twoFactorAuthSetOrDismissed && (
                        <AccountSecurityCard
                            title={c('Title').t`Enable 2FA`}
                            description={c('Description')
                                .t`2FA adds an extra security layer, preventing unauthorized access.`}
                            state="warning"
                            path="/account-password#two-fa"
                            isDismissible
                            onDismiss={() => {
                                void dismissed2FACardFeature.update(true);
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default AccountSecurity;
