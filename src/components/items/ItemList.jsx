import React from 'react';
import ClipboardItem from './ClipboardItem';

const ItemList = ({
    filteredItems,
    copyToClipboard,
    editItem,
    deleteItem,
    openLink,
    isLikelyUrl,
    truncateText,
    dragHandlers,
    copiedId
}) => {
    if (!filteredItems || filteredItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            {filteredItems.map((item) => (
                <ClipboardItem
                    key={item.id}
                    item={item}
                    copyToClipboard={copyToClipboard}
                    editItem={editItem}
                    deleteItem={deleteItem}
                    openLink={openLink}
                    isLikelyUrl={isLikelyUrl}
                    truncateText={truncateText}
                    dragHandlers={dragHandlers}
                    copiedId={copiedId}
                />
            ))}
        </div>
    );
};

export default ItemList; 