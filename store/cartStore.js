import create from "zustand";

const useCartStore = create((set) => ({
  cartItems: 0, // عدد العناصر في السلة
  addToCart: () => set((state) => ({ cartItems: state.cartItems + 1 })), // دالة لإضافة عنصر
  removeFromCart: () => set((state) => ({ cartItems: state.cartItems > 0 ? state.cartItems - 1 : 0 })), // دالة لحذف عنصر
}));

export default useCartStore;
