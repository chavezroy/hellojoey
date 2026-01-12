export default function NoiseOverlay() {
  return (
    <div
      className="noise fixed top-0 left-0 w-full h-full pointer-events-none -z-[1] opacity-10 mix-blend-screen"
      style={{
        background: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZldHVyYnVsZW5jZT48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbilvcGFjaXR5PSIuMDUiLz48L3N2Zz4=') repeat`,
        animation: 'noise-move 0.3s steps(8) infinite',
      }}
    />
  );
}

