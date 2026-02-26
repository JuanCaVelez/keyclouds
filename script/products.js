import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

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
   PRODUCTOS / FIRESTORE
   ========================== */
async function getProducts() {
  try {
    const q = query(collection(db, "products"), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Error leyendo productos:", e);
    return [];
  }
}

async function addProduct(product) {
  try {
    const docRef = await addDoc(collection(db, "products"), product);
    return docRef.id;
  } catch (e) {
    console.error("Error agregando producto:", e);
    return null;
  }
}

async function updateProduct(id, updatedProduct) {
  try {
    const ref = doc(db, "products", id);
    await updateDoc(ref, updatedProduct);
  } catch (e) {
    console.error("Error actualizando producto:", e);
  }
}

async function deleteProduct(id) {
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (e) {
    console.error("Error eliminando producto:", e);
  }
}

/* ==========================
   FILTRO POR CATEGORÍA
   ========================== */
let currentSelectedCategory = "all";

async function filterByCategory(category) {
  currentSelectedCategory = category;
  const products = await getProducts();

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
async function displayProducts(productsToDisplay = null) {
  const products = productsToDisplay || await getProducts();
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

  // Guardar productos en memoria para acceso rápido
  window._cachedProducts = products;
}

/* ==========================
   CAMBIAR IMAGEN / COLOR
   ========================== */
function changeProductImage(productId, imageIndex, dotElement) {
  const products = window._cachedProducts || [];
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
  const products = window._cachedProducts || [];
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
async function displayAdminProducts() {
  const products = await getProducts();
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

  window._cachedProducts = products;
}

export {
  getCategories,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  filterByCategory,
  displayProducts,
  displayAdminProducts,
  changeProductImage,
  buyProduct
};