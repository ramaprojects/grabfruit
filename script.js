let cart = [];

// ====== CART FUNCTIONS ======
function addToCart(name, price) {
    const item = cart.find(i => i.name === name);
    if (item) item.qty++;
    else cart.push({ name, price, qty: 1 });
    renderCart();
}

function updateQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    renderCart();
}

function removeItem(index) {
    if (!confirm("Hapus item ini dari keranjang?")) return;
    cart.splice(index, 1);
    renderCart();
}

function getTotalPrice() {
    return cart.reduce((t, i) => t + i.price * i.qty, 0);
}

function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    badge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
}

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.disabled = cart.length === 0;
}

function renderCart() {
    const list = document.getElementById("cart-list");
    const totalEl = document.getElementById("total-price");

    list.innerHTML = "";
    if (cart.length === 0) {
        list.innerHTML = `<li class="cart-empty">Keranjang masih kosong</li>`;
        totalEl.textContent = "Total: Rp 0";
        updateCartBadge();
        updateCheckoutButton();
        return;
    }

    cart.forEach((item, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="cart-item-left">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">Rp ${(item.price * item.qty).toLocaleString("id-ID")}</span>
            </div>
            <div class="cart-item-right">
                <div class="qty-control">
                    <button data-action="decrease" data-index="${i}">−</button>
                    <span>${item.qty}</span>
                    <button data-action="increase" data-index="${i}">+</button>
                </div>
                <button class="remove-btn" data-action="remove" data-index="${i}">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });

    totalEl.textContent = `Total: Rp ${getTotalPrice().toLocaleString("id-ID")}`;
    updateCartBadge();
    updateCheckoutButton();
}

// ====== MENU EVENT DELEGATION ======
document.getElementById("menu-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;

    const li = btn.closest(".menu-item");
    const name = li.dataset.name;
    const price = parseInt(li.dataset.price);
    addToCart(name, price);
});

// ====== CART EVENT DELEGATION ======
document.getElementById("cart-list").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const { action, index } = btn.dataset;
    if (action === "increase") updateQty(index, 1);
    if (action === "decrease") updateQty(index, -1);
    if (action === "remove") removeItem(index);
});

// ====== SCROLL HERO ======
document.getElementById("scroll-menu-btn").addEventListener("click", () => {
    document.querySelector(".menu").scrollIntoView({ behavior: "smooth" });
});

// ====== PAYMENT ======
document.getElementById("checkout-btn").addEventListener("click", goToPayment);

document.getElementById("payment-section").addEventListener("click", (e) => {
    const btn = e.target.closest(".payment-btn");
    if (!btn) return;
    const method = btn.dataset.method;
    selectPayment(method);
});

function goToPayment() {
    if (cart.length === 0) return showToast("Keranjang masih kosong");

    const customer = document.getElementById("customer-name").value.trim();
    if (!customer) return showToast("Isi nama pemesan");

    document.getElementById("payment-section").classList.remove("hidden");
    document.getElementById("payment-section").scrollIntoView({ behavior: "smooth" });
}

function selectPayment(method) {
    if (method === "whatsapp") orderWhatsApp();
    if (method === "transfer") openTransfer();
    if (method === "qris") openQris();
}

function orderWhatsApp() {
    const name = document.getElementById("customer-name").value.trim();
    const total = getTotalPrice();

    const message = `halo ram. aku ${name}\n\npesananku ini ya:\n` +
        cart.map((i, idx) => `${idx + 1}. ${i.name} x ${i.qty}`).join("\n") +
        `\n\nTotal: Rp ${total.toLocaleString("id-ID")}`;

    window.open(`https://wa.me/6282233425752?text=${encodeURIComponent(message)}`, "_blank");
}

// ====== MODAL ======
document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const close = btn.dataset.close;
        if (close === "transfer") closeTransfer();
        if (close === "qris") closeQris();
    });
});

function openTransfer() { document.getElementById("transfer-modal").classList.remove("hidden"); }
function closeTransfer() { document.getElementById("transfer-modal").classList.add("hidden"); }
function openQris() { document.getElementById("qris-modal").classList.remove("hidden"); }
function closeQris() { document.getElementById("qris-modal").classList.add("hidden"); }

document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.dataset.copy;
        try {
            await navigator.clipboard.writeText(document.getElementById(id).innerText);
            showToast("Nomor rekening berhasil disalin");
        } catch (err) {
            showToast("Gagal menyalin rekening");
        }
    });
});

document.querySelector(".qris-confirm").addEventListener("click", () => {
    closeQris();
    orderWhatsApp();
});

// ====== TOAST ======
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hidden");
    }, 2000);
}

renderCart();