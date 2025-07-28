// script.js

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function filterCategory(category) {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  const filtered = category === "all"
    ? products
    : products.filter(p => p.category === category);

  filtered.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.price} ₸</p>
    `;
    div.onclick = () => openProductModal(product);
    list.appendChild(div);
  });
}

function openProductModal(product) {
  const template = document.getElementById("product-modal-template");
  const clone = template.content.cloneNode(true);
  const modal = clone.querySelector(".modal");
  const closeBtn = clone.querySelector(".close");
  const left = clone.querySelector(".modal-left");
  const right = clone.querySelector(".modal-right");

  let qty = 1;

  left.innerHTML = `<img src="${product.image}" style="width:100%; border-radius:10px">`;

  right.innerHTML = `
    <h2>${product.name}</h2>
    <p>${product.description}</p>
    <p><strong>Характеристики:</strong><br>${product.details}</p>
    <p><strong>Цена:</strong> ${product.price} ₸</p>
    <div style="margin:10px 0;">
      <button onclick="adjustQty(-1)">➖</button>
      <span id="qty-counter">1</span>
      <button onclick="adjustQty(1)">➕</button>
    </div>
    <button onclick="addToCart(${product.id})">Добавить в корзину</button>
    <div class="reviews">
      <h4>Отзывы</h4>
      <div id="reviewList${product.id}">${renderReviews(product.id)}</div>
      <input placeholder="Имя" id="reviewName${product.id}">
      <input type="number" placeholder="Оценка (1–5)" min="1" max="5" id="reviewRating${product.id}">
      <textarea placeholder="Отзыв" id="reviewText${product.id}"></textarea>
      <input type="file" accept="image/*" id="reviewPhoto${product.id}">
      <button onclick="submitReview(${product.id})">Оставить отзыв</button>
    </div>
  `;

  closeBtn.onclick = () => modal.remove();
  document.getElementById("modal-root").appendChild(modal);

  window.adjustQty = delta => {
    qty = Math.max(1, qty + delta);
    document.getElementById("qty-counter").textContent = qty;
  };

  window.addToCart = id => {
    for (let i = 0; i < qty; i++) cart.push(id);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`Добавлено: ${qty} шт.`);
    modal.remove();
  };
}

function toggleCart(open = true) {
  const panel = document.getElementById("cart-panel");
  if (!open) return (panel.innerHTML = "");

  if (!cart.length) return alert("Корзина пуста");

  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const count = {};
  cart.forEach(id => (count[id] = (count[id] || 0) + 1));

  let total = 0;
  const items = Object.entries(count).map(([id, qty]) => {
    const p = products.find(pr => pr.id == id);
    if (!p) return "";
    total += p.price * qty;
    return `<li>${p.name} — ${qty} шт. <button onclick="changeQty(${id}, -1)">➖</button><button onclick="changeQty(${id}, 1)">➕</button></li>`;
  });

  panel.innerHTML = `
    <div class="cart-flyout">
      <h3>🛍️ Ваша корзина</h3>
      <ul>${items.join('')}</ul>
      <p><strong>Итого:</strong> ${total} ₸</p>
      <hr>
      <h4>Оформление:</h4>
      <input id="orderName" placeholder="ФИО">
      <input id="orderPhone" placeholder="Телефон">
      <input id="orderCity" placeholder="Город">
      <input id="orderAddress" placeholder="Адрес">
      <button onclick="sendOrderToWhatsApp()">📦 Отправить в WhatsApp</button>
    </div>
  `;
}

function changeQty(id, delta) {
  const idx = cart.findIndex(i => i == id);
  if (delta < 0 && idx !== -1) cart.splice(idx, 1);
  if (delta > 0) cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  toggleCart(true);
}

function sendOrderToWhatsApp() {
  const name = document.getElementById("orderName").value.trim();
  const phone = document.getElementById("orderPhone").value.trim();
  const city = document.getElementById("orderCity").value.trim();
  const address = document.getElementById("orderAddress").value.trim();

  if (!name || !phone || !city || !address) return alert("Пожалуйста, заполните все поля");
  if (!cart.length) return alert("Корзина пуста");

  const products = JSON.parse(localStorage.getItem("products") || "[]");
  let message = `🕯️ Новый заказ:
👤 ${name}
📞 ${phone}
🏙️ ${city}
🏡 ${address}
\nТовары:\n`;
  let total = 0;

  const count = {};
  cart.forEach(id => (count[id] = (count[id] || 0) + 1));

  for (let [id, qty] of Object.entries(count)) {
    const p = products.find(pr => pr.id == id);
    if (!p) continue;
    message += `• ${p.name} — ${qty} шт. x ${p.price} ₸\n`;
    total += qty * p.price;
  }

  message += `\n💰 Итого: ${total} ₸`;
  window.open(`https://wa.me/77479573817?text=${encodeURIComponent(message)}`, '_blank');
  localStorage.removeItem("cart");
  cart = [];
  toggleCart(false);
}

function renderReviews(id) {
  const reviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]');
  if (!reviews.length) return '<p>Пока нет отзывов</p>';
  return `<ul>${reviews.map(r => `<li><strong>${r.name}</strong>: ${r.text} (${r.rating}⭐)
    ${r.photo ? `<br><img src="${r.photo}" style="max-width:80px">` : ''}</li>`).join('')}</ul>`;
}

function submitReview(id) {
  const name = document.getElementById(`reviewName${id}`).value.trim();
  const rating = document.getElementById(`reviewRating${id}`).value.trim();
  const text = document.getElementById(`reviewText${id}`).value.trim();
  const fileInput = document.getElementById(`reviewPhoto${id}`);
  const reader = new FileReader();

  if (!name || !rating || !text) return alert("Заполните все поля");

  reader.onload = () => {
    const reviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]');
    reviews.push({ name, rating, text, photo: fileInput.files.length ? reader.result : null });
    localStorage.setItem(`reviews_${id}`, JSON.stringify(reviews));
    document.getElementById(`reviewList${id}`).innerHTML = renderReviews(id);
    document.getElementById(`reviewName${id}`).value = '';
    document.getElementById(`reviewRating${id}`).value = '';
    document.getElementById(`reviewText${id}`).value = '';
    fileInput.value = '';
  };

  if (fileInput.files.length) reader.readAsDataURL(fileInput.files[0]);
  else reader.onload();
}
