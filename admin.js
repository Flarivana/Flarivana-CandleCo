document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  document.getElementById("searchInput").addEventListener("input", renderProducts);
  document.getElementById("categoryFilter").addEventListener("change", renderProducts);
  document.getElementById("statusFilter").addEventListener("change", renderProducts);
});

document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = this.dataset.editingId ? parseInt(this.dataset.editingId) : Date.now();
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const details = document.getElementById("details").value.trim();
  const price = parseInt(document.getElementById("price").value);
  const stock = parseInt(document.getElementById("stock").value);
  const category = document.getElementById("category").value;
  const tags = document.getElementById("tags").value.trim().split(",").map(t => t.trim()).filter(Boolean);
  const status = document.getElementById("status").value;
  const imageFiles = document.getElementById("images").files;
  const videoFile = document.getElementById("video").files[0];

  if (!name || !description || !details || !price || isNaN(stock) || !category) {
    alert("Пожалуйста, заполните все поля.");
    return;
  }

  const readImages = Array.from(imageFiles).map(file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  });

  Promise.all(readImages).then(images => {
    const save = (videoData) => {
      const product = {
        id,
        name,
        description,
        details,
        price,
        stock,
        category,
        tags,
        status,
        image: images[0] || "",
        images,
        video: videoData || null
      };

      const existing = JSON.parse(localStorage.getItem("products") || "[]");
      const updated = existing.filter(p => p.id !== id);
      updated.push(product);
      localStorage.setItem("products", JSON.stringify(updated));

      alert("Товар сохранён.");
      document.getElementById("productForm").reset();
      delete this.dataset.editingId;
      renderProducts();
    };

    if (videoFile) {
      const reader = new FileReader();
      reader.onload = () => save(reader.result);
      reader.readAsDataURL(videoFile);
    } else {
      save(null);
    }
  });
});

function renderProducts() {
  const tbody = document.querySelector("#productTable tbody");
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;
  const products = JSON.parse(localStorage.getItem("products") || "[]");

  const filtered = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(search);
    const matchCategory = categoryFilter === "" || p.category === categoryFilter;
    const matchStatus = statusFilter === "" || p.status === statusFilter;
    return matchName && matchCategory && matchStatus;
  });

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><img src="${p.image}" class="thumb"></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.price} ₸</td>
      <td>${p.stock}</td>
      <td>${p.status || "—"}</td>
      <td>
        <button onclick="editProduct(${p.id})">✏️</button>
        <button onclick="deleteProduct(${p.id})">❌</button>
      </td>
    </tr>
  `).join('');
}

window.editProduct = function (id) {
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const p = products.find(pr => pr.id === id);
  if (!p) return;

  document.getElementById("name").value = p.name;
  document.getElementById("description").value = p.description;
  document.getElementById("details").value = p.details;
  document.getElementById("price").value = p.price;
  document.getElementById("stock").value = p.stock;
  document.getElementById("category").value = p.category;
  document.getElementById("tags").value = (p.tags || []).join(", ");
  document.getElementById("status").value = p.status || "";
  document.getElementById("productForm").dataset.editingId = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteProduct = function (id) {
  if (!confirm("Удалить товар?")) return;
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem("products", JSON.stringify(filtered));
  renderProducts();
};

