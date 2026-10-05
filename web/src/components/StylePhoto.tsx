// Shows the real uploaded photo when one exists, otherwise the
// branded gradient placeholder with style initials.
export function StylePhoto({
  photo,
  name,
  gradient,
  className,
}: {
  photo?: string;
  name: string;
  gradient: string;
  className: string;
}) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={name} className={`${className} object-cover`} />;
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
