import '../styles/globals.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import 'swiper/swiper-bundle.css';
import { Swiper, SwiperSlide } from 'swiper/react';  // استيراد مكونات Swiper
import { faShoppingCart, faSearch, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"; // المكتبة الأخرى التي تستخدمها



export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
