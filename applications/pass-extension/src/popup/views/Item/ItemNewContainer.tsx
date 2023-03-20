import { type VFC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { itemCreationIntent, selectDefaultVaultOrThrow } from '@proton/pass/store';
import { ItemCreateIntent, ItemType } from '@proton/pass/types';

import { ItemNewProps } from '../../../shared/items/types';
import { useNavigationContext } from '../../context';
import { useItemsFilteringContext } from '../../context/items/useItemsFilteringContext';
import { AliasNew } from './Alias/Alias.new';
import { LoginNew } from './Login/Login.new';
import { NoteNew } from './Note/Note.new';

const itemNewMap: { [T in ItemType]: VFC<ItemNewProps<T>> } = {
    login: LoginNew,
    note: NoteNew,
    alias: AliasNew,
};

export const ItemNewContainer: VFC = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const { itemType } = useParams<{ shareId: string; itemType: ItemType }>();
    const { selectItem } = useNavigationContext();
    const { vaultId: selectedVaultId } = useItemsFilteringContext();

    const defaultVault = useSelector(selectDefaultVaultOrThrow);
    const vaultId = selectedVaultId ?? defaultVault.shareId;

    const ItemNewComponent = itemNewMap[itemType];

    const handleSubmit = (createIntent: ItemCreateIntent) => {
        const action = itemCreationIntent(createIntent);
        dispatch(action);

        selectItem(createIntent.shareId, action.payload.optimisticId);
    };

    const handleCancel = () => history.goBack();

    return <ItemNewComponent vaultId={vaultId} onSubmit={handleSubmit} onCancel={handleCancel} />;
};
