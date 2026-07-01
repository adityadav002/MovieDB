import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  Keyboard,
  A11y,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "../style/ShowListStyle.css";

function Slider() {
  const sliderData = [
    {
      image:
        "https://m.media-amazon.com/images/S/pv-target-images/00d8d53bbef88370084ddcad59c7c25c2283b819916da02ab000a5636c9d205a._SX1080_FMjpg_.jpg",
      title: "Discover Hidden Gems",
      subtitle: "Find films that fly under the radar.",
      description:
        "Dive into lesser-known masterpieces and uncover stories that deserve the spotlight. Every scroll brings a new surprise.",
    },
    {
      image:
        "https://m.media-amazon.com/images/S/pv-target-images/81ef275effa427553a847bc220bebe1dc314b2e79d00333f94a6bcadd7cce851.jpg",
      title: "Explore by Genre or Mood",
      subtitle: "Pick your vibe, and we'll match the movie.",
      description:
        "Feeling nostalgic, adventurous, or romantic? Browse collections curated by genre, tone, or even time of day.",
    },
    {
      image: "https://wallpaperaccess.com/full/1460157.jpg",
      title: "Rate, Review & Remember",
      subtitle:
        "Write your own reviews and never forget what made a film special.",
      description:
        "Track personal notes and revisit your thoughts on every movie you've seen.",
    },
    {
      image: "https://wallpapercave.com/wp/wp9049816.jpg",
      title: "Create Your Watchlist",
      subtitle: "Plan your movie nights with ease.",
      description:
        "Queue up films you're excited about and never lose track of what to watch next.",
    },
    {
      image: "https://images.hdqwalls.com/download/movie-wall-e-ad-3840x2160.jpg",
      title: "Custom Lists for Every Mood",
      subtitle: "Organize by genre, actor, theme, or even vibe.",
      description:
        "Whether it's rainy-day comedies or late-night thrillers, curate lists that reflect your taste.",
    },
    {
      image: "https://wallsdesk.com/wp-content/uploads/2016/11/Spider-Man-Pictures.jpg",
      title: "Your Movie Shelf, Simplified",
      subtitle: "A clean and focused space to manage your collection.",
      description:
        "No ads, no clutter — just you and your movie library, your way.",
    },
    {
      image:
        "https://images.hdqwalls.com/wallpapers/avengers-endgame-2019-official-poster-th.jpg",
      title: "Join a Community of Film Lovers",
      subtitle: "Share your lists and discover new favorites.",
      description:
        "Connect with fellow cinephiles, exchange recommendations, and explore curated collections.",
    },
  ];

  return (
    <Swiper
      modules={[
        Navigation,
        Pagination,
        Autoplay,
        Keyboard,
        A11y,
      ]}
      loop={true}
      speed={900}
      grabCursor={true}
      watchOverflow={true}
      centeredSlides={true}
      preloadImages={false}
      lazyPreloadPrevNext={2}
      keyboard={{
        enabled: true,
      }}
      autoplay={{
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
      }}
      navigation={true}
      touchRatio={1}
      threshold={10}
      resistance={true}
      resistanceRatio={0.85}
      observer={true}
      observeParents={true}
      updateOnWindowResize={true}
      breakpoints={{
        0: {
          slidesPerView: 1,
          navigation: false,
        },
        640: {
          slidesPerView: 1,
          navigation: false,
        },
        768: {
          slidesPerView: 1,
          navigation: true,
        },
        1024: {
          slidesPerView: 1,
          navigation: true,
        },
      }}
      style={{
        "--swiper-navigation-color": "#ffffff",
        "--swiper-pagination-color": "#ffffff",
      }}
      className="hero-swiper"
    >
      {sliderData.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="slider_image_wrapper">
            <img
              src={slide.image}
              alt={slide.title}
              className="slider_img"
              loading="lazy"
              draggable="false"
            />
          </div>

          <div className="slider_content">
            <h1>{slide.title}</h1>

            <p>{slide.subtitle}</p>

            <span>{slide.description}</span>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default Slider;