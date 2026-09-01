export function Corners() {
  const arm = "pointer-events-none absolute size-5 border-fg/20";
  return (
    <>
      <span className={`${arm} top-3 left-3 border-t border-l`} />
      <span className={`${arm} top-3 right-3 border-t border-r`} />
      <span className={`${arm} bottom-3 left-3 border-b border-l`} />
      <span className={`${arm} bottom-3 right-3 border-b border-r`} />
    </>
  );
}