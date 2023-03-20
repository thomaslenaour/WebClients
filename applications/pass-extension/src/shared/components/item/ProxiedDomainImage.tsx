import { VFC, useMemo } from 'react';

export enum ImageStatus {
    LOADING,
    READY,
    ERROR,
}

interface Props {
    className?: string;
    onStatusChange: (status: ImageStatus) => void;
    status: ImageStatus;
    url: string;
}

export const ProxiedDomainImage: VFC<Props> = ({ className, onStatusChange, status, url }) => {
    const domain = useMemo(() => {
        try {
            onStatusChange(ImageStatus.LOADING);
            return new URL(url).host;
        } catch (error) {
            onStatusChange(ImageStatus.ERROR);
        }
    }, [url]);

    const style = { opacity: status === ImageStatus.READY ? 1 : 0 };

    return (
        <img
            alt=""
            className={className}
            onError={() => onStatusChange(ImageStatus.ERROR)}
            onLoad={() => onStatusChange(ImageStatus.READY)}
            src={`/api-proxy/core/v4/images/logo?Domain=${domain}&Size=64&Mode=light`}
            style={style}
        />
    );
};
