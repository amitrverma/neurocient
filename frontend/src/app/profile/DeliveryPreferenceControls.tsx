"use client";

export const PreferenceToggle = ({
  title,
  text,
  checked,
  onChange,
  compact = false,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  compact?: boolean;
}) => (
  <label
    className={`flex cursor-pointer items-center justify-between gap-5 ${
      compact ? "" : "py-5"
    }`}
  >
    <span>
      <span className="block font-sans text-sm font-semibold text-brand-dark">
        {title}
      </span>
      <span className="mt-1 block max-w-xl font-sans text-sm leading-6 text-brand-dark/64">
        {text}
      </span>
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-5 w-5 shrink-0 accent-brand-accent"
    />
  </label>
);

export const WhatsAppVerificationControls = ({
  number,
  verifiedNumber,
  verified,
  code,
  codeSent,
  busy,
  onNumberChange,
  onCodeChange,
  onRequestCode,
  onConfirmCode,
}: {
  number: string;
  verifiedNumber: string;
  verified: boolean;
  code: string;
  codeSent: boolean;
  busy: boolean;
  onNumberChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onRequestCode: () => void;
  onConfirmCode: () => void;
}) => (
  <div className="mt-4 space-y-3">
    <label className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-brand-teal">
      WhatsApp number
      <input
        type="tel"
        inputMode="tel"
        placeholder="+919876543210"
        value={number}
        onChange={(event) => onNumberChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-brand-dark/15 px-4 py-3 font-sans text-sm normal-case tracking-normal text-brand-dark outline-none transition placeholder:text-brand-dark/40 focus:border-brand-teal"
      />
    </label>
    {verified && number === verifiedNumber ? (
      <p className="font-sans text-sm text-brand-dark/64">
        Verified. Optional reminders may use this number only while WhatsApp
        and the relevant reminder are enabled.
      </p>
    ) : codeSent ? (
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Six-digit WhatsApp verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="Six-digit code"
          value={code}
          onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, ""))}
          className="min-w-0 flex-1 rounded-lg border border-brand-dark/15 px-4 py-3 font-sans text-sm text-brand-dark outline-none focus:border-brand-teal"
        />
        <button
          type="button"
          onClick={onConfirmCode}
          disabled={code.length !== 6 || busy}
          className="rounded-full border border-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark disabled:opacity-40"
        >
          Confirm code
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={onRequestCode}
        disabled={!number.trim() || busy}
        className="rounded-full border border-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark disabled:opacity-40"
      >
        {busy ? "Sending code" : "Verify this number"}
      </button>
    )}
  </div>
);
