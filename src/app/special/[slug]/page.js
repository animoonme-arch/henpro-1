import Link from "next/link";
import "./special.css";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { slug } = await params;

  const res = await fetch(`https://api.henpro.fun/api/special-watch/${slug}`, {
    next: { revalidate: 3600 },
  });

  const json = await res.json();
  const video = json.data;

  return (
    <div className="special-container">
      {/* VIDEO PLAYER */}
      <div className="player-wrapper">
        <video
          className="video-player"
          controls
          preload="metadata"
          poster={video.thumbnail}
        >
          <source src={video.customVideoURL} type="video/mp4" />
        </video>
      </div>

      {/* TITLE */}
      <h1 className="video-title">{video.title}</h1>

      {/* META */}
      <div className="meta">
        <span>
          <strong>Artist:</strong> {video.artist}
        </span>
        <span>
          <strong>Upload:</strong> {new Date(video.uploadDate).toDateString()}
        </span>
      </div>

      {/* CHARACTERS */}
      {video.characters?.length > 0 && (
        <div className="section">
          <h3 className="section-title">Characters</h3>
          <div className="characters">
            {video.characters.map((char, i) => (
              <span key={i} className="character">
                {char.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TAGS */}
      {video.tags?.length > 0 && (
        <div className="section">
          <h3 className="section-title">Tags</h3>
          <div className="tags">
            {video.tags.slice(0, 25).map((tag, i) => (
              <span key={i} className="tag">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* RELATED VIDEOS */}
      <h2 className="related-title">
        <span>Related Videos</span>
      </h2>

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

                <div className="overlay">▶</div>

                <span className="duration">{item.duration}</span>
              </div>

              <p className="related-name">{item.title}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
