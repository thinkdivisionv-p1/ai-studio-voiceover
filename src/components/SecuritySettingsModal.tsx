import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ShieldCheck, Check, AlertCircle, RefreshCw, X } from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioPassword: string;
  onSavePassword: (pw: string) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  studioPassword,
  onSavePassword,
}) => {
  const [passwordInput, setPasswordInput] = useState(studioPassword);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    setPasswordInput(studioPassword);
  }, [studioPassword]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setIsVerifying(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-studio-password': passwordInput,
        },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok) {
        onSavePassword(passwordInput);
        if (data.protected) {
          setStatusMessage({
            type: 'success',
            text: 'Passcode verified successfully! Your studio requests are authorized.',
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: 'Backend has no password configured (Personal Open Mode). Passcode saved locally.',
          });
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Passcode rejected: The password does not match the server STUDIO_PASSWORD.',
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: `Connection error: ${e.message}`,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Studio Security & Auth</h3>
              <p className="text-xs text-slate-400">
                Protect your public Cloudflare deployment from credit draining
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              When hosting publicly on <strong>Cloudflare Pages</strong>, anyone with your domain could
              theoretically generate speech on your Gemini API key.
            </p>
            <p>
              By setting <code>STUDIO_PASSWORD</code> in your Cloudflare Pages environment variables,
              all generation calls will require this passcode.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              Your Personal Studio Passcode
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter STUDIO_PASSWORD..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'info'
                  ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              setPasswordInput('');
              onSavePassword('');
              setStatusMessage({
                type: 'info',
                text: 'Cleared local passcode.',
              });
            }}
            className="text-xs text-slate-500 hover:text-slate-400"
          >
            Clear Passcode
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={isVerifying}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isVerifying ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save & Test Auth
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
