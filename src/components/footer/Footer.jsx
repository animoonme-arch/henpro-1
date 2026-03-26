import React from "react";
import "./footer.css";
import Image from "next/image";

const Footer = () => {
  // Assuming process.env.NEXT_PUBLIC_SITE_NAME will resolve to 'Henpro.fun'
  // or a similar string that includes "pro" or "tv" logic for rendering
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Hanimetv";

  // Helper function to render the stylized site name text
  const renderSiteName = (isFooterLogo = false) => {
    // Determine the base and accent parts based on whether the name contains "pro"
    const isPro = siteName.toLowerCase().includes("pro");
    const base = isPro ? "hen" : "hanime";
    const accent = isPro ? "pro" : "tv";
    const accentClass = isFooterLogo ? "col-p" : "col-imp";

    return (
      <>
        {base}
        <span className={accentClass}>{accent}</span>
      </>
    );
  };

  return (
    <>
      <div className="margino">
        <div className="site-details">
          {/* IMAGE SECTION */}
          <div className="imo">
            <div className="site-image">
              <img src="/pearl.png" alt="Marin Sticker Character" />
            </div>
          </div>

          {/* TEXT CONTENT SECTION (Scrollable) */}
          <div className="site-lines">
            {/* HEADING 1 */}
            <div className="line-head">
              Watch Hentai online at {siteName}
            </div>

            {/* PARAGRAPH 1 */}
            <div className="line-inn">
              In {siteName} you will find a hentai haven for the latest
              uncensored Hentai. We offer the best hentai collection in the
              highest possible quality at 1080p from Blu-Ray rips. Many videos
              are licensed direct downloads from the original animators,
              producers, or publishing source company in Japan.
            </div>

            {/* PARAGRAPH 2 */}
            <div className="line-inn">
              If you're looking for the latest Hentai videos of various genres,
              {siteName} is exactly what you need. Our website is an
              international hub of Hentai animation. Here you will find a great
              collection of uncensored Hentai videos as well as links to sex
              games and porn. Browse our catalog to find the most exciting and
              hot Hentai anime. We have both old-school videos for real admirers
              and the latest Hentai episodes for those who would like to stay up
              to date. We stream thousands of Hentai videos in HD quality that
              you can watch on your PC, tablet, and mobile phone.
            </div>

            {/* PARAGRAPH 3 */}
            <div className="line-inn">
              With
              {siteName}, you can watch the newest Hentai series and
              follow your favorite characters. Whether you like a raw fap
              material or a well-developed plot, we have got you covered. Here,
              you can find Hentai that focuses on the physical aspect of love as
              well as romance. We strive to provide the best experience to all
              our clients, that is why you can always click the “subbed” tag to
              follow the plot if you do not know Japanese.
            </div>

            {/* HEADING 2 */}
            <div className="line-head">
              I want to watch free uncensored anime hentai videos online in 720p
              1080p HD quality
            </div>

            {/* PARAGRAPH 4 */}
            <div className="line-inn">
              Connected to many leaks, {siteName}.fun is where you can watch
              hentai with just one click. Including hentai in and up to 2022,
              where is the latest hentai are archived and curated here. Here is
              the place where you can find the best hentai online 24/7. Enjoy
              hentai movies, hentai clips, and also hentai pictures images for
              free! This site is the best place for ecchi since hentai haven,
              and includes many hentai categories like:
              <span className="col-imp">Incest hentai</span>,
              <span className="col-imp">Milf hentai</span>,
              <span className="col-imp">Anal Hentai</span>,
              <span className="col-imp">Creampie Hentai</span>,
              <span className="col-imp">Futanari Hentai</span>,
              <span className="col-imp">School Girls Hentai</span>,
              <span className="col-imp">Yuri Hentai</span>, and much more!
            </div>

            {/* HEADING 3 */}
            <div className="line-head">
              Join our hentai {siteName} fans community Discord
            </div>

            {/* PARAGRAPH 5 */}
            <div className="line-inn">
              Our fans' community Discord is 145,000+ members strong and
              growing! Join one of the largest - if not, the largest hentai fans
              community on the internet. Socialize with like-minded friends,
              upload pictures images and video clips, share your favorite music
              or DJ and livestream the games you play!
            </div>

            {/* PARAGRAPH 6 */}
            <div className="line-inn">
              What is Hentai? Hentai (変態 or へんたい). Hentai or seijin-anime
              is a Japanese word that, in the West, is used when referring to
              sexually explicit or pornographic comics and animation,
              particularly those of Japanese origin such as anime and manga.
            </div>
          </div>
        </div>

        {/* COPYRIGHT FOOTER SECTION */}
        <div className="foot">
          <div className="flx">
            <Image
              src="/favicon.ico"
              alt={`${siteName} Logo`}
              width={50}
              height={50}
              className="kisan"
            />
          </div>
          <div className="headi">
            {renderSiteName(true)}{" "}
            {/* Pass true to use 'col-p' for the logo text accent */}
            <div className="copyright-text">
              <p>
                {siteName} does not store any files on our server; we only link
                to the media which is hosted on 3rd party services.
              </p>
              <p>&copy; {siteName} All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
