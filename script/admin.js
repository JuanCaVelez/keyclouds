let editingProductId = null;

/* ==========================
   INICIALIZACIÓN
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  displayAdminProducts();
  loadCategorySelect();
});

/* ==========================
   FORMULARIO
   ========================== */
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();
  saveProduct();
});

/* ==========================
   GUARDAR PRODUCTO
   ========================== */
function saveProduct() {
  const id = document.getElementById("productId").value || String(Date.now());
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const price = document.getElementById("productPrice").value.trim();
  const link = document.getElementById("productLink").value.trim();

  const image1 = document.getElementById("productImage1").value.trim();
  const image2 = document.getElementById("productImage2").value.trim();
  const image3 = document.getElementById("productImage3").value.trim();

  const images = [image1, image2, image3].filter(Boolean);

  if (!name || !category || !price || !link || images.length === 0) {
    alert("Completa todos los campos obligatorios");
    return;
  }

  const product = { id, name, category, price, images, link };

  let products = JSON.parse(localStorage.getItem("products")) || [];
  const index = products.findIndex(p => p.id == id);

  if (index !== -1) {
    products[index] = product;
  } else {
    products.push(product);
  }

  localStorage.setItem("products", JSON.stringify(products));

  resetForm();
  displayAdminProducts();
  alert("Producto guardado correctamente ✅");
}

/* ==========================
   MOSTRAR ADMIN
   ========================== */
function displayAdminProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const container = document.getElementById("adminProductsList");

  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = "<p>No hay productos registrados</p>";
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="admin-product-item">
      <img src="${product.images[0]}" class="admin-product-thumb">
      <div>
        <h4>${product.name}</h4>
        <p>${product.category}</p>
        <p>$${product.price}</p>
      </div>
      <div>
        <button onclick="editProduct('${product.id}')">✏️</button>
        <button onclick="deleteProduct('${product.id}')">🗑️</button>
      </div>
    </div>
  `).join("");
}

/* ==========================
   EDITAR / ELIMINAR
   ========================== */
function editProduct(id) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find(p => p.id == id);
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productLink").value = product.link;
  document.getElementById("productImage1").value = product.images[0] || "";
  document.getElementById("productImage2").value = product.images[1] || "";
  document.getElementById("productImage3").value = product.images[2] || "";
}

function deleteProduct(id) {
  if (!confirm("¿Eliminar producto?")) return;
  let products = JSON.parse(localStorage.getItem("products")) || [];
  products = products.filter(p => p.id != id);
  localStorage.setItem("products", JSON.stringify(products));
  displayAdminProducts();
}

/* ==========================
   CATEGORÍAS
   ========================== */
function loadCategorySelect() {
  const select = document.getElementById("productCategory");
  select.innerHTML = `<option value="">Selecciona una categoría</option>`;

  getCategories().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
}