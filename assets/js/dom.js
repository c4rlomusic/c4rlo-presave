export const $ = (sel) => document.querySelector(sel);
export const el = (tag, attrs = {}, txt = '') => {
  const x = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => x.setAttribute(k, v));
  if (txt) x.textContent = txt;
  return x;
};
