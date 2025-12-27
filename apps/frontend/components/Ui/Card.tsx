import { cn } from "../../lib/utils";

type DivProps = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className, ...rest }: DivProps) {
  return (
    <div
      className={cn("bg-background border border-border rounded-xl shadow-sm", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...rest }: DivProps) {
  return (
    <div
      className={cn("px-4 py-3 border-b border-border", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...rest }: DivProps) {
  return (
    <div className={cn("px-4 py-3", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...rest }: DivProps) {
  return (
    <div
      className={cn("px-4 py-3 border-t border-border", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

type HeadingProps = React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>;

export function CardTitle({ children, className, ...rest }: HeadingProps) {
  return (
    <h2
      className={cn("text-sm font-semibold text-text-secondary", className)}
      {...rest}
    >
      {children}
    </h2>
  );
}

type ParagraphProps = React.PropsWithChildren<React.HTMLAttributes<HTMLParagraphElement>>;

export function CardValue({ children, className, ...rest }: ParagraphProps) {
  return (
    <p
      className={cn("text-2xl font-bold text-text-primary", className)}
      {...rest}
    >
      {children}
    </p>
  );
}
