"use client";
import React, { useId } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronLeft, FaChevronRight, FaPlay } from "react-icons/fa";
import { motion, easeOut } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
// ⭐️ IMPORT useSearchParams
// import { useSearchParams } from "next/navigation";
import "swiper/css";
import "swiper/css/navigation";
import "./hero.css";

// 

const Swipe = ({ slides = [], title = "Recent Uploads", slug , creator }) => {
  if (!slides?.length) return null;

  const uid = useId(); // unique ID per swiper

  // ⭐️ Retrieve the creator parameter
  // const searchParams = useSearchParams();
  const creat = creator;

  // ⭐️ Helper function to append the creat parameter to a URL
  const getUpdatedLink = (baseLink) => {
    if (!creat) return baseLink;

    // Check if the link is external or already has query params
    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}creator=${creat}`;
  };
  // --------------------------------------------------------

  const normalize = (s) => (s || "").toString().toUpperCase().trim();
  const labelClass = (label) => {
    const l = normalize(label);
    if (l === "RAW") return "label-raw";
    if (l === "SUB") return "label-sub";
    if (l === "CEN" || l === "CENSORED") return "label-cen";
    if (l === "UNC" || l === "UNCENSORED") return "label-unc";
    return "label-default";
  };

  return (
    <section className="crype-wrapper">
      {/* //group relative */}
      <div className="crype-header">
        {/* flex items-center justify-between */}
        <h2 className="crype-title">{title}</h2>
        <div className="crype-nav-group">
          {/* flex items-center gap-2 */}
          <Link
            // ⭐️ Applied creator logic to View All link
            href={getUpdatedLink(slug)}
            className="crype-all"
          >
            View All
          </Link>
          <div className="crype-nav-btns">
            {/* flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 */}
            <button className={`btn-prev-${uid} crype-btn`}>
              <FaChevronLeft />
            </button>
            <button className={`btn-next-${uid} crype-btn`}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: `.btn-next-${uid}`,
          prevEl: `.btn-prev-${uid}`,
        }}
        loop={false}
        pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={7}
        breakpoints={{
          2600: {
            slidesPerView: 11,
            spaceBetween: 10,
          },
          2400: {
            slidesPerView: 10,
            spaceBetween: 10,
          },
          1970: {
            slidesPerView: 9,
            spaceBetween: 10,
          },
          1700: {
            slidesPerView: 8,
            spaceBetween: 10,
          },
          1600: {
            slidesPerView: 7,
            spaceBetween: 10,
          },
          1450: {
            slidesPerView: 6,
            spaceBetween: 10,
          },
          1200: {
            slidesPerView: 5,
            spaceBetween: 10,
          },
          900: {
            slidesPerView: 4,
          },
          450: {
            slidesPerView: 3,
          },
          200: {
            slidesPerView: 2,
          },
        }}
        className="crype-carousel"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.id || i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: easeOut }}
              className="crype-card-inner"
            >
              <Link
                // ⭐️ Applied creator logic to individual watch link
                href={getUpdatedLink(`/${slide.link}`)}
                className="crype-image-wrapper"
              >
                <Image
                  src={slide.poster}
                  alt={slide.title}
                  width={200}
                  height={280}
                  className="crype-image"
                />
                <div className="crype-overlay">
                  <FaPlay className="crype-play-icon" />
                </div>
                <span className={`crype-tag top ${labelClass(slide.label)}`}>
                  {slide.label}
                </span>
                <span className={`crype-tag bottom ${labelClass(slide.year)}`}>
                  {slide.year}
                </span>
              </Link>
              <h3 className="crype-title-below">{slide.title}</h3>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Swipe;
