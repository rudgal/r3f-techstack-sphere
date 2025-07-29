export function TailwindBreakpointsHelper() {
  return (
    <div className="fixed right-0 bottom-0 z-50 m-4 flex size-7 items-center justify-center rounded-full bg-rose-500 font-mono text-sm font-bold text-white sm:bg-cyan-500 md:bg-amber-500 lg:bg-lime-500 xl:bg-sky-500 2xl:bg-fuchsia-500">
      <div className="block sm:hidden md:hidden lg:hidden xl:hidden">xs</div>
      <div className="hidden sm:block md:hidden lg:hidden xl:hidden">sm</div>
      <div className="hidden sm:hidden md:block lg:hidden xl:hidden">md</div>
      <div className="hidden sm:hidden md:hidden lg:block xl:hidden">lg</div>
      <div className="hidden sm:hidden md:hidden lg:hidden xl:block 2xl:hidden">
        xl
      </div>
      <div className="hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block">
        2xl
      </div>
    </div>
  );
}
