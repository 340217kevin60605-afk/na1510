@echo off
chcp 65001
echo =======================================
echo 🚀 LUMO 網站一鍵發布系統啟動！
echo =======================================
echo.
echo [1/3] 正在檢查程式碼是否有錯誤...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ 發現錯誤！打包失敗，已停止上傳。
    echo 請看上方的紅色錯誤訊息進行修復。
    pause
    exit /b %errorlevel%
)

echo.
echo ✅ 檢查通過！準備存檔並上傳...
echo [2/3] 正在打包加入 GitHub...
git add .
git commit -m "Auto Update: 一鍵自動發布"

echo.
echo [3/3] 正在推送到 Vercel 伺服器...
git push

echo.
echo =======================================
echo 🎉 大功告成！程式碼已成功送出。
echo ⏳ 請稍候大約 1 分鐘，客寶們就能看到最新網站囉！
echo =======================================
pause