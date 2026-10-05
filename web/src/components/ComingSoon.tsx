import { Button } from "./Button";

export function ComingSoon({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-blush-100 bg-white p-10 text-center shadow-[0_10px_30px_rgba(107,33,72,0.12)]">
      <p className="text-xs font-extrabold tracking-[3px] text-blush-600">
        COMING IN PHASE 2
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-plum-700">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-cocoa-500">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button href="/explore">Explore Hairstyles</Button>
        <Button href="/request" variant="dark">
          Tell Ese What I Want
        </Button>
      </div>
    </div>
  );
}
