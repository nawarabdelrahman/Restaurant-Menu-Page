let products = JSON.parse(localStorage.getItem("products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let currentFilter = "الكل";

function save() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("orders", JSON.stringify(orders));
}

function showPage(id, el) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document
    .querySelectorAll(".nav-link")
    .forEach((a) => a.classList.remove("active"));
  if (el) {
    el.classList.add("active");
  } else {
    let link = document.querySelector(`.nav-link[onclick*="${id}"]`);
    if (link) link.classList.add("active");
  }

  window.scrollTo(0, 0);
  renderAll();
}

function productCard(p) {
  return `<div class="col-md-6 col-lg-4">
    <div class="card food-card">
      <img src="${p.img}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'">
      <div class="card-body d-flex flex-column">
        <div>
          <span class="badge bg-light text-dark border">${p.cat}</span>
          <h5 class="fw-bold mt-2">${p.name}</h5>
          <p class="text-muted small">${p.desc || ''}</p>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-auto pt-2">
          <span class="price">${p.price} جنيه</span>
          <button onclick="addToCart(${p.id})" class="btn btn-main btn-sm"><i class="bi bi-cart-plus"></i> أضف</button>
        </div>
      </div>
    </div>
  </div>`;
}

function renderAll() {
  let filtered =
    currentFilter === "الكل"
      ? products
      : products.filter((p) => p.cat === currentFilter);
      
  let menuGrid = document.getElementById("menu-grid");
  if (menuGrid) {
    menuGrid.innerHTML =
      filtered.map(productCard).join("") ||
      '<p class="text-center py-4">لا يوجد أصناف في هذا القسم</p>';
  }

  let featuredGrid = document.getElementById("featured");
  if (featuredGrid) {
    featuredGrid.innerHTML = products
      .slice(0, 3)
      .map(productCard)
      .join("");
  }

  let cartDiv = document.getElementById("cart-items");
  if (cartDiv) {
    if (cart.length === 0) {
      cartDiv.innerHTML =
        '<p class="text-center text-muted py-4 m-0">السلة فارغة <i class="bi bi-cart-x"></i></p>';
    } else {
      cartDiv.innerHTML = cart
        .map(
          (c, i) => `
        <div class="d-flex align-items-center justify-content-between border-bottom py-3">
          <div class="d-flex align-items-center gap-3">
            <img src="${c.img}" class="cart-img" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'">
            <div>
              <h6 class="mb-0 fw-bold">${c.name}</h6>
              <small class="text-muted">${c.price} جنيه</small>
              <div class="mt-1">
                <button onclick="changeQty(${i}, -1)" class="btn btn-sm btn-outline-secondary px-2 py-0">-</button>
                <span class="mx-2">${c.qty}</span>
                <button onclick="changeQty(${i}, 1)" class="btn btn-sm btn-outline-secondary px-2 py-0">+</button>
              </div>
            </div>
          </div>
          <div class="text-end">
            <div class="fw-bold">${c.price * c.qty} جنيه</div>
            <button onclick="removeFromCart(${i})" class="btn btn-sm text-danger p-0 mt-1"><i class="bi bi-trash"></i></button>
          </div>
        </div>`,
        )
        .join("");
    }
  }

  let total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  let totalPriceEl = document.getElementById("total-price");
  if (totalPriceEl) totalPriceEl.innerText = total + " جنيه";

  let cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) {
    cartCountEl.innerText = cart.reduce((s, c) => s + c.qty, 0);
  }

  let adminTable = document.getElementById("admin-table");
  if (adminTable) {
    adminTable.innerHTML = products
      .map(
        (p) => `
      <tr>
        <td><img src="${p.img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'"></td>
        <td><b>${p.name}</b><br><small class="text-muted">${p.cat} - ${p.price} جنيه</small></td>
        <td class="text-end"><button onclick="deleteProduct(${p.id})" class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i> حذف</button></td>
      </tr>`,
      )
      .join("");
  }

  let ordersCountEl = document.getElementById("orders-count");
  if (ordersCountEl) ordersCountEl.innerText = orders.length;

  let ordersList = document.getElementById("orders-list");
  if (ordersList) {
    ordersList.innerHTML = orders.length
      ? orders
          .map(
            (o) => `
      <div class="border rounded p-2 mb-2 small bg-light">
        <b>${o.name}</b> - ${o.phone}<br>
        <span class="text-muted">${o.address}</span><br>
        <div class="mt-1 fw-bold text-success">الإجمالي: ${o.total} جنيه</div>
        <small class="text-secondary">${o.items.map((i) => i.name + " × " + i.qty).join(", ")}</small>
      </div>`,
          )
          .join("")
      : '<small class="text-muted d-block text-center py-2">لا يوجد طلبات بعد</small>';
  }
}

function filterCat(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.remove("btn-dark");
    b.classList.add("btn-outline-dark");
  });
  if (btn) {
    btn.classList.remove("btn-outline-dark");
    btn.classList.add("btn-dark");
  }
  renderAll();
}

function addToCart(id) {
  let p = products.find((x) => x.id === id);
  if (!p) return;
  let f = cart.find((x) => x.id === id);
  if (f) f.qty++;
  else cart.push({ ...p, qty: 1 });
  save();
  renderAll();

  Swal.fire({
    icon: "success",
    title: "تمت الإضافة للسلة",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
}

function changeQty(i, d) {
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  save();
  renderAll();
}

function removeFromCart(i) {
  cart.splice(i, 1);
  save();
  renderAll();
}

function addProduct() {
  let name = document.getElementById("p-name").value.trim();
  let price = +document.getElementById("p-price").value;
  let cat = document.getElementById("p-cat").value;
  let img = document.getElementById("p-img").value.trim();
  let desc = document.getElementById("p-desc").value.trim();

  if (!name || !price || !img) {
    return Swal.fire({
      icon: "warning",
      title: "بيانات ناقصة",
      text: "يرجى إكمال جميع البيانات الأساسية",
      confirmButtonText: "حسناً",
      confirmButtonColor: "#3085d6",
    });
  }

  products.push({ id: Date.now(), name, price, cat, img, desc });
  save();
  renderAll();

  document.getElementById("p-name").value = "";
  document.getElementById("p-price").value = "";
  document.getElementById("p-img").value = "";
  document.getElementById("p-desc").value = "";

  Swal.fire({
    icon: "success",
    title: "تمت الإضافة بنجاح",
    text: "تم إضافة الصنف للمنيو",
    confirmButtonText: "حسناً",
    confirmButtonColor: "#198754",
  });
}

function deleteProduct(id) {
  Swal.fire({
    title: "هل أنت تأكد؟",
    text: "سيتم حذف هذا الصنف من المنيو نهائياً",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "نعم، احذف",
    cancelButtonText: "إلغاء",
  }).then((result) => {
    if (result.isConfirmed) {
      products = products.filter((p) => p.id !== id);
      save();
      renderAll();

      Swal.fire({
        icon: "success",
        title: "تم الحذف",
        text: "تم حذف الصنف بنجاح",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}

function placeOrder() {
  if (cart.length === 0) {
    return Swal.fire({
      icon: "info",
      title: "السلة فارغة!",
      text: "قم بإضافة بعض المنتجات أولاً لتأكيد الطلب",
      confirmButtonText: "حسناً",
      confirmButtonColor: "#0d6efd",
    });
  }

  let name = document.getElementById("c-name").value.trim();
  let phone = document.getElementById("c-phone").value.trim();
  let address = document.getElementById("c-address").value.trim();

  if (!name || !phone || !address) {
    return Swal.fire({
      icon: "warning",
      title: "بيانات التوصيل ناقصة",
      text: "يرجى إكمال جميع بيانات التوصيل قبل إرسال الطلب",
      confirmButtonText: "حسناً",
      confirmButtonColor: "#3085d6",
    });
  }

  let total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  orders.push({
    name,
    phone,
    address,
    items: [...cart],
    total,
    date: new Date().toLocaleString("ar-EG"),
  });

  cart = [];
  save();

  document.getElementById("c-name").value = "";
  document.getElementById("c-phone").value = "";
  document.getElementById("c-address").value = "";

  renderAll();

  Swal.fire({
    icon: "success",
    title: "تم استلام طلبك بنجاح",
    text: "سيتم التواصل معك قريباً لتأكيد التوصيل",
    confirmButtonText: "رائع!",
    confirmButtonColor: "#198754",
  });

  showPage("home");
}

document.addEventListener("DOMContentLoaded", renderAll);