import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableSectionProps {
    id: string;
    children: React.ReactNode;
    key?: React.Key;
}

export function SortableSection({ id, children }: SortableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20 hover:bg-white/10 text-white/20 hover:text-white/40"
                title="Drag to rearrange"
            >
                <GripVertical size={14} />
            </div>

            {children}
        </div>
    );
}
