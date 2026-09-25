"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useId, useRef, useState } from "react";
import type { FormState } from "@/lib/validation";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

const PendingContext = createContext(false);

/**
 * A form bound to a server action that shows its error or success message.
 * Submits manually so React does not reset what the user typed when validation fails.
 */
export function ActionForm({
  action,
  children,
  className = "flex flex-col gap-5",
  resetOnSuccess = false,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!state?.ok || !form) return;
    if (resetOnSuccess) form.reset();
    // Clear chosen files so saving again does not re-upload them.
    form.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => { input.value = ""; });
  }, [state, resetOnSuccess]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <PendingContext.Provider value={pending}>
      <form ref={formRef} onSubmit={onSubmit} className={className} aria-busy={pending}>
        {children}
        <div aria-live="polite" className="empty:hidden">
          {!pending && state?.error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
          {!pending && state?.ok && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.ok}</p>}
        </div>
      </form>
    </PendingContext.Provider>
  );
}

export function SubmitButton({ children = "Save", pendingText = "Saving…" }: { children?: React.ReactNode; pendingText?: string }) {
  const pending = useContext(PendingContext);
  return (
    <button type="submit" disabled={pending} className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-6 text-[15px] font-semibold text-white hover:bg-accent-dark disabled:cursor-wait disabled:opacity-70">
      {pending ? pendingText : children}
    </button>
  );
}

/** Two-step delete: the first click asks for confirmation. */
export function DeleteButton({ action, label = "Delete" }: { action: () => Promise<void>; label?: string }) {
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(false);
  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-edge-strong px-4 text-sm font-semibold text-red-700 hover:border-red-300 hover:bg-red-50">
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={async () => { setPending(true); await action(); setPending(false); setArmed(false); }}
        className="inline-flex h-11 cursor-pointer items-center rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-70"
      >
        {pending ? "Deleting…" : "Confirm delete"}
      </button>
      <button type="button" onClick={() => setArmed(false)} className="inline-flex h-11 cursor-pointer items-center rounded-lg px-3 text-sm font-semibold text-muted hover:text-ink">
        Cancel
      </button>
    </span>
  );
}

const inputClass = "w-full rounded-lg border border-edge-strong bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-[#8A909B] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

type FieldProps = { label: string; name: string; hint?: string; className?: string };

function FieldShell({ label, hint, id, className, children }: { label: string; hint?: string; id: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      {children}
      {hint && <p id={`${id}-hint`} className="text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

export function Input({ label, name, hint, className, ...props }: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id} className={className}>
      <input id={id} name={name} aria-describedby={hint ? `${id}-hint` : undefined} className={inputClass} {...props} />
    </FieldShell>
  );
}

export function Textarea({ label, name, hint, className, ...props }: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id} className={className}>
      <textarea id={id} name={name} aria-describedby={hint ? `${id}-hint` : undefined} className={`${inputClass} min-h-24 leading-relaxed`} {...props} />
    </FieldShell>
  );
}

export function Select({ label, name, hint, className, options, ...props }: FieldProps & { options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id} className={className}>
      <select id={id} name={name} className={inputClass} {...props}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FieldShell>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-5 cursor-pointer accent-accent" />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-ink">{label}</label>
        {hint && <p className="text-[13px] text-muted">{hint}</p>}
      </div>
    </div>
  );
}

/** File picker that shows the current file and lets the admin remove it. */
export function FileField({ label, name, current, accept = "image/*", hint, removeName }: { label: string; name: string; current?: string | null; accept?: string; hint?: string; removeName: string }) {
  const id = useId();
  const isImage = accept.startsWith("image");
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      {current && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-edge bg-panel p-3">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt="" className="h-16 w-24 rounded-md object-cover" />
          ) : (
            <a href={current} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent underline">View current file</a>
          )}
          <Checkbox label="Remove" name={removeName} />
        </div>
      )}
      <input id={id} type="file" name={name} accept={accept} className="text-sm text-body file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent-soft file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-accent hover:file:bg-[#D9E0F8]" />
      <p className="text-[13px] text-muted">{hint ?? (isImage ? "JPG, PNG, WebP, GIF or AVIF, up to 4 MB." : "PDF, up to 4 MB.")}</p>
    </div>
  );
}
