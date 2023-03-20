import type { VFC } from 'react';

import { ContentItemsListSkeleton } from '../../../shared/components/content/ContentItemsListSkeleton';
import { ContentLayout } from '../../../shared/components/content/ContentLayout';
import { usePopupContext } from '../../context';
import ContentItemsList from './ContentItemsList';

export const Content: VFC = () => {
    const { ready } = usePopupContext();

    return <ContentLayout>{!ready ? <ContentItemsListSkeleton /> : <ContentItemsList />}</ContentLayout>;
};
