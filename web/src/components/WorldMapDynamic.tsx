"use client";

import dynamic from "next/dynamic";

const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-neutral-200 bg-sky-50 text-neutral-500">
      Loading map…
    </div>
  ),
});

export default WorldMap;
