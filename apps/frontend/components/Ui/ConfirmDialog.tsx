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
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-0">
            <div
                className="absolute inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md p-6 overflow-hidden transition-all transform border shadow-2xl rounded-2xl border-border bg-background">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full dark:bg-red-900/30 text-rose-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 transition-colors rounded-full text-text-secondary hover:bg-surface hover:text-text-primary"
                        title="Close dialog"
                        aria-label="Close dialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-text-primary">
                    {title}
                </h3>

                <p className="mb-6 text-sm leading-relaxed text-text-secondary">
                    {description}
                </p>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium transition-colors text-text-secondary hover:text-text-primary bg-surface hover:bg-surface/80 rounded-xl"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 rounded-full animate-spin border-white/20 border-t-white" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
