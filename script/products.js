/* ==========================
   CATEGORÍAS
   ========================== */
const CATEGORIES = [
  "Navidad",
  "Halloween",
  "San Valentín",
];

function getCategories() {
  return CATEGORIES;
}

/* ==========================
   PRODUCTOS / STORAGE
   ========================== */
function getProducts() {
  try {
    const products = localStorage.getItem("products");
    const parsed = products ? JSON.parse(products) : [];

    return parsed.filter(p =>
      p &&
      typeof p === "object" &&
      p.id &&
      p.name &&
      p.price &&
      p.link &&
      Array.isArray(p.images) &&
      p.images.length > 0
    );
  } catch (e) {
    console.error("Error leyendo productos:", e);
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function addProduct(product) {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

function updateProduct(id, updatedProduct) {
  const products = getProducts();
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index !== -1) {
    products[index] = updatedProduct;
    saveProducts(products);
  }
}

function deleteProduct(id) {
  const products = getProducts();
  const filtered = products.filter(p => String(p.id) !== String(id));
  saveProducts(filtered);
}

/* ==========================
   FILTRO POR CATEGORÍA
   ========================== */
let currentSelectedCategory = "all";

function filterByCategory(category) {
  currentSelectedCategory = category;
  const products = getProducts();

  if (category === "all") {
    displayProducts(products);
  } else {
    const filtered = products.filter(p => p.category === category);
    displayProducts(filtered);
  }
}

/* ==========================
   MOSTRAR PRODUCTOS (INDEX)
   ========================== */
function displayProducts(productsToDisplay = null) {
  const products = productsToDisplay || getProducts();
  const grid = document.getElementById("productosGrid");
  const noProducts = document.getElementById("noProducts");

  if (!grid) return;

  if (products.length === 0) {
    grid.style.display = "none";
    noProducts.style.display = "block";

    const text = document.getElementById("noProductsText");
    if (text) {
      text.textContent =
        currentSelectedCategory === "all"
          ? "No hay productos disponibles."
          : `No hay productos disponibles en la categoría "${currentSelectedCategory}".`;
    }
    return;
  }

  grid.style.display = "grid";
  noProducts.style.display = "none";

  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img 
          src="${product.images[0]}" 
          alt="${product.name}"
          id="product-img-p${product.id}"
          data-selected-color="0">
      </div>

      <div class="color-dots">
        ${product.images.map((_, index) => `
          <span 
            class="color-dot ${index === 0 ? "active" : ""}"
            onclick="changeProductImage('${product.id}', ${index}, this)">
          </span>
        `).join("")}
      </div>

      <div class="product-info">
        <h3>${product.name}</h3>
        ${product.category ? `<p class="product-category">${product.category}</p>` : ""}
        <p class="product-price">$${product.price}</p>
        <a href="#" onclick="buyProduct('${product.id}')" class="btn-buy">
          <i class="fa-solid fa-cart-shopping"></i> Comprar
        </a>
      </div>
    </div>
  `).join("");
}

/* ==========================
   CAMBIAR IMAGEN / COLOR
   ========================== */
function changeProductImage(productId, imageIndex, dotElement) {
  const products = getProducts();
  const product = products.find(p => String(p.id) === String(productId));
  if (!product || !product.images[imageIndex]) return;

  const img = document.getElementById(`product-img-p${productId}`);
  if (!img) return;

  img.src = product.images[imageIndex];
  img.dataset.selectedColor = imageIndex;

  dotElement.parentElement
    .querySelectorAll(".color-dot")
    .forEach(dot => dot.classList.remove("active"));

  dotElement.classList.add("active");
}

/* ==========================
   COMPRAR POR WHATSAPP
   ========================== */
function buyProduct(productId) {
  const products = getProducts();
  const product = products.find(p => String(p.id) === String(productId));
  if (!product) return;

  const img = document.getElementById(`product-img-p${productId}`);
  const selectedIndex = img?.dataset?.selectedColor ?? 0;

  const message = `
Hola 👋
Quiero comprar una vela:

🕯️ Producto: ${product.name}
🎨 Color: ${parseInt(selectedIndex) + 1}
💰 Precio: $${product.price}
📂 Categoría: ${product.category}
  `.trim();

  const url = `${product.link}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/* ==========================
   MOSTRAR PRODUCTOS (ADMIN)
   ========================== */
function displayAdminProducts() {
  const products = getProducts();
  const container = document.getElementById("adminProductsList");

  if (!container) return;

  if (products.length === 0) {
    container.innerHTML =
      '<p class="no-products-admin">No hay productos registrados aún.</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="admin-product-item">
      <img 
        src="${product.images[0]}" 
        alt="${product.name}" 
        class="admin-product-thumb">

      <div class="admin-product-details">
        <h4>${product.name}</h4>
        ${product.category ? `<p class="admin-product-category">${product.category}</p>` : ""}
        <p class="admin-product-price">${product.price} $</p>
        <a href="${product.link}" target="_blank" class="admin-product-link">
          <i class="fa-solid fa-link"></i> Ver enlace
        </a>
      </div>

      <div class="admin-product-actions">
        <button onclick="editProduct('${product.id}')" class="btn-edit">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button onclick="confirmDelete('${product.id}')" class="btn-delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}