import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PAYMENT_TOKEN_STATUS, PaymentMethodStatus } from '@proton/components/payments/core';
import { queryPaymentMethodStatus } from '@proton/shared/lib/api/payments';
import { CYCLE, PLANS, PLAN_TYPES } from '@proton/shared/lib/constants';
import { addApiMock, applyHOCs, withApi, withAuthentication, withConfig, withDeprecatedModals } from '@proton/testing';
import noop from '@proton/utils/noop';

import PaymentStep, { Props } from './PaymentStep';

let paymentMethodStatus: PaymentMethodStatus;
beforeEach(() => {
    jest.clearAllMocks();

    paymentMethodStatus = {
        Card: true,
        Paypal: true,
        Apple: true,
        Cash: true,
        Bitcoin: true,
    };

    addApiMock(queryPaymentMethodStatus().url, () => paymentMethodStatus);
});

const PaymentStepContext = applyHOCs(
    withApi(),
    withConfig(),
    withDeprecatedModals(),
    withAuthentication()
)(PaymentStep);

let props: Props;

beforeEach(() => {
    const plans: Props['plans'] = [
        {
            ID: '1',
            ParentMetaPlanID: '',
            Type: PLAN_TYPES.PLAN,
            Cycle: CYCLE.MONTHLY,
            Name: PLANS.BUNDLE,
            Title: 'ProtonMail Plus',
            Currency: 'USD',
            Amount: 1099,
            MaxDomains: 10,
            MaxAddresses: 10,
            MaxSpace: 5368709120,
            MaxCalendars: 10,
            MaxMembers: 10,
            MaxVPN: 10,
            MaxTier: 3,
            Services: 1,
            Features: 1,
            Quantity: 1,
            Pricing: {
                [CYCLE.MONTHLY]: 1099,
                [CYCLE.YEARLY]: 1099 * 12,
                [CYCLE.TWO_YEARS]: 1099 * 24,
            },
            PeriodEnd: {
                '1': 1678452604,
                '12': 1707569404,
                '24': 1739191804,
            },
            State: 1,
            Offers: [],
        },
    ];

    props = {
        api: noop as any,
        subscriptionData: {
            currency: 'USD',
            cycle: CYCLE.MONTHLY,
            minimumCycle: CYCLE.MONTHLY,
            skipUpsell: false,
            planIDs: {
                [PLANS.BUNDLE]: 1,
            },
            checkResult: {
                Amount: 1099,
                AmountDue: 1099,
                CouponDiscount: 0,
                Coupon: null,
                UnusedCredit: 0,
                Credit: 0,
                Currency: 'USD',
                Cycle: CYCLE.MONTHLY,
                Gift: 0,
                Additions: null,
                PeriodEnd: 1622505600,
            },
            payment: undefined,
        },
        plans,
        onPay: jest.fn(),
        onChangePlanIDs: jest.fn(),
        onChangeCurrency: jest.fn(),
        onChangeCycle: jest.fn(),
        plan: plans[0],
        planName: plans[0].Name,
        paymentMethodStatus: {
            Card: true,
            Paypal: true,
            Apple: false,
            Cash: false,
            Bitcoin: false,
        },
    };
});

jest.mock('@proton/components/hooks/useElementRect');

it('should render', () => {
    const { container } = render(<PaymentStepContext {...props} />);
    expect(container).not.toBeEmptyDOMElement();
});

it('should call onPay with the new token', async () => {
    addApiMock('payments/v4/tokens', () => ({
        Token: 'token123',
        Code: 1000,
        Status: PAYMENT_TOKEN_STATUS.STATUS_CHARGEABLE,
    }));

    const { findByTestId, findByText } = render(<PaymentStepContext {...props} />);

    const payButton = await findByText(/Pay /);

    expect(payButton).toBeDefined();
    expect(payButton).toHaveTextContent('Pay');

    const ccNumber = await findByTestId('ccnumber');
    const cvc = await findByTestId('cvc');
    const exp = await findByTestId('exp');
    const postalCode = await findByTestId('postalCode');

    await userEvent.type(ccNumber, '4242424242424242');
    await userEvent.type(cvc, '123');
    await userEvent.type(exp, '1230'); // stands for 12/30, i.e. December 2030
    await userEvent.type(postalCode, '12345');

    await userEvent.click(payButton);

    expect(props.onPay).toHaveBeenCalledWith(
        {
            Details: {
                Token: 'token123',
            },
            Type: 'token',
        },
        'cc'
    );
});
