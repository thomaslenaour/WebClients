import { ComponentPropsWithoutRef, ReactElement, useState } from 'react';
import { Cycle, Currency, Plan, Organization, PlanIDs } from '@proton/shared/lib/interfaces';
import { c } from 'ttag';

import {
    ADDON_NAMES,
    GIGA,
    MAX_ADDRESS_ADDON,
    MAX_DOMAIN_PRO_ADDON,
    MAX_MEMBER_ADDON,
    MAX_SPACE_ADDON,
    MAX_VPN_ADDON,
} from '@proton/shared/lib/constants';
import { getSupportedAddons, setQuantity } from '@proton/shared/lib/helpers/planIDs';

import { Icon, Info, Price } from '../../components';

import { classnames } from '../../helpers';

const AddonKey = {
    [ADDON_NAMES.ADDRESS]: 'MaxAddresses',
    [ADDON_NAMES.MEMBER]: 'MaxMembers',
    [ADDON_NAMES.DOMAIN]: 'MaxDomains',
    [ADDON_NAMES.DOMAIN_BUNDLE_PRO]: 'MaxDomains',
    [ADDON_NAMES.DOMAIN_ENTERPRISE]: 'MaxDomains',
    [ADDON_NAMES.VPN]: 'MaxVPN',
    [ADDON_NAMES.SPACE]: 'MaxSpace',
    [ADDON_NAMES.MEMBER_MAIL_PRO]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_DRIVE_PRO]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_BUNDLE_PRO]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_ENTERPRISE]: 'MaxMembers',
} as const;

interface Props extends ComponentPropsWithoutRef<'div'> {
    cycle: Cycle;
    currency: Currency;
    currentPlan: Plan;
    planIDs: PlanIDs;
    onChangePlanIDs: (planIDs: PlanIDs) => void;
    plans: Plan[];
    plansMap: { [key: string]: Plan };
    organization?: Organization;
    loading?: boolean;
}

const ButtonNumberInput = ({
    value,
    onChange,
    id,
    min = 0,
    max = 999,
    step = 1,
    disabled = false,
}: {
    step?: number;
    id: string;
    min?: number;
    max?: number;
    value: number;
    disabled?: boolean;
    onChange?: (newValue: number) => void;
}) => {
    const [tmpValue, setTmpValue] = useState<number | undefined>(value);

    const getIsValidValue = (newValue?: number) => {
        return newValue !== undefined && newValue >= min && newValue <= max && newValue % step === 0;
    };

    const isDecDisabled = disabled || !getIsValidValue((tmpValue || 0) - step);
    const isIncDisabled = disabled || !getIsValidValue((tmpValue || 0) + step);

    const isValidTmpValue = getIsValidValue(tmpValue);

    return (
        <div className="border rounded flex-item-noshrink flex flex-nowrap">
            <button
                type="button"
                title={c('Action').t`Decrease`}
                className={classnames(['p0-5 flex', isDecDisabled && 'color-disabled'])}
                disabled={isDecDisabled}
                onClick={() => {
                    if (!isValidTmpValue || tmpValue === undefined) {
                        return;
                    }
                    const newValue = tmpValue - step;
                    setTmpValue?.(newValue);
                    onChange?.(newValue);
                }}
            >
                <Icon name="minus" alt={c('Action').t`Decrease`} className="mauto" />
            </button>
            <label htmlFor={id} className="mt0-5 flex mb0-5">
                <input
                    autoComplete="off"
                    min={min}
                    max={max}
                    value={tmpValue}
                    id={id}
                    className="w6e border-left border-right text-center"
                    onBlur={() => {
                        if (!isValidTmpValue) {
                            // Revert to the latest valid value upon blur
                            setTmpValue(value);
                        }
                    }}
                    onChange={({ target: { value: newValue } }) => {
                        if (newValue === '') {
                            setTmpValue?.(undefined);
                            return;
                        }
                        const newIntValue = parseInt(newValue, 10);
                        setTmpValue?.(newIntValue);
                        if (getIsValidValue(newIntValue)) {
                            onChange?.(newIntValue);
                        }
                    }}
                />
            </label>
            <button
                type="button"
                title={c('Action').t`Increase`}
                className={classnames(['p0-5 flex', isIncDisabled && 'color-disabled'])}
                disabled={isIncDisabled}
                onClick={() => {
                    if (!isValidTmpValue || tmpValue === undefined) {
                        return;
                    }
                    const newValue = tmpValue + step;
                    setTmpValue?.(newValue);
                    onChange?.(newValue);
                }}
            >
                <Icon name="plus" alt={c('Action').t`Increase`} className="mauto" />
            </button>
        </div>
    );
};

const addonLimit = {
    [ADDON_NAMES.SPACE]: MAX_SPACE_ADDON,
    [ADDON_NAMES.MEMBER]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.DOMAIN]: MAX_DOMAIN_PRO_ADDON,
    [ADDON_NAMES.DOMAIN_BUNDLE_PRO]: MAX_DOMAIN_PRO_ADDON,
    [ADDON_NAMES.DOMAIN_ENTERPRISE]: MAX_DOMAIN_PRO_ADDON,
    [ADDON_NAMES.ADDRESS]: MAX_ADDRESS_ADDON,
    [ADDON_NAMES.VPN]: MAX_VPN_ADDON,
    [ADDON_NAMES.MEMBER_MAIL_PRO]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.MEMBER_DRIVE_PRO]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.MEMBER_BUNDLE_PRO]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.MEMBER_ENTERPRISE]: MAX_MEMBER_ADDON,
} as const;

const AccountSizeCustomiser = ({
    addon,
    maxUsers,
    price,
    input,
}: {
    addon: Plan;
    maxUsers: number;
    price: ReactElement;
    input: ReactElement;
}) => {
    const contactMailToLink = <a key={1} href="mailto:ProtonForBusiness@proton.me">{c('Action').t`contact`}</a>;
    return (
        <div className="mb2">
            <h2 className="text-2xl text-bold">{c('Info').t`Account size`}</h2>
            <div className="mb1">
                {c('Info')
                    .jt`Select the number of users to include in your plan. Each additional user costs ${price}. Should you need more than ${maxUsers} user accounts, please ${contactMailToLink} our Customer Success team.`}
            </div>
            <div className="flex-no-min-children flex-nowrap flex-align-items-center mb1 on-mobile-flex-wrap">
                <label
                    htmlFor={addon.Name}
                    className="min-w14e plan-customiser-addon-label text-bold pr0-5 on-mobile-w100"
                >
                    {c('Info').t`Number of users`}
                    <Info
                        className="ml0-5"
                        title={c('Info').t`A user is an account associated with a single username, mailbox, and person`}
                    />
                </label>
                {input}
            </div>
        </div>
    );
};
const AdditionalOptionsCustomiser = ({
    addon,
    price,
    input,
}: {
    addon: Plan;
    price: ReactElement;
    input: ReactElement;
}) => {
    return (
        <>
            <h2 className="text-2xl text-bold">{c('Info').t`Additional options`}</h2>
            <div className="mb1">
                {c('Info')
                    .jt`Email hosting for 10 custom email domain names is included for free. Additional domains can be added for ${price}.`}
            </div>
            <div className="flex-no-min-children flex-nowrap flex-align-items-center mb1 on-mobile-flex-wrap">
                <label
                    htmlFor={addon.Name}
                    className="min-w14e plan-customiser-addon-label text-bold pr0-5 on-mobile-w100"
                >
                    {c('Info').t`Custom email domains`}
                    <Info
                        className="ml0-5"
                        title={c('Info')
                            .t`Email hosting is only available for domains you already own. Domain registration is not currently available through Proton. You can host email for domains registered on any domain registrar.`}
                    />
                </label>
                {input}
            </div>
        </>
    );
};

const ProtonPlanCustomizer = ({
    cycle,
    currency,
    onChangePlanIDs,
    planIDs,
    plansMap,
    plans,
    currentPlan,
    organization,
    loading,
    className,
    ...rest
}: Props) => {
    const supportedAddons = getSupportedAddons(planIDs);

    return (
        <div className={classnames(['plan-customiser', className])} {...rest}>
            {Object.entries(supportedAddons).map(([addonName]) => {
                const addon = plansMap[addonName];

                if (!addon) {
                    return null;
                }

                const addonNameKey = addon.Name as ADDON_NAMES;
                const quantity = planIDs[addon.Name] ?? 0;

                const isSupported = !!supportedAddons[addonNameKey];
                const addonMaxKey = AddonKey[addonNameKey];
                const addonMultiplier = addon[addonMaxKey] ?? 1;
                const min = currentPlan[addonMaxKey] ?? 0;
                const max = addonLimit[addonNameKey] * addonMultiplier;
                // Member addon comes with MaxSpace + MaxAddresses
                const value = isSupported
                    ? min + quantity * addonMultiplier
                    : Object.entries(planIDs).reduce(
                          (acc, [planName, quantity]) => acc + plansMap[planName][addonMaxKey] * quantity,
                          0
                      );
                const divider = addonNameKey === ADDON_NAMES.SPACE ? GIGA : 1;
                const maxTotal = max / divider;

                const addonPriceInline = (
                    <Price key={`${addon.Name}-1`} currency={currency} suffix={c('Suffix for price').t`per month`}>
                        {addon.Pricing[cycle] / cycle}
                    </Price>
                );
                const input = (
                    <ButtonNumberInput
                        key={`${addon.Name}-input`}
                        id={addon.Name}
                        value={value / divider}
                        min={min / divider}
                        max={maxTotal}
                        disabled={loading || !isSupported}
                        onChange={(newQuantity) => {
                            onChangePlanIDs(
                                setQuantity(planIDs, addon.Name, (newQuantity * divider - min) / addonMultiplier)
                            );
                        }}
                        step={addonMultiplier}
                    />
                );

                if (
                    [
                        ADDON_NAMES.MEMBER,
                        ADDON_NAMES.MEMBER_BUNDLE_PRO,
                        ADDON_NAMES.MEMBER_DRIVE_PRO,
                        ADDON_NAMES.MEMBER_MAIL_PRO,
                        ADDON_NAMES.MEMBER_ENTERPRISE,
                    ].includes(addonNameKey)
                ) {
                    return (
                        <AccountSizeCustomiser
                            key={`${addon.Name}-size`}
                            addon={addon}
                            price={addonPriceInline}
                            input={input}
                            maxUsers={maxTotal}
                        />
                    );
                }

                if (
                    [ADDON_NAMES.DOMAIN, ADDON_NAMES.DOMAIN_BUNDLE_PRO, ADDON_NAMES.DOMAIN_ENTERPRISE].includes(
                        addonNameKey
                    )
                ) {
                    return (
                        <AdditionalOptionsCustomiser
                            key={`${addon.Name}-options`}
                            addon={addon}
                            price={addonPriceInline}
                            input={input}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
};

export default ProtonPlanCustomizer;
