import { SimpleMap } from '@proton/shared/lib/interfaces';

export enum TelemetryMeasurementGroups {
    mailSimpleLogin = 'mail.web.simplelogin_popups',
    screenSize = 'any.web.screen_size',
    calendarTimeZoneSelector = 'calendar.web.timezone_selector',
    accountSignupBasic = 'account.any.signup_basic',
    keyTransparency = 'any.web.key_transparency',
}

export enum TelemetrySimpleLoginEvents {
    spam_view = 'spam_view',
    newsletter_unsubscribe = 'newsletter_unsubscribe',
    simplelogin_modal_view = 'simplelogin_modal_view',
    go_to_simplelogin = 'go_to_simplelogin',
}

export enum TelemetryScreenSizeEvents {
    load = 'load',
    resize = 'resize',
}

export enum TelemetryCalendarEvents {
    change_temporary_time_zone = 'change_temporary_time_zone',
}

export enum TelemetryAccountSignupBasicEvents {
    flow_started = 'flow_started',
    account_created = 'account_created',
}

export enum TelemetryKeyTransparencySelfAuditErrorEvents {
    self_audit_error = 'self_audit_error',
}

export type TelemetryEvents =
    | TelemetrySimpleLoginEvents
    | TelemetryScreenSizeEvents
    | TelemetryCalendarEvents
    | TelemetryAccountSignupBasicEvents
    | TelemetryKeyTransparencySelfAuditErrorEvents;

export interface TelemetryReport {
    measurementGroup: TelemetryMeasurementGroups;
    event: TelemetryEvents;
    values?: SimpleMap<number>;
    dimensions?: SimpleMap<string>;
}

export const sendTelemetryData = (data: {
    MeasurementGroup: TelemetryMeasurementGroups;
    Event: TelemetryEvents;
    Values?: SimpleMap<number>;
    Dimensions?: SimpleMap<string>;
}) => ({
    method: 'post',
    url: 'data/v1/stats',
    data: {
        ...data,
        Values: data.Values || {},
        Dimensions: data.Dimensions || {},
    },
});

export const sendMultipleTelemetryData = (data: { reports: TelemetryReport[] }) => {
    const EventInfo = data.reports.map(({ measurementGroup, event, values, dimensions }) => ({
        MeasurementGroup: measurementGroup,
        Event: event,
        Values: values || {},
        Dimensions: dimensions || {},
    }));

    return {
        method: 'post',
        url: 'data/v1/stats/multiple',
        data: { EventInfo },
    };
};
