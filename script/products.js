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
          id="product-img-${product.id}"
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
        <p class="product-category">${product.category}</p>
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
  const product = products.find(p => p.id == productId);
  if (!product) return;

  const img = document.getElementById(`product-img-${productId}`);
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
  const product = products.find(p => p.id == productId);
  if (!product) return;

  const img = document.getElementById(`product-img-${productId}`);
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