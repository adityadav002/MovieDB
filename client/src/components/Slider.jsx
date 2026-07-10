import { memo } from "react";

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

const sliderData = [
  {
    image:
      "https://m.media-amazon.com/images/S/pv-target-images/00d8d53bbef88370084ddcad59c7c25c2283b819916da02ab000a5636c9d205a._SX1080_FMjpg_.jpg",
    title: "Discover Hidden Gems",
    subtitle: "Find films that fly under the radar.",
    description:
      "Explore underrated movies and discover stories beyond the mainstream.",
  },

  {
    image:
      "https://m.media-amazon.com/images/S/pv-target-images/81ef275effa427553a847bc220bebe1dc314b2e79d00333f94a6bcadd7cce851.jpg",
    title: "Explore Every Genre",
    subtitle: "Your next favorite movie is waiting.",
    description:
      "Browse action, comedy, drama, thrillers and movies matching your mood.",
  },

  {
    image: "https://wallpaperaccess.com/full/1460157.jpg",
    title: "Rate & Remember",
    subtitle: "Keep track of movies you love.",
    description:
      "Save ratings, favorites and create your personal movie history.",
  },

  {
    image: "https://wallpapercave.com/wp/wp9049816.jpg",
    title: "Build Your Watchlist",
    subtitle: "Never forget a movie again.",
    description: "Collect movies you want to watch and organize your journey.",
  },

  {
    image:
      "https://wallsdesk.com/wp-content/uploads/2016/11/Spider-Man-Pictures.jpg",
    title: "Discover By Actors",
    subtitle: "Follow your favorite stars.",
    description: "Search actors and explore their complete movie collection.",
  },
];

const swiperStyle = {
  "--swiper-navigation-color": "#ffffff",
  "--swiper-pagination-color": "#ffffff",
};

function Slider() {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay, Keyboard, A11y]}
      className="hero-swiper"
      loop
      grabCursor
      centeredSlides
      speed={900}
      slidesPerView={1}
      keyboard={{
        enabled: true,
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
      }}
      navigation
      lazyPreloadPrevNext={2}
      watchOverflow
      style={swiperStyle}
      breakpoints={{
        0: {
          navigation: false,
        },

        768: {
          navigation: true,
        },
      }}
    >
      {sliderData.map((slide, index) => (
        <SwiperSlide key={slide.title}>
          <div className="slider_image_wrapper">
            <img
              src={slide.image}
              alt={slide.title}
              className="slider_img"
              loading={index === 0 ? "eager" : "lazy"}
              draggable={false}
              onError={(e) => {
                e.currentTarget.src = "/fallback-banner.jpg";
              }}
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

export default memo(Slider);
