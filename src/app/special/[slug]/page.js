import Link from "next/link";
import "./special.css";

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
    <div className="special-container">
      {/* VIDEO PLAYER */}
      <div className="player-wrapper">
        <iframe src={video.iframeSrc} allowFullScreen className="player" />
      </div>

      {/* TITLE */}
      <h1 className="video-title">{video.title}</h1>

      {/* META */}
      <div className="meta">
        <span>Artist: {video.artist}</span>
        <span>Upload: {new Date(video.uploadDate).toDateString()}</span>
      </div>

      {/* CHARACTERS */}
      <div className="characters">
        {video.characters?.map((char, i) => (
          <span key={i} className="character">
            {char.name}
          </span>
        ))}
      </div>

      {/* TAGS */}
      <div className="tags">
        {video.tags?.slice(0, 25).map((tag, i) => (
          <span key={i} className="tag">
            {tag.name}
          </span>
        ))}
      </div>

      {/* RELATED VIDEOS */}
      <h2 className="related-title">Related Videos</h2>

      <div className="related-grid">
        {video.related?.map((item, i) => {
          const slug = new URL(item.link).pathname.replace(/\/$/, "");
          const internal = `/SPECIAL${slug}`;

          return (
            <Link key={i} href={internal} className="related-card">
              <div className="thumb">
                <img
                  src={`https://3dhentai.co/wp-content/uploads/${item.videoFile}`}
                  alt={item.title}
                />
                <span className="duration">{item.duration}</span>
              </div>

              <p>{item.title}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
