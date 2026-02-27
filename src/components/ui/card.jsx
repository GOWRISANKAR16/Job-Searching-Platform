export function Card({ className = "", ...props }) {
  return (
    <div
      className={
        "rounded-xl border border-slate-800 bg-slate-950/70 text-slate-50 shadow-sm " +
        className
      }
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }) {
  return (
    <div
      className={"flex flex-col space-y-1.5 p-4 border-b border-slate-800 " + className}
      {...props}
    />
  );
}

export function CardTitle({ className = "", ...props }) {
  return (
    <h3
      className={
        "font-semibold leading-none tracking-tight text-sm text-slate-50 " + className
      }
      {...props}
    />
  );
}

export function CardDescription({ className = "", ...props }) {
  return (
    <p
      className={
        "text-xs text-slate-400 leading-relaxed max-w-prose " + className
      }
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }) {
  return (
    <div className={"p-4 text-sm text-slate-200 " + className} {...props} />
  );
}

export function CardFooter({ className = "", ...props }) {
  return (
    <div
      className={"flex items-center justify-between gap-3 p-4 border-t border-slate-800 " + className}
      {...props}
    />
  );
}
