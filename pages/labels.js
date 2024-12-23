import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faSearch, faTimes, faPlus, faMinus, faTrash, faSpinner, faArrowUp, faChevronDown, faBars, faList, faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { faFacebookSquare, faInstagramSquare } from "@fortawesome/free-brands-svg-icons";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const LazyImage = dynamic(() => import('next/image'), { 
  ssr: false, 
  loading: () => <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-white" />,
  suspense: false // Corrected suspense to true
});
const LazySwiper = dynamic(() => import('swiper/react').then(mod => mod.Swiper), {
  ssr: false,
  loading: () => <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-white" />
});

// تحديث الأسهم المخصصة
const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="slick-custom-arrow slick-custom-arrow-prev"
    aria-label="Previous"
  >
    ❯
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="slick-custom-arrow slick-custom-arrow-next"
    aria-label="Next"
  >
    ❮
  </button>
);

const CartItem = ({ item, updateCartQuantity, removeFromCart }) => (
  <li className="flex items-center justify-between border-b pb-2 transition-all duration-300">
    <div className="flex items-center">
      <LazyImage src={item.img} alt={item.name} width={60} height={60} className="rounded-lg" loading="lazy" />
      <div className="ml-4">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-gray-700 font-bold">{item.price.toLocaleString()} دج</p>
      </div>
    </div>
    <div className="flex items-center space-x-reverse space-x-2">
      <button
        className="py-1 px-2 bg-blue-500 rounded-sm text-white hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
        onClick={() => updateCartQuantity(item.name, 1)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <span className="text-lg">{item.quantity}</span>
      <button
        className="py-1 px-2 bg-red-500 rounded-sm text-white hover:bg-red-600 transition-colors duration-300 flex items-center justify-center"
        onClick={() => updateCartQuantity(item.name, -1)}
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <button
        className="py-1 px-2 rounded-sm text-gray-700 transition-colors duration-300 flex items-center justify-center"
        onClick={() => removeFromCart(item.name)}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  </li>
);

// Move debounce function outside the component
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Update the Sidebar component to accept props
const Sidebar = ({ isOpen, onClose, categories, setActiveCategory, scrollToSection, onTouchStart, onTouchMove, onTouchEnd }) => (
  <div
    className={`fixed inset-0 bg-black/50 backdrop-filter backdrop-blur-xl z-50 transition-transform duration-300 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    }`}
    style={{ 
      width: "100%", 
      maxWidth: "300px", 
      right: 0,
      touchAction: 'pan-x' // إضافة ه��ا للسماح بالسحب الأفقي
    }}
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
    onClick={onClose}
  >
    <div
      className={`p-4 text-white transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/20 transition-colors duration-300" 
        onClick={onClose}
      >
        <FontAwesomeIcon icon={faTimes} className="text-2xl" />
      </button>
      <nav className="space-y-4">
        <a href="#" className="block text-xl hover:text-sky-400 transition-colors duration-300">
          من نحن
        </a>
        <a href="#" className="block text-xl hover:text-sky-400 transition-colors duration-300">
          ماذا نبيع
        </a>
        <a href="#" className="block text-xl hover:text-sky-400 transition-colors duration-300">
          اتصل بنا
        </a>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveCategory(category.link);
                scrollToSection(category.link);
                onClose();
              }}
              className="block text-xl hover:text-sky-400 transition-colors duration-300"
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="flex space-x-reverse space-x-4 mt-4">
          <FontAwesomeIcon
            icon={faFacebookSquare}
            className="text-white text-3xl hover:text-teal-300 transition-colors duration-300"
          />
          <FontAwesomeIcon
            icon={faInstagramSquare}
            className="text-white text-3xl hover:text-teal-300 transition-colors duration-300"
          />
        </div>
      </nav>
    </div>
  </div>
);

export default function ProductPage() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeCategory, setActiveCategory] = useState("printers"); // Set default active category to "printers"
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Add state for search modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Add state for dropdown
  const [selectedCategory, setSelectedCategory] = useState(null); // Add state for selected category
  const [isScrolled, setIsScrolled] = useState(false); // Add state for scroll detection
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Add state for sidebar
  const [isClosing, setIsClosing] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false); // Ensure sidebar is hidden on initial render
  }, []);

  // Load cart from local storage on initial render
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(savedCart);
    } catch (error) {
      console.error("Failed to load cart from local storage", error);
    } finally {
      setIsLoading(false); // Set loading to false after initial load
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add new useEffect for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const scrollAmount = 100; // Amount to scroll in pixels
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          window.scrollBy({
            top: -scrollAmount,
            behavior: 'smooth'
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add new useEffect for handling body scroll lock
  useEffect(() => {
    if (isCartOpen || isSearchOpen || isSidebarOpen || isCategoriesOpen) {
      // حفظ موضع التمرير الحالي
      const currentPosition = window.pageYOffset;
      setScrollPosition(currentPosition);
      
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      if (window.innerWidth <= 768) {
        // Mobile behavior
        document.body.style.position = 'fixed';
        document.body.style.top = `-${currentPosition}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      } else {
        // Desktop behavior - only for search and sidebar
        if (isSearchOpen || isSidebarOpen || isCategoriesOpen) {
          document.body.style.overflow = 'hidden';
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        // Don't modify scroll behavior when cart is open on desktop
        if (isCartOpen) {
          document.body.style.overflow = 'auto';
          document.body.style.paddingRight = '0px';
        }
      }
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isCartOpen, isSearchOpen, isSidebarOpen, isCategoriesOpen, scrollPosition]);

  const handleCartTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleCartTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleCartTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe) {
      setIsCartOpen(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // إضافة معالجات اللمس للسايدبار
  const handleSidebarTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleSidebarTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleSidebarTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > minSwipeDistance;
    
    if (isRightSwipe) {
      setIsSidebarOpen(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // تحديث معالجات اللمس لنافذة البحث
const handleSearchTouchStart = (e) => {
  setTouchStart(e.targetTouches[0].clientY);
};

const handleSearchTouchMove = (e) => {
  setTouchEnd(e.targetTouches[0].clientY);
};

const handleSearchTouchEnd = () => {
  if (!touchStart || !touchEnd) return;
  
  const distance = touchEnd - touchStart;
  const isDownSwipe = distance > minSwipeDistance;
  
  if (isDownSwipe) {
    closeSearchModal();
  }
  
  setTouchStart(null);
  setTouchEnd(null);
};

  // Add new touch handlers for categories modal
  const handleCategoriesTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleCategoriesTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleCategoriesTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isUpSwipe = distance < -minSwipeDistance;
    const isDownSwipe = distance > minSwipeDistance;
    
    if (isDownSwipe && isCategoriesOpen) {
      setIsCategoriesOpen(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const sectionRefs = {
    store: useRef(null),
    printers: useRef(null),
    scanners: useRef(null),
    "cash-drawers": useRef(null),
    assemblies: useRef(null),
    labels: useRef(null),
    equipment: useRef(null),
  };

  const categories = useMemo(() => [
    { name: "طابعات حرارية", link: "printers" },
    { name: "قارئات الباركود", link: "scanners" },
    { name: "ادراج النقود", link: "cash-drawers" },
    { name: "تجميعات", link: "assemblies" },
    { name: "ورق وملصقات", link: "labels" },
    { name: "معدات", link: "equipment" },
  ], []);

  const products = {
    printers: [
      { name: "Xprinter XP-350B", price: 16500, img: "/images/assembly-1.png", description: "طابعة حرارية عالية الأداء" },
      { name: "Xprinter XP-370B", price: 17000, img: "/images/assembly-1.png", description: "طابعة حرارية موثوقة" },
      { name: "Xprinter XP-323B", price: 18500, img: "/images/assembly-1.png", description: "طابعة حرارية سريعة" },
      { name: "Xprinter XP-350B", price: 16500, img: "/images/assembly-1.png", description: "طابعة حرارية مدمجة" },
      { name: "Xprinter XP-370B", price: 17000, img: "/images/assembly-1.png", description: "طابعة حرارية اقتصادية" },
      { name: "Xprinter XP-323B", price: 18500, img: "/images/assembly-1.png", description: "طابعة حرارية متعددة الاستخدامات" },
    ],
    scanners: [
      { name: "Henex HC-666", price: 15000, img: "/images/assembly-1.png", description: "قارئ باركود سريع" },
      { name: "Henex HC-6052", price: 16000, img: "/images/assembly-1.png", description: "قارئ باركود دقيق" },
      { name: "Henex HC-777", price: 18000, img: "/images/assembly-1.png", description: "قارئ باركود متين" },
      { name: "Henex HC-666", price: 15000, img: "/images/assembly-1.png", description: "قارئ باركود لاسلكي" },
      { name: "Henex HC-6052", price: 16000, img: "/images/assembly-1.png", description: "قارئ باركود مريح" },
      { name: "Henex HC-777", price: 18000, img: "/images/assembly-1.png", description: "قارئ باركود عالي الدقة" },
    ],
    "cash-drawers": [
      { name: "درج النقود الفضي", price: 9000, img: "/images/assembly-1.png", description: "درج نقود فضي متين" },
      { name: "درج النقود الذهبي", price: 10500, img: "/images/assembly-1.png", description: "درج نقود ذهبي فاخر" },
      { name: "درج النقود الأسود", price: 11000, img: "/images/assembly-1.png", description: "درج نقود أسود أنيق" },
      { name: "درج النقود الفضي", price: 9000, img: "/images/assembly-1.png", description: "درج نقود فضي عملي" },
      { name: "درج النقود الذهبي", price: 10500, img: "/images/assembly-1.png", description: "درج نقود ذهبي متين" },
      { name: "درج النقود الأسود", price: 11000, img: "/images/assembly-1.png", description: "درج نقود أسود فاخر" },
    ],
    assemblies: [
      { name: "تجميعة احترافية", price: 55000, img: "/images/assembly-1.png", description: "تجميعة كمبيوتر للألعاب" },
      { name: "تجميعة اقتصادية", price: 30000, img: "/images/assembly-2.png", description: "تجميعة كمبيوتر اقتصادية" },
      { name: "تجميعة مكتبية", price: 40000, img: "/images/assembly-3.png", description: "تجميعة كمبيوتر مكتبية" },
      { name: "تجميعة احترافية", price: 55000, img: "/images/assembly-1.png", description: "تجميعة كمبيوتر قوية" },
      { name: "تجميعة اقتصادية", price: 30000, img: "/images/assembly-2.png", description: "تجميعة كمبيوتر ميسورة" },
      { name: "تجميعة مكتبية", price: 40000, img: "/images/assembly-3.png", description: "تجميعة كمبيوتر عملية" },
    ],
    labels: [
      { name: "ملصقات حرارية", price: 2000, img: "/images/label-1.png", description: "ملصقات حرارية عالية الجودة" },
      { name: "ملصقات ملونة", price: 3000, img: "/images/label-2.png", description: "ملصقات ملونة زاهية" },
      { name: "ملصقات شفافة", price: 4000, img: "/images/label-3.png", description: "ملصقات شفافة متينة" },
      { name: "ملصقات حرارية", price: 2000, img: "/images/label-1.png", description: "ملصقات حرارية اقتصادية" },
      { name: "ملصقات ملونة", price: 3000, img: "/images/label-2.png", description: "ملصقات ملونة متنوعة" },
      { name: "ملصقات شفافة", price: 4000, img: "/images/label-3.png", description: "ملصقات شفافة عالية الجودة" },
    ],
    equipment: [
      { name: "معدات إعلامية متطورة", price: 75000, img: "/images/equipment-1.png", description: "معدات إعلامية متطورة" },
      { name: "معدات إعلامية بسيطة", price: 25000, img: "/images/equipment-2.png", description: "معدات إعلامية بسيطة" },
      { name: "معدات إعلامية قياسية", price: 50000, img: "/images/equipment-3.png", description: "معدات إعلامية قياسية" },
      { name: "معدات إعلامية متطورة", price: 75000, img: "/images/equipment-1.png", description: "معدات إعلامية حديثة" },
      { name: "معدات إعلامية بسيطة", price: 25000, img: "/images/equipment-2.png", description: "معدات إعلامية ميسورة" },
      { name: "معدات إعلامية قياسية", price: 50000, img: "/images/equipment-3.png", description: "معدات إعلامية موثوقة" },
    ],
  };

  const addToCart = useCallback((product) => {
    const existingItem = cart.find((item) => item.name === product.name);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    setNotification(`تم إضافة "${product.name}" إلى السلة`);
    setTimeout(() => setNotification(null), 5000);
  }, [cart]);

  const updateCartQuantity = useCallback((productName, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.name === productName
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = () => {
    setCart([]);
  };

  const scrollToSection = (section) => {
    setActiveCategory(section);
    
    // إضافة تأخير بسيط للسماح بإغلاق السايدبار/القائمة أولاً
    setTimeout(() => {
      const element = sectionRefs[section]?.current;
      if (element) {
        // حساب ارتفاع الهيدر بشكل ديناميكي
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 60;
        
        // حساب الموضع مع الأخذ في الاعتبار ارتفاع الهيدر والتباعد الإضافي
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

        // التمرير إلى القسم
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100); // تأخير 100 مللي ثانية
  };

  const totalCartPrice = cart.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setIsSearching(true);

    debounce(() => {
      const results = Object.keys(products).reduce((acc, category) => {
        if (!selectedCategory || selectedCategory === category) {
          acc[category] = products[category].filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase())
          );
        }
        return acc;
      }, {});
      setSearchResults(results);
      setIsSearching(false);
    }, 300)();
  };

  const removeFromCart = useCallback((productName) => {
    setCart(cart.filter((item) => item.name !== productName));
    setNotification(`تم إزالة "${productName}" من السلة`);
    setTimeout(() => setNotification(null), 5000);
  }, [cart]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDropdownClose = () => {
    setIsClosing(true);
    // انتظر حتى ينتهي الأنيميشن قبل إغلاق القائمة
    setTimeout(() => {
      setIsDropdownOpen(false);
      setTimeout(() => {
        setIsClosing(false);
      }, 50);
    }, 300);
  };

  const closeSearchModal = () => {
    setIsSearchClosing(true);
    // لا نقوم بإخفاء النافذة مباشرة
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsSearchClosing(false);
    }, 500);
  };

  const swiperSettings = {
    modules: [Navigation, Pagination],
    spaceBetween: 30,
    slidesPerView: 4.2, // زيادة عدد السلايدات المعروضة قليلاً
    centeredSlides: false,
    navigation: true,
    pagination: { clickable: true },
    dir: 'rtl',
    simulateTouch: true,
    mousewheel: false,
    grabCursor: true,
    resistance: true,
    resistanceRatio: 0.85,
    speed: 400,
    touchRatio: 1,
    touchAngle: 45,
    longSwipes: true,
    longSwipesRatio: 0.2,
    shortSwipes: true,
    touchStartPreventDefault: true,
    touchMoveStopPropagation: true,
    preventClicks: false,
    preventClicksPropagation: false,
    cssMode: false,
    threshold: 10,
    touchStartForcePreventDefault: true,
    followFinger: true,
    allowTouchMove: true,
    breakpoints: {
      320: {
        slidesPerView: 1.2, // إظهار جزء من السلايد التالي على الموبايل
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 2.2, // إظهار جزء من السلايد التالي على التابلت
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 4.2, // إظهار جزء من السلايد التالي على الديسكتوب
        spaceBetween: 30,
      }
    }
  };

  // إضافة وظيفة جديدة للتحكم في فتح/إغلاق النوافذ
  const handleOpenWindow = (window) => {
    // إغلاق جميع النوافذ أولاً
    setIsCartOpen(false);
    setIsSidebarOpen(false);
    setIsSearchOpen(false);

    // فتح النافذة المطلوبة فقط
    switch(window) {
      case 'cart':
        setIsCartOpen(true);
        break;
      case 'sidebar':
        setIsSidebarOpen(true);
        break;
      case 'search':
        setIsSearchOpen(true);
        break;
    }
  };

  const handleOpenCategories = () => {
    setScrollPosition(window.pageYOffset);
    setIsCategoriesOpen(true);
  };

  const handleCloseCategoriesModal = () => {
    // حفظ موضع التمرير قبل إغلاق النافذة
    const currentPosition = parseInt(document.body.style.top || '0', 10) * -1;
    
    // إعادة الخصائص الأصلية للجسم
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    // إغلاق النافذة
    setIsCategoriesOpen(false);
    
    // استعادة موضع التمرير بعد التأكد من إغلاق النافذة
    window.scrollTo(0, currentPosition);
  };

  return (
    <div
      className={`min-h-screen text-white font-zain relative overflow-x-hidden pt-20 ${
        (isCartOpen || isSearchOpen || isSidebarOpen) ? 'fixed inset-0' : ''
      }`}
      onClick={() => {
        setIsCartOpen(false);
      }}
      style={{
        backgroundImage: "url('/images/background.webP')",
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        width: '100%',
      }}
    >
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-blue-500">
          <div className="animate-spin-slow">
            <LazyImage src="/images/logo.png" alt="Logo" width={200} height={200} style={{ objectFit: 'contain' }} />
          </div>
        </div>
      ) : (
        <>
          {/* Sidebar */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            categories={categories}
            setActiveCategory={setActiveCategory}
            scrollToSection={scrollToSection}
            onTouchStart={handleSidebarTouchStart}
            onTouchMove={handleSidebarTouchMove}
            onTouchEnd={handleSidebarTouchEnd}
          />

          {/* Notification */}
          {notification && (
            <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-500">
              {notification}
            </div>
          )}

          {/* Header */}
          <header
            className={`p-2 flex flex-wrap items-center justify-between border-b border-slate-50/20 transition-all duration-500 fixed top-0 left-0 right-0 z-40 ${
              isScrolled 
              ? "bg-black/15 backdrop-blur-md" 
              : "bg-transparent backdrop-blur-md"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between w-full mx-4 md:w-auto space-x-reverse space-x-8" data-aos="fade-down">
              <a href="/">
                <LazyImage src="/images/logo.png" alt="Logo" width={75} height={75} className="" priority />
              </a>
              <nav className="hidden md:flex flex-wrap justify-center space-x-reverse space-x-5 w-full md:w-auto mt-4 md:mt-0">
                <a href="#" className="text-xl hover:text-sky-400 transition-colors duration-300">
                  من نحن
                </a>
                <a href="#" className="text-xl hover:text-sky-400 transition-colors duration-300">
                  ماذا نبيع
                </a>
                <a href="#" className="text-xl hover:text-sky-400 transition-colors duration-300">
                  اتصل بنا
                </a>
              </nav>
              {/* Hamburger Menu for Mobile */}
              <div className="md:hidden flex items-center mr-auto z-50">
                {/* Cart Icon for Mobile */}
                <div className="relative flex items-center text-white cursor-pointer transition-transform duration-300 hover:scale-110 mr-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenWindow('cart');
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="text-2xl mx-4" />
                  <span className="absolute -top-2 right-2 bg-red-500 text-white text-xs rounded-full px-2">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </div>
                <button
                  className="text-2xl text-white"
                  onClick={() => handleOpenWindow('sidebar')}
                >
                  <FontAwesomeIcon icon={faBars} />
                </button>
              </div>
            </div>

            {/* Center Section: Social Media Icons */}
            <div className="hidden md:flex flex-wrap justify-center space-x-reverse space-x-4 w-full md:w-auto mt-4 md:mt-0" data-aos="fade-down">
              <FontAwesomeIcon
                icon={faFacebookSquare}
                className="text-white text-3xl hover:text-teal-300 transition-colors duration-300"
              />
              <FontAwesomeIcon
                icon={faInstagramSquare}
                className="text-white text-3xl hover:text-teal-300 transition-colors duration-300"
              />
            </div>

            {/* Search Bar */}
            {!isSearchOpen && (
              <div className="hidden md:flex items-center space-x-reverse space-x-8 w-full md:w-auto mt-4 md:mt-0">
                <div className="relative w-full md:w-[250px] lg:w-[400px]">
                  <input
                    type="text"
                    placeholder="بحث . . ."
                    className="w-full h-12 rounded-xl bg-white bg-opacity-15 text-white placeholder-white px-4 pr-12 text-xl shadow-md border border-slate-50/35 border-white focus:outline-none transition-all duration-300"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-white transition-transform duration-300"
                  />
                  {isSearching && (
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-xl text-white flex items-center transition-opacity duration-300">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span className="ml-2">جار البحث</span>
                    </div>
                  )}
                  {searchQuery && (
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl text-white transition-transform duration-300"
                      onClick={() => setSearchQuery("")}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                  {searchQuery && (
                    <div className="absolute left-0 right-0 mt-2 backdrop-blur-xl bg-white/75 text-black rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      style={{ 
                        position: 'absolute',
                        top: '100%',
                        width: '100%',
                        zIndex: 1000,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                    >
                      {Object.keys(searchResults).map((category) =>
                        searchResults[category].map((product, idx) => (
                          <div
                            key={idx}
                            className="flex items-center p-2 border-b border-white/20 cursor-pointer hover:bg-white/70 transition-colors duration-300"
                            onClick={() => {
                              addToCart(product);
                              setSearchQuery("");
                              setIsSearchOpen(false);
                            }}
                          >
                            <LazyImage src={product.img} alt={product.name} width={60} height={60} className="rounded-lg" />
                            <div className="ml-4">
                              <h3 className="font-bold">{product.name}</h3>
                              <p className="font-bold text-sky-950">{product.price.toLocaleString()} دج</p>
                            </div>
                          </div>
                        ))
                      )}
                      {Object.keys(searchResults).every(category => searchResults[category].length === 0) && (
                        <div className="p-2 text-center font-bold text-gray-500">لا توجد نتائج</div>
                      )}
                    </div>
                  )}
                </div>
                              {/* Cart Icon for Desktop */}
              <div className="hidden md:flex relative items-center text-white cursor-pointer transition-transform duration-300 hover:scale-110 mr-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenWindow('cart');
                }}
              >
                <FontAwesomeIcon icon={faShoppingCart} className="text-2xl mx-4" />
                <span className="absolute -top-2 right-2 bg-red-500 text-white text-xs rounded-full px-2">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
               </div>
              </div>
            )}
          </header>

          {/* إضافة شريط البحث الثابت في الأسفل */}
          {!isSearchOpen && (
            <div 
              className="fixed bottom-0 left-0 w-full bg-sky-950 bg-opacity-60 backdrop-blur-xl text-white flex justify-around py-2 md:hidden z-50 overflow-hidden transition-transform duration-300 transform translate-y-0"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchEnd={(e) => e.stopPropagation()}
              style={{ touchAction: 'none' }}
            >
              <button
                className="flex flex-col items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenWindow('search');
                }}
              >
                <FontAwesomeIcon icon={faSearch} className="text-lg" />
                <span className="text-sm">ابحث</span>
              </button>
              <button
                className="flex flex-col items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCategories();
                }}
              >
                <FontAwesomeIcon icon={faList} className="text-lg" />
                <span className="text-sm">التصنيفات</span>
              </button>
            </div>
          )}

          {/* نافذة البحث المنبثقة */}
          <div 
            className={`fixed inset-0 bg-black/20 backdrop-filter backdrop-blur-xl text-white z-50 flex flex-col md:hidden transition-all duration-500 ease-in-out ${
              !isSearchOpen && !isSearchClosing ? 'translate-y-full' : '0'
            } ${
              isSearchOpen && !isSearchClosing ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ 
              willChange: 'transform'
            }}
            onTouchStart={handleSearchTouchStart}
            onTouchMove={handleSearchTouchMove}
            onTouchEnd={handleSearchTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full" onClick={e => e.stopPropagation()}>
              <div className="search-header flex justify-between items-center p-4">
                <h2 className="text-xl">بحث</h2>
                <button 
                  onClick={closeSearchModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/20 transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-2xl" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="بحث . . ."
                    className="w-full h-12 rounded-xl bg-white bg-opacity-15 text-white placeholder-white px-4 pr-12 text-xl shadow-md border border-white focus:outline-none transition-all duration-300"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl text-white transition-transform duration-300 hover:scale-110"
                      onClick={() => setSearchQuery("")}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
                <div className="relative mt-4">
                <button
                  className="w-full h-12 rounded-xl bg-white bg-opacity-15 text-white px-4 text-xl shadow-md border border-white focus:outline-none transition-all duration-300 flex justify-between items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                >
                  {selectedCategory ? categories.find(cat => cat.link === selectedCategory).name : "جميع الأصناف"}
                  <FontAwesomeIcon icon={faChevronDown} className="text-xl" />
                </button>
                {(isDropdownOpen || isClosing) && (
                  <ul 
                    className={`absolute w-full backdrop-blur-xl bg-black bg-opacity-35 text-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-2 ${
                      isClosing ? 'animate-dropdown-close' : 'animate-dropdown-open'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    onAnimationEnd={() => {
                      if (isClosing) {
                        setIsDropdownOpen(false);
                        setIsClosing(false);
                      }
                    }}
                  >
                    <li
                      className="px-4 p-2 cursor-pointer hover:bg-white/20 transition-colors duration-300"
                      onClick={() => {
                        setSelectedCategory(null);
                        handleDropdownClose();
                      }}
                    >
                      جميع الأصناف
                    </li>
                    {categories.map((category, index) => (
                      <li
                        key={index}
                        className="px-4 p-3 cursor-pointer hover:bg-white/20 transition-colors duration-300"
                        onClick={() => {
                          setSelectedCategory(category.link);
                          handleDropdownClose();
                        }}
                      >
                        {category.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {isSearching && (
                <div className="flex items-center mt-4">
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span className="ml-2">جار البحث</span>
                </div>
              )}
              {searchQuery && (
                <div 
                  className="mt-4 backdrop-blur-sm bg-white/75 text-black rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  {Object.keys(searchResults).map((category) =>
                    searchResults[category].map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center p-2 border-b cursor-pointer hover:bg-gray-200 transition-colors duration-300"
                        onClick={() => {
                          addToCart(product);
                          setSearchQuery("");
                          setIsSearchOpen(false);
                        }}
                      >
                        <LazyImage src={product.img} alt={product.name} width={60} height={60} className="rounded-lg" />
                        <div className="ml-4">
                          <h3 className="font-bold">{product.name}</h3>
                          <p className="text-sky-950">{product.price.toLocaleString()} دج</p>
                        </div>
                      </div>
                    ))
                  )}
                  {Object.keys(searchResults).every(category => searchResults[category].length === 0) && (
                    <div className="p-2 text-center text-gray-500">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div> {/* Add closing div tag for the search modal */}
          {/* Cart Popup */}
          <div
  className={`fixed top-0 left-0 w-120 h-full bg-white/75 backdrop-filter backdrop-blur-xl text-black z-50 p-4 transition-transform duration-300 ${
    isCartOpen ? "translate-x-0" : "-translate-x-full"
  }`}
  style={{
    overflowY: 'auto',
    maxWidth: '480px',
    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
    height: '100%', // تأكد من أن الارتفاع يملأ الشاشة
    position: 'fixed', // تأكد من التثبيت
    touchAction: 'pan-x', // إضافة هذا للسماح بالسحب الأفقي
  }}
  onTouchStart={handleCartTouchStart}
  onTouchMove={handleCartTouchMove}
  onTouchEnd={handleCartTouchEnd}
  onClick={(e) => e.stopPropagation()}
>
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">سلة المشتريات</h2>
    <button
      onClick={() => setIsCartOpen(false)}
      className="text-xl hover:text-red-500 transition-colors duration-300"
    >
      <FontAwesomeIcon icon={faTimes} />
    </button>
  </div>
  {cart.length === 0 ? (
    <p className="text-center">سلة المشتريات فارغة</p>
  ) : (
    <>
      <ul className="space-y-4 mb-4 overflow-y-auto max-h-[calc(100vh-200px)] cart-scrollbar">
        {cart.map((item) => (
          <CartItem
            key={item.name}
            item={item}
            updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart}
          />
        ))}
      </ul>
      <div className="border-t pt-4">
        <div className="text-xl font-bold mb-4">
          الإجمالي: {totalCartPrice.toLocaleString()} دج
        </div>
        <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
          إتمام الشراء
        </button>
      </div>
    </>
  )}
</div>

          {/* Main Categories Grid */}
          <section className="px-4 sm:px-6 lg:px-12 p-2 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-3 relative z-10">
            {categories.map((category, idx) => ( // تأكد من استخدام categories بدون slice
              <div
                key={idx}
                className="cursor-pointer bg-white bg-opacity-15 p-2 rounded-xl shadow-lg flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 border border-white border-opacity-50"
              >
                <LazyImage
                  src={`/images/category-${idx + 1}.png`}
                  alt={category.name}
                  width={150}
                  height={150}
                  className="rounded-xl"
                  loading="lazy"
                  style={{ width: '100%', height: 'auto' }} // تثبيت حجم الصورة
                />
                <h2 className="text-base sm:text-xl lg:text-xl font-bold mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{category.name}</h2>
                <a href={`/${category.link}`} className="w-full bg-black bg-opacity-15 text-blue-400 text-sm sm:text-base lg:text-xl font-bold mt-1 py-1 border border-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300">
                  تسوق الآن
                </a>
              </div>
            ))}
          </section>
                    {/* Categories */}
          <nav className="hidden md:flex flex-wrap justify-center space-x-reverse space-x-8 p-6">
            {categories.map((category, index) => (
              <button
                key={index} // Add key prop
                onClick={() => {
                  setActiveCategory(category.link);
                  scrollToSection(category.link);
                }}
                className={`px-4 p-1  rounded-xl border transition-all duration-300 ${
                  activeCategory === category.link
                    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-400/50 border-white"
                    : "bg-black bg-opacity-15 border-blue-400 text-white hover:bg-blue-400"
                }`}
                style={
                  activeCategory === category.link
                    ? {
                        boxShadow: "0 0 8px 4px rgba(59,130,246,0.5)",
                      }
                    : {}
                }
              >
                {category.name}
              </button>
            ))}
          </nav>

          {/* Sections */}
          {categories.map((category) => ( // تأكد من استخدام categories بدون slice
            <section id={category.link} ref={sectionRefs[category.link]} className="p-3 scroll-mt-24" key={category.link}>
              <h2 className="text-3xl text-blue-400 font-black mb-2 text-center transition-all duration-300">
                {category.name}
              </h2>
              <LazySwiper {...swiperSettings}>
                {products[category.link]?.length > 0 ? (
                  products[category.link].map((product, idx) => (
                    <SwiperSlide key={idx}>
                      <div key={idx} className="p-2 transition-transform duration-300 hover:scale-[1.02]">
                        <div className="bg-gradient-to-r from-sky-700 from-0% via-sky-500/50 via-25% to-sky-600 to-100% p-4 rounded-lg shadow-md"
                          style={{
                            background: 'radial-gradient(circle at 90% 0%, #0565be 0%, transparent 50%), radial-gradient(circle at 0% 10%, #0565be 0%, transparent 50%), linear-gradient(to top, #0565be 0%, transparent 50%), #041c34',
                            boxShadow: "0 0 4px 2px rgba(0,0,0,0.1)",
                          }}
                        >
                          <LazyImage
                            src={product.img}
                            alt={product.name}
                            width={200}
                            height={200}
                            className="rounded-xl mx-auto"
                            loading="lazy"
                          />
                          <div className="flex justify-between items-end mt-2">
                            <button
                              onClick={() => addToCart(product)}
                              className="bg-black bg-opacity-15 text-blue-400 p-2 border border-cyan-500 rounded-xl hover:bg-blue-500 hover:text-white text-white hover:bg-blue-500 transition-colors duration-300 flex items-center justify-center"
                            >
                              <FontAwesomeIcon icon={faCartPlus} className="text-xl" /> {/* Updated icon */}
                            </button>
                            <div className="text-right">
                              <p className="text-2xl text-white font-bold" style={{ direction: 'rtl' }}>{product.price.toLocaleString()} دج</p>
                              <p className="text-base text-gray-200 font-semibold" style={{ direction: 'rtl' }}>{product.description}</p>
                              <h2 className="text-2xl text-sky-200 font-bold" style={{ direction: 'rtl' }}>{product.name}</h2>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))
                ) : (
                  <p className="text-center text-gray-500">لا توجد منتجات في هذه الفئة</p>
                )}
              </LazySwiper>
            </section>
          ))}

          {/* Scroll to Top Button */}
          {showScrollToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-16 right-2 md:bottom-4 md:right-4 bg-blue-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300 animate-bounce-slow"
              aria-label="Scroll to top"
              style={{
                fontSize: '0.875rem', // يعادل text-sm في Tailwind
              }}
            >
              <FontAwesomeIcon icon={faArrowUp} className="text-base md:text-xl" />
            </button>
          )}

          {/* Footer */}
          <footer className="bg-black/75 backdrop-filter backdrop-blur-xl text-white py-6 mt-12">
            <div className="container mx-auto flex flex-wrap justify-between items-center">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-2">fb:AMIR HAMCHERIF </h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-teal-300 transition-colors duration-300">من نحن</a></li>
                  <li><a href="#" className="hover:text-teal-300 transition-colors duration-300">ماذا نبيع</a></li>
                  <li><a href="#" className="hover:text-teal-300 transition-colors duration-300">اتصل بنا</a></li>
                </ul>
              </div>
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-2">اتصل بنا</h3>
                <p>العنوان: شارع المثال، المدينة، البلد</p>
                <p>الهاتف: 123-456-789</p>
                <p>البريد الإلكتروني: info@example.com</p>
              </div>
              <div className="w-full md:w-1/3">
                <h3 className="text-xl font-bold mb-2">تابعنا</h3>
                <div className="flex space-x-reverse space-x-4">
                  <FontAwesomeIcon
                    icon={faFacebookSquare}
                    className="text-white text-3xl hover:text-teal-300 transition-colors duration-300"
                  />
                  <FontAwesomeIcon
                    icon={faInstagramSquare}
                    className="text-white text-3xl hover:text-teal-300 transition-colors duration-300"
                  />
                </div>
              </div>
            </div>
          </footer>
          <style jsx global>{`
            .animate-spin-slow {
              animation: spin 3s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .slick-dots li.slick-active div {
              background: white !important;
            }
            @keyframes dropdownOpen {
              from {
                opacity: 0;
                transform: scaleY(0);
              }
              to {
                opacity: 1;
                transform: scaleY(1);
              }
            }
            @keyframes dropdownClose {
              0% {
                opacity: 1;
                transform: scaleY(1);
              }
              100% {
                opacity: 0;
                transform: scaleY(0);
              }
            }
            .animate-dropdown-open {
              animation: dropdownOpen 300ms ease-out forwards;
              transform-origin: top;
            }
            .animate-dropdown-close {
              animation: dropdownClose 300ms ease-out forwards;
              transform-origin: top;
              pointer-events: none;
            }
            /* Add these new styles */
            section {
              scroll-margin-top: 100px; /* Alternative to scroll-mt-24 for better browser support */
            }
            .slick-slider {
              padding-bottom: 60px; // إضافة تباعد سفلي للسلايدر
              position: relative;   // مهم لوضع النقاط بشكل صحيح
            }
            
            .slick-dots {
              display: flex !important;
              justify-content: center;
              align-items: center;
              gap: 0;
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 0;
              margin: 0;
            }
            
            .slick-dots li {
              margin: 0;
              padding: 5px 0;
              transition: all 0.3s ease;
            }
            
            .slick-dots li.slick-active {
              width: 30px;
            }
            
            .slick-dots li.slick-active div {
              background: white !important;
              width: 30px !important;
            }
            
            .slick-dots li:not(.slick-active):hover div {
              background: rgba(255, 255, 255, 0.5) !important;
            }
            @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
              .backdrop-blur-xl {
                -webkit-backdrop-filter: blur(24px);
                backdrop-filter: blur(24px);
              }
            }
            /* تحسين شريط التمرير للكارت في الهاتف */
            @media (max-width: 768px) {
              .cart-scrollbar {

                overflow-y: scroll !important; /* إجبار ظهور شريط التمرير */
                scrollbar-width: thin;
                scrollbar-color: rgba(59, 130, 246, 0.8) transparent;
                padding-left: 8px;
              }
              
              .cart-scrollbar::-webkit-scrollbar {
                -webkit-appearance: none;
                width: 8px !important;
                display: block !important; /* إجبار ظهور شريط التمرير */
              }
              
              .cart-scrollbar::-webkit-scrollbar-track {
                background: transparent;
                width: 8px !important;
                margin: 0;
              }
              
              .cart-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(59, 130, 246, 0.8);
                border-radius: 100px;
                min-height: 40px;
                width: 8px !important;
              }
              
              /* إضافة ظل لتحسين الرؤية */
              .cart-scrollbar::-webkit-scrollbar-track {
                box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
              }
              
              /* تحسين التفاعل عند اللمس */
              .cart-scrollbar {
                touch-action: pan-y;
                -webkit-tap-highlight-color: transparent;
              }
            }
            /* تحسين شريط التمرير للكارت في الهاتف */
            @media (max-width: 768px) {
              .cart-scrollbar {
                -webkit-overflow-scrolling: touch;
              }
              
              .cart-scrollbar::-webkit-scrollbar {
                -webkit-appearance: none;
                width: 8px;
              }
              
              .cart-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(59, 130, 246, 0.8);
                border-radius: 10px;
                opacity: 1 !important;
              }
              
              /* تحسين شريط التمرير لنتائج البحث في الهاتف */
              .max-h-60::-webkit-scrollbar {
                -webkit-appearance: none;
                width: 8px;
              }
              
              .max-h-60::-webkit-scrollbar-thumb {
                background-color: rgba(59, 130, 246, 0.8);
                border-radius: 10px;
                opacity: 1 !important;
              }
            }
            @media (min-width: 769px) {
              /* Main page scrollbar */
              html, body {
                scrollbar-width: thin;
                scrollbar-color: rgba(70, 136, 241, 1) rgba(208, 220, 236, 1);
              }
          
              html::-webkit-scrollbar, body::-webkit-scrollbar {
                width: 8px;
              }
          
              html::-webkit-scrollbar-track, body::-webkit-scrollbar-track {
                background: transparent;
              }
          
              html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb {
                background-color: rgba(59, 130, 246, 0.9);
                border-radius: 9999px;  /* Changed to 9999px for fully rounded corners */
                border: 2px solid rgba(255, 255, 255, 0.75);
              }
          
              /* Cart scrollbar */
              .cart-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(59, 130, 246, 0.9) rgba(0, 0, 0, 0.1);
                padding-left: 8px;
              }
          
              .cart-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
          
              .cart-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
          
              .cart-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(59, 130, 246, 0.8);
                border-radius: 9999px;  /* Changed to 9999px for fully rounded corners */
                border: 2px solid rgba(255, 255, 255, 0.75);
              }
          
              /* Search results scrollbar */
              .max-h-60 {
                scrollbar-width: thin;
                scrollbar-color: rgba(59, 130, 246, 0.8) rgba(0, 0, 0, 0.1);
              }
          
              .max-h-60::-webkit-scrollbar {
                width: 8px;
              }
          
              .max-h-60::-webkit-scrollbar-track {
                background: transparent;
              }
          
              .max-h-60::-webkit-scrollbar-thumb {
                background-color: rgba(59, 130, 246, 0.8);
                border-radius: 9999px;  /* Changed to 9999px for fully rounded corners */
                border: 2px solid rgba(255, 255, 255, 0.75);
              }
            }
            /* تعديل قواعد شريط التمرير للأجهزة المحمولة */
            @media (max-width: 768px) {
              html, body {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              
              html::-webkit-scrollbar, 
              body::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                background: transparent !important;
              }
              
              /* إخفاء شريط التمرير في الصفحة الرئيسية على الهواتف المحمولة */
              .min-h-screen::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                background: transparent !important;
              }
              
              .min-h-screen {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
            }
          
            /* الاحتفاظ بقواعد شريط التمرير للأجهزة المكتبية كما هي */
            @media (min-width: 769px) {
              // ...existing scrollbar code for desktop...
            }
            /* Add these new styles for better mobile handling */
            @media (max-width: 768px) {
              body.scroll-locked {
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                -webkit-overflow-scrolling: touch !important;
              }
            }
            /* تأثيرات نافذة البحث */
            .translate-y-full {
              transform: translateY(100%);
            }
            
            .translate-y-0 {
              transform: translateY(0);
            }
            
            /* تعديل مدة التأثير */
            .transition-all {
              transition-property: all;
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              transition-duration: 500ms;
            }
            
            /* إضافة تأثير للظهور والاختفاء */
            .duration-500 {
              transition-duration: 500ms;
            }
            
            .ease-in-out {
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* إضافة أنماط للسحب باللمس */
            @media (max-width: 768px) {
              .touch-pan-x {
                touch-action: pan-x;
              }
              
              .touch-pan-y {
                touch-action: pan-y;
              }
              
              /* تحسين أداء الحركة */
              .transition-transform {
                will-change: transform;
              }
            }
            /* إضافة تأثير Bounce للزر */
            @keyframes bounce-slow {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-10px);
              }
            }
            
            .animate-bounce-slow {
              animation: bounce-slow 2s infinite ease-in-out;
              transition: all 0.3s ease;
            }
            
            .animate-bounce-slow:hover {
              animation-play-state: paused;
              transform: scale(1.1);
            }
            /* تصميم جديد لأسهم السلايدر */
            .slick-custom-arrow {
              width: 50px;
              height: 50px;
              display: flex !important;
              align-items: center;
              justify-content: center;
              background: rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(8px);
              border-radius: 50%;
              color: white;
              font-size: 24px;
              cursor: pointer;
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              z-index: 10;
              transition: all 0.3s ease;
              border: 2px solid rgba(255, 255, 255, 0.2);
            }
          
            .slick-custom-arrow:hover {
              background: rgba(255, 255, 255, 0.25);
              border-color: rgba(255, 255, 255, 0.4);
              transform: translateY(-50%) scale(1.1);
            }
          
            .slick-custom-arrow-next {
              right: -30px; // تغيير موقع الزر التالي
              border-radius: 16px 8px 8px 16px;
            }
          
            .slick-custom-arrow-prev {
              left: -30px; // تغيير موقع الزر السابق
              border-radius: 8px 16px 16px 8px;
            }
          
            /* تحسين ظهور الأسهم على الشاشات الصغيرة */
            @media (max-width: 768px) {
              .slick-custom-arrow {
                width: 40px;
                height: 40px;
                font-size: 20px;
                background: rgba(0, 0, 0, 0.5);
              }
          
              .slick-custom-arrow-next {
                right: 0;
              }
          
              .slick-custom-arrow-prev {
                left: 0;
              }
            }
          
            /* تحسين موقع الأسهم بالنسبة للمحتوى */
            .slick-slider {
              margin: 0 30px;
            }
          
            @media (max-width: 768px) {
              .slick-slider {
                margin: 0 10px;
              }
            }
            /* تحديث أنماط أسهم السلايدر */
            .slick-custom-arrow {
              width: 50px;
              height: 50px;
              display: flex !important;
              align-items: center;
              justify-content: center;
              background: rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(8px);
              border-radius: 50%;
              color: white;
              font-size: 24px;
              cursor: pointer;
              position: absolute;
              top: 40%; /* تعديل الموضع للأعلى */
              transform: translateY(-50%);
              z-index: 10;
              transition: all 0.3s ease;
              border: 2px solid rgba(255, 255, 255, 0.2);
            }
          
            .slick-custom-arrow:hover {
              background: rgba(255, 255, 255, 0.25);
              border-color: rgba(255, 255, 255, 0.4);
              transform: translateY(-50%) scale(1.1);
              box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
            }
          
            .slick-custom-arrow-next {
              left: -25px;
            }
          
            .slick-custom-arrow-prev {
              right: -25px;
            }
          
            /* تحسين ظهور الأسهم على الشاشات الصغيرة */
            @media (max-width: 768px) {
              .slick-custom-arrow {
                width: 40px;
                height: 40px;
                font-size: 20px;
                background: rgba(0, 0, 0, 0.5);
                top: 40%; /* تعديل الموضع للأعلى في الشاشات الصغيرة */
              }
          
              .slick-custom-arrow-next {
                left: 5px;
              }
          
              .slick-custom-arrow-prev {
                right: 5px;
              }
            }
          
            /* تحديث هوامش السلايدر */
            .slick-slider {
              margin: 0 20px;
              padding-bottom: 40px; /* تقليل المسافة السفلية */
            }
          
            @media (max-width: 768px) {
              .slick-slider {
                margin: 0 10px;
                padding-bottom: 30px; /* تقليل المسافة السفلية في الشاشات الصغيرة */
              }
            }
            /* تحديث تصميم أسهم السلايدر */
            .slick-custom-arrow {
              width: 60px;
              height: 60px;
              display: flex !important;
              align-items: center;
              justify-content: center;
              background: rgba(0, 124, 255, 0.2);
              backdrop-filter: blur(8px);
              border-radius: 16px;
              color: white;
              font-size: 28px;
              cursor: pointer;
              position: absolute;
              top: 40%;
              transform: translateY(-50%) translateX(0);
              z-index: 10;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              border: 2px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
          
            .slick-custom-arrow:before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(45deg, rgba(0, 124, 255, 0.3), rgba(0, 124, 255, 0.1));
              z-index: -1;
              transition: all 0.4s ease;
            }
          
            .slick-custom-arrow:hover {
              transform: translateY(-50%) scale(1.05);
              background: rgba(0, 124, 255, 0.3);
              border-color: rgba(255, 255, 255, 0.5);
              box-shadow: 0 8px 25px rgba(0, 124, 255, 0.3),
                          0 0 0 2px rgba(255, 255, 255, 0.2);
            }
          
            .slick-custom-arrow:hover:before {
              background: linear-gradient(45deg, rgba(0, 124, 255, 0.4), rgba(0, 124, 255, 0.2));
            }
          
            .slick-custom-arrow:active {
              transform: translateY(-50%) scale(0.95);
            }
          
            .slick-custom-arrow-next {
              left: -30px;
              border-radius: 8px 16px 16px 8px;
            }
          
            .slick-custom-arrow-prev {
              right: -30px;
              border-radius: 16px 8px 8px 16px;
            }
          
            /* تحسين ظهور الأسهم على الشاشات الصغيرة */
            @media (max-width: 768px) {
              .slick-custom-arrow {
                width: 45px;
                height: 45px;
                font-size: 20px;
                border-radius: 12px;
                background: rgba(0, 124, 255, 0.25);
                backdrop-filter: blur(4px);
              }
          
              .slick-custom-arrow-next {
                left: 0;
                border-radius: 12px 6px 6px 12px;
              }
          
              .slick-custom-arrow-prev {
                right: 0;
                border-radius: 6px 12px 12px 6px;
              }
          
              .slick-custom-arrow:hover {
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 4px 15px rgba(0, 124, 255, 0.2);
              }
            }
            /* أنماط Swiper */
            .swiper {
              direction: rtl;
              padding: 20px 0;
            }
          
            .swiper-button-next,
            .swiper-button-prev {
              color: white;
              background: rgba(0, 124, 255, 0.2);
              width: 45px;
              height: 45px;
              border-radius: 12px;
              &:after {
                font-size: 20px;
              }
              &:hover {
                background: rgba(0, 124, 255, 0.3);
              }
            }
          
            .swiper-pagination-bullet {
              background: white;
            }
          
            .swiper-pagination-bullet-active {
              background: #3b82f6;
            }

            /* Swiper improvements for desktop */
            .swiper {
              user-select: none;
              touch-action: pan-y;
            }

            .swiper-slide {
              transition: transform 0.3s ease;
              cursor: grab;
            }

            .swiper-slide:active {
              cursor: grabbing;
            }

            .swiper-button-next,
            .swiper-button-prev {
              transition: transform 0.3s ease, background-color 0.3s ease;
            }

            .swiper-button-next:hover,
            .swiper-button-prev:hover {
              transform: scale(1.1);
            }

            .swiper-button-next:active,
            .swiper-button-prev:active {
              transform: scale(0.95);
            }

            /* Prevent text selection during slide */
            .swiper-slide * {
              user-select: none;
              -webkit-user-drag: none;
            }
          `}</style>
        </>
      )}
      {/* Categories Modal */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-filter backdrop-blur-xl text-white z-50 flex flex-col justify-end md:hidden transition-all duration-500 ease-in-out ${
          !isCategoriesOpen ? 'translate-y-full' : 'translate-y-0'
        }`}
        onClick={handleCloseCategoriesModal}
        onTouchStart={handleCategoriesTouchStart}
        onTouchMove={handleCategoriesTouchMove}
        onTouchEnd={handleCategoriesTouchEnd}
        style={{ 
          touchAction: 'pan-y',
          willChange: 'transform'
        }}
      >
        <div 
          className="p-4 h-[100vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 sticky top-0 py-2 z-10">
            <h2 className="text-2xl font-bold">التصنيفات</h2>
            <button 
              onClick={handleCloseCategoriesModal}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/20 transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 pb-20">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveCategory(category.link);
                  scrollToSection(category.link);
                  handleCloseCategoriesModal();
                }}
                className="bg-white/10 rounded-xl p-4 flex flex-col items-center space-y-2 hover:bg-white/20 transition-all duration-300 active:scale-95"
              >
                <div className="w-50 h-50 bg-white/5 rounded-xl p-2 flex items-center justify-center">
                  <LazyImage
                    src={`/images/category-${index + 1}.png`}
                    alt={category.name}
                    width={200}
                    height={200}
                    className="rounded-lg object-contain"
                  />
                </div>
                <span className="text-md font-bold text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}