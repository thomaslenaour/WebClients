import { ButtonLike } from '@proton/atoms';

export const ContentItemsListSkeleton = () => (
    <ul className="unstyled m0 anime-fade-in">
        {Array.from({ length: 7 }, (_, i) => (
            <ButtonLike
                key={`skeleton-item-${i}`}
                className="pass-item-list--item block w100"
                as={'li'}
                shape="ghost"
                disabled
            >
                <div className="flex flex-nowrap p0-5 mb-0-25">
                    <div className="mr1" style={{ minWidth: 16 }}>
                        <div className="extension-skeleton extension-skeleton--item-icon" />
                    </div>
                    <div className="text-left" style={{ width: '100%' }}>
                        <div className="extension-skeleton extension-skeleton--item-heading" />
                        <div className="extension-skeleton extension-skeleton--item-subheading" />
                    </div>
                </div>
            </ButtonLike>
        ))}
    </ul>
);
