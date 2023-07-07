import { Device } from '../../../../store';
import { ContextMenuProps } from '../../../FileBrowser/interface';
import { useRenameDeviceModal } from '../../../modals/RenameDeviceModal';
import { ItemContextMenu } from '../../ContextMenu/ItemContextMenu';
import { RenameButton } from './buttons';

export function DevicesItemContextMenu({
    selectedDevices,
    anchorRef,
    isOpen,
    position,
    open,
    close,
}: ContextMenuProps & {
    selectedDevices: Device[];
}) {
    const [renameDeviceModal, showRenameDeviceModal] = useRenameDeviceModal();
    const isOnlyOneItem = selectedDevices.length === 1;

    if (!isOnlyOneItem) {
        return null;
    }

    return (
        <>
            <ItemContextMenu isOpen={isOpen} open={open} close={close} position={position} anchorRef={anchorRef}>
                <RenameButton showRenameDeviceModal={showRenameDeviceModal} device={selectedDevices[0]} close={close} />
            </ItemContextMenu>
            {renameDeviceModal}
        </>
    );
}
