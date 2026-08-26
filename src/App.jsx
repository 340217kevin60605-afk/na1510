import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User, 
  Settings, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ExternalLink,
  Package,
  Layers,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

// 初始商品資料
const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    name: '經典燕麥色法式襯衫',
    price: 680,
    category: '服飾',
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&q=80',
    description: '親膚透氣微寬鬆版型，溫柔奶茶色系百搭首選。'
  },
  {
    id: 'p2',
    name: '極簡奶油霧面馬克杯',
    price: 320,
    category: '生活選物',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
    description: '手工啞光釉面，質感厚實溫潤，為日常增添儀式感。'
  },
  {
    id: 'p3',
    name: '品牌客製風格卡紙（10張入）',
    price: 150,
    category: '客製印刷',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&q=80',
    description: '厚磅進口卡紙，細緻印製，適合隨包裹附贈品牌小卡。'
  }
];

export default function LumoStore() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);
  
  // 購物車 state: { [productId]: quantity }
  const [cart, setCart] = useState({ p1: 1 });
  
  // 會員資料（以電話為 Key）
  const [memberPhone, setMemberPhone] = useState('0912345678');
  const [memberPoints, setMemberPoints] = useState(250); // 模擬既有點數
  const [usePoints, setUsePoints] = useState(false);
  
  // 結帳表單 state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    shippingMethod: '7-11', // 7-11, FamilyMart
    storeInfo: '',
    paymentMethod: 'COD', // COD (貨到付款), Transfer (銀行轉帳)
    note: ''
  });

  // 後台訂單列表
  const [orders, setOrders] = useState([
    {
      id: 'ORD-20260826-001',
      date: '2026-08-26 14:30',
      customer: '陳小美',
      phone: '0912345678',
      items: [{ name: '經典燕麥色法式襯衫', qty: 1, price: 680 }],
      shippingMethod: '7-11 取貨付款',
      storeInfo: '鑫華門市 (981245)',
      paymentMethod: '貨到付款',
      subtotal: 680,
      discount: 2,
      total: 678,
      earnedPoints: 678,
      status: '待出貨'
    }
  ]);

  // 購物車計算
  const cartItemDetails = Object.entries(cart).map(([id, qty]) => {
    const product = INITIAL_PRODUCTS.find(p => p.id === id);
    return { ...product, qty };
  }).filter(item => item.qty > 0);

  const subtotal = cartItemDetails.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const maxDiscountAmount = Math.floor(memberPoints / 100);
  const discountAmount = usePoints ? Math.min(maxDiscountAmount, subtotal) : 0;
  const usedPointsCount = discountAmount * 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // 數量增減
  const updateQty = (id, delta) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  // 送出訂單
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.storeInfo) {
      alert('請完整填寫收件資訊！');
      return;
    }

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString(),
      customer: formData.name,
      phone: formData.phone,
      items: cartItemDetails.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      shippingMethod: `${formData.shippingMethod} 超商取貨`,
      storeInfo: formData.storeInfo,
      paymentMethod: formData.paymentMethod === 'COD' ? '貨到付款' : '銀行轉帳',
      subtotal,
      discount: discountAmount,
      total: finalTotal,
      earnedPoints: finalTotal,
      status: '待出貨'
    };

    setOrders([newOrder, ...orders]);
    setMemberPoints(prev => prev - usedPointsCount + finalTotal);
    setCart({});
    setCheckoutStep(false);
    setCartOpen(false);
    alert(`🎉 下單成功！訂單編號：${newOrder.id}\n已為您累積 ${finalTotal} 點會員點數！`);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#4A403A] font-sans">
      
      {/* 頂部導覽列 */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E8DED1] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsAdmin(false); setCheckoutStep(false); }}>
            <div className="h-9 w-20 bg-[#D3C2AD] rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-white font-serif tracking-[0.2em] font-bold text-lg">LUMO</span>
            </div>
          </div>

          {/* 右側操作區 */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAdmin(!isAdmin)} 
              className="text-xs px-2.5 py-1.5 rounded-full border border-[#D3C2AD] text-[#7A6B63] hover:bg-[#F3ECE1] flex items-center gap-1 transition"
            >
              <Settings size={14} />
              {isAdmin ? '切換回前台' : '管理員後台'}
            </button>

            {!isAdmin && (
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2 bg-[#F3ECE1] text-[#4A403A] rounded-full hover:bg-[#E8DED1] transition"
              >
                <ShoppingBag size={20} />
                {cartItemDetails.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#A67C52] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartItemDetails.reduce((a, c) => a + c.qty, 0)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================
          後台管理介面
      ========================================================= */}
      {isAdmin ? (
        <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-[#4A403A]">訂單管理後台</h1>
              <p className="text-xs text-[#8C7A70]">即時檢視前台送出之訂單資料與明細</p>
            </div>
            <div className="text-sm bg-white px-3 py-1.5 rounded-lg border border-[#E8DED1] shadow-sm">
              共 <span className="font-bold text-[#A67C52]">{orders.length}</span> 筆訂單
            </div>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-xl p-5 border border-[#E8DED1] shadow-sm space-y-3">
                <div className="flex flex-wrap justify-between items-center border-b border-[#F0EAE1] pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#E8DED1]">
                      {ord.id}
                    </span>
                    <span className="text-xs text-[#8C7A70]">{ord.date}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EBF3E8] text-[#486940]">
                    {ord.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                  <div>
                    <p className="font-bold text-[#7A6B63] mb-1">📦 顧客與收件資訊</p>
                    <p>姓名：{ord.customer}</p>
                    <p>電話：{ord.phone}</p>
                    <p>超商/門市：{ord.shippingMethod} - {ord.storeInfo}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#7A6B63] mb-1">💰 金額與付款方式</p>
                    <p>付款方式：{ord.paymentMethod}</p>
                    <p>商品小計：${ord.subtotal} (點數折抵 -${ord.discount})</p>
                    <p className="text-sm font-bold text-[#A67C52]">實付總額：${ord.total}</p>
                  </div>
                </div>

                <div className="bg-[#FAF6F0] rounded-lg p-3 text-xs">
                  <p className="font-semibold text-[#7A6B63] mb-1">訂購品項：</p>
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between py-0.5">
                      <span>{it.name} × {it.qty}</span>
                      <span>${it.price * it.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        /* =========================================================
            前台購物介面
        ========================================================= */
        <main className="max-w-4xl mx-auto px-4 py-8">
          
          {/* 會員點數狀態條 */}
          <div className="bg-gradient-to-r from-[#D3C2AD]/40 to-[#E8DED1]/60 rounded-2xl p-4 mb-8 border border-[#D3C2AD]/50 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#A67C52] shadow-sm">
                <User size={18} />
              </div>
              <div>
                <div className="text-xs text-[#7A6B63]">會員專屬回饋（{memberPhone}）</div>
                <div className="text-sm font-bold">現有累積點數：<span className="text-[#A67C52] text-base font-extrabold">{memberPoints}</span> 點</div>
              </div>
            </div>
            <div className="text-xs text-[#8C7A70] bg-white/70 px-3 py-1.5 rounded-xl">
              💡 100 點可折抵 $1 元
            </div>
          </div>

          {/* 商品櫥窗 */}
          <div className="mb-6 flex justify-between items-end">
            <h2 className="text-lg font-bold tracking-wide">精選商品 / Products</h2>
            <span className="text-xs text-[#8C7A70]">全館滿 $1 累積 1 點</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {INITIAL_PRODUCTS.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-[#E8DED1] shadow-sm flex flex-col group">
                <div className="h-48 overflow-hidden bg-[#FAF6F0] relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <span className="absolute top-2 left-2 text-[10px] bg-white/90 px-2 py-0.5 rounded-full font-medium text-[#7A6B63]">
                    {product.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#4A403A] mb-1">{product.name}</h3>
                    <p className="text-xs text-[#8C7A70] line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F5EFEB]">
                    <span className="font-bold text-[#A67C52] text-base">${product.price}</span>
                    <button 
                      onClick={() => updateQty(product.id, 1)}
                      className="bg-[#D3C2AD] hover:bg-[#C2AF99] text-white text-xs px-3.5 py-1.5 rounded-xl font-medium transition shadow-sm"
                    >
                      加入購物車
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* =========================================================
          側欄購物車 / 結帳抽屜 (Cart Drawer)
      ========================================================= */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity" onClick={() => setCartOpen(false)} />

          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[#E8DED1] flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-2">
                {checkoutStep && (
                  <button onClick={() => setCheckoutStep(false)} className="text-[#7A6B63] hover:text-black">
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h3 className="font-bold text-[#4A403A]">{checkoutStep ? '填寫結帳資訊' : '購物清單'}</h3>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-xs text-[#8C7A70] hover:underline">關閉</button>
            </div>

            {/* 內容區塊 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!checkoutStep ? (
                /* Step 1: 購物清單 */
                cartItemDetails.length === 0 ? (
                  <div className="text-center py-20 text-[#8C7A70] text-sm">購物車目前是空的</div>
                ) : (
                  <div className="space-y-3">
                    {cartItemDetails.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#F0EAE1] bg-[#FAF6F0]/40">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold truncate">{item.name}</h4>
                          <div className="text-xs text-[#A67C52] font-semibold mt-0.5">${item.price}</div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQty(item.id, -1)} className="p-0.5 rounded bg-white border border-[#E8DED1]"><Minus size={12} /></button>
                            <span className="text-xs font-semibold px-1">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="p-0.5 rounded bg-white border border-[#E8DED1]"><Plus size={12} /></button>
                          </div>
                        </div>
                        <button onClick={() => updateQty(item.id, -item.qty)} className="text-[#C2AF99] hover:text-red-400 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Step 2: 填寫資料與超商 */
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#7A6B63] mb-1">收件人姓名 *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="例：王小美"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E8DED1] focus:outline-none focus:border-[#D3C2AD]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#7A6B63] mb-1">手機號碼 (同會員帳號) *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E8DED1] focus:outline-none focus:border-[#D3C2AD]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#7A6B63] mb-1">超商取貨通路 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['7-11', '全家 (FamilyMart)'].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormData({ ...formData, shippingMethod: m })}
                          className={`py-2 px-3 rounded-lg border text-center font-medium transition ${
                            formData.shippingMethod === m ? 'border-[#A67C52] bg-[#FAF6F0] text-[#A67C52] font-bold' : 'border-[#E8DED1]'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#7A6B63] mb-1">門市名稱與店號 *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="例：鑫華門市 (981245)"
                      value={formData.storeInfo}
                      onChange={(e) => setFormData({ ...formData, storeInfo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E8DED1] focus:outline-none focus:border-[#D3C2AD]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#7A6B63] mb-1">付款方式 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'COD', label: '超商貨到付款' },
                        { id: 'Transfer', label: '銀行轉帳匯款' }
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: p.id })}
                          className={`py-2 px-3 rounded-lg border text-center font-medium transition ${
                            formData.paymentMethod === p.id ? 'border-[#A67C52] bg-[#FAF6F0] text-[#A67C52] font-bold' : 'border-[#E8DED1]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 點數折抵開關 */}
                  <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DED1] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#7A6B63]">會員點數折抵</span>
                      <span className="text-[11px] text-[#8C7A70]">可用：{memberPoints} 點</span>
                    </div>
                    {maxDiscountAmount > 0 ? (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input 
                          type="checkbox" 
                          checked={usePoints}
                          onChange={(e) => setUsePoints(e.target.checked)}
                          className="accent-[#A67C52] rounded"
                        />
                        <span>使用點數折抵 <strong className="text-[#A67C52]">${discountAmount}</strong> 元（消耗 {usedPointsCount} 點）</span>
                      </label>
                    ) : (
                      <p className="text-[11px] text-[#8C7A70]">點數未滿 100 點，尚無法折抵。</p>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Footer / 計價區塊 */}
            {cartItemDetails.length > 0 && (
              <div className="p-4 border-t border-[#E8DED1] bg-white space-y-3">
                <div className="space-y-1.5 text-xs text-[#7A6B63]">
                  <div className="flex justify-between">
                    <span>商品小計</span>
                    <span>${subtotal}</span>
                  </div>
                  {usePoints && discountAmount > 0 && (
                    <div className="flex justify-between text-[#A67C52]">
                      <span>點數折抵</span>
                      <span>-${discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-[#4A403A] pt-2 border-t border-[#F0EAE1]">
                    <span>總付款金額</span>
                    <span className="text-[#A67C52] text-base">${finalTotal}</span>
                  </div>
                </div>

                {!checkoutStep ? (
                  <button 
                    onClick={() => setCheckoutStep(true)}
                    className="w-full bg-[#D3C2AD] hover:bg-[#C2AF99] text-white py-3 rounded-xl font-bold text-xs transition shadow-sm"
                  >
                    前往結帳填單
                  </button>
                ) : (
                  <button 
                    type="submit"
                    form="checkout-form"
                    className="w-full bg-[#A67C52] hover:bg-[#8F6943] text-white py-3 rounded-xl font-bold text-xs transition shadow-sm"
                  >
                    確認送出訂單（可獲 {finalTotal} 點）
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}