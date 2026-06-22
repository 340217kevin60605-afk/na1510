import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Search, Truck, ClipboardCheck, ArrowLeft, Settings, Calendar } from 'lucide-react';

const galleryImages = [
  "https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188955800089163.jpg",
  "https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188956700026933.jpg",
  "https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188958400083329.jpg",
  "https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188960000016192.jpg",
  "https://bio.linkcdn.cc/upload/6072019vugjps/2026061917/178188961500094446.jpg"
];

const SHIPPING_OPTIONS = {
  'store': { name: '到店取貨', fee: 0, desc: '三重水漾路一段39號（近三重捷運站）' },
  'meetup': { name: '面交', fee: 0, desc: '限北北基地區 (請填寫面交地址)' },
  '711': { name: '7-11 門市取貨', fee: 40, desc: '請填寫門市名稱與地址' }
};

export default function App() {
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('wholesale');
  
  // 畫面控制：根據網址參數判斷初始畫面，若無則顯示 main
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') || 'main';
    }
    return 'main';
  });

  // 當畫面改變時，自動更新網址，讓連結可以單獨分享
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (view === 'main') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', view);
      }
      window.history.pushState({}, '', url);
    }
  }, [view]);

  // 後台登入狀態
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // 訂單資料庫 (安全載入，避免 SSR 報錯)
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrders = localStorage.getItem('na_design_orders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      } catch (error) {
        console.error("解析訂單資料失敗：", error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('na_design_orders', JSON.stringify(orders));
    }
  }, [orders]);

  // 下單暫存狀態
  const [pendingDesignOrder, setPendingDesignOrder] = useState({ type: '設計+影印', quantity: 1, remark: '' });
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '' });
  const [shippingMethod, setShippingMethod] = useState('store');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bankFirst3, setBankFirst3] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // 查詢與預約系統狀態
  const [lookupType, setLookupType] = useState('design'); // 查詢類型：design 或 wholesale
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('13:00-14:00');

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartOrder = () => {
    setView('checkout');
    window.scrollTo(0, 0);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    let finalAddress = address;
    if (shippingMethod === 'store') finalAddress = SHIPPING_OPTIONS['store'].desc;
    if (!finalAddress) return alert('請填寫完整取貨資訊！');

    const totalAmount = (pendingDesignOrder.quantity * 6) + SHIPPING_OPTIONS[shippingMethod].fee;
    setPendingDesignOrder(prev => ({
      ...prev,
      customer: checkoutForm,
      shipping: { method: shippingMethod, address: finalAddress, fee: SHIPPING_OPTIONS[shippingMethod].fee },
      totalAmount
    }));
    setView('payment');
    window.scrollTo(0, 0);
  };

  const handleConfirmPayment = () => {
    if (!paymentMethod) return alert('請選擇付款方式！');
    if (paymentMethod === '銀行匯款' && bankFirst3.length !== 3) {
      return alert('請確實填寫您匯款帳號的【前 3 碼】！');
    }

    const newOrder = {
      id: `NA${Math.floor(Math.random() * 89999 + 10000)}`,
      date: new Date().toLocaleString(),
      ...pendingDesignOrder,
      paymentMethod,
      bankFirst3: paymentMethod === '銀行匯款' ? bankFirst3 : null,
      status: paymentMethod === '銀行匯款' ? '已付款 (待確認)' : '未付款 (貨到付款)',
      appointmentTime: null
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setCompletedOrder(newOrder);
    setPaymentMethod('');
    setBankFirst3('');
    setView('success');
    window.scrollTo(0, 0);
  };

  const executeSearch = (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    const cleanSearchPhone = searchPhone.replace(/\D/g, '');
    const results = orders.filter(o => o.customer.phone.replace(/\D/g, '') === cleanSearchPhone);
    setSearchResults(results);
  };

  const handleBookingSubmit = (orderId) => {
    if (!bookingDate) return alert('請選擇預約日期');
    const formattedTime = `${bookingDate} ${bookingSlot}`;
    
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: '已約定', appointmentTime: formattedTime } : o);
    setOrders(updatedOrders);
    
    const cleanSearchPhone = searchPhone.replace(/\D/g, '');
    setSearchResults(updatedOrders.filter(o => o.customer.phone.replace(/\D/g, '') === cleanSearchPhone));
    alert(`預約成功！時間為：${formattedTime}`);
    setBookingDate('');
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // --- 後台登入畫面 ---
  if (view === 'admin' && !isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8EDED] flex items-center justify-center px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#F0E4E4] max-w-sm w-full">
          <h2 className="text-base sm:text-lg font-bold text-[#6B5A59] mb-4 text-center">請輸入後台密碼</h2>
          <input 
            type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} 
            className="w-full border border-[#D9D0CF] p-2.5 sm:p-3 rounded-xl mb-4 text-center focus:border-[#6B5A59] outline-none text-[#6B5A59] font-bold text-sm sm:text-base" 
            placeholder="輸入密碼進入後台" 
          />
          <button 
            onClick={() => adminPassword === '1510' ? setIsAdminLoggedIn(true) : alert('密碼錯誤')} 
            className="w-full bg-[#6B5A59] text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base"
          >
            登入
          </button>
          <button onClick={() => setView('main')} className="w-full mt-4 text-[#8C7A79] font-bold text-xs sm:text-sm">返回首頁</button>
        </div>
      </div>
    );
  }

  // --- 後台管理畫面 ---
  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8EDED] p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#6B5A59]">📦 訂單管理系統</h2>
            <button onClick={() => setView('main')} className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[#6B5A59] font-bold shadow-sm border border-[#F0E4E4] text-xs sm:text-sm">返回前台</button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#F0E4E4] overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[800px]">
              <thead className="bg-[#F8EDED] text-[#8C7A79] border-b border-[#F0E4E4]">
                <tr>
                  <th className="p-3 sm:p-4 font-bold">單號 / 日期</th>
                  <th className="p-3 sm:p-4 font-bold">顧客資訊</th>
                  <th className="p-3 sm:p-4 font-bold">訂購內容</th>
                  <th className="p-3 sm:p-4 font-bold">物流 / 付款</th>
                  <th className="p-3 sm:p-4 font-bold">預約時間</th>
                  <th className="p-3 sm:p-4 font-bold">狀態更改</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E4E4] text-[#6B5A59]">
                {orders.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-[#8C7A79]">尚無訂單</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50">
                      <td className="p-3 sm:p-4">
                        <div className="font-bold">{order.id}</div>
                        <div className="text-[11px] text-[#8C7A79]">{order.date}</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="font-bold">{order.customer.name}</div>
                        <div className="text-[#8C7A79]">{order.customer.phone}</div>
                      </td>
                      <td className="p-3 sm:p-4 text-[12px] sm:text-[13px]">
                        <span className="font-bold">{order.type}</span> x{order.quantity}<br/>
                        <span className="text-[#8C7A79]">{order.remark}</span>
                      </td>
                      <td className="p-3 sm:p-4 text-[12px] sm:text-[13px]">
                        <div><span className="font-bold">{SHIPPING_OPTIONS[order.shipping.method]?.name}</span></div>
                        <div className="text-[#8C7A79] truncate max-w-[150px]">{order.shipping.address}</div>
                        <div className="mt-1 font-bold text-[#D98282]">{order.paymentMethod} {order.bankFirst3 && `(前3碼:${order.bankFirst3})`}</div>
                      </td>
                      <td className="p-3 sm:p-4 text-[12px] sm:text-[13px] font-bold">
                        {order.appointmentTime ? <span className="text-[#6B5A59]">{order.appointmentTime}</span> : <span className="text-[#B09F9E]">尚未預約</span>}
                      </td>
                      <td className="p-3 sm:p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="border border-[#D9D0CF] rounded-lg px-2 py-1 text-[11px] sm:text-xs font-bold text-[#6B5A59] focus:outline-none"
                        >
                          {['未付款 (貨到付款)', '已付款 (待確認)', '製作中', '可預約', '已約定', '已出貨', '已完成'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8EDED] font-sans tracking-wide text-[#6B5A59] pb-20 selection:bg-[#E6D5D5] selection:text-[#6B5A59]">
      
      {/* --- 頂部導覽列 --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#F0E4E4] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('main')}>
             <div className="w-7 h-7 sm:w-8 h-8 rounded-full overflow-hidden bg-white border border-[#F0E4E4]">
                <img src="https://bio.linkcdn.cc/upload/6072019vugjps/2026061915/178188145100086430.jpg" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <span className="font-bold tracking-wider text-[#6B5A59] text-[14px] sm:text-base">NA Shop 151</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setView('admin')} className="text-[#B09F9E] hover:text-[#6B5A59] transition-colors p-1">
              <Settings size={18} />
            </button>
            <button 
              onClick={() => { setView('lookup'); setSearchResults(null); setSearchPhone(''); setLookupType('design'); window.scrollTo(0,0); }} 
              className="flex items-center gap-1 text-[11px] sm:text-[13px] font-bold text-[#8C7A79] bg-[#F8EDED] hover:bg-[#F0E4E4] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors"
            >
              <Search size={13} /> 查詢訂單
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================
          主頁面 (導覽與下單)
      ========================================================= */}
      {view === 'main' && (
        <>
          <div className="max-w-3xl mx-auto px-2 mt-6 sm:mt-8 mb-5 sm:mb-6">
            <div className="flex justify-center gap-2 sm:gap-8 border-b border-[#E6D5D5] overflow-x-auto whitespace-nowrap scrollbar-none px-2">
              {/* 這裡暫時移除了 'share'，只留下前兩項 */}
              {['wholesale', 'design'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-[14px] sm:text-[17px] font-medium flex items-center transition-colors relative ${
                    activeTab === tab ? 'text-[#6B5A59] font-bold' : 'text-[#B09F9E] hover:text-[#8C7A79]'
                  }`}
                >
                  {tab === 'wholesale' ? '純批發' : '卡紙設計/代印'}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6B5A59] rounded-t-full"></div>}
                </button>
              ))}
            </div>
          </div>

          <main className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-10 shadow-sm border border-[#F0E4E4]">
              <div className="text-center font-bold text-[#8C7A79] text-[13px] sm:text-[15px] tracking-wider mb-6 sm:mb-8">
                Step1:請先查看詳情 🔎 選方案
              </div>

              {/* 1. 純批發 */}
              {activeTab === 'wholesale' && (
                <div className="animate-fade-in">
                  <h3 className="text-[17px] sm:text-[20px] font-bold text-[#6B5A59] mb-3 sm:mb-4">純批發</h3>
                  <div className="text-[13px] sm:text-[15px] leading-relaxed text-[#6B5A59] space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div>
                      <p className="font-bold mb-1">🤎步驟說明</p>
                      <p>❶點選商品圖&gt;&gt;查看商品與批發價錢</p>
                      <p>❷挑選商品直接下單</p>
                    </div>
                    <hr className="border-[#F0E4E4] my-3 sm:my-4" />
                    <div>
                      <p className="font-bold mb-1">🤎須知</p>
                      <p>✔️預購海運7~21天(韓國發貨)</p>
                      <p>✔️現貨2~5天</p>
                      <p>✔️2件起批</p>
                      <p>✔️可面交.到店取貨</p>
                      <p className="mt-3 text-[#D98282]">❌不提供商品圖請自行準備</p>
                    </div>
                  </div>

                  <div className="bg-[#F8EDED] rounded-2xl p-4 sm:p-5 border border-[#F0E4E4]">
                    <div className="text-[#8C7A79] text-[12px] sm:text-[14px] leading-relaxed mb-3 sm:mb-4">
                      <span className="font-bold text-[#6B5A59] block mb-1.5 sm:mb-2">〰️ Step 2: 批發下一步</span>
                      <p>✔️可直接下單</p>
                      <p>✔️下單完直接登入電子郵件查訂單進度</p>
                    </div>
                    <a href="https://na-shop-cbcba.web.app/?wholesale=OK" target="_blank" rel="noreferrer" className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white text-[14px] sm:text-[15px] py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold shadow-sm">
                      前往批發專屬官網 <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              )}

              {/* 2. 卡紙設計/代印服務 */}
              {activeTab === 'design' && (
                <div className="animate-fade-in">
                  <h3 className="text-[17px] sm:text-[20px] font-bold text-[#6B5A59] mb-3 sm:mb-4">卡紙設計/代印服務</h3>
                  
                  {/* 滑動式卡紙範例圖 */}
                  <div className="mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-[#F0E4E4] bg-[#F8EDED]/50 py-3 sm:py-4">
                    <p className="font-bold text-[#6B5A59] text-center mb-2 sm:mb-3 text-[13px] sm:text-[15px]">🤍 卡紙範例圖 (左右滑動查看)</p>
                    <div className="flex overflow-x-auto gap-3 sm:gap-4 px-4 snap-x snap-mandatory pb-2 sm:pb-4" style={{ scrollbarWidth: 'none' }}>
                      {galleryImages.map((src, idx) => (
                        <div key={idx} className="snap-center shrink-0 w-[85%] sm:w-[60%]">
                          <img src={src} alt={`範例 ${idx+1}`} className="w-full h-auto rounded-xl shadow-md object-cover border border-[#E6D5D5]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[13px] sm:text-[15px] leading-relaxed text-[#6B5A59] space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="font-bold space-y-0.5">
                      <p>【▫️設計+影印】</p>
                      <p>OR</p>
                      <p>【▫️代印服務- 您自行設計·我們印出】</p>
                    </div>
                    <hr className="border-[#F0E4E4] my-3 sm:my-4" />
                    <div>
                      <p className="font-bold mb-1">🤎須知</p>
                      <p>❶設計免費（如需耗時較長酌收$30～50不等）</p>
                      <p>❷可印彩色or黑白</p>
                      <p>❸可只印一張</p>
                      <p>❹風格、樣式可以討論 / 可手繪</p>
                      <p>❺可面交.到店取貨</p>
                    </div>
                    <hr className="border-[#F0E4E4] my-3 sm:my-4" />
                    <div>
                      <p className="font-bold mb-1">🤎印出費用計算</p>
                      <p>❶卡紙大小基本A6大小（超過額外計算價格）</p>
                      <p>❷影印費用=一張A6 $6</p>
                      <p className="mt-1.5 text-[#8C7A79] text-[12px] sm:text-[13px]">
                        &gt;＞看設計的尺寸以A6為基礎切割<br/>
                        （ex:5*5cm可以在A6分6張=一張卡紙$1）
                      </p>
                    </div>
                  </div>

                  {/* 🚨 Step 2: 複製表單 */}
                  <div className="bg-[#FDF8F8] rounded-2xl p-4 sm:p-5 border border-[#E6D5D5] mb-5 sm:mb-6">
                    <span className="font-bold text-[#6B5A59] block mb-2.5 sm:mb-3 text-[14px] sm:text-[16px]">〰️ Step 2: 請先複製表單至 Line 回覆與我們討論</span>
                    
                    <div className="space-y-2.5 sm:space-y-3 mb-1">
                      <button 
                        onClick={() => handleCopy("【影印+設計】\n❶ 喜歡何種風格/元素、預計卡紙尺寸：\n❷ 卡紙用途、印幾張：\n❸ 電子郵件、電話：\n❹ 想要如何交貨（711、到店取貨、面交）：", 'design')}
                        className="w-full bg-white hover:bg-[#F0E4E4] border border-[#E6D5D5] text-[#6B5A59] text-[13px] sm:text-[14px] py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl flex items-center justify-between transition-colors font-bold text-left shadow-sm"
                      >
                        <span>複製【影印+設計】表單</span>
                        {copiedId === 'design' ? <Check size={15} className="text-emerald-500"/> : <Copy size={15} className="text-[#B09F9E]"/>}
                      </button>

                      <button 
                        onClick={() => handleCopy("【代印服務】\n❶ 影印設計圖、印幾張：\n❷ 電子郵件、電話：\n❸ 想要如何交貨（711、到店取貨、面交）：", 'print')}
                        className="w-full bg-white hover:bg-[#F0E4E4] border border-[#E6D5D5] text-[#6B5A59] text-[13px] sm:text-[14px] py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl flex items-center justify-between transition-colors font-bold text-left shadow-sm"
                      >
                        <span>複製【代印服務】表單</span>
                        {copiedId === 'print' ? <Check size={15} className="text-emerald-500"/> : <Copy size={15} className="text-[#B09F9E]"/>}
                      </button>
                    </div>
                  </div>

                  {/* 🚨 Step 3: 直接下單 */}
                  <div className="bg-[#F8EDED] rounded-2xl p-4 sm:p-5 border border-[#F0E4E4]">
                    <span className="font-bold text-[#6B5A59] block mb-3 sm:mb-4 text-[14px] sm:text-[16px]">〰️ Step 3: 討論完畢後，選擇規格並下單</span>
                    
                    <div className="space-y-3.5 sm:space-y-4 mb-5 sm:mb-6">
                      <div>
                        <label className="block text-[12px] sm:text-[13px] font-bold text-[#8C7A79] mb-1.5">📝 選擇服務類型</label>
                        <select 
                          className="w-full border border-[#D9D0CF] rounded-xl p-2.5 sm:p-3 bg-white text-[#6B5A59] font-bold focus:outline-none focus:border-[#6B5A59] text-sm"
                          value={pendingDesignOrder.type}
                          onChange={e => setPendingDesignOrder({...pendingDesignOrder, type: e.target.value})}
                        >
                          <option value="設計+影印">【設計+影印】</option>
                          <option value="代印服務">【代印服務 - 您設計我們印】</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[12px] sm:text-[13px] font-bold text-[#8C7A79] mb-1.5">🖨️ 印幾張 (以 A6 為單位計算)</label>
                        <input 
                          type="number" min="1" 
                          className="w-full border border-[#D9D0CF] rounded-xl p-2.5 sm:p-3 bg-white text-[#6B5A59] font-bold focus:outline-none focus:border-[#6B5A59] text-sm"
                          value={pendingDesignOrder.quantity}
                          onChange={e => setPendingDesignOrder({...pendingDesignOrder, quantity: parseInt(e.target.value) || 1})}
                        >
                        </input>
                      </div>

                      <div>
                        <label className="block text-[12px] sm:text-[13px] font-bold text-[#8C7A79] mb-1.5">💬 備註說明 (風格/用途/尺寸等)</label>
                        <textarea 
                          className="w-full border border-[#D9D0CF] rounded-xl p-2.5 sm:p-3 bg-white text-[#6B5A59] focus:outline-none focus:border-[#6B5A59] h-20 text-sm"
                          placeholder="例如：想要韓系簡約風、5x5cm..."
                          value={pendingDesignOrder.remark}
                          onChange={e => setPendingDesignOrder({...pendingDesignOrder, remark: e.target.value})}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleStartOrder}
                      className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white text-[14px] sm:text-[15px] py-2.5 sm:py-3.5 rounded-xl font-bold shadow-sm transition-colors"
                    >
                      填寫收件與結帳資訊
                    </button>
                  </div>
                </div>
              )}

              {/* 3. 社群分潤 (暫時隱藏起來，日後需要開啟時將下方的註解拿掉即可) */}
              {/* activeTab === 'share' && (
                <div className="animate-fade-in">
                  <h3 className="text-[17px] sm:text-[20px] font-bold text-[#6B5A59] mb-4">社群分潤</h3>
                  <div className="text-[13px] sm:text-[15px] leading-relaxed text-[#6B5A59] space-y-4 mb-8">
                    <div>
                      <p className="font-bold mb-1">🤎合作方式 / 推廣</p>
                      <p>❶我們提供分潤連結</p>
                      <p>❷您自由選擇平台分享→顧客購買 → 獲得分潤</p>
                      <p>❸合作期限：1 個月 （可續約）</p>
                      <p>❹由我們出貨</p>
                    </div>
                    <hr className="border-[#F0E4E4] my-4" />
                    <div>
                      <p className="font-bold mb-1">🤎分潤連結</p>
                      <p>❶客人會直接導入到NA shop官網進行下單</p>
                      <p>❷下單會有電子郵件通知合作夥伴</p>
                      <p>❸分潤計算：下單總金額 x 30% 分潤</p>
                      <p className="mt-2 text-[#8C7A79] text-[12px] sm:text-[13px]">
                        （例如下單500*30%=您獲得150）<br/>
                        （客人點選分潤連結下單的任意商品皆算入總金額內）
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F8EDED] rounded-2xl p-4 sm:p-5 border border-[#F0E4E4]">
                    <span className="font-bold text-[#6B5A59] block mb-3">〰️ Step 2: 請複製表單在 line 回覆</span>
                    <div className="bg-white p-4 rounded-xl text-[13px] sm:text-[14px] text-[#6B5A59] mb-4 shadow-sm border border-[#F0E4E4]">
                      ❶ 大概會如何進行推廣<br/>
                      ❷ 您的電子郵件
                    </div>
                    <button 
                      onClick={() => handleCopy("【申請社群分潤】\n❶ 大概會如何進行推廣：\n❷ 您的電子郵件：", 'share')}
                      className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white text-[14px] sm:text-[15px] py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold shadow-sm"
                    >
                      {copiedId === 'share' ? <><Check size={15} className="text-emerald-500"/> 已複製</> : <><Copy size={15} /> 複製回覆表單</>}
                    </button>
                  </div>
                </div>
              )
              */}

            </div>
          </main>
        </>
      )}

      {/* =========================================================
          填寫結帳資料 (Checkout)
      ========================================================= */}
      {view === 'checkout' && (
        <main className="max-w-2xl mx-auto px-4 mt-8 animate-fade-in">
          <button onClick={() => setView('main')} className="flex items-center gap-1 text-[#8C7A79] hover:text-[#6B5A59] font-bold mb-6 text-[13px] sm:text-[14px]">
            <ArrowLeft size={15} /> 返回修改項目
          </button>
          
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-10 shadow-sm border border-[#F0E4E4]">
            <h2 className="text-[16px] sm:text-[18px] font-bold text-[#6B5A59] mb-5 sm:mb-6 flex items-center gap-2 border-b border-[#F0E4E4] pb-4">
              <Truck size={18} /> 填寫收件資訊
            </h2>

            <form onSubmit={handleCheckoutSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[12px] sm:text-[13px] font-bold text-[#8C7A79] mb-1.5">收件人姓名 *</label>
                  <input required type="text" className="w-full border border-[#D9D0CF] rounded-xl p-2.5 sm:p-3 focus:border-[#6B5A59] outline-none font-bold text-[#6B5A59] text-sm" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[12px] sm:text-[13px] font-bold text-[#8C7A79] mb-1.5">聯絡電話 (供查詢用) *</label>
                  <input required type="tel" className="w-full border border-[#D9D0CF] rounded-xl p-2.5 sm:p-3 focus:border-[#6B5A59] outline-none font-bold text-[#6B5A59] text-sm" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[12px] sm:text-[13px] font-bold text-[#8C7A79] mb-2.5 sm:mb-3">選擇取貨與物流方式 *</label>
                <div className="space-y-2.5 sm:space-y-3">
                  {Object.entries(SHIPPING_OPTIONS).map(([key, opt]) => (
                    <label key={key} className={`flex flex-col p-3.5 sm:p-4 border rounded-xl cursor-pointer transition-all ${shippingMethod === key ? 'border-[#6B5A59] bg-[#F8EDED]' : 'border-[#F0E4E4] hover:bg-stone-50'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <input type="radio" name="shipping" value={key} checked={shippingMethod === key} onChange={(e) => { setShippingMethod(e.target.value); setAddress(''); }} className="accent-[#6B5A59] w-4 h-4" />
                          <span className="font-bold text-[#6B5A59] text-sm sm:text-base">{opt.name}</span>
                        </div>
                        <span className="text-[13px] sm:text-[14px] font-bold text-[#8C7A79]">{opt.fee === 0 ? '運費 $0' : `+$${opt.fee}`}</span>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-[#A29493] ml-6 sm:ml-7 mt-1">{opt.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] sm:text-[13px] font-bold text-[#8C7A79] mb-1.5">
                  {shippingMethod === '711' ? '7-11 門市名稱與地址 *' : shippingMethod === 'meetup' ? '面交地址 (限北北基) *' : '到店取貨地點'}
                </label>
                {shippingMethod === 'store' ? (
                  <input disabled type="text" className="w-full border border-[#F0E4E4] rounded-xl p-2.5 sm:p-3 bg-[#F8EDED] text-[#8C7A79] font-bold cursor-not-allowed text-sm" value={SHIPPING_OPTIONS['store'].desc} />
                ) : (
                  <input required type="text" placeholder={shippingMethod === '711' ? '請輸入門市名稱' : '請輸入欲面交的地點'} className="w-full border border-[#D9D0CF] rounded-xl p-2.5 sm:p-3 focus:border-[#6B5A59] outline-none font-bold text-[#6B5A59] text-sm" value={address} onChange={e => setAddress(e.target.value)} />
                )}
              </div>

              <div className="border-t border-[#F0E4E4] pt-5 sm:pt-6 flex justify-between items-center mb-5 sm:mb-6">
                <span className="font-bold text-[#8C7A79] text-sm sm:text-base">總結帳金額 (含運)</span>
                <span className="text-lg sm:text-xl font-bold text-[#6B5A59]">NT$ {(pendingDesignOrder.quantity * 6) + SHIPPING_OPTIONS[shippingMethod].fee}</span>
              </div>

              <button type="submit" className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white py-3 sm:py-4 rounded-xl font-bold text-[14px] sm:text-[15px] transition-colors shadow-sm">
                下一步：選擇付款方式
              </button>
            </form>
          </div>
        </main>
      )}

      {/* =========================================================
          付款頁面 (Payment)
      ========================================================= */}
      {view === 'payment' && (
        <main className="max-w-2xl mx-auto px-4 mt-8 animate-fade-in">
          <button onClick={() => setView('checkout')} className="flex items-center gap-1 text-[#8C7A79] hover:text-[#6B5A59] font-bold mb-6 text-[13px] sm:text-[14px]">
            <ArrowLeft size={15} /> 返回上一步
          </button>

          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-10 shadow-sm border border-[#F0E4E4]">
             <h2 className="text-[16px] sm:text-[18px] font-bold text-[#6B5A59] mb-1.5 text-center">結帳總額：NT$ {pendingDesignOrder.totalAmount}</h2>
             <p className="text-center text-[#8C7A79] text-[12px] sm:text-[13px] mb-6 sm:mb-8 border-b border-[#F0E4E4] pb-5 sm:pb-6">請選擇付款方式以完成訂單</p>

             <div className="space-y-3.5 sm:space-y-4 mb-6 sm:mb-8">
                {/* 貨到付款 */}
                <div className={`border rounded-xl transition-all ${paymentMethod === '貨到付款' ? 'border-[#6B5A59] bg-[#F8EDED]' : 'border-[#D9D0CF]'}`}>
                  <button onClick={() => setPaymentMethod('貨到付款')} className="w-full flex items-center p-3.5 sm:p-4 text-left">
                    <input type="radio" checked={paymentMethod === '貨到付款'} readOnly className="accent-[#6B5A59] w-4 h-4 mr-3" />
                    <div>
                      <h4 className="font-bold text-[#6B5A59] text-sm sm:text-base">貨到付款 / 面交給現</h4>
                      <p className="text-[11px] sm:text-[12px] text-[#8C7A79] mt-0.5">商品送達或面交時以現金支付</p>
                    </div>
                  </button>
                </div>

                /* 銀行匯款 */
                <div className={`border rounded-xl transition-all overflow-hidden ${paymentMethod === '銀行匯款' ? 'border-[#6B5A59] bg-[#F8EDED]' : 'border-[#D9D0CF]'}`}>
                  <button onClick={() => setPaymentMethod('銀行匯款')} className="w-full flex items-center p-3.5 sm:p-4 text-left">
                    <input type="radio" checked={paymentMethod === '銀行匯款'} readOnly className="accent-[#6B5A59] w-4 h-4 mr-3" />
                    <div>
                      <h4 className="font-bold text-[#6B5A59] text-sm sm:text-base">銀行匯款</h4>
                      <p className="text-[11px] sm:text-[12px] text-[#8C7A79] mt-0.5">匯款後輸入帳號前3碼成立訂單</p>
                    </div>
                  </button>

                  {paymentMethod === '銀行匯款' && (
                    <div className="px-4 pb-4 sm:pb-5 pt-1.5 space-y-3.5 sm:space-y-4 animate-fade-in">
                      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#D9D0CF] text-[12px] sm:text-[13px] text-[#6B5A59] space-y-1 sm:space-y-1.5 shadow-sm">
                        <p className="font-bold text-[#6B5A59] text-xs sm:text-sm mb-1.5 sm:mb-2">🏦 請先匯款至以下帳戶：</p>
                        <p>銀行代碼：奶油銀行 (822)</p>
                        <p>匯款帳號：123-456789-012</p>
                        <p>戶名：奶油選物工作室</p>
                        <p className="text-[#D98282] pt-1.5 font-bold">※ 匯款完成後，請於下方輸入您的帳號前3碼並送出。</p>
                      </div>
                      
                      <div>
                        <input 
                          type="text" maxLength="3" placeholder="請輸入您匯款帳號的【前3碼】" 
                          className="w-full text-xs sm:text-sm font-bold border border-[#D9D0CF] p-3 rounded-xl focus:border-[#6B5A59] outline-none bg-white" 
                          value={bankFirst3} 
                          onChange={e => setBankFirst3(e.target.value.replace(/\D/g, '').slice(0,3))} 
                        />
                      </div>
                    </div>
                  )}
                </div>
             </div>

             <button onClick={handleConfirmPayment} className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white py-3 sm:py-4 rounded-xl font-bold text-[14px] sm:text-[15px] transition-colors shadow-sm">
                確認結帳並建立訂單
              </button>
          </div>
        </main>
      )}

      {/* =========================================================
          成功頁面 (Success)
      ========================================================= */}
      {view === 'success' && completedOrder && (
        <main className="max-w-xl mx-auto px-4 mt-12 text-center animate-fade-in">
          <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-sm border border-[#F0E4E4]">
             <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#F8EDED] text-[#6B5A59] rounded-full mb-5 sm:mb-6">
                <ClipboardCheck size={28} />
             </div>
             <h2 className="text-[18px] sm:text-[20px] font-bold text-[#6B5A59] mb-1.5">訂單建立成功！</h2>
             <p className="text-[12px] sm:text-[14px] text-[#8C7A79] mb-6 sm:mb-8">您隨時可使用手機號碼在右上角「查詢訂單」確認進度。</p>

             <div className="bg-[#F8EDED] rounded-2xl p-4 sm:p-5 text-left text-[13px] sm:text-[14px] text-[#6B5A59] space-y-3 sm:space-y-4 mb-6 sm:mb-8 border border-[#F0E4E4]">
               <div className="flex justify-between border-b border-[#E6D5D5] pb-2.5 sm:pb-3">
                 <span className="font-bold text-[#8C7A79]">訂單編號</span>
                 <span className="font-bold">{completedOrder.id}</span>
               </div>
               <div className="flex justify-between border-b border-[#E6D5D5] pb-2.5 sm:pb-3">
                 <span className="font-bold text-[#8C7A79]">訂單狀態</span>
                 <span className="font-bold text-[#D98282]">{completedOrder.status}</span>
               </div>
               <div className="flex justify-between border-b border-[#E6D5D5] pb-2.5 sm:pb-3">
                 <span className="font-bold text-[#8C7A79]">購買服務</span>
                 <span className="font-bold">{completedOrder.type} x{completedOrder.quantity}</span>
               </div>
               <div className="flex justify-between pt-1">
                 <span className="font-bold text-[#8C7A79]">總付金額</span>
                 <span className="font-bold text-[15px] sm:text-[16px]">NT$ {completedOrder.totalAmount}</span>
               </div>
             </div>

             <button onClick={() => setView('main')} className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white py-3 sm:py-3.5 rounded-xl font-bold transition-colors text-sm sm:text-base">
                返回首頁
             </button>
          </div>
        </main>
      )}

      {/* =========================================================
          查詢訂單 (Lookup)
      ========================================================= */}
      {view === 'lookup' && (
        <main className="max-w-2xl mx-auto px-4 mt-8 animate-fade-in">
           <div className="bg-white rounded-[2rem] p-5 sm:p-10 shadow-sm border border-[#F0E4E4]">
             
             <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[#6B5A59] flex items-center gap-2">
                  <Search size={18} /> 請依類型查詢訂單
                </h2>
                <button onClick={() => setView('main')} className="text-[#8C7A79] hover:text-[#6B5A59] text-xs sm:text-[13px] font-bold">返回首頁</button>
             </div>

             {/* 選擇要查詢哪一種系統的訂單 */}
             <div className="flex gap-4 border-b border-[#E6D5D5] mb-6 sm:mb-8">
               <button 
                 onClick={() => setLookupType('design')}
                 className={`pb-2.5 px-1.5 text-[14px] sm:text-[15px] font-bold transition-colors relative ${lookupType === 'design' ? 'text-[#6B5A59]' : 'text-[#B09F9E] hover:text-[#8C7A79]'}`}
               >
                 卡紙設計/代印
                 {lookupType === 'design' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6B5A59] rounded-t-full"></div>}
               </button>
               <button 
                 onClick={() => setLookupType('wholesale')}
                 className={`pb-2.5 px-1.5 text-[14px] sm:text-[15px] font-bold transition-colors relative ${lookupType === 'wholesale' ? 'text-[#6B5A59]' : 'text-[#B09F9E] hover:text-[#8C7A79]'}`}
               >
                 純批發
                 {lookupType === 'wholesale' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6B5A59] rounded-t-full"></div>}
               </button>
             </div>

             {/* --- 批發查詢區塊 --- */}
             {lookupType === 'wholesale' && (
               <div className="text-center bg-[#F8EDED] p-6 sm:p-8 rounded-2xl border border-[#F0E4E4] animate-fade-in">
                 <p className="font-bold text-[#6B5A59] mb-5 sm:mb-6 text-sm sm:text-base">請使用您的電子郵件登入批發網站查詢訂單 🔎</p>
                 <a 
                   href="https://na-shop-cbcba.web.app/" 
                   target="_blank" rel="noreferrer" 
                   className="inline-flex items-center gap-2 bg-[#6B5A59] hover:bg-[#524544] text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm text-sm"
                 >
                   前往批發專屬官網 <ExternalLink size={15} />
                 </a>
               </div>
             )}

             {/* --- 卡紙設計查詢區塊 --- */}
             {lookupType === 'design' && (
               <div className="animate-fade-in">
                 <form onSubmit={executeSearch} className="flex gap-2 mb-6 sm:mb-8">
                   <input 
                     type="tel" required placeholder="請輸入下單時的手機號碼" 
                     className="flex-grow border border-[#D9D0CF] rounded-xl p-2.5 sm:p-3 focus:border-[#6B5A59] outline-none font-bold text-[#6B5A59] text-sm"
                     value={searchPhone} onChange={e => setSearchPhone(e.target.value)}
                   />
                   <button type="submit" className="bg-[#6B5A59] text-white px-5 rounded-xl font-bold transition-colors whitespace-nowrap text-sm">
                     搜尋
                   </button>
                 </form>

                 {searchResults !== null && (
                   <div>
                     <h3 className="text-xs sm:text-[14px] font-bold text-[#8C7A79] mb-4">搜尋結果 ({searchResults.length} 筆)</h3>
                     
                     {searchResults.length === 0 ? (
                       <div className="text-center bg-[#F8EDED] p-6 sm:p-8 text-sm text-[#8C7A79] font-bold border border-[#F0E4E4] rounded-2xl">
                         查無此電話的訂單，請確認輸入是否正確。
                       </div>
                     ) : (
                       <div className="space-y-4">
                         {searchResults.map(order => (
                           <div key={order.id} className="bg-white border border-[#E6D5D5] p-4 sm:p-5 rounded-2xl shadow-sm">
                             <div className="flex justify-between items-center border-b border-[#F0E4E4] pb-2.5 mb-3">
                               <div>
                                 <p className="text-[10px] sm:text-[11px] text-[#8C7A79]">{order.date}</p>
                                 <p className="font-bold text-[#6B5A59] text-sm">單號: {order.id}</p>
                               </div>
                               <span className="bg-[#F8EDED] text-[#6B5A59] px-2.5 py-0.5 rounded-full text-[11px] sm:text-[12px] font-bold border border-[#E6D5D5]">
                                 {order.status}
                               </span>
                             </div>
                             
                             <div className="text-[12px] sm:text-[13px] text-[#6B5A59] space-y-1 sm:space-y-1.5 font-bold">
                               <p><span className="text-[#8C7A79] font-normal">服務：</span>{order.type} x{order.quantity}</p>
                               <p><span className="text-[#8C7A79] font-normal">收件：</span>{order.customer.name}</p>
                               <p><span className="text-[#8C7A79] font-normal">方式：</span>{order.shipping.method === '711' ? '7-11' : order.shipping.method === 'meetup' ? '面交' : '店取'} - {order.shipping.address}</p>
                               <p><span className="text-[#8C7A79] font-normal">總額：</span>NT$ {order.totalAmount} ({order.paymentMethod})</p>
                               
                               {order.paymentMethod === '銀行匯款' && (
                                 <p className="text-[#D98282] bg-[#FDF8F8] p-1.5 rounded inline-block mt-1 text-[11px] sm:text-xs">匯款前3碼：{order.bankFirst3}</p>
                               )}
                               
                               {order.appointmentTime && (
                                 <p className="text-[#6B5A59] bg-[#EFEAE9] p-2 rounded-lg inline-flex items-center gap-1.5 mt-2 text-[11px] sm:text-xs">
                                   <Calendar size={13}/> 約定取貨：{order.appointmentTime}
                                 </p>
                               )}
                             </div>

                             {/* 若狀態為可預約，顯示預約時間表單 */}
                             {order.status === '可預約' && ['store', 'meetup'].includes(order.shipping.method) && (
                               <div className="mt-3.5 pt-3.5 border-t border-[#F0E4E4] bg-[#F8EDED]/50 p-3.5 rounded-xl">
                                 <p className="font-bold text-[#6B5A59] text-[12px] sm:text-[13px] mb-2.5 sm:mb-3 flex items-center gap-1.5">
                                   <Calendar size={13}/> 您的訂單已可取貨，請預約時間
                                 </p>
                                 <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3">
                                   <input 
                                     type="date" required
                                     className="w-full border border-[#D9D0CF] rounded-lg p-2 text-[11px] sm:text-[12px] font-bold text-[#6B5A59] outline-none"
                                     value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                                   />
                                   <select 
                                     className="w-full border border-[#D9D0CF] rounded-lg p-2 text-[11px] sm:text-[12px] font-bold text-[#6B5A59] outline-none"
                                     value={bookingSlot} onChange={e => setBookingSlot(e.target.value)}
                                   >
                                     <option value="11:00-12:00">11:00 - 12:00</option>
                                     <option value="13:00-14:00">13:00 - 14:00</option>
                                     <option value="14:00-15:00">14:00 - 15:00</option>
                                     <option value="15:00-16:00">15:00 - 16:00</option>
                                     <option value="17:00-18:00">17:00 - 18:00</option>
                                     <option value="19:00-20:00">19:00 - 20:00 (限面交)</option>
                                   </select>
                                 </div>
                                 <button 
                                   onClick={() => handleBookingSubmit(order.id)}
                                   className="w-full bg-[#6B5A59] hover:bg-[#524544] text-white font-bold py-2 rounded-lg text-[12px] sm:text-[13px] transition-colors shadow-sm"
                                 >
                                   確認預約時間
                                 </button>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 )}
               </div>
             )}
             
           </div>
        </main>
      )}

    </div>
  );
}