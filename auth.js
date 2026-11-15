// 1. ตรวจสอบสิทธิ์การเข้าใช้งานทันทีที่เปิดหน้า index.html
const currentUserRaw = localStorage.getItem(APP_CONFIG.SESSION_KEY);
if (!currentUserRaw) {
  window.location.href = 'login.html';
}
const CURRENT_USER = JSON.parse(currentUserRaw || '{}');

// 2. เพิ่มแถบแสดงชื่อครูผู้สอนและปุ่มออกจากระบบบน Header อัตโนมัติ
window.addEventListener('DOMContentLoaded', () => {
  const headerRight = document.querySelector('header .flex.items-center.gap-1\\.5');
  if (headerRight && CURRENT_USER.fullname) {
    const userBadge = document.createElement('div');
    userBadge.className = 'hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-slate-200';
    userBadge.innerHTML = `
      <div class="text-right leading-tight">
        <div class="text-xs font-bold text-slate-800">${CURRENT_USER.fullname}</div>
        <div class="text-[10px] text-emerald-600 font-medium" id="cloud-sync-status">
          <i class="fa-solid fa-cloud"></i> ออนไลน์
        </div>
      </div>
      <button onclick="logoutUser()" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition" title="ออกจากระบบ">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    `;
    headerRight.appendChild(userBadge);
  }
});

function logoutUser() {
  localStorage.removeItem(APP_CONFIG.SESSION_KEY);
  localStorage.removeItem('SMART_SEATING_CHART_STATE_V2');
  window.location.href = 'login.html';
}

// 3. ฟังก์ชันซิงก์ข้อมูลขึ้น Google Sheets (Debounced หน่วงเวลา 2 วินาทีหลังแก้ไขล่าสุด)
let syncTimeout = null;
function syncStateToCloud(stateObj) {
  const statusEl = document.getElementById('cloud-sync-status');
  if (statusEl) {
    statusEl.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin text-amber-500"></i> กำลังบันทึก...';
  }

  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await fetch(APP_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'saveState',
          username: CURRENT_USER.username,
          stateJson: JSON.stringify(stateObj)
        })
      });
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-solid fa-cloud-check text-emerald-600"></i> บันทึกบน Cloud แล้ว';
      }
    } catch (e) {
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-rose-500"></i> ออฟไลน์';
      }
    }
  }, 2000);
}