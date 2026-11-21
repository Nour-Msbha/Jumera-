const WA = "201026239007"; // رقم الواتساب اللي بيستقبل الطلبات (بدون + أو صفر)
const cart = {};
const $ = s => document.querySelector(s);

// ---------- بناء المنيو ----------
let tabsHTML = "", html = "";
MENU.forEach((c, ci) => {
  tabsHTML += `<a href="#c${ci}">${c.n}</a>`;
  html += `<section id="c${ci}"><h2>${c.n}</h2>${c.note ? `<p class="note">${c.note}</p>` : ""}`;
  c.i.forEach((it, ii) => {
    if (typeof it === "string") { html += `<h3>${it}</h3>`; return; }
    const [n, p, d, img] = it;
    const opts = typeof p === "object" ? Object.entries(p) : [["", p]];
    html += `<div class="item"><div class="pic">${img ? `<img src="img/${img}" alt="${n}">` : "ج"}</div>
      <div class="info"><b>${n}</b>${d ? `<small>${d}</small>` : ""}`;
    opts.forEach(([label, price]) => {
      const k = `${ci}-${ii}-${label}`;
      const name = label ? `${n} (${label})` : n;
      html += `<div class="row" data-k="${k}" data-n="${name}" data-p="${price}">
        <span class="lbl">${label}</span><span class="price">${price} ج</span>
        <span class="qty"><button data-d="-1" aria-label="إنقاص">−</button><i>0</i><button data-d="1" aria-label="زيادة">+</button></span></div>`;
    });
    html += `</div></div>`;
  });
  html += `</section>`;
});
$("#tabs").innerHTML = tabsHTML;
$("#menu").innerHTML = html;

// ---------- السلة ----------
function sync() {
  const lines = Object.values(cart);
  const count = lines.reduce((a, l) => a + l.q, 0);
  const total = lines.reduce((a, l) => a + l.q * l.p, 0);
  $("#bar").hidden = !count;
  $("#barCount").textContent = count;
  $("#barTotal").textContent = total;
  $("#total").textContent = total;
  $("#lines").innerHTML = lines.length
    ? lines.map(l => `<div class="line"><span>${l.q} × ${l.n}</span><span>${l.q * l.p} ج</span></div>`).join("")
    : `<p class="note">السلة فاضية. اختاري أصناف من المنيو.</p>`;
  if (!count) $("#sheet").hidden = true;
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-d]");
  if (!b) return;
  const row = b.closest(".row"), k = row.dataset.k;
  const line = cart[k] || (cart[k] = { n: row.dataset.n, p: +row.dataset.p, q: 0 });
  line.q = Math.max(0, line.q + +b.dataset.d);
  if (!line.q) delete cart[k];
  row.querySelector("i").textContent = line.q;
  row.classList.toggle("on", line.q > 0);
  sync();
});

$("#openCart").onclick = () => { $("#sheet").hidden = false; };
$("#closeCart").onclick = () => { $("#sheet").hidden = true; };
$("#sheet").onclick = e => { if (e.target.id === "sheet") $("#sheet").hidden = true; };

$("#send").onclick = () => {
  const lines = Object.values(cart);
  if (!lines.length) return;
  const total = lines.reduce((a, l) => a + l.q * l.p, 0);
  const name = $("#cname").value.trim(), addr = $("#caddr").value.trim(), note = $("#cnote").value.trim();
  const msg = ["طلب جديد من موقع جميرا", ""]
    .concat(lines.map(l => `- ${l.q} × ${l.n} = ${l.q * l.p} ج`))
    .concat(["", `الإجمالي: ${total} ج`])
    .concat(name ? [`الاسم: ${name}`] : [])
    .concat(addr ? [`العنوان: ${addr}`] : [])
    .concat(note ? [`ملاحظات: ${note}`] : [])
    .join("\n");
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");
};
