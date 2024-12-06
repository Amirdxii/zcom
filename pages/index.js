import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faSearch, faTimes, faPlus, faMinus, faTrash, faSpinner, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { faFacebookSquare, faInstagramSquare } from "@fortawesome/free-brands-svg-icons";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AOS from 'aos';
import 'aos/dist/aos.css';

const LazyImage = dynamic(() => import('next/image'), { 
  ssr: false, 
  loading: () => <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-white" />,
  suspense: true // Add suspense to handle lazy loading errors
});
const LazySlider = dynamic(() => import('react-slick'), { 
  ssr: false, 
  loading: () => <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-white" />,
  suspense: true // Add suspense to handle lazy loading errors
});

const CartItem = ({ item, updateCartQuantity, removeFromCart }) => (
  <li className="flex items-center justify-between border-b pb-2 transition-all duration-300">
    <div className="flex items-center">
      <LazyImage src={item.img} alt={item.name} width={50} height={50} className="rounded-lg" loading="lazy" />
      <div className="ml-4">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-gray-600">{item.price.toLocaleString()} دج</p>
      </div>
    </div>
    <div className="flex items-center space-x-reverse space-x-2">
      <button
        className="px-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
        onClick={() => updateCartQuantity(item.name, 1)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <span className="text-lg">{item.quantity}</span>
      <button
        className="px-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
        onClick={() => updateCartQuantity(item.name, -1)}
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <button
        className="px-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300"
        onClick={() => removeFromCart(item.name)}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  </li>
);

export default function ProductPage() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeCategory, setActiveCategory] = useState("store");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Load cart from local storage on initial render
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
    setIsLoading(false); // Set loading to false after initial load
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
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionRefs = {
    store: useRef(null),
    printers: useRef(null),
    scanners: useRef(null),
    "cash-drawers": useRef(null),
    assemblies: useRef(null),
    labels: useRef(null),
    equipment: useRef(null),
  };

  const categories = [
    { name: "المتجر", link: "store" },
    { name: "طابعات حرارية", link: "printers" },
    { name: "قارئات الباركود", link: "scanners" },
    { name: "ادراج النقود", link: "cash-drawers" },
    { name: "تجميعات", link: "assemblies" },
    { name: "ورق وملصقات", link: "labels" },
    { name: "معدات إعلام آلي", link: "equipment" },
  ];

  const products = {
    printers: [
      { name: "طابعة حرارية Xprinter XP-350B", price: 16500, img: "/images/printer-1.png" },
      { name: "طابعة حرارية Xprinter XP-370B", price: 17000, img: "/images/printer-2.png" },
      { name: "طابعة حرارية Xprinter XP-323B", price: 18500, img: "/images/printer-3.png" },
      { name: "طابعة حرارية Xprinter XP-350B", price: 16500, img: "/images/printer-1.png" },
      { name: "طابعة حرارية Xprinter XP-370B", price: 17000, img: "/images/printer-2.png" },
      { name: "طابعة حرارية Xprinter XP-323B", price: 18500, img: "/images/printer-3.png" },
    ],
    scanners: [
      { name: "قارئ باركود مكتبي Henex HC-666", price: 15000, img: "/images/scanner-1.png" },
      { name: "قارئ باركود مكتبي Henex HC-6052", price: 16000, img: "/images/scanner-2.png" },
      { name: "قارئ باركود مكتبي Henex HC-777", price: 18000, img: "/images/scanner-3.png" },
      { name: "قارئ باركود مكتبي Henex HC-666", price: 15000, img: "/images/scanner-1.png" },
      { name: "قارئ باركود مكتبي Henex HC-6052", price: 16000, img: "/images/scanner-2.png" },
      { name: "قارئ باركود مكتبي Henex HC-777", price: 18000, img: "/images/scanner-3.png" },
    ],
    "cash-drawers": [
      { name: "درج النقود الفضي", price: 9000, img: "/images/cash-drawer-1.png" },
      { name: "درج النقود الذهبي", price: 10500, img: "/images/cash-drawer-2.png" },
      { name: "درج النقود الأسود", price: 11000, img: "/images/cash-drawer-3.png" },
      { name: "درج النقود الفضي", price: 9000, img: "/images/cash-drawer-1.png" },
      { name: "درج النقود الذهبي", price: 10500, img: "/images/cash-drawer-2.png" },
      { name: "درج النقود الأسود", price: 11000, img: "/images/cash-drawer-3.png" },
    ],
    assemblies: [
      { name: "تجميعة احترافية", price: 55000, img: "/images/assembly-1.png" },
      { name: "تجميعة اقتصادية", price: 30000, img: "/images/assembly-2.png" },
      { name: "تجميعة مكتبية", price: 40000, img: "/images/assembly-3.png" },
      { name: "تجميعة احترافية", price: 55000, img: "/images/assembly-1.png" },
      { name: "تجميعة اقتصادية", price: 30000, img: "/images/assembly-2.png" },
      { name: "تجميعة مكتبية", price: 40000, img: "/images/assembly-3.png" },
    ],
    labels: [
      { name: "ملصقات حرارية", price: 2000, img: "/images/label-1.png" },
      { name: "ملصقات ملونة", price: 3000, img: "/images/label-2.png" },
      { name: "ملصقات شفافة", price: 4000, img: "/images/label-3.png" },
      { name: "ملصقات حرارية", price: 2000, img: "/images/label-1.png" },
      { name: "ملصقات ملونة", price: 3000, img: "/images/label-2.png" },
      { name: "ملصقات شفافة", price: 4000, img: "/images/label-3.png" },
    ],
    equipment: [
      { name: "معدات إعلامية متطورة", price: 75000, img: "/images/equipment-1.png" },
      { name: "معدات إعلامية بسيطة", price: 25000, img: "/images/equipment-2.png" },
      { name: "معدات إعلامية قياسية", price: 50000, img: "/images/equipment-3.png" },
      { name: "معدات إعلامية متطورة", price: 75000, img: "/images/equipment-1.png" },
      { name: "معدات إعلامية بسيطة", price: 25000, img: "/images/equipment-2.png" },
      { name: "معدات إعلامية قياسية", price: 50000, img: "/images/equipment-3.png" },
    ],
  };

  const filteredProducts = products;

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
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
    if (section !== "store") {
      sectionRefs[section]?.current?.scrollIntoView({ behavior: "smooth" });
    }
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
        acc[category] = products[category].filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase())
        );
        return acc;
      }, {});
      setSearchResults(results);
      setIsSearching(false);
    }, 300)();
  };

  const handleSearchBlur = () => {
    setSearchQuery("");
  };

  const removeFromCart = useCallback((productName) => {
    setCart(cart.filter((item) => item.name !== productName));
    setNotification(`تم إزالة "${productName}" من السلة`);
    setTimeout(() => setNotification(null), 5000);
  }, [cart]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <div style={{ fontSize: '60px', color: 'white', cursor: 'pointer', transition: 'transform 0.3s' }}>❯</div>,
    prevArrow: <div style={{ fontSize: '60px', color: 'white', cursor: 'pointer', transition: 'transform 0.3s' }}>❮</div>,
    centerMode: true,
    centerPadding: '30px',
    rtl: true, // إضافة هذه السطر لجعل السلايدر يعمل بعكس الاتجاه
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          centerMode: true,
          centerPadding: '20px',
          rtl: true, // إضافة هذه السطر لجعل السلايدر يعمل بعكس الاتجاه
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
          centerMode: true,
          centerPadding: '20px',
          rtl: true, // إضافة هذه السطر لجعل السلايدر يعمل بعكس الاتجاه
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '20px',
          rtl: true, // إضافة هذه السطر لجعل السلايدر يعمل بعكس الاتجاه
        }
      }
    ],
    appendDots: dots => (
      <ul style={{ margin: "0px", padding: "0px" }}> {dots} </ul>
    ),
    customPaging: i => (
      <div
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.5)",
          display: "inline-block",
          margin: "0 5px"
        }}
        className="slick-dot"
      />
    )
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen text-white font-zain relative"
      onClick={() => {
        setIsCartOpen(false);
        handleSearchBlur();
      }}
      style={{
        backgroundImage: "url('/images/background.webP')",
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        transition: "background 0.5s ease-in-out",
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
          {/* Notification */}
          {notification && (
            <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-500">
              {notification}
            </div>
          )}

          {/* Header */}
          <header className="container mx-auto p-3 flex flex-wrap items-center justify-between transition-all duration-500">
            <div className="flex items-center space-x-reverse space-x-10" data-aos="fade-down">
              <a href="/">
                <LazyImage src="/images/logo.png" alt="Logo" width={90} height={90} className="" priority />
              </a>
              <nav className="flex space-x-reverse space-x-10">
                <a href="#" className="text-2xl hover:text-teal-300 transition-colors duration-300">
                  من نحن
                </a>
                <a href="#" className="text-2xl hover:text-teal-300 transition-colors duration-300">
                  ماذا نبيع
                </a>
                <a href="#" className="text-2xl hover:text-teal-300 transition-colors duration-300">
                  اتصل بنا
                </a>
              </nav>
            </div>

            {/* Center Section: Social Media Icons */}
            <div className="flex space-x-reverse space-x-4" data-aos="fade-down">
              <FontAwesomeIcon
                icon={faFacebookSquare}
                className="text-white text-3xl hover:text-teal-300 transition-colors duration-300"
              />
              <FontAwesomeIcon
                icon={faInstagramSquare}
                className="text-white text-3xl hover:text-teal-300 transition-colors duration-300"
              />
            </div>

            {/* Search Bar and Cart */}
            <div className="flex items-center space-x-reverse space-x-8 w-full md:w-auto mt-4 md:mt-0">
              <div className="relative w-full md:w-[480px]">
                <input
                  type="text"
                  placeholder="بحث . . ."
                  className="w-full h-12 rounded-xl bg-white bg-opacity-15 text-white placeholder-white px-4 pr-12 text-xl shadow-md border border-white focus:outline-none transition-all duration-300"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-white transition-transform duration-300"
                />
                {isSearching && (
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl text-white flex items-center transition-opacity duration-300">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span className="ml-2">جار البحث</span>
                  </div>
                )}
                {searchQuery && (
                  <div className="absolute top-14 left-0 w-full bg-white text-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto transition-all duration-300">
                    {Object.keys(searchResults).map((category) =>
                      searchResults[category].map((product, idx) => (
                        <div
                          key={idx}
                          className="flex items-center p-2 border-b cursor-pointer hover:bg-gray-200 transition-colors duration-300"
                          onClick={() => {
                            addToCart(product);
                            setSearchQuery("");
                          }}
                        >
                          <LazyImage src={product.img} alt={product.name} width={50} height={50} className="rounded-lg" />
                          <div className="ml-4">
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="text-gray-600">{product.price.toLocaleString()} دج</p>
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

              <div
                className="relative flex items-center text-white cursor-pointer transition-transform duration-300 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCartOpen(!isCartOpen);
                }}
              >
                <FontAwesomeIcon icon={faShoppingCart} className="text-3xl" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>
            </div>
          </header>

          {/* Cart Popup */}
          <div
            className={`fixed top-0 left-0 h-full bg-white text-black shadow-lg p-4 z-50 transition-transform duration-300 ${
              isCartOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{ width: "100%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">السلة</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">السلة فارغة</p>
            ) : (
              <>
                <ul className="space-y-4 overflow-y-auto max-h-[60vh]">
                  {cart.map((item, idx) => (
                    <CartItem
                      key={idx}
                      item={item}
                      updateCartQuantity={updateCartQuantity}
                      removeFromCart={removeFromCart}
                    />
                  ))}
                </ul>
                <div className="mt-4 text-lg font-bold">
                  الإجمالي: {totalCartPrice.toLocaleString()} دج
                </div>
                <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
                  إتمام الشراء
                </button>
              </>
            )}
          </div>

          {/* Categories */}
          <nav className="flex flex-wrap justify-center space-x-reverse space-x-6 p-2">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveCategory(category.link);
                  scrollToSection(category.link);
                }}
                className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
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

          {/* Main Categories Grid */}
          <section className="p-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
            {categories
              .slice(1)
              .map((category, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer bg-white bg-opacity-15 p-3 rounded-xl shadow-lg flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 border border-white border-opacity-50"
                  data-aos="fade-up"
                >
                  <LazyImage
                    src={`/images/category-${idx + 1}.png`}
                    alt={category.name}
                    width={400}
                    height={400}
                    className="rounded-xl"
                    loading="lazy"
                  />
                  <h2 className="text-xl font-bold mt-2">{category.name}</h2>
                  <a href={`/${category.link}`} className="w-full bg-black bg-opacity-15 text-blue-400 text-2xl font-bold mt-2 py-2 border border-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300">
                    تسوق الآن
                  </a>
                </div>
              ))}
          </section>

          {/* Sections */}
          {categories.slice(1).map((category) => (
            <section id={category.link} ref={sectionRefs[category.link]} className="p-6" key={category.link}>
              <h2 className="text-4xl text-blue-500 font-bold mb-4 text-center transition-all duration-300">
                {category.name}
              </h2>
              <LazySlider {...sliderSettings}>
                {filteredProducts[category.link]?.length > 0 ? (
                  filteredProducts[category.link].map((product, idx) => (
                    <div key={idx} className="p-4 transition-transform duration-300 hover:scale-105">
                      <div className="bg-blue-700 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
                        <LazyImage
                          src={product.img}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="rounded-xl"
                          loading="lazy"
                        />
                        <h2 className="text-xl font-bold mt-2">{product.name}</h2>
                        <p className="mt-1 text-xl text-white">{product.price.toLocaleString()} دج</p>
                        <button
                          onClick={() => addToCart(product)}
                          className="mt-2 bg-blue-600 px-6 py-2 rounded-xl text-white hover:bg-blue-500 transition-colors duration-300"
                        >
                          أضف إلى السلة
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">لا توجد منتجات في هذه الفئة</p>
                )}
              </LazySlider>
            </section>
          ))}

          {/* Scroll to Top Button */}
          {showScrollToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
              aria-label="Scroll to top"
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </button>
          )}

          {/* Footer */}
          <footer className="bg-black bg-opacity-75 text-white py-6 mt-12">
            <div className="container mx-auto flex flex-wrap justify-between items-center">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-2">روابط سريعة</h3>
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
          `}</style>
        </>
      )}
    </div>
  );
}