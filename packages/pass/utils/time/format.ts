import { format as formatDate } from '@proton/shared/lib/date-fns-utc';

export const getFormattedDateFromTimestamp = (timestamp: number) => {
    return `${formatDate(new Date(timestamp * 1000), 'MMM dd, yyyy, HH:mm:ss')} UTC`;
};
