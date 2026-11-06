// Mật khẩu panel (Dokploy PANEL_KEY): nhập ở trang điều khiển, lưu sessionStorage
// (đóng tab là mất), gửi kèm mọi lệnh ghi (control / giả lập / kết nối / ngắt / ảnh nền).
export function getPanelKey(): string {
  try {
    return sessionStorage.getItem('panelKey') || '';
  } catch {
    return '';
  }
}
export function setPanelKey(k: string) {
  try {
    sessionStorage.setItem('panelKey', k);
  } catch {
    // bỏ qua
  }
}
export function panelHeaders(): Record<string, string> {
  const k = getPanelKey();
  return k ? { 'x-panel-key': k } : {};
}
