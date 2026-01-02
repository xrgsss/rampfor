import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#070707] border border-white/10 rounded-[32px] w-full max-w-md p-6 text-white shadow-[0_30px_60px_rgba(0,0,0,0.65)]">
        <p className="text-xs uppercase tracking-[0.35em] text-green-500 mb-3">Konfirmasi</p>
        <h3 className="text-2xl font-black mb-2">{title}</h3>
        <p className="text-sm text-white/70 mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-2xl border border-white/10 bg-[#111] text-white/70 hover:border-white/40 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-cyan-400 text-black font-black tracking-tight shadow-lg shadow-green-500/30 hover:brightness-105 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
