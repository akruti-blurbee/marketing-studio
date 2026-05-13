import adbeeLogo from "@/assets/adbeeai-logo.png";

export function Logo({
  className = "",
  imageClassName = "",
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={adbeeLogo}
        alt="AdbeeAI"
        width={1168}
        height={483}
        className={`h-8 w-auto max-w-[min(11.2rem)] object-contain object-left drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] sm:h-9 sm:max-w-[min(100%,14.4rem)] ${imageClassName}`}
        decoding="async"
      />
    </div>
  );
}
