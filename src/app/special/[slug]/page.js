import Link from "next/link";

import Special from "@/components/Special/Special";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const param = await params;
  const { slug } = param;

  const res = await fetch(`https://api.henpro.fun/api/special-watch/${slug}`, {
    next: { revalidate: 3600 },
  });

  const json = await res.json();
  const video = json.data;

  return (
    <div>
      <Special video={video}/>
    </div>
  );
}
