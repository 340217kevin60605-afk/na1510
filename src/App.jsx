import React, { useState } from 'react';
import { ShoppingCart, Store, Settings, X, Plus, Trash2, Check, Package, CreditCard, ArrowLeft, Truck, Wallet, Banknote, ClipboardCheck, Calendar, Search, Menu, ChevronRight } from 'lucide-react';

// --- 預設商品資料 (加入分類標籤) ---
const initialProducts = [
  { 
    id: 1, 
    name: '極簡流線戒指', 
    price: 490, 
    desc: '日常百搭的簡約設計，採用抗敏材質，適合每天配戴的溫柔點綴。', 
    detail: '這款極簡流線戒指是我們本季最暢銷的單品。採用 925 純銀鍍 14K 金打造，獨特的流線設計能修飾手指線條。抗敏材質讓您每天配戴也能保持舒適，無論是單獨配戴或是與其他戒指疊搭都非常適合。',
    category: '飾品配件',
    specs: [
      { name: '顏色', options: ['香檳金', '玫瑰銀'] },
      { name: '尺寸', options: ['國際圍 10', '國際圍 12', '國際圍 14'] }
    ], 
    stock: 10, 
    iconType: 'ring' 
  },
  { 
    id: 2, 
    name: '奶油皮革小方包', 
    price: 1280, 
    desc: '柔軟觸感的高級素食皮革，容量適中，適合約會或日常通勤。', 
    detail: '採用觸感極佳的高級素食皮革製作，外觀呈現溫潤的奶油色調。內部空間經過精心設計，足以容納您的手機、短夾、鑰匙與補妝用品。附有可調式背帶，可肩背也可斜背。',
    category: '包袋皮件',
    specs: [
      { name: '顏色', options: ['奶油白', '焦糖棕'] },
      { name: '背帶種類', options: ['常規皮革細帶', '設計編織寬帶'] }
    ], 
    stock: 5, 
    iconType: 'bag' 
  },
  { 
    id: 3, 
    name: '木質調淡香水', 
    price: 850, 
    desc: '沉穩的雪松與檀香，散發自然不刺鼻的舒適氣息。', 
    detail: '前調帶有淡淡的柑橘清香，隨後轉為沉穩的雪松與溫暖的檀香。這款淡香水特別適合喜歡中性香氣、不愛甜膩花果香的您。持香時間約 4-6 小時，為您帶來一整天的安定感。',
    category: '質感香氛',
    specs: [
      { name: '容量', options: ['30ml', '50ml'] },
      { name: '包裝禮盒', options: ['極簡牛皮紙盒', '精緻緞帶提袋'] }
    ], 
    stock: 20, 
    iconType: 'perfume' 
  },
];

// --- 預設分類選單項目 ---
const initialCategories = ['所有商品', '飾品配件', '包袋皮件', '質感香氛'];

// --- 運費與物流設定 ---
const SHIPPING_OPTIONS = {
  '711': { name: '7-11 門市取貨', fee: 40, desc: '請填寫門市名稱與地址' },
  'meetup': { name: '面交', fee: 10, desc: '限北北基地區' },
  'store': { name: '到店取貨', fee: 0, desc: '三重水漾路一段39號（近三重捷運站）' }
};

// --- 商品插圖元件 (SVG) ---
const ProductGraphic = ({ type }) => {
  const baseClasses = "w-full h-full flex items-center justify-center bg-[#F5EFE6] text-[#A6907C]";
  if (type === 'ring') {
    return (
      <div className={baseClasses}>
        <svg width="30%" height="30%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="14" r="6" />
          <path d="M10 8L12 4L14 8" />
        </svg>
      </div>
    );
  } else if (type === 'bag') {
    return (
      <div className={baseClasses}>
        <svg width="30%" height="30%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
    );
  } else {
    return (
      <div className={baseClasses}>
        <svg width="30%" height="30%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('所有商品');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // --- 購物車功能 ---
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

  const finalizeOrder = (paymentMethod) => {
    const newOrder = {
      id: `ORD${Math.floor(Math.random() * 89999 + 10000)}`,
      date: new Date().toLocaleString(),
      ...pendingOrder,
      paymentMethod,
      status: '未付款',
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
      order.id === orderId ? { ...order, status: '已預約', appointmentTime: formattedTime } : order
    ));
    alert(`預約成功！時間為：${formattedTime}\n您的訂單狀態已更新為「已預約」`);
  };

  const Navbar = () => (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#4A4A4A] flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedCategory('所有商品'); setView('store'); }}>
          <Package className="text-[#D3C4B7]" />
          NA shop151
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setView('lookup')} className={`text-xs sm:text-sm flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${view === 'lookup' ? 'bg-[#F5EFE6] text-[#A6907C] font-semibold' : 'text-gray-600 hover:text-black'}`}>
            <Search size={16} /> 查詢訂單
          </button>

          {view === 'admin' ? (
            <button onClick={() => setView('store')} className="text-xs sm:text-sm flex items-center gap-1 text-gray-600 hover:text-black px-2.5 py-1.5">
              <Store size={16} /> 前台商店
            </button>
          ) : (
            <button onClick={() => setView('admin')} className="text-xs sm:text-sm flex items-center gap-1 text-gray-600 hover:text-black px-2.5 py-1.5">
              <Settings size={16} /> 後台管理
            </button>
          )}
          
          {view !== 'admin' && (
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:text-black">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#D3C4B7] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
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

    const handleQuickAdd = () => {
      const specString = Object.entries(selectedSpecs)
        .map(([name, val]) => `${name}: ${val}`)
        .join(' / ');
      addToCart(product, specString, qty);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-all">
        <div className="cursor-pointer" onClick={() => { setSelectedProduct(product); setView('productDetail'); }}>
          <div className="aspect-square w-full overflow-hidden bg-gray-50 relative group">
            <ProductGraphic type={product.iconType} />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="bg-white/90 text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">查看詳情</span>
            </div>
          </div>
          <div className="p-3 md:p-4 pb-1">
            <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
            <div className="text-xs md:text-sm font-bold text-[#A6907C] mb-2">NT$ {product.price}</div>
          </div>
        </div>
        
        <div className="px-3 md:px-4 pb-3 md:pb-4 mt-auto">
          <div className="space-y-2 mb-3 border-t border-gray-50 pt-2 text-[11px] md:text-xs">
            {product.specs && product.specs.length > 0 && product.specs.map((specGroup, sIdx) => (
              <div key={sIdx} className="flex items-center gap-1.5">
                <span className="text-gray-400 shrink-0">{specGroup.name}</span>
                <select 
                  className="w-full text-[11px] border-gray-200 rounded p-0.5 bg-gray-50 focus:ring-[#D3C4B7] focus:border-[#D3C4B7]"
                  value={selectedSpecs[specGroup.name] || ''}
                  onChange={(e) => setSelectedSpecs(prev => ({ ...prev, [specGroup.name]: e.target.value }))}
                >
                  {specGroup.options.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 shrink-0">數量</span>
              <input 
                type="number" 
                min="1" max={product.stock}
                className="w-full text-[11px] border-gray-200 rounded p-0.5 bg-gray-50 focus:ring-[#D3C4B7] focus:border-[#D3C4B7]"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <button 
            onClick={handleQuickAdd}
            className="w-full bg-[#D3C4B7] hover:bg-[#C2B2A5] text-white py-1.5 rounded font-medium transition-colors text-xs"
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
      selectedProduct.specs?.forEach(specGroup => {
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
        <button onClick={() => setView('store')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors text-sm">
          <ArrowLeft size={18} /> 返回商品列表
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 aspect-square bg-gray-50">
            <ProductGraphic type={selectedProduct.iconType} />
          </div>
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            <span className="text-xs font-bold text-[#A6907C] uppercase tracking-wider mb-2 bg-[#F5EFE6] px-2.5 py-1 rounded self-start">{selectedProduct.category || '一般商品'}</span>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h2>
            <div className="text-lg md:text-xl font-bold text-[#A6907C] mb-6">NT$ {selectedProduct.price}</div>
            
            <div className="mb-8">
              <h4 className="font-medium text-gray-800 mb-2 text-sm">商品詳細介紹</h4>
              <p className="text-gray-600 leading-relaxed text-xs md:text-sm whitespace-pre-line">
                {selectedProduct.detail || selectedProduct.desc}
              </p>
            </div>

            <div className="mt-auto space-y-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
              {selectedProduct.specs && selectedProduct.specs.length > 0 && selectedProduct.specs.map((specGroup, sIdx) => (
                <div key={sIdx}>
                  <label className="block text-xs font-medium text-gray-700 mb-2">選擇{specGroup.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {specGroup.options.map(s => (
                      <button 
                        key={s}
                        onClick={() => setSelectedSpecs(prev => ({ ...prev, [specGroup.name]: s }))}
                        className={`px-3 py-1 border rounded text-xs font-medium transition-colors ${selectedSpecs[specGroup.name] === s ? 'border-[#A6907C] bg-[#A6907C] text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">購買數量</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" min="1" max={selectedProduct.stock}
                    className="w-24 border-gray-300 rounded shadow-sm p-1 bg-white text-xs text-center"
                    value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  />
                  <span className="text-xs text-gray-400">庫存餘額: {selectedProduct.stock}</span>
                </div>
              </div>

              <button 
                onClick={handleDetailAdd}
                className="w-full bg-[#4A4A4A] hover:bg-black text-white py-3 rounded-lg font-bold transition-colors shadow-sm flex items-center justify-center gap-2 text-xs md:text-sm"
              >
                <ShoppingCart size={16} /> 加入購物車
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartDrawer = () => (
    <>
      {isCartOpen && <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-4 border-b flex justify-between items-center bg-[#FAF7F2]">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={18}/> 購物車清單
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black bg-white rounded-full p-1 shadow-sm">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingCart size={40} strokeWidth={1.5} />
              <p className="text-xs">購物車空空如也，快去選購吧！</p>
              <button onClick={() => { setIsCartOpen(false); setView('store'); }} className="text-[#A6907C] underline text-xs mt-2">去逛逛</button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                  <ProductGraphic type={item.iconType} />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 truncate">{item.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-1 bg-gray-100 inline-block px-1.5 py-0.5 rounded max-w-full truncate">{item.spec}</p>
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-xs font-medium text-[#A6907C]">NT$ {item.price}</p>
                    <p className="text-[10px] text-gray-400">x {item.quantity}</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(index)} className="text-gray-300 hover:text-red-500 p-1.5 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-600 font-medium">小計 (不含運費)</span>
              <span className="text-lg font-bold text-[#A6907C]">NT$ {cartTotal}</span>
            </div>
            <button 
              onClick={() => { setIsCartOpen(false); setView('checkout'); }}
              className="w-full bg-[#A6907C] hover:bg-[#8e7a68] text-white py-3 rounded-lg font-bold transition-colors shadow-md text-xs md:text-sm"
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
        <button onClick={() => setView('store')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-xs md:text-sm">
          <ArrowLeft size={16} /> 繼續選購
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
              <Truck size={18} className="text-[#D3C4B7]"/> 運送資訊
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">收件人姓名 *</label>
                  <input required type="text" className="w-full border-gray-300 rounded-md p-2 bg-gray-50 focus:ring-[#A6907C] focus:border-[#A6907C] text-xs" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">聯絡電話 *</label>
                  <input required type="tel" className="w-full border-gray-300 rounded-md p-2 bg-gray-50 focus:ring-[#A6907C] focus:border-[#A6907C] text-xs" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">選擇運送方式 *</label>
                <div className="space-y-3">
                  {Object.entries(SHIPPING_OPTIONS).map(([key, opt]) => (
                    <label key={key} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${shippingMethod === key ? 'border-[#A6907C] bg-[#F5EFE6]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" name="shipping" value={key} 
                          checked={shippingMethod === key} 
                          onChange={(e) => { setShippingMethod(e.target.value); setAddress(''); }}
                          className="text-[#A6907C] focus:ring-[#A6907C]"
                        />
                        <div>
                          <div className="font-semibold text-gray-800 text-xs">{opt.name}</div>
                          <div className="text-[10px] text-gray-500">{opt.desc}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-700 text-xs">{opt.fee === 0 ? '免運' : `+ NT$ ${opt.fee}`}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {shippingMethod === '711' ? '7-11 門市名稱與地址 *' : shippingMethod === 'meetup' ? '面交聯絡地點 (限北北基地區) *' : '取貨地點'}
                </label>
                {shippingMethod === 'store' ? (
                  <input disabled type="text" className="w-full border-gray-200 rounded-md p-2.5 bg-gray-100 text-gray-600 cursor-not-allowed text-xs" value={SHIPPING_OPTIONS['store'].desc} />
                ) : (
                  <input 
                    required type="text" 
                    placeholder={shippingMethod === '711' ? '例：7-11 信義門市 (台北市信義區信義路XX號)' : '例：台北市中山捷運站3號出口旁'}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2.5 bg-white focus:ring-[#A6907C] focus:border-[#A6907C] text-xs" 
                    value={address} onChange={e => setAddress(e.target.value)} 
                  />
                )}
              </div>

              <button type="submit" className="w-full bg-[#4A4A4A] hover:bg-black text-white py-3.5 rounded-lg font-bold mt-6 shadow-md transition-all text-xs">
                下一步：選擇付款方式
              </button>
            </form>
          </div>
          
          <div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-24">
               <h3 className="text-sm font-bold mb-6 border-b border-gray-200 pb-3 text-gray-800">訂單摘要</h3>
               
               <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded bg-white border border-gray-100 flex-shrink-0">
                          <ProductGraphic type={item.iconType}/>
                        </div>
                        <div className="min-w-0">
                          <div className="text-gray-800 font-medium truncate">{item.name}</div>
                          <div className="text-gray-500 text-[10px] mt-0.5 truncate">{item.spec}</div>
                          <div className="text-gray-400 text-[10px]">數量: {item.quantity}</div>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-700 shrink-0">NT$ {item.price * item.quantity}</span>
                    </div>
                  ))}
               </div>
               
               <div className="border-t border-gray-200 pt-4 space-y-3">
                 <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>商品小計</span>
                    <span>NT$ {cartTotal}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>運費 ({SHIPPING_OPTIONS[shippingMethod].name})</span>
                    <span>NT$ {shippingFee}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2">
                    <span className="font-bold text-gray-800 text-sm">總結帳金額</span>
                    <span className="text-lg font-bold text-[#A6907C]">NT$ {finalTotal}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentView = () => {
    if (!pendingOrder) return null;

    const paymentMethods = [
      { id: 'cod', name: '貨到付款', icon: <Truck size={20} />, desc: '商品送達時以現金支付' },
      { id: 'bank', name: '銀行匯款', icon: <Banknote size={20} />, desc: '透過轉帳或匯款完成支付，後續提供後五碼核對' },
      { id: 'ecpay', name: '綠界科技 Ecpay', icon: <CreditCard size={20} />, desc: '安全金流，支援信用卡、ATM、超商代碼付款' }
    ];

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#D3C4B7] text-white rounded-full mb-4">
            <Wallet size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">最後一步：選擇付款方式</h2>
          <p className="text-xs text-gray-500 mt-2">您的應付總金額為 <span className="font-bold text-[#A6907C] text-sm md:text-base">NT$ {pendingOrder.totalAmount}</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <button 
                key={method.id}
                onClick={() => finalizeOrder(method.name)}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#A6907C] hover:bg-[#F5EFE6] transition-all text-left group"
              >
                <div className="text-gray-400 group-hover:text-[#A6907C] bg-gray-50 group-hover:bg-white p-2.5 rounded-lg transition-colors">
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{method.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{method.desc}</p>
                </div>
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setView('checkout')}
            className="w-full mt-6 text-gray-500 hover:text-gray-800 text-xs py-2 text-center"
          >
            返回修改訂單資訊
          </button>
        </div>
      </div>
    );
  };

  const OrderSuccessView = () => {
    if (!completedOrder) return null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full mb-6">
            <ClipboardCheck size={28} />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">訂單建立成功！</h2>
          <p className="text-xs text-gray-500 mb-8">感謝您的購買！您可以複製下方的訂單編號，方便隨時回到本站查詢進度。</p>

          <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 mb-8">
            <div className="flex justify-between items-center text-xs border-b pb-3 border-gray-200">
              <span className="text-gray-500">訂單編號</span>
              <span className="font-bold text-gray-800 select-all bg-white px-2 py-1 rounded border">{completedOrder.id}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-b pb-3 border-gray-200">
              <span className="text-gray-500">當前狀態</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                {completedOrder.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs border-b pb-3 border-gray-200">
              <span className="text-gray-500">付款方式</span>
              <span className="font-medium text-gray-800">{completedOrder.paymentMethod}</span>
            </div>

            {completedOrder.paymentMethod === '銀行匯款' && (
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#D3C4B7]/30 space-y-2 text-xs text-[#8e7a68]">
                <p className="font-bold">🏦 匯款帳戶資訊：</p>
                <p>銀行代碼：NA銀行 (822)</p>
                <p>匯款帳號：123-456789-012</p>
                <p>戶名：NA shop151工作室</p>
                <p className="text-[10px] text-gray-400 mt-1">※ 匯款完成後，請前往「查詢訂單」提供後五碼以利核對。</p>
              </div>
            )}

            <div className="flex justify-between items-center text-xs border-b pb-3 border-gray-200">
              <span className="text-gray-500">配送方式</span>
              <span className="font-medium text-gray-800">
                {SHIPPING_OPTIONS[completedOrder.shipping.method]?.name}
              </span>
            </div>

            <div className="flex justify-between items-start text-xs border-b pb-3 border-gray-200">
              <span className="text-gray-500 shrink-0 mr-4">收件地址 / 門市</span>
              <span className="font-medium text-gray-800 text-right">{completedOrder.shipping.address}</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-gray-500 font-semibold">應付總金額</span>
              <span className="text-lg font-bold text-[#A6907C]">NT$ {completedOrder.totalAmount}</span>
            </div>
          </div>

          <button 
            onClick={() => { setCompletedOrder(null); setView('store'); }}
            className="w-full bg-[#A6907C] hover:bg-[#8e7a68] text-white py-3.5 rounded-xl font-bold transition-all shadow-md text-xs"
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
        o.id === orderId ? { ...o, status: '已預約', appointmentTime: `${bookingDate} ${bookingSlot}` } : o
      ));
    };

    const getStatusBadgeStyle = (status) => {
      switch (status) {
        case '未付款': return 'bg-rose-50 text-rose-700 border-rose-200';
        case '已付款': return 'bg-sky-50 text-sky-700 border-sky-200';
        case '可預約': return 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse';
        case '已預約': return 'bg-purple-50 text-purple-700 border-purple-200';
        case '已出貨': return 'bg-amber-50 text-amber-700 border-amber-200';
        case '已完成': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Search className="text-[#A6907C]" size={20} /> 查詢您的訂單
        </h2>

        <form onSubmit={handleSearch} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-2 mb-8">
          <input 
            type="text" 
            required
            placeholder="請輸入「訂單編號」或「收件人電話號碼」"
            className="flex-grow border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-[#A6907C] focus:border-[#A6907C] text-xs md:text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-[#A6907C] hover:bg-[#8e7a68] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0">
            <Search size={14} /> 搜尋
          </button>
        </form>

        {searched && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-700 text-sm">搜尋結果 ({searchResults.length} 筆)</h3>
            
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 text-xs">
                沒有找到符合的訂單資訊，請確認輸入是否正確。
              </div>
            ) : (
              searchResults.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
                    <div>
                      <span className="text-[10px] text-gray-400">訂單時間: {order.date}</span>
                      <h4 className="font-bold text-gray-800 text-sm mt-1">訂單編號: {order.id}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-gray-700 mb-1">📦 寄送商品與規格：</p>
                      <ul className="space-y-1 bg-gray-50 p-3 rounded-lg text-gray-600">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{item.name} <span className="text-gray-400 text-[10px]">({item.spec})</span></span>
                            <span className="font-medium shrink-0">x {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5 text-gray-600">
                      <p><strong className="text-gray-700">收件姓名：</strong>{order.customer.name}</p>
                      <p><strong className="text-gray-700">聯絡電話：</strong>{order.customer.phone}</p>
                      <p><strong className="text-gray-700">配送方式：</strong>{SHIPPING_OPTIONS[order.shipping.method]?.name}</p>
                      <p><strong className="text-gray-700">配送地址 / 門市：</strong>{order.shipping.address}</p>
                      <p><strong className="text-gray-700">付款方式：</strong>{order.paymentMethod}</p>
                      <p><strong className="text-gray-700">總付金額：</strong><span className="font-bold text-[#A6907C]">NT$ {order.totalAmount}</span></p>
                      
                      {order.appointmentTime && (
                        <p className="mt-2 bg-[#F5EFE6] px-3 py-1.5 rounded-lg border border-[#D3C4B7] text-[#8e7a68] font-bold inline-flex items-center gap-1">
                          📅 已約定時間：{order.appointmentTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {order.status === '可預約' && (order.shipping.method === 'meetup' || order.shipping.method === 'store') && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                      {bookingOrderId !== order.id ? (
                        <button 
                          onClick={() => setBookingOrderId(order.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm animate-bounce"
                        >
                          <Calendar size={14} /> 進行預約 (此訂單已可排程面交/取貨)
                        </button>
                      ) : (
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                          <h5 className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                            <Calendar size={14} /> 線上面交/取貨時間預約
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1">預約日期</label>
                              <input 
                                type="date" 
                                required
                                className="w-full text-xs border-gray-200 rounded p-1.5 bg-white"
                                value={bookingDate}
                                onChange={e => setBookingDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1">時間時段</label>
                              <select 
                                className="w-full text-xs border-gray-200 rounded p-1.5 bg-white"
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

                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleBookingSubmit(order.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded text-xs"
                            >
                              送出預約
                            </button>
                            <button 
                              onClick={() => setBookingOrderId(null)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 px-3 rounded text-xs"
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
    const [tab, setTab] = useState('orders'); 
    const [passwordInput, setPasswordInput] = useState('');
    
    const [newProduct, setNewProduct] = useState({ name: '', price: '', desc: '', detail: '', category: categories[1] || '' });
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
        iconType: 'box'
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

    const handleUpdateStock = (id, newStock) => {
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
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
        case '未付款': return 'bg-rose-50 text-rose-700 border-rose-200';
        case '已付款': return 'bg-sky-50 text-sky-700 border-sky-200';
        case '可預約': return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';
        case '已預約': return 'bg-purple-50 text-purple-700 border-purple-200';
        case '已出貨': return 'bg-amber-50 text-amber-700 border-amber-200';
        case '已完成': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    if (!isAdminAuthenticated) {
      return (
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <Settings className="text-[#A6907C]" /> 後台系統登入
            </h2>
            <input
              type="password"
              placeholder="請輸入後台密碼"
              className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:ring-[#A6907C] focus:border-[#A6907C] mb-4 text-sm text-center tracking-widest"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (passwordInput === '1510') setIsAdminAuthenticated(true);
                  else alert('密碼錯誤！請重新輸入。');
                }
              }}
            />
            <button
              onClick={() => {
                if (passwordInput === '1510') setIsAdminAuthenticated(true);
                else alert('密碼錯誤！請重新輸入。');
              }}
              className="w-full bg-[#4A4A4A] hover:bg-black text-white py-3 rounded-lg font-bold transition-all text-sm"
            >
              登入
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Settings className="text-gray-500"/> 後台管理系統
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-200 pb-2 text-sm">
          <button className={`font-medium pb-2 px-2 transition-colors ${tab === 'orders' ? 'text-[#A6907C] border-b-2 border-[#A6907C]' : 'text-gray-500 hover:text-gray-800'}`} onClick={() => setTab('orders')}>訂單管理</button>
          <button className={`font-medium pb-2 px-2 transition-colors ${tab === 'products' ? 'text-[#A6907C] border-b-2 border-[#A6907C]' : 'text-gray-500 hover:text-gray-800'}`} onClick={() => setTab('products')}>商品上架管理</button>
          <button className={`font-medium pb-2 px-2 transition-colors ${tab === 'menu' ? 'text-[#A6907C] border-b-2 border-[#A6907C]' : 'text-gray-500 hover:text-gray-800'}`} onClick={() => setTab('menu')}>選單分類管理</button>
        </div>

        {tab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-medium">訂單編號 / 時間</th>
                  <th className="p-4 font-medium">顧客資訊</th>
                  <th className="p-4 font-medium">物流與地址</th>
                  <th className="p-4 font-medium">商品內容與規格</th>
                  <th className="p-4 font-medium">付款與總額</th>
                  <th className="p-4 font-medium">排程預約時間</th>
                  <th className="p-4 font-medium">切換狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500 text-xs">尚無訂單，趕快去前台模擬下單吧！</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 align-top">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{order.id}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{order.date}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{order.customer.name}</div>
                        <div className="text-gray-500 mt-0.5">{order.customer.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600 mb-1">
                          {SHIPPING_OPTIONS[order.shipping.method]?.name || '未知'} (運費 {order.shipping.fee})
                        </div>
                        <div className="text-gray-500 max-w-[200px] break-all" title={order.shipping.address}>{order.shipping.address}</div>
                      </td>
                      <td className="p-4">
                        <ul className="space-y-1 text-gray-600 max-w-[250px]">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex gap-1 items-start">
                              <span className="flex-shrink-0">•</span> 
                              <span>
                                <strong className="text-gray-800">{item.name}</strong> 
                                <br/>
                                <span className="text-gray-400 text-[10px]">規格: {item.spec}</span>
                                <span className="text-gray-500 ml-1 text-[10px]">x{item.quantity}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#A6907C]">NT$ {order.totalAmount}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{order.paymentMethod}</div>
                      </td>
                      <td className="p-4">
                        {order.appointmentTime ? (
                          <div className="bg-[#FAF7F2] text-[#8e7a68] p-1.5 rounded border border-[#D3C4B7]/30 font-semibold flex items-center gap-1">
                            📅 {order.appointmentTime}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">尚未進行預約</span>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`border rounded-full px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-[#A6907C] ${getStatusBadgeStyle(order.status)}`}
                        >
                          {['未付款', '已付款', '可預約', '已預約', '已出貨', '已完成'].map(status => (
                            <option key={status} value={status} className="bg-white text-gray-800 font-normal">
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
          <div className="grid lg:grid-cols-3 gap-8 text-xs">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800 border-b pb-3"><Plus size={16} className="text-[#A6907C]"/> 新增商品</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500">商品名稱 *</label>
                    <input required className="w-full border-gray-300 shadow-sm p-2 rounded-md focus:ring-[#A6907C] focus:border-[#A6907C]" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500">隸屬分類 *</label>
                    <select 
                      required 
                      className="w-full border-gray-300 shadow-sm p-2 rounded-md focus:ring-[#A6907C] focus:border-[#A6907C]"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      {categories.filter(c => c !== '所有商品').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500">價格 *</label>
                    <input required type="number" className="w-full border-gray-300 shadow-sm p-2 rounded-md focus:ring-[#A6907C] focus:border-[#A6907C]" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500">列表簡介 (短) *</label>
                    <input required className="w-full border-gray-300 shadow-sm p-2 rounded-md focus:ring-[#A6907C] focus:border-[#A6907C]" value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500">詳細介紹 (長)</label>
                    <textarea className="w-full border-gray-300 shadow-sm p-2 rounded-md h-20 focus:ring-[#A6907C] focus:border-[#A6907C]" value={newProduct.detail} onChange={e => setNewProduct({...newProduct, detail: e.target.value})} />
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                    <span className="font-bold text-gray-700 block">規格組一 (選填)</span>
                    <input placeholder="規格名稱 (例如: 顏色)" className="w-full border-gray-300 p-1.5 rounded-md text-xs" value={spec1Name} onChange={e => setSpec1Name(e.target.value)} />
                    <input placeholder="選項 (用英文逗號分隔，例如: 紅,藍)" className="w-full border-gray-300 p-1.5 rounded-md text-xs" value={spec1Options} onChange={e => setSpec1Options(e.target.value)} />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                    <span className="font-bold text-gray-700 block">規格組二 (選填)</span>
                    <input placeholder="規格名稱 (例如: 尺寸)" className="w-full border-gray-300 p-1.5 rounded-md text-xs" value={spec2Name} onChange={e => setSpec2Name(e.target.value)} />
                    <input placeholder="選項 (用英文逗號分隔，例如: S,M)" className="w-full border-gray-300 p-1.5 rounded-md text-xs" value={spec2Options} onChange={e => setSpec2Options(e.target.value)} />
                  </div>

                  <button type="submit" className="w-full bg-[#4A4A4A] hover:bg-black text-white py-2.5 rounded-md font-medium transition-colors text-xs">新增上架</button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-medium w-1/3">商品名稱與分類</th>
                      <th className="p-4 font-medium">價格 / 庫存管理</th>
                      <th className="p-4 font-medium">規格組合</th>
                      <th className="p-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{product.name}</div>
                          <div className="flex gap-1.5 mt-1.5">
                            <span className="text-[10px] bg-[#FAF7F2] text-[#A6907C] border border-[#D3C4B7]/40 px-1.5 py-0.5 rounded">{product.category}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-[#A6907C] font-semibold mb-2">NT$ {product.price}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">庫存:</span>
                            <input 
                              type="number" 
                              min="0"
                              className="w-16 border-gray-300 rounded p-1 text-xs bg-white focus:ring-[#A6907C] focus:border-[#A6907C]"
                              value={product.stock}
                              onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </td>
                        <td className="p-4 text-[10px] text-gray-500">
                           {product.specs && product.specs.length > 0 ? (
                             <div className="space-y-1">
                               {product.specs.map((group, gIdx) => (
                                 <div key={gIdx}>
                                   <strong className="text-gray-600">{group.name}:</strong>{' '}
                                   {group.options.map(s => (
                                     <span key={s} className="inline-block bg-gray-100 px-1.5 py-0.5 rounded mr-1 mb-1 text-[9px]">{s}</span>
                                   ))}
                                 </div>
                               ))}
                             </div>
                           ) : '無規格設定'}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                            <Trash2 size={16} />
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
          <div className="grid md:grid-cols-3 gap-8 text-xs">
            <div className="md:col-span-1">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800 border-b pb-3">
                  <Plus size={16} /> 新增分類選單
                </h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 block mb-1">分類選單名稱</label>
                    <input 
                      required 
                      type="text"
                      placeholder="例如: 鞋履特輯" 
                      className="w-full border-gray-300 shadow-sm p-2 rounded-md focus:ring-[#A6907C] focus:border-[#A6907C] text-xs" 
                      value={newCategory} 
                      onChange={e => setNewCategory(e.target.value)} 
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#4A4A4A] hover:bg-black text-white py-2 rounded-md font-medium text-xs">
                    確定新增
                  </button>
                </form>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-medium">前台側邊選單項目</th>
                      <th className="p-4 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(cat => (
                      <tr key={cat} className="hover:bg-gray-50">
                        <td className="p-4 font-semibold text-gray-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#D3C4B7] rounded-full inline-block"></span>
                          {cat}
                        </td>
                        <td className="p-4 text-right">
                          {cat === '所有商品' ? (
                            <span className="text-[10px] text-gray-400 italic">系統基礎項目</span>
                          ) : (
                            <button onClick={() => handleDeleteCategory(cat)} className="text-gray-400 hover:text-red-500 p-1.5 transition-colors">
                              <Trash2 size={16} />
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
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-gray-800 pb-12 selection:bg-[#D3C4B7] selection:text-white">
      <Navbar />
      
      {view === 'store' && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4A4A4A] mb-2">春季新品上架</h2>
            <p className="text-xs sm:text-sm text-gray-500">挑選屬於你的日常溫柔。</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <aside className="hidden md:block w-48 shrink-0 bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky top-24">
              <h4 className="font-bold text-gray-800 text-xs mb-4 flex items-center gap-1">
                <Menu size={14} className="text-[#A6907C]" /> 商品分類
              </h4>
              <div className="flex flex-col gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${selectedCategory === cat ? 'bg-[#F5EFE6] text-[#A6907C]' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={12} className={`${selectedCategory === cat ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>
            </aside>

            <div className="md:hidden w-full overflow-x-auto whitespace-nowrap pb-3 flex gap-2 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedCategory === cat ? 'bg-[#A6907C] border-[#A6907C] text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-grow w-full">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400 text-xs">
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