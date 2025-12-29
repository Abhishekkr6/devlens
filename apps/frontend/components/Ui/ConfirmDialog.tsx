import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Delete",
    cancelText = "Cancel",
    isLoading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-0">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-rose-600">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {title}
                </h3>

                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                    {description}
                </p>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface hover:bg-surface/80 rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
