import * as React from "react";

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
}

export function AlertDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel"
}: AlertDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog */}
            <div className="relative bg-slate-900 border border-white/10 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 fade-in">
                <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
                <p className="text-slate-400 text-sm mb-6">{description}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
