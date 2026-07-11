"use client";

import { cn } from "@/lib/utils";

type FormFieldBase = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoComplete?: string;
  error?: string | null;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
  inputClassName?: string;
};

type InputProps = FormFieldBase & {
  as?: "input";
  type?: string;
};

type TextareaProps = FormFieldBase & {
  as: "textarea";
  rows?: number;
};

export type FormFieldProps = InputProps | TextareaProps;

export function FormField(props: FormFieldProps) {
  const {
    id,
    label,
    required,
    value,
    onChange,
    onBlur,
    autoComplete,
    error,
    hint,
    maxLength,
    showCount,
    className,
    inputClassName,
  } = props;

  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const controlClass = cn(
    "w-full px-3 py-3 md:py-2.5 text-base md:text-sm border bg-white focus:outline-none focus:border-champagne",
    error ? "border-crimson" : "border-border",
    inputClassName
  );

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5"
      >
        {label}
        {required ? <span className="text-crimson ml-0.5">*</span> : null}
      </label>
      {props.as === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          maxLength={maxLength}
          rows={props.rows ?? 4}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(controlClass, "resize-none")}
        />
      ) : (
        <input
          id={id}
          type={props.type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={controlClass}
        />
      )}
      <div className="mt-1.5 flex items-start justify-between gap-2 min-h-[1.25rem]">
        <div className="flex-1">
          {error ? (
            <p id={`${id}-error`} className="text-xs text-crimson" role="alert">
              {error}
            </p>
          ) : hint ? (
            <p id={`${id}-hint`} className="text-xs text-muted">
              {hint}
            </p>
          ) : null}
        </div>
        {showCount && typeof maxLength === "number" ? (
          <p className="text-[10px] text-muted tabular-nums shrink-0">
            {value.length}/{maxLength}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type FormSelectProps = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSelect({
  id,
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  hint,
  children,
  className,
}: FormSelectProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5"
      >
        {label}
        {required ? <span className="text-crimson ml-0.5">*</span> : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={cn(
          "w-full px-3 py-3 md:py-2.5 text-base md:text-sm border bg-white focus:outline-none focus:border-champagne",
          error ? "border-crimson" : "border-border"
        )}
      >
        {children}
      </select>
      <div className="mt-1.5 min-h-[1.25rem]">
        {error ? (
          <p id={`${id}-error`} className="text-xs text-crimson" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
