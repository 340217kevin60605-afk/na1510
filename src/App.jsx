import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store, Settings, X, Plus, Trash2, Check, Package, CreditCard, ArrowLeft, Truck, Wallet, Banknote, ClipboardCheck, Calendar, Search, Menu, ChevronRight } from 'lucide-react';

// --- 預設商品資料 ---
const initialProducts = [
  { 
    id: 1, 
    name: '批發', 
    price: 0, 
    desc: '2件起批/國際運費由我們負擔/可到店取貨or面交', 
    detail: '1.點選商品圖>>查看商品與價錢(連結已是批發價格) 2.挑選商品直接下單 3.皆從韓國叫貨(為壓低成本皆採海運7~21天)>有現貨2~5天 4.不提供商品圖請自行準備',
    category: '批發',
    specs: [
     ], 
    stock: 100000, 
    iconType: '批發' 
  },
  { 
    id: 2, 
    name: '社群分潤', 
    price: 0, 
    desc: '只要分享圖片與連結，有人下單即可分潤。', 
    detail: '1.我們提供商品圖片與分潤連結 2.您在社群or賣場推廣 3.有客人下單您分成總金額30%(例如客人下單500您會獲得150) 4.合作期限1個月/推廣方式自由選擇',
    category: '社群分潤',
    specs: [
     ], 
    stock:10000, 
    iconType: '社群分潤' 
  },
  { 
    id: 3, 
    name: '卡紙設計/代印', 
    price:6, 
    desc: '一張a6大小卡紙6塊/彩色黑白/', 
    detail: '',
    category: '質感香氛',
    specs: [
      { name: '設計+代印' },
      { name: '代印' }
    ], 
    stock: 20, 
    iconType: '卡紙設計/代印' 
  },
];

// --- 預設分類項目 ---
const initialCategories = ['所有商品', '批發', '社群分潤', '卡紙設計/代印'];

// --- 運費與物流設定 ---
const SHIPPING_OPTIONS = {
  '711': { name: '7-11 門市取貨', fee: 40, desc: '請填寫門市名稱與地址' },
  'meetup': { name: '面交', fee: 10, desc: '限北北基地區' },
  'store': { name: '到店取貨', fee: 0, desc: '三重水漾路一段39號（近三重捷運站）' }
};

// --- 商品插圖元件 (SVG) ---
const ProductGraphic = ({ type }) => {
  const baseClasses = "w-full h-full flex items-center justify-center bg-[#FAF6F0] text-[#A6907C]";
  if (type === 'ring') {
    return (
      <div className={baseClasses}>
        <svg width="28%" height="28%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="14" r="6" />
          <path d="M10 8L12 4L14 8" />
        </svg>
      </div>
    );
  } else if (type === 'bag') {
    return (
      <div className={baseClasses}>
        <svg width="28%" height="28%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
    );
  } else {
    return (
      <div className={baseClasses}>
        <svg width="28%" height="28%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <rect width="10" height="14" x="7" y="8" rx="2" />
          <path d="M12 8V4" />
          <path d="M10 2h4" />
        </svg>
      </div>
    );
  }
};

export default function App() {
 const [view, setView] = useState('store'); 
// 改用 LocalStorage 記憶資料
const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem('na_products')) || initialProducts);
const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem('na_categories')) || initialCategories);
const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('na_cart')) || []);
const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('na_orders')) || []);

const [selectedCategory, setSelectedCategory] = useState('所有商品');
const [isCartOpen, setIsCartOpen] = useState(false);
const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // 新增密碼鎖狀態

// 當資料改變時自動存檔
useEffect(() => localStorage.setItem('na_products', JSON.stringify(products)), [products]);
useEffect(() => localStorage.setItem('na_categories', JSON.stringify(categories)), [categories]);
useEffect(() => localStorage.setItem('na_cart', JSON.stringify(cart)), [cart]);
useEffect(() => localStorage.setItem('na_orders', JSON.stringify(orders)), [orders]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const addToCart = (product, selectedSpecString, quantity) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.spec === selectedSpecString);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.spec === selectedSpecString) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, spec: selectedSpecString, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleProceedToPayment = (formData, shippingMethod, finalAddress) => {
    const shippingFee = SHIPPING_OPTIONS[shippingMethod].fee;
    const orderData = {
      customer: formData,
      shipping: { method: shippingMethod, address: finalAddress, fee: shippingFee },
      items: [...cart],
      subTotal: cartTotal,
      totalAmount: cartTotal + shippingFee,
    };
    setPendingOrder(orderData);
    setView('payment');
  };

const finalizeOrder = (paymentMethod, bankLast5 = null) => {
  const newOrder = {
    id: `ORD${Math.floor(Math.random() * 89999 + 10000)}`,
    date: new Date().toLocaleString(),
    ...pendingOrder,
    paymentMethod,
    bankLast5, // 紀錄後五碼
    status: paymentMethod === '貨到付款' ? '未付款' : '已付款', // 匯款直接變已付款
    appointmentTime: null
  };
    setOrders([newOrder, ...orders]);
    setCompletedOrder(newOrder);
    setCart([]);
    setPendingOrder(null);
    setView('success');
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleMakeAppointment = (orderId, date, slot) => {
    const formattedTime = `${date} ${slot}`;
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: '已約定', appointmentTime: formattedTime } : order
    ));
    alert(`預約成功！時間為：${formattedTime}\n您的訂單狀態已更新為「已約定」`);
  };

  const Navbar = () => (
    <nav className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        <h1 className="text-lg tracking-widest font-light text-stone-800 flex items-center gap-2.5 cursor-pointer" onClick={() => { setSelectedCategory('所有商品'); setView('store'); }}>
          <Package size={20} className="text-[#D3C4B7]" />
          NA Shop
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setView('lookup')} className={`text-xs tracking-wider flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${view === 'lookup' ? 'bg-[#F5EFE6] text-[#A6907C] font-medium' : 'text-stone-500 hover:text-stone-800'}`}>
            <Search size={14} /> 查詢訂單
          </button>

          {view === 'admin' ? (
            <button onClick={() => setView('store')} className="text-xs tracking-wider flex items-center gap-1 text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-full">
              <Store size={14} /> 前台商店
            </button>
          ) : (
            <button onClick={() => setView('admin')} className="text-xs tracking-wider flex items-center gap-1 text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-full">
              <Settings size={14} /> 後台管理
            </button>
          )}
          
          {view !== 'admin' && (
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#E8DCC4] text-stone-700 text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {cart.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  const ProductCard = ({ product }) => {
    const [selectedSpecs, setSelectedSpecs] = useState(() => {
      const initial = {};
      product.specs?.forEach(specGroup => {
        initial[specGroup.name] = specGroup.options[0] || '';
      });
      return initial;
    });
    const [qty, setQty] = useState(1);

    const handleQuickAdd = (e) => {
      e.stopPropagation();
      const specString = Object.entries(selectedSpecs)
        .map(([name, val]) => `${name}: ${val}`)
        .join(' / ');
      addToCart(product, specString, qty);
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-stone-100 hover:shadow-md transition-all duration-300 group">
        <div className="cursor-pointer flex flex-col flex-1" onClick={() => { setSelectedProduct(product); setView('productDetail'); }}>
          <div className="aspect-[4/5] w-full overflow-hidden bg-stone-50 relative">
            {product.image ? <img src={product.image} className="w-full h-full object-cover"/> : <ProductGraphic type="box" />}
            <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <span className="bg-white/95 text-stone-700 text-xs px-3 py-1.5 rounded-full tracking-wider font-light shadow-sm">查看詳情</span>
            </div>
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-xs sm:text-sm text-stone-700 tracking-wide line-clamp-1 mb-1 font-normal">{product.name}</h3>
            <div className="text-xs sm:text-sm font-medium text-[#A6907C]">NT$ {product.price}</div>
          </div>
        </div>
        
        <div className="px-4 pb-4 mt-auto border-t border-stone-50 pt-3">
          <div className="space-y-2 mb-3 text-[11px] text-stone-500">
            {product.specs?.map((specGroup, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2">
                <span className="text-stone-400 shrink-0 w-8">{specGroup.name}</span>
                <select 
                  className="w-full text-[11px] border-stone-200 rounded-lg p-1 bg-stone-50/50 focus:ring-1 focus:ring-[#D3C4B7] focus:border-[#D3C4B7]"
                  value={selectedSpecs[specGroup.name] || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedSpecs(prev => ({ ...prev, [specGroup.name]: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {specGroup.options.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-stone-400 shrink-0 w-8">數量</span>
              <input 
                type="number" 
                min="1" max={product.stock}
                className="w-full text-[11px] border-stone-200 rounded-lg p-1 bg-stone-50/50 focus:ring-1 focus:ring-[#D3C4B7] focus:border-[#D3C4B7] text-center"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <button 
            onClick={handleQuickAdd}
            className="w-full bg-[#D3C4B7] hover:bg-[#C2B2A5] text-stone-800 py-2 rounded-xl tracking-widest transition-colors text-xs font-medium"
          >
            快速加入
          </button>
        </div>
      </div>
    );
  };

  const ProductDetailView = () => {
    const [selectedSpecs, setSelectedSpecs] = useState(() => {
      const initial = {};
      selectedProduct?.specs?.forEach(specGroup => {
        initial[specGroup.name] = specGroup.options[0] || '';
      });
      return initial;
    });
    const [qty, setQty] = useState(1);

    if (!selectedProduct) return null;

    const handleDetailAdd = () => {
      const specString = Object.entries(selectedSpecs)
        .map(([name, val]) => `${name}: ${val}`)
        .join(' / ');
      addToCart(selectedProduct, specString, qty);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setView('store')} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 mb-6 transition-colors text-xs tracking-wider">
          <ArrowLeft size={14} /> 返回商品列表
        </button>
        
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 aspect-square bg-stone-50">
            {selectedProduct.image ? <img src={selectedProduct.image} className="w-full h-full object-cover"/> : <ProductGraphic type="box"/>}
          </div>
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            <span className="text-[10px] font-medium text-[#A6907C] tracking-widest mb-3 bg-[#FAF6F0] px-2.5 py-1 rounded-full self-start">{selectedProduct.category || '一般商品'}</span>
            <h2 className="text-xl font-normal text-stone-800 tracking-wide mb-2">{selectedProduct.name}</h2>
            <div className="text-lg font-medium text-[#A6907C] mb-6">NT$ {selectedProduct.price}</div>
            
            <div className="mb-6">
              <h4 className="text-xs text-stone-400 tracking-wider mb-2">商品詳細介紹</h4>
              <p className="text-stone-600 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-light">
                {selectedProduct.detail || selectedProduct.desc}
              </p>
            </div>

            <div className="mt-auto space-y-4 bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
              {selectedProduct.specs?.map((specGroup, sIdx) => (
                <div key={sIdx}>
                  <label className="block text-[11px] text-stone-400 tracking-wider mb-2">選擇{specGroup.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {specGroup.options.map(s => (
                      <button 
                        key={s}
                        onClick={() => setSelectedSpecs(prev => ({ ...prev, [specGroup.name]: s }))}
                        className={`px-3 py-1.5 border rounded-xl text-xs tracking-wide transition-all ${selectedSpecs[specGroup.name] === s ? 'border-[#A6907C] bg-[#A6907C] text-white shadow-sm' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              <div>
                <label className="block text-[11px] text-stone-400 tracking-wider mb-2">購買數量</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" min="1" max={selectedProduct.stock}
                    className="w-20 border-stone-200 rounded-xl p-1.5 bg-white text-xs text-center focus:ring-1 focus:ring-[#A6907C]"
                    value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  />
                  <span className="text-[11px] text-stone-400 tracking-wider">庫存餘額: {selectedProduct.stock}</span>
                </div>
              </div>

              <button 
                onClick={handleDetailAdd}
                className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3.5 rounded-xl font-medium tracking-widest transition-colors shadow-sm flex items-center justify-center gap-2 text-xs"
              >
                <ShoppingCart size={14} /> 加入購物車
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartDrawer = () => (
    <>
      {isCartOpen && <div className="fixed inset-0 bg-stone-900/20 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-4 border-b flex justify-between items-center bg-[#FAF6F0]">
          <h2 className="text-sm tracking-widest font-medium text-stone-700 flex items-center gap-2">
            <ShoppingCart size={16}/> SHOPPING CART
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-stone-400 hover:text-stone-700 bg-white rounded-full p-1.5 shadow-sm transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-3">
              <ShoppingCart size={36} strokeWidth={1} />
              <p className="text-xs tracking-wider">購物車空空如也，快去選購吧！</p>
              <button onClick={() => { setIsCartOpen(false); setView('store'); }} className="text-[#A6907C] underline text-xs mt-1">去逛逛</button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm">
                <div className="w-14 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-50">
                  <ProductGraphic type={item.iconType} />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs text-stone-800 tracking-wide font-normal truncate">{item.name}</h4>
                  <p className="text-[10px] text-stone-500 mt-1 bg-stone-50 inline-block px-2 py-0.5 rounded-lg max-w-full truncate">{item.spec}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs font-medium text-[#A6907C]">NT$ {item.price}</p>
                    <p className="text-[10px] text-stone-400 font-light">x {item.quantity}</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(index)} className="text-stone-300 hover:text-red-400 p-2 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-stone-500 tracking-wider">小計 (不含運費)</span>
              <span className="text-base font-medium text-[#A6907C]">NT$ {cartTotal}</span>
            </div>
            <button 
              onClick={() => { setIsCartOpen(false); setView('checkout'); }}
              className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3.5 rounded-xl tracking-widest text-xs transition-colors shadow-sm"
            >
              前往結帳
            </button>
          </div>
        )}
      </div>
    </>
  );

  const CheckoutView = () => {
    const [form, setForm] = useState({ name: '', phone: '' });
    const [shippingMethod, setShippingMethod] = useState('711');
    const [address, setAddress] = useState('');

    const shippingFee = SHIPPING_OPTIONS[shippingMethod].fee;
    const finalTotal = cartTotal + shippingFee;

    const handleSubmit = (e) => {
      e.preventDefault();
      let finalAddress = address;
      if (shippingMethod === 'store') {
        finalAddress = SHIPPING_OPTIONS['store'].desc;
      }
      if (!finalAddress) return;
      handleProceedToPayment(form, shippingMethod, finalAddress);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setView('store')} className="flex items-center gap-1 text-stone-400 hover:text-stone-700 mb-6 text-xs tracking-wider">
          <ArrowLeft size={14} /> 繼續選購
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <h2 className="text-sm font-medium tracking-widest text-stone-700 mb-6 flex items-center gap-2 border-b pb-4">
              <Truck size={16} className="text-[#D3C4B7]"/> 運送資訊
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-stone-400 tracking-wide mb-1.5">收件人姓名 *</label>
                  <input required type="text" className="w-full border-stone-200 rounded-xl p-2.5 bg-stone-50/50 focus:ring-1 focus:ring-[#A6907C] text-xs" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 tracking-wide mb-1.5">聯絡電話 *</label>
                  <input required type="tel" className="w-full border-stone-200 rounded-xl p-2.5 bg-stone-50/50 focus:ring-1 focus:ring-[#A6907C] text-xs" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 tracking-wide mb-2.5">選擇運送方式 *</label>
                <div className="space-y-2.5">
                  {Object.entries(SHIPPING_OPTIONS).map(([key, opt]) => (
                    <label key={key} className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${shippingMethod === key ? 'border-[#A6907C] bg-[#FAF6F0]' : 'border-stone-100 hover:bg-stone-50/50'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" name="shipping" value={key} 
                          checked={shippingMethod === key} 
                          onChange={(e) => { setShippingMethod(e.target.value); setAddress(''); }}
                          className="text-[#A6907C] focus:ring-[#A6907C]"
                        />
                        <div>
                          <div className="text-xs font-medium text-stone-700 tracking-wide">{opt.name}</div>
                          <div className="text-[10px] text-stone-400 font-light mt-0.5">{opt.desc}</div>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-stone-600">{opt.fee === 0 ? '免運' : `+ NT$ ${opt.fee}`}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[11px] text-stone-400 tracking-wide mb-1.5">
                  {shippingMethod === '711' ? '7-11 門市名稱與地址 *' : shippingMethod === 'meetup' ? '面交聯絡地點 (限北北基地區) *' : '取貨地點'}
                </label>
                {shippingMethod === 'store' ? (
                  <input disabled type="text" className="w-full border-stone-100 rounded-xl p-2.5 bg-stone-100/70 text-stone-500 text-xs cursor-not-allowed" value={SHIPPING_OPTIONS['store'].desc} />
                ) : (
                  <input 
                    required type="text" 
                    placeholder={shippingMethod === '711' ? '例：7-11 信義門市 (台北市信義區信義路XX號)' : '例：台北市中山捷運站3號出口旁'}
                    className="w-full border-stone-200 rounded-xl p-2.5 bg-white focus:ring-1 focus:ring-[#A6907C] text-xs shadow-sm" 
                    value={address} onChange={e => setAddress(e.target.value)} 
                  />
                )}
              </div>

              <button type="submit" className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3.5 rounded-xl font-medium mt-6 tracking-widest text-xs transition-colors">
                下一步：選擇付款方式
              </button>
            </form>
          </div>
          
          <div className="bg-stone-50/70 p-6 rounded-3xl border border-stone-100 md:sticky md:top-24">
             <h3 className="text-xs font-medium tracking-widest mb-6 border-b border-stone-200/60 pb-3 text-stone-700">ORDER SUMMARY</h3>
             
             <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs">
                    <div className="flex gap-3">
                      <div className="w-10 h-12 rounded-lg bg-white border border-stone-100 flex-shrink-0 overflow-hidden">
                        {selectedProduct.image ? <img src={selectedProduct.image} className="w-full h-full object-cover"/> : <ProductGraphic type="box" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-stone-700 truncate font-normal">{item.name}</div>
                        <div className="text-stone-400 text-[10px] mt-0.5 truncate">{item.spec}</div>
                        <div className="text-stone-400 text-[10px] font-light">數量: {item.quantity}</div>
                      </div>
                    </div>
                    <span className="text-stone-600 font-medium shrink-0 ml-2">NT$ {item.price * item.quantity}</span>
                  </div>
                ))}
             </div>
             
             <div className="border-t border-stone-200/60 pt-4 space-y-2.5 text-xs">
               <div className="flex justify-between items-center text-stone-500">
                 <span className="tracking-wide">商品小計</span>
                 <span>NT$ {cartTotal}</span>
               </div>
               <div className="flex justify-between items-center text-stone-500">
                 <span className="tracking-wide">運費 ({SHIPPING_OPTIONS[shippingMethod].name})</span>
                 <span>NT$ {shippingFee}</span>
               </div>
               <div className="flex justify-between items-center border-t border-stone-200/60 pt-4 mt-2">
                  <span className="text-stone-700 tracking-wider">總結帳金額</span>
                  <span className="text-base font-medium text-[#A6907C]">NT$ {finalTotal}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

const PaymentView = () => {
  if (!pendingOrder) return null;
  const [selectedMethod, setSelectedMethod] = useState('');
  const [bankLast5, setBankLast5] = useState('');

  const paymentMethods = [
    { id: 'cod', name: '貨到付款', icon: <Truck size={20} />, desc: '商品送達時以現金支付' },
    { id: 'bank', name: '銀行匯款', icon: <Banknote size={20} />, desc: '請匯款後填寫帳號後五碼以利核對' },
    { id: 'ecpay', name: '線上刷卡', icon: <CreditCard size={20} />, desc: '安全金流，支援信用卡付款' }
  ];

  const handleConfirmPayment = () => {
    if (!selectedMethod) return alert('請選擇付款方式！');
    if (selectedMethod === '銀行匯款' && bankLast5.length !== 5) return alert('選擇銀行匯款請務必填寫帳號後五碼！');
    finalizeOrder(selectedMethod, selectedMethod === '銀行匯款' ? bankLast5 : null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">應付總額: NT$ {pendingOrder.totalAmount}</h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        {paymentMethods.map(method => (
          <div key={method.id} className={`border rounded-xl transition-all ${selectedMethod === method.name ? 'border-[#A6907C] bg-[#F5EFE6]' : 'border-gray-200'}`}>
            <button onClick={() => setSelectedMethod(method.name)} className="w-full flex items-center gap-4 p-4 text-left">
              <div className="text-gray-400">{method.icon}</div>
              <div><h4 className="font-bold text-sm">{method.name}</h4><p className="text-xs text-gray-500">{method.desc}</p></div>
            </button>
            {selectedMethod === '銀行匯款' && method.id === 'bank' && (
              <div className="px-4 pb-4">
                <input type="text" maxLength="5" placeholder="請輸入匯款帳號後五碼" className="w-full text-sm border p-2 rounded focus:ring-[#A6907C]" value={bankLast5} onChange={e => setBankLast5(e.target.value.replace(/\D/g, ''))} />
              </div>
            )}
          </div>
        ))}
        <button onClick={handleConfirmPayment} className="w-full bg-[#4A4A4A] text-white py-3 rounded-lg font-bold mt-4">確認付款並建立訂單</button>
      </div>
    </div>
  );
};

  const OrderSuccessView = () => {
    if (!completedOrder) return null;

    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full mb-4">
            <ClipboardCheck size={22} />
          </div>
          
          <h2 className="text-base font-medium tracking-widest text-stone-700 mb-2">訂單建立成功！</h2>
          <p className="text-xs text-stone-400 font-light max-w-sm mx-auto mb-6">感謝您的購買！您可以複製下方的訂單編號，方便隨時回到本站查詢進度。</p>

          <div className="bg-stone-50/50 rounded-2xl p-5 text-left space-y-3.5 mb-6 text-xs border border-stone-100">
            <div className="flex justify-between items-center border-b pb-2.5 border-stone-200/60">
              <span className="text-stone-400">訂單編號</span>
              <span className="font-mono bg-white px-2 py-1 rounded border border-stone-200 select-all text-stone-700 font-semibold">{completedOrder.id}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-2.5 border-stone-200/60">
              <span className="text-stone-400">當前狀態</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
                {completedOrder.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-2.5 border-stone-200/60">
              <span className="text-stone-400">付款方式</span>
              <span className="font-medium text-stone-700">{completedOrder.paymentMethod}</span>
            </div>

            {completedOrder.paymentMethod === '銀行匯款' && (
              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#D3C4B7]/30 space-y-1.5 text-[11px] text-[#8e7a68]">
                <p className="font-medium">🏦 匯款帳戶資訊：</p>
                <p>銀行代碼：奶油銀行 (822)</p>
                <p>匯款帳號：123-456789-012</p>
                <p>戶名：奶油選物工作室</p>
                <p className="text-[10px] text-stone-400 font-light mt-1">※ 匯款完成後，請前往「查詢訂單」提供後五碼以利核對。</p>
              </div>
            )}

            <div className="flex justify-between items-center border-b pb-2.5 border-stone-200/60">
              <span className="text-stone-400">配送方式</span>
              <span className="font-medium text-stone-700">
                {SHIPPING_OPTIONS[completedOrder.shipping.method]?.name}
              </span>
            </div>

            <div className="flex justify-between items-start border-b pb-2.5 border-stone-200/60">
              <span className="text-stone-400 shrink-0 mr-4">收件地址 / 門市</span>
              <span className="font-medium text-stone-700 text-right">{completedOrder.shipping.address}</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-stone-500 tracking-wide">應付總金額</span>
              <span className="text-base font-medium text-[#A6907C]">NT$ {completedOrder.totalAmount}</span>
            </div>
          </div>

          <button 
            onClick={() => { setCompletedOrder(null); setView('store'); }}
            className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3.5 rounded-xl font-medium tracking-widest transition-all shadow-sm text-xs"
          >
            返回首頁繼續選購
          </button>
        </div>
      </div>
    );
  };

  const OrderLookupView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searched, setSearched] = useState(false);

    const [bookingOrderId, setBookingOrderId] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingSlot, setBookingSlot] = useState('13:00-14:00');

    const handleSearch = (e) => {
      e.preventDefault();
      const query = searchQuery.trim();
      if (!query) return;

      const found = orders.filter(order => 
        order.id.toLowerCase() === query.toLowerCase() || 
        order.customer.phone === query
      );
      setSearchResults(found);
      setSearched(true);
    };

    const handleBookingSubmit = (orderId) => {
      if (!bookingDate) {
        alert('請選擇預約日期');
        return;
      }
      handleMakeAppointment(orderId, bookingDate, bookingSlot);
      setBookingOrderId(null);
      setBookingDate('');
      setSearchResults(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: '已約定', appointmentTime: `${bookingDate} ${bookingSlot}` } : o
      ));
    };

    const getStatusBadgeStyle = (status) => {
      switch (status) {
        case '未付款': return 'bg-rose-50 text-rose-600 border-rose-100';
        case '已付款': return 'bg-sky-50 text-sky-600 border-sky-100';
        case '可預約': return 'bg-indigo-50 text-indigo-600 border-indigo-100 font-medium animate-pulse';
        case '已約定': return 'bg-purple-50 text-purple-600 border-purple-100';
        case '已出貨': return 'bg-amber-50 text-amber-600 border-amber-100';
        case '已完成': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        default: return 'bg-stone-50 text-stone-500 border-stone-200';
      }
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-base font-medium tracking-widest text-stone-700 mb-6 flex items-center gap-2">
          <Search className="text-[#A6907C]" size={16} /> 查詢您的訂單
        </h2>

        <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-2 mb-6">
          <input 
            type="text" 
            required
            placeholder="輸入「訂單編號」或「收件人電話」"
            className="flex-grow border-stone-200 rounded-xl p-2.5 bg-stone-50/50 focus:ring-1 focus:ring-[#A6907C] text-xs"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-[#A6907C] hover:bg-[#8e7a68] text-white px-5 py-2.5 rounded-xl text-xs font-medium tracking-wider transition-all flex items-center gap-1 shrink-0">
            搜尋
          </button>
        </form>

        {searched && (
          <div className="space-y-4">
            <h3 className="text-xs text-stone-400 tracking-wider">搜尋結果 ({searchResults.length} 筆)</h3>
            
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center text-stone-400 text-xs tracking-wide">
                沒有找到符合的訂單資訊，請確認輸入是否正確。
              </div>
            ) : (
              searchResults.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-100 shadow-sm space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3 border-stone-100">
                    <div>
                      <span className="text-[10px] text-stone-400 font-light">訂單時間: {order.date}</span>
                      <h4 className="font-medium text-stone-800 text-xs tracking-wide mt-0.5">訂單編號: {order.id}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs font-light text-stone-600">
                    <div>
                      <p className="text-stone-400 text-[11px] mb-1.5">📦 購買商品與規格：</p>
                      <ul className="space-y-1.5 bg-stone-50/50 p-3 rounded-xl border border-stone-100/60 text-[11px]">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-start">
                            <span className="text-stone-700 truncate">{item.name} <span className="text-stone-400 text-[9px]">({item.spec})</span></span>
                            <span className="font-medium text-stone-500 shrink-0 ml-2">x {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <p><span className="text-stone-400">收件姓名：</span>{order.customer.name}</p>
                      <p><span className="text-stone-400">聯絡電話：</span>{order.customer.phone}</p>
                      <p><span className="text-stone-400">配送方式：</span>{SHIPPING_OPTIONS[order.shipping.method]?.name}</p>
                      <p><span className="text-stone-400">收件地址 / 門市：</span>{order.shipping.address}</p>
                      <p><span className="text-stone-400">付款方式：</span>{order.paymentMethod}</p>
                      <p className="pt-1"><span className="text-stone-400">總付金額：</span><span className="font-medium text-[#A6907C]">NT$ {order.totalAmount}</span></p>
                      
                      {order.appointmentTime && (
                        <p className="mt-2 bg-[#FAF6F0] px-3 py-1.5 rounded-xl border border-[#D3C4B7]/40 text-[#8e7a68] font-medium inline-flex items-center gap-1">
                          📅 已約定取貨時間：{order.appointmentTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {order.status === '可預約' && (order.shipping.method === 'meetup' || order.shipping.method === 'store') && (
                    <div className="mt-2 pt-3 border-t border-dashed border-stone-200/60">
                      {bookingOrderId !== order.id ? (
                        <button 
                          onClick={() => setBookingOrderId(order.id)}
                          className="bg-stone-800 hover:bg-stone-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Calendar size={13} /> 進行線上取貨預約
                        </button>
                      ) : (
                        <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 space-y-3">
                          <h5 className="font-medium text-stone-700 text-xs flex items-center gap-1.5">
                            <Calendar size={13} /> 線上面交/到店取貨時間預約
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-stone-400 mb-1">預約日期</label>
                              <input 
                                type="date" required
                                className="w-full text-xs border-stone-200 rounded-lg p-1.5 bg-white focus:ring-1 focus:ring-[#A6907C]"
                                value={bookingDate}
                                onChange={e => setBookingDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 mb-1">時間時段</label>
                              <select 
                                className="w-full text-xs border-stone-200 rounded-lg p-1.5 bg-white focus:ring-1 focus:ring-[#A6907C]"
                                value={bookingSlot}
                                onChange={e => setBookingSlot(e.target.value)}
                              >
                                <option value="11:00-12:00">11:00 - 12:00</option>
                                <option value="13:00-14:00">13:00 - 14:00</option>
                                <option value="14:00-15:00">14:00 - 15:00</option>
                                <option value="15:00-16:00">15:00 - 16:00</option>
                                <option value="16:00-17:00">16:00 - 17:00</option>
                                <option value="17:00-18:00">17:00 - 18:00</option>
                                <option value="19:00-20:00">19:00 - 20:00 (限面交)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button 
                              onClick={() => handleBookingSubmit(order.id)}
                              className="bg-[#A6907C] hover:bg-[#8e7a68] text-white font-medium py-1.5 px-3 rounded-lg text-xs"
                            >
                              確認預約
                            </button>
                            <button 
                              onClick={() => setBookingOrderId(null)}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-500 py-1.5 px-3 rounded-lg text-xs"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const AdminView = () => {
  const [passwordInput, setPasswordInput] = useState('');
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-sm mx-auto py-20 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-bold mb-4">請輸入後台密碼</h2>
          <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full border p-2 rounded mb-4 text-center" placeholder="輸入 1510" />
          <button onClick={() => passwordInput === '1510' ? setIsAdminLoggedIn(true) : alert('密碼錯誤')} className="w-full bg-[#A6907C] text-white py-2 rounded">登入</button>
        </div>
      </div>
    );
  }

  const [tab, setTab] = useState('orders'); 

  // 加上 image 欄位
  const [newProduct, setNewProduct] = useState({ name: '', price: '', desc: '', detail: '', category: categories[1] || '', image: '' });
    const [spec1Name, setSpec1Name] = useState('');
    const [spec1Options, setSpec1Options] = useState('');
    const [spec2Name, setSpec2Name] = useState('');
    const [spec2Options, setSpec2Options] = useState('');

    const [newCategory, setNewCategory] = useState('');

    const handleAddProduct = (e) => {
      e.preventDefault();
      const specsArray = [];
      if (spec1Name.trim() && spec1Options.trim()) {
        specsArray.push({
          name: spec1Name.trim(),
          options: spec1Options.split(',').map(s => s.trim()).filter(Boolean)
        });
      }
      if (spec2Name.trim() && spec2Options.trim()) {
        specsArray.push({
          name: spec2Name.trim(),
          options: spec2Options.split(',').map(s => s.trim()).filter(Boolean)
        });
      }

      const productToAdd = {
    id: Date.now(),
    name: newProduct.name,
    price: parseInt(newProduct.price),
    desc: newProduct.desc,
    detail: newProduct.detail || newProduct.desc,
    category: newProduct.category || '未分類',
    specs: specsArray,
    stock: 10,
    image: newProduct.image // 儲存網址
  };
      setProducts([productToAdd, ...products]);
      setNewProduct({ name: '', price: '', desc: '', detail: '', category: categories[1] || '' });
      setSpec1Name('');
      setSpec1Options('');
      setSpec2Name('');
      setSpec2Options('');
    };

    const handleDeleteProduct = (id) => {
      setProducts(products.filter(p => p.id !== id));
    };

    const handleAddCategory = (e) => {
      e.preventDefault();
      const val = newCategory.trim();
      if (!val) return;
      if (categories.includes(val)) {
        alert('此分類選單已存在！');
        return;
      }
      setCategories([...categories, val]);
      setNewCategory('');
    };

    const handleDeleteCategory = (catName) => {
      if (catName === '所有商品') {
        alert('預設基礎選單無法刪除！');
        return;
      }
      setCategories(categories.filter(c => c !== catName));
      if (selectedCategory === catName) {
        setSelectedCategory('所有商品');
      }
    };

    const getStatusBadgeStyle = (status) => {
      switch (status) {
        case '未付款': return 'bg-rose-50 text-rose-600 border-rose-100';
        case '已付款': return 'bg-sky-50 text-sky-600 border-sky-100';
        case '可預約': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case '已約定': return 'bg-purple-50 text-purple-600 border-purple-100';
        case '已出貨': return 'bg-amber-50 text-amber-600 border-amber-100';
        case '已完成': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        default: return 'bg-stone-50 text-stone-500 border-stone-200';
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-base font-medium tracking-widest text-stone-700 mb-6 flex items-center gap-2">
          <Settings size={16} className="text-stone-400"/> 後台管理系統
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-6 border-b border-stone-200 pb-2 text-xs sm:text-sm tracking-wide">
          <button className={`font-medium pb-2 px-1 transition-colors ${tab === 'orders' ? 'text-[#A6907C] border-b-2 border-[#A6907C]' : 'text-stone-400 hover:text-stone-700'}`} onClick={() => setTab('orders')}>訂單管理</button>
          <button className={`font-medium pb-2 px-1 transition-colors ${tab === 'products' ? 'text-[#A6907C] border-b-2 border-[#A6907C]' : 'text-stone-400 hover:text-stone-700'}`} onClick={() => setTab('products')}>商品上架管理</button>
          <button className={`font-medium pb-2 px-1 transition-colors ${tab === 'menu' ? 'text-[#A6907C] border-b-2 border-[#A6907C]' : 'text-stone-400 hover:text-stone-700'}`} onClick={() => setTab('menu')}>選單分類管理</button>
        </div>

        {tab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="bg-stone-50/70 text-stone-500 border-b border-stone-100">
                <tr>
                  <th className="p-4 font-medium tracking-wider">訂單編號 / 時間</th>
                  <th className="p-4 font-medium tracking-wider">顧客資訊</th>
                  <th className="p-4 font-medium tracking-wider">物流與地址</th>
                  <th className="p-4 font-medium tracking-wider">商品內容與規格</th>
                  <th className="p-4 font-medium tracking-wider">付款與總額</th>
                  <th className="p-4 font-medium tracking-wider">排程約定時間</th>
                  <th className="p-4 font-medium tracking-wider">切換狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 font-light text-stone-600">
                {orders.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-stone-400 text-xs">尚無訂單，趕快去前台模擬下單吧！</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/50 align-top">
                      <td className="p-4">
                        <div className="font-semibold text-stone-700 font-mono">{order.id}</div>
                        <div className="text-[10px] text-stone-400 font-light mt-1">{order.date}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-stone-700">{order.customer.name}</div>
                        <div className="text-stone-400 mt-0.5">{order.customer.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="inline-block px-2 py-0.5 bg-stone-50 border border-stone-100 rounded-lg text-[10px] text-stone-500 mb-1">
                          {SHIPPING_OPTIONS[order.shipping.method]?.name}
                        </div>
                        <div className="text-stone-400 max-w-[200px] break-all leading-relaxed">{order.shipping.address}</div>
                      </td>
                      <td className="p-4">
                        <ul className="space-y-1 text-[11px] max-w-[240px]">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">
                              • <span className="text-stone-700 font-medium">{item.name}</span> <span className="text-stone-400 text-[10px]">({item.spec})</span> x{item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#A6907C]">NT$ {order.totalAmount}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{order.paymentMethod}</div>
                      </td>
                      <td className="p-4">
                        {order.appointmentTime ? (
                          <div className="bg-[#FAF6F0] text-[#8e7a68] p-1.5 rounded-xl border border-[#D3C4B7]/30 text-[11px] font-medium inline-block">
                            📅 {order.appointmentTime}
                          </div>
                        ) : (
                          <span className="text-stone-400 italic font-light text-[11px]">尚未預約</span>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`border rounded-xl px-2.5 py-1 text-xs font-medium focus:outline-none ${getStatusBadgeStyle(order.status)}`}
                        >
                          {['未付款', '已付款', '可預約', '已約定', '已出貨', '已完成'].map(status => (
                            <option key={status} value={status} className="bg-white text-stone-700 font-normal">
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'products' && (
          <div className="grid lg:grid-cols-3 gap-6 text-xs font-light">
            <div className="lg:col-span-1">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-medium text-stone-700 mb-4 flex items-center gap-1.5 border-b pb-3 tracking-wider"><Plus size={14} className="text-[#A6907C]"/> 新增商品</h3>
                <form onSubmit={handleAddProduct} className="space-y-3"><div>
  <label className="text-[10px] font-medium text-gray-500">商品圖片網址 (URL)</label>
  <input type="url" placeholder="貼上圖片網址" className="w-full border-gray-300 shadow-sm p-2 rounded-md" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
</div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">商品名稱 *</label>
                    <input required className="w-full border-stone-200 rounded-xl p-2 bg-stone-50/50 focus:ring-1 focus:ring-[#A6907C]" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">隸屬分類 *</label>
                    <select 
                      required 
                      className="w-full border-stone-200 rounded-xl p-2 bg-white focus:ring-1 focus:ring-[#A6907C]"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      {categories.filter(c => c !== '所有商品').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">價格 *</label>
                    <input required type="number" className="w-full border-stone-200 rounded-xl p-2 bg-stone-50/50 focus:ring-1 focus:ring-[#A6907C]" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">列表簡介 (短) *</label>
                    <input required className="w-full border-stone-200 rounded-xl p-2 bg-stone-50/50 focus:ring-1 focus:ring-[#A6907C]" value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">詳細介紹 (長)</label>
                    <textarea className="w-full border-stone-200 rounded-xl p-2 bg-stone-50/50 h-16 focus:ring-1 focus:ring-[#A6907C]" value={newProduct.detail} onChange={e => setNewProduct({...newProduct, detail: e.target.value})} />
                  </div>
                  
                  <div className="p-3 bg-stone-50/50 rounded-xl space-y-2 border border-stone-100">
                    <span className="font-medium text-stone-600 block text-[11px]">規格組一 (選填)</span>
                    <input placeholder="規格名稱 (例如: 顏色)" className="w-full border-stone-200 p-2 rounded-lg text-xs" value={spec1Name} onChange={e => setSpec1Name(e.target.value)} />
                    <input placeholder="選項 (以英文逗號分隔: 紅,藍)" className="w-full border-stone-200 p-2 rounded-lg text-xs" value={spec1Options} onChange={e => setSpec1Options(e.target.value)} />
                  </div>

                  <div className="p-3 bg-stone-50/50 rounded-xl space-y-2 border border-stone-100">
                    <span className="font-medium text-stone-600 block text-[11px]">規格組二 (選填)</span>
                    <input placeholder="規格名稱 (例如: 尺寸)" className="w-full border-stone-200 p-2 rounded-lg text-xs" value={spec2Name} onChange={e => setSpec2Name(e.target.value)} />
                    <input placeholder="選項 (以英文逗號分隔: S,M)" className="w-full border-stone-200 p-2 rounded-lg text-xs" value={spec2Options} onChange={e => setSpec2Options(e.target.value)} />
                  </div>

                  <button type="submit" className="w-full bg-stone-800 hover:bg-stone-700 text-white py-2.5 rounded-xl font-medium tracking-widest text-xs transition-colors mt-2">新增上架</button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                 <table className="w-full text-left">
                  <thead className="bg-stone-50/70 text-stone-500 border-b border-stone-100">
                    <tr>
                      <th className="p-4 font-medium tracking-wider w-1/3">商品名稱與分類</th>
                      <th className="p-4 font-medium tracking-wider">價格</th>
                      <th className="p-4 font-medium tracking-wider">規格組合</th>
                      <th className="p-4 font-medium tracking-wider text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 font-light text-stone-600">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-stone-50/30">
                        <td className="p-4">
                          <div className="font-medium text-stone-700">{product.name}</div>
                          <div className="mt-1">
                            <span className="text-[10px] bg-stone-50 text-stone-500 border border-stone-100 px-2 py-0.5 rounded-full">{product.category}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[#A6907C] font-medium">NT$ {product.price}</td>
                        <td className="p-4 text-[10px] text-stone-400">
                           {product.specs && product.specs.length > 0 ? (
                             <div className="space-y-1">
                               {product.specs.map((group, gIdx) => (
                                 <div key={gIdx}>
                                   <span className="text-stone-500">{group.name}:</span>{' '}
                                   {group.options.map(s => (
                                     <span key={s} className="inline-block bg-stone-50 border border-stone-100 text-stone-600 px-1.5 py-0.5 rounded-md mr-1 text-[9px]">{s}</span>
                                   ))}
                                 </div>
                               ))}
                             </div>
                           ) : '無規格'}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-stone-300 hover:text-red-400 p-2 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'menu' && (
          <div className="grid md:grid-cols-3 gap-6 text-xs font-light">
            <div className="md:col-span-1">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-medium text-stone-700 mb-4 flex items-center gap-1.5 border-b pb-3 tracking-wider">
                  <Plus size={14} /> 新增分類項目
                </h3>
                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">分類選單名稱</label>
                    <input 
                      required type="text"
                      placeholder="例如: 精選耳環" 
                      className="w-full border-stone-200 rounded-xl p-2.5 bg-stone-50/50 focus:ring-1 focus:ring-[#A6907C] text-xs" 
                      value={newCategory} 
                      onChange={e => setNewCategory(e.target.value)} 
                    />
                  </div>
                  <button type="submit" className="w-full bg-stone-800 hover:bg-stone-700 text-white py-2.5 rounded-xl font-medium text-xs tracking-widest transition-colors">
                    確定新增
                  </button>
                </form>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50/70 text-stone-500 border-b border-stone-100">
                    <tr>
                      <th className="p-4 font-medium tracking-wider">前台側邊選單項目</th>
                      <th className="p-4 font-medium tracking-wider text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 text-stone-600">
                    {categories.map(cat => (
                      <tr key={cat} className="hover:bg-stone-50/30">
                        <td className="p-4 text-stone-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#D3C4B7] rounded-full inline-block"></span>
                          {cat}
                        </td>
                        <td className="p-4 text-right">
                          {cat === '所有商品' ? (
                            <span className="text-[10px] text-stone-400 italic font-light">系統基本項目</span>
                          ) : (
                            <button onClick={() => handleDeleteCategory(cat)} className="text-stone-300 hover:text-red-400 p-2 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredProducts = selectedCategory === '所有商品' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 pb-12 selection:bg-[#D3C4B7] selection:text-white">
      <Navbar />
      
      {view === 'store' && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-light text-stone-800 tracking-widest mb-2">春季新品特輯</h2>
            <p className="text-xs sm:text-sm text-stone-400 tracking-wider">為日常點綴恰到好處的溫柔微光。</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* 電腦版左側選單 */}
            <aside className="hidden md:block w-44 shrink-0 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm sticky top-24">
              <h4 className="font-medium text-stone-700 text-xs mb-3 px-2 flex items-center gap-1.5 tracking-wider">
                <Menu size={13} className="text-[#A6907C]" /> 商品分類
              </h4>
              <div className="flex flex-col gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs tracking-wide transition-all flex items-center justify-between ${selectedCategory === cat ? 'bg-[#FAF6F0] text-[#A6907C] font-medium' : 'text-stone-500 hover:bg-stone-50/50'}`}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={12} className={`transition-opacity ${selectedCategory === cat ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>
            </aside>

            {/* 手機版滑動選單 */}
            <div className="md:hidden w-full overflow-x-auto whitespace-nowrap pb-2 flex gap-2 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-block px-4 py-1.5 rounded-full text-xs tracking-wide border transition-all ${selectedCategory === cat ? 'bg-[#A6907C] border-[#A6907C] text-white shadow-sm' : 'bg-white border-stone-200 text-stone-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 右側商品列表 */}
            <div className="flex-grow w-full">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-stone-100 text-center text-stone-400 text-xs tracking-wider">
                  此分類中目前尚無商品。
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {view === 'productDetail' && <ProductDetailView />}
      {view === 'checkout' && <CheckoutView />}
      {view === 'payment' && <PaymentView />}
      {view === 'success' && <OrderSuccessView />}
      {view === 'admin' && <AdminView />}
      {view === 'lookup' && <OrderLookupView />}

      <CartDrawer />
    </div>
  );
}