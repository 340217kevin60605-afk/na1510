import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, User, Settings, LogOut, ChevronRight } from 'lucide-react';

const initialProducts = [
  { id: 1, name: '法式流線純銀戒指', price: 880, stock: 15, image: 'https://images.unsplash.com/photo-1605100804763-247f6612d540?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: '晨露珍珠細頸鍊', price: 1280, stock: 8, image: 'https://images.unsplash.com/photo-1599643478524-fb66f72400de?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: '琥珀香檳耳扣', price: 650, stock: 20, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400' },
  { id: 4, name: '極簡波浪麻花戒', price: 790, stock: 5, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400' },
];

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // 後台狀態
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  // 購物車邏輯
  const addToCart = (product) => {
    if (product.stock <= 0) return alert('這款已經被搶購一空囉！');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('已經達到庫存上限囉！');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true); // 加入後自動打開購物車
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        const product = products.find(p => p.id === id);
        if (newQuantity > product.stock) return item;
        if (newQuantity < 1) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 後台邏輯
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '1510') {
      setIsLoggedIn(true);
      setPassword('');
    } else {
      alert('密碼錯誤喔！');
    }
  };

  const updateStock = (id, newStock) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Number(newStock) } : p));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-800 font-sans selection:bg-orange-100">
      {/* 頂部導覽列 */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-stone-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-xl tracking-widest font-light text-stone-700">
            NA Shop
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsAdminOpen(true)} className="text-stone-400 hover:text-stone-600 transition-colors">
              <Settings size={20} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative text-stone-600 hover:text-stone-800 transition-colors p-2"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#E8DCC4] text-stone-700 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 首頁視覺區 */}
      <header className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-[#F4F0EA] rounded-3xl p-8 sm:p-16 mb-12 shadow-sm border border-stone-100">
          <h1 className="text-3xl sm:text-4xl font-light text-stone-800 mb-4 tracking-wide">
            為日常點綴微光
          </h1>
          <p className="text-stone-500 tracking-wider text-sm sm:text-base">
            Minimalist Jewelry Collection
          </p>
        </div>

        {/* 商品列表 (響應式網格) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 text-left">
          {products.map(product => (
            <div key={product.id} className="group flex flex-col group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100 mb-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {product.stock <= 3 && product.stock > 0 && (
                  <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 text-[10px] tracking-wider rounded-sm text-stone-500">
                    即將完售
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-stone-800 text-white px-4 py-2 text-sm tracking-widest rounded-full">SOLD OUT</span>
                  </div>
                )}
              </div>
              <h3 className="text-sm text-stone-700 tracking-wide mb-1">{product.name}</h3>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm font-medium text-stone-600">NT$ {product.price}</span>
                <button 
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-[#E8DCC4] hover:text-stone-800 transition-colors disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* 購物車抽屜 (側邊滑出) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-lg tracking-widest font-medium text-stone-800">SHOPPING CART</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="tracking-wide text-sm">客寶，購物車還是空的喔！</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-xl bg-stone-100" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between mb-1">
                            <h3 className="text-sm text-stone-700 tracking-wide">{item.name}</h3>
                            <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-red-400">
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-stone-500">NT$ {item.price}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-stone-200 rounded-full px-2 py-1">
                            <button onClick={() => updateCartQuantity(item.id, -1)} className="text-stone-400 hover:text-stone-600 p-1"><Minus size={12} /></button>
                            <span className="text-xs w-6 text-center text-stone-600">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, 1)} className="text-stone-400 hover:text-stone-600 p-1"><Plus size={12} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-stone-50 border-t border-stone-100">
                <div className="flex justify-between mb-6 text-stone-800">
                  <span className="tracking-widest text-sm">TOTAL</span>
                  <span className="font-medium tracking-wider">NT$ {cartTotal}</span>
                </div>
                <button className="w-full bg-stone-800 text-white py-4 rounded-xl tracking-widest text-sm hover:bg-stone-700 transition-colors flex items-center justify-center gap-2">
                  前往結帳 <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 後台管理 Modal */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsAdminOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl tracking-widest text-stone-800 flex items-center gap-2">
                  <Settings size={20} className="text-stone-400"/> 闆娘專屬後台
                </h2>
                <button onClick={() => setIsAdminOpen(false)} className="text-stone-400 hover:text-stone-600 p-2">
                  <X size={20} />
                </button>
              </div>

              {!isLoggedIn ? (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-xs tracking-widest text-stone-500 mb-2">請輸入管理密碼</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#E8DCC4] focus:ring-1 focus:ring-[#E8DCC4] transition-all bg-stone-50 text-center tracking-widest"
                      placeholder="••••"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#E8DCC4] text-stone-800 py-3 rounded-xl tracking-widest text-sm hover:bg-[#d6c5a5] transition-colors font-medium">
                    登入管理
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl">
                    <span className="text-sm tracking-wider text-stone-600">商品庫存管理</span>
                    <button onClick={() => setIsLoggedIn(false)} className="text-xs flex items-center gap-1 text-stone-400 hover:text-stone-600">
                      <LogOut size={14}/> 登出
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 border border-stone-100 rounded-2xl hover:border-stone-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-stone-100" />
                          <div>
                            <p className="text-sm tracking-wide text-stone-700">{product.name}</p>
                            <p className="text-xs text-stone-400">NT$ {product.price}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <label className="text-[10px] tracking-widest text-stone-400">現有庫存</label>
                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => updateStock(product.id, e.target.value)}
                            className="w-16 text-center text-sm px-2 py-1 border border-stone-200 rounded-lg focus:outline-none focus:border-[#E8DCC4]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}