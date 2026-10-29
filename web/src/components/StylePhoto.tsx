import Image from "next/image";
import { isVideoUrl } from "@/lib/uploads";

// Shows the real uploaded photo or video when one exists, otherwise the
// branded gradient placeholder with style initials.
export function StylePhoto({
  photo,
  name,
  gradient,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px",
}: {
  photo?: string;
  name: string;
  gradient: string;
  className: string;
  sizes?: string;
}) {
  if (photo && isVideoUrl(photo)) {
    return (
      <video
        src={photo}
        controls
        preload="metadata"
        playsInline
        aria-label={`${name} video`}
        className={`${className} object-cover bg-black`}
      />
    );
  }
  if (photo) {
    // Next optimizes these: right size per screen, WebP, lazy below the fold.
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={photo}
          alt={name}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`${className} flex items-center justify-center font-extrabold text-white`}
      style={{ background: gradient }}
      role="img"
      aria-label={`${name} photo coming soon`}
    >
      {name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")}
    </div>
  );
}
