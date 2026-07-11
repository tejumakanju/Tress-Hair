import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Header-only mark: transparent, no black disc. Do not reuse for footer. */
export function BrandLogoHeader({
  className,
}: {
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "absolute left-1/2 -translate-x-1/2 flex flex-col items-center",
        className
      )}
    >
      <Image
        src="/logo-header.png"
        alt="Tressé Hair"
        width={140}
        height={120}
        className="h-12 md:h-16 w-auto object-contain"
        priority
        unoptimized
      />
    </Link>
  );
}

/** Footer-only mark: black circular badge. Do not reuse for header. */
export function BrandLogoFooter({
  className,
}: {
  className?: string;
}) {
  return (
    <Image
      src="/logo-footer.png"
      alt="Tressé Hair"
      width={160}
      height={160}
      className={cn("h-16 md:h-20 w-auto mb-6 object-contain", className)}
      unoptimized
    />
  );
}
