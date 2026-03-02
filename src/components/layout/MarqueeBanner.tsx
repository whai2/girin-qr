export default function MarqueeBanner() {
  return (
    <div className="w-full bg-red-600 overflow-hidden sticky top-0 z-50">
      <div className="flex w-max animate-marquee">
        <img
          src="/wtl-marquee.png"
          alt="banner"
          className="h-7 md:h-9 block"
          draggable={false}
        />
        <img
          src="/wtl-marquee.png"
          alt="banner"
          className="h-7 md:h-9 block"
          draggable={false}
        />
      </div>
    </div>
  );
}
