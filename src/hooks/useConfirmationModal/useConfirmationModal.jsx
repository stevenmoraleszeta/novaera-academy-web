import { useState } from 'react';

export const useConfirmationModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [item, setItem] = useState(null);

    const open = (itemToConfirm) => {
        setItem(itemToConfirm);
        setIsOpen(true);
    };

    const close = () => {
        setItem(null);
        setIsOpen(false);
    };

    return {
        isConfirmationOpen: isOpen,
        itemForConfirmation: item,
        openConfirmation: open,
        closeConfirmation: close,
    };
};