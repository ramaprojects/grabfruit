let cart = [];
let appliedPromo = null;


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
    badge.classList.remove("pop");
    void badge.offsetWidth;
    badge.classList.add("pop");
}

function updateCheckoutButton() {
    document.getElementById("checkout-btn").disabled = cart.length === 0;
}

// ======== PROMOTION ========
const promoCodes = {
    RASA10: { type: "percent", value: 10, minPurchase: 8000 },
    UTAMARASA5K: { type: "fixed", value: 5000, minPurchase: 25000 },
    RAMAGANTENG: { type: "fixed", value: 99999999, minPurchase: 0 },
    POB5K: { type: "fixed", value: 5000, minPurchase: 30000 }
};

function validatePromoInput() {
    const inputEl = document.getElementById("promo-input");
    const btn = document.getElementById("apply-promo-btn");
    const msgEl = document.getElementById("promo-message");

    const code = inputEl.value.trim().toUpperCase();
    const subtotal = getTotalPrice();
    
    inputEl.classList.remove("valid", "invalid");
    
    if (!code) {
        btn.disabled = true;
        msgEl.textContent = "";
        return;
    }

    const promo = promoCodes[code];
    if (!promo) {
        btn.disabled = true;
        msgEl.textContent = "Kode promo tidak valid";
        inputEl.classList.add("invalid");
        return;
    }

    if (subtotal < promo.minPurchase) {
        btn.disabled = true;
        msgEl.textContent = `Minimum belanja Rp ${promo.minPurchase.toLocaleString("id-ID")}`;
        inputEl.classList.add("invalid");
        return;
    }

    // valid & siap apply
    btn.disabled = false;
    msgEl.textContent = "Kode promo tersedia ✔️";
    inputEl.classList.add("valid");
}

const debouncedValidatePromo = debounce(validatePromoInput, 1100);

document.getElementById("promo-input")
    .addEventListener("input", debouncedValidatePromo);

;

document.getElementById("apply-promo-btn").addEventListener("click", () => {
    const inputEl = document.getElementById("promo-input");
    const msgEl = document.getElementById("promo-message");

    const code = inputEl.value.trim().toUpperCase();
    const promo = promoCodes[code];

    if (!promo) return;

    appliedPromo = promo;
    msgEl.textContent = `Promo "${code}" berhasil diterapkan! 🎉`;

    // lock button & input
    inputEl.disabled = true;
    document.getElementById("apply-promo-btn").disabled = true;

    renderCart();
});


document.getElementById("promo-input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
        document.getElementById("apply-promo-btn").click();
    }
});

function resetPromoIfInvalid() {
    if (!appliedPromo) return;

    if (getTotalPrice() < appliedPromo.minPurchase) {
        appliedPromo = null;

        const inputEl = document.getElementById("promo-input");
        inputEl.disabled = false;
        inputEl.value = "";

        document.getElementById("promo-message").textContent =
            "Promo dibatalkan (minimum belanja tidak terpenuhi)";
    }
}

function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ======== TOTAL CALCULATOR (SINGLE SOURCE) ========
function calculateTotal() {
    const subtotal = getTotalPrice();
    let discount = 0;
    let discountText = "";

    if (appliedPromo && subtotal >= appliedPromo.minPurchase) {
        if (appliedPromo.type === "percent") {
            discount = subtotal * (appliedPromo.value / 100);
            discountText = `Diskon ${appliedPromo.value}%`;
        } else {
            discount = appliedPromo.value;
            discountText = `Diskon Rp ${discount.toLocaleString("id-ID")}`;
        }
    }

    return {
        subtotal,
        discount,
        discountText,
        total: Math.max(0, subtotal - discount)
    };
}

// ======== ORDER SUMMARY ========
function renderOrderSummary() {
    const summary = document.getElementById("order-summary");
    if (!summary || cart.length === 0) return;

    const itemsHtml = cart.map(item => `
        <li>
            <span>${item.name} x${item.qty}</span>
            <span>Rp ${(item.price * item.qty).toLocaleString("id-ID")}</span>
        </li>
    `).join("");

    const { subtotal, discount, discountText, total } = calculateTotal();

    summary.classList.remove("skeleton");
    summary.innerHTML = `
        <h3>🧾 Ringkasan Pesanan</h3>
        <ul>${itemsHtml}</ul>
        <div>Subtotal: Rp ${subtotal.toLocaleString("id-ID")}</div>
        ${discount > 0 ? `<div>${discountText}: -Rp ${discount.toLocaleString("id-ID")}</div>` : ""}
        <div class="total">Total: Rp ${total.toLocaleString("id-ID")}</div>
    `;
}

// ======== CART RENDER ========
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

    const { total } = calculateTotal();
    totalEl.textContent = `Total: Rp ${total.toLocaleString("id-ID")}`;

    updateCartBadge();
    updateCheckoutButton();
    resetPromoIfInvalid();
    validatePromoInput();
}

// ====== EVENTS ======
document.getElementById("menu-list").addEventListener("click", e => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    const li = btn.closest(".menu-item");
    addToCart(li.dataset.name, parseInt(li.dataset.price));
});

document.getElementById("cart-list").addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const { action, index } = btn.dataset;
    if (action === "increase") updateQty(+index, 1);
    if (action === "decrease") updateQty(+index, -1);
    if (action === "remove") removeItem(index);
});

document.getElementById("scroll-menu-btn")
    ?.addEventListener("click", () => {
        document.querySelector(".menu")
            ?.scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.close;

        if (type === "transfer") closeTransfer();
        if (type === "qris") closeQris();
    });
});

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.add("hidden");
    });
});

// ====== MODAL CONTROLLER ======
function openTransfer() {
    document.getElementById("transfer-modal")?.classList.remove("hidden");
}

function closeTransfer() {
    document.getElementById("transfer-modal")?.classList.add("hidden");
}

function openQris() {
    document.getElementById("qris-modal")?.classList.remove("hidden");
}

function closeQris() {
    document.getElementById("qris-modal")?.classList.add("hidden");
}

// ====== PAYMENT ======
document.getElementById("checkout-btn").addEventListener("click", () => {
    if (!cart.length) return showToast("Keranjang masih kosong");

    const name = document.getElementById("customer-name").value.trim();
    if (!name) return showToast("Isi nama pemesan");

    const summary = document.getElementById("order-summary");
    summary.innerHTML = "";
    summary.classList.remove("hidden");

    for (let i = 0; i < cart.length; i++) {
        const div = document.createElement("div");
        div.className = "skeleton-item";
        summary.appendChild(div);
    }

    setTimeout(renderOrderSummary, 1200);

    document.getElementById("payment-section")
    ?.addEventListener("click", e => {
        const btn = e.target.closest(".payment-btn");
        if (!btn) return;

        const method = btn.dataset.method;

        if (method === "transfer") openTransfer();
        if (method === "qris") openQris();
        if (method === "whatsapp") orderWhatsApp();
    });

    document.getElementById("payment-section").classList.remove("hidden");
    document.getElementById("payment-section").scrollIntoView({ behavior: "smooth" });
});

// ====== WHATSAPP ======
function orderWhatsApp() {
    const name = document.getElementById("customer-name").value.trim();
    const { total } = calculateTotal();

    const message = `Halo, aku ${name}\n\nPesananku:\n` +
        cart.map((i, idx) => `${idx + 1}. ${i.name} x ${i.qty}`).join("\n") +
        `\n\nTotal: Rp ${total.toLocaleString("id-ID")}`;

    window.open(`https://wa.me/6282233425752?text=${encodeURIComponent(message)}`, "_blank");
}

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

// ===== SPLASH → HEADER → CONTENT =====
window.addEventListener("load", () => {
    const splash = document.getElementById("splash-screen");
    const header = document.querySelector(".header");
    const page = document.querySelector(".page");
    const content = document.querySelector(".container");

    document.body.classList.add("splash-active");

    setTimeout(() => {
        splash.classList.add("hide");

    page.classList.add("show");

        // header dulu
        header.classList.add("show");

        // konten nyusul dikit
        setTimeout(() => {
            content.classList.add("show");
            document.body.classList.remove("splash-active");
        }, 500);

    }, 2100);
});

// ========== AUTO SCROLL (LEFT SLIDE) ==========
const track = document.getElementById("carousel-track");
let index = 0;
let timer;

const firstClone = track.children[0].cloneNode(true);
track.appendChild(firstClone);

const cards = track.children;

function autoScrollCarousel() {
    index++;

    const targetCard = cards[index];
    
    track.scrollTo({
        left: targetCard.offsetLeft,
        behavior: "smooth"
    });

    if (index === cards.length - 1) {
        setTimeout(() => {
            track.style.scrollBehavior = "auto";
            index = 0;
            track.scrollTo({
                left: cards[index].offsetLeft
            });
            track.style.scrollBehavior = "smooth";
        }, 450); // harus sesuai durasi animasi
    }
}

setInterval(autoScrollCarousel, 2900);

track.addEventListener("touchstart", () => {
    clearInterval(timer);
});

track.addEventListener("touchend", () => {
    timer = setInterval(autoScrollCarousel, 3500);
});

// ========== DARK MODE ================ 
const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
};

// load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
}

