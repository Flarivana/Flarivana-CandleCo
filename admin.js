// admin.js — логика сохранения товаров в localStorage с выбором категории

document.getElementById('productForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const details = document.getElementById('details').value.trim();
  const price = parseInt(document.getElementById('price').value);
  const category = document.getElementById('category').value;
  const imageFiles = document.getElementById('images').files;
  const videoFile = document.getElementById('video').files[0];

  if (!name || !description || !details || !price || imageFiles.length === 0 || !category) {
    alert("Пожалуйста, заполните все поля и добавьте минимум одно фото.");
    return;
  }

  const readImages = Array.from(imageFiles).map(file => {
    return new Promise(resolve => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(file);
    });
  });

  Promise.all(readImages).then(images => {
    if (videoFile) {
      const videoReader = new FileReader();
      videoReader.onload = () => {
        saveProduct(name, description, details, price, category, images, videoReader.result);
      };
      videoReader.readAsDataURL(videoFile);
    } else {
      saveProduct(name, description, details, price, category, images, null);
    }
  });
});

function saveProduct(name, description, details, price, category, images, video) {
  const product = {
    id: Date.now(),
    name,
    description,
    details,
    price,
    category,
    image: images[0],
    images,
    video
  };

  const existing = JSON.parse(localStorage.getItem('products') || '[]');
  existing.push(product);
  localStorage.setItem('products', JSON.stringify(existing));

  alert("Товар успешно добавлен!");
  document.getElementById('productForm').reset();
}
