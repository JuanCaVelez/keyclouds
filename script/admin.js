let editingProductId = null;

/* ==========================
   INICIALIZACIÓN
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  displayAdminProducts();
  loadCategorySelect();
});

/* ==========================
   ENVÍO DEL FORMULARIO
   ========================== */
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();
  saveProduct();
});

/* ==========================
   GUARDAR / EDITAR PRODUCTO
   ========================== */
function saveProduct() {
  const id = document.getElementById("productId").value || Date.now();
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const price = document.getElementById("productPrice").value.trim();
  const link = document.getElementById("productLink").value.trim();

  // URLs Cloudinary (hasta 3 colores)
  const image1 = document.getElementById("productImage1").value.trim();
  const image2 = document.getElementById("productImage2").value.trim();
  const image3 = document.getElementById("productImage3").value.trim();

  const images = [image1, image2, image3].filter(img => img !== "");

  // Validaciones
  if (!name || !category || !price || !link) {
    alert("Completa todos los campos obligatorios");
    return;
  }

  if (images.length === 0) {
    alert("Debes agregar al menos una imagen de Cloudinary");
    return;
  }

  const product = {
    id,
    name,
    category,
    price,
    images,
    link
  };

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
   EDITAR PRODUCTO
   ========================== */
function editProduct(id) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find(p => p.id === id);

  if (!product) return;

  editingProductId = id;

  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productLink").value = product.link;

  // Rellenar URLs Cloudinary
  document.getElementById("productImage1").value = product.images[0] || "";
  document.getElementById("productImage2").value = product.images[1] || "";
  document.getElementById("productImage3").value = product.images[2] || "";

  document.getElementById("formTitle").textContent = "Editar Producto";
  document
    .querySelector(".admin-form-container")
    .scrollIntoView({ behavior: "smooth" });
}

/* ==========================
   ELIMINAR PRODUCTO
   ========================== */
function confirmDelete(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

  let products = JSON.parse(localStorage.getItem("products")) || [];
  products = products.filter(p => p.id !== id);
  localStorage.setItem("products", JSON.stringify(products));

  displayAdminProducts();
  alert("Producto eliminado exitosamente");
}

/* ==========================
   CANCELAR / RESET
   ========================== */
function cancelEdit() {
  resetForm();
}

function resetForm() {
  editingProductId = null;
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("formTitle").textContent = "Agregar Nuevo Producto";
}

/* ==========================
   CARGAR CATEGORÍAS
   ========================== */
function loadCategorySelect() {
  const select = document.getElementById("productCategory");
  if (!select) return;

  select.innerHTML = `<option value="">Selecciona una categoría</option>`;

  const categories = getCategories();
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}