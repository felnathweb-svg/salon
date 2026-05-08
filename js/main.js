const products = [
  {
    id: "noir-silk-column-gown",
    name: "Noir Silk Column Gown",
    category: "evening",
    price: 420,
    image: "assets/shop01.jpg",
    hover: "assets/teamfam.jpg",
    badge: "Bestseller",
    colors: ["black", "ivory"],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "ivory-atelier-dress",
    name: "Ivory Atelier Dress",
    category: "bridal",
    price: 680,
    image: "assets/interior1.png",
    hover: "assets/interior2.png",
    badge: "New",
    colors: ["ivory", "gold"],
    sizes: ["S", "M", "L"]
  },
  {
    id: "soft-gold-wrap",
    name: "Soft Gold Wrap",
    category: "accessories",
    price: 260,
    image: "assets/at09.png",
    hover: "assets/shop10.jpg",
    badge: "Limited",
    colors: ["gold", "ivory"],
    sizes: ["XS", "S", "M"]
  },
  {
    id: "rose-couture-slip",
    name: "Rose Couture Slip",
    category: "couture",
    price: 540,
    image: "assets/color.jpg",
    hover: "assets/perm.jpg",
    badge: "Atelier",
    colors: ["rose", "ivory"],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "midnight-tailored-set",
    name: "Midnight Tailored Set",
    category: "evening",
    price: 760,
    image: "assets/teamfam.jpg",
    hover: "assets/shop09.jpg",
    badge: "Signature",
    colors: ["black"],
    sizes: ["S", "M", "L"]
  },
  {
    id: "pearl-satin-clutch",
    name: "Pearl Satin Clutch",
    category: "accessories",
    price: 220,
    image: "assets/shop10.jpg",
    hover: "assets/at09.png",
    badge: "Edit",
    colors: ["ivory", "gold"],
    sizes: ["XS", "S"]
  },
  {
    id: "ceremony-organza-coat",
    name: "Ceremony Organza Coat",
    category: "bridal",
    price: 890,
    image: "assets/interior2.png",
    hover: "assets/interior1.png",
    badge: "Ceremony",
    colors: ["ivory"],
    sizes: ["S", "M", "L"]
  },
  {
    id: "sculpted-black-bodice",
    name: "Sculpted Black Bodice",
    category: "couture",
    price: 480,
    image: "assets/shop09.jpg",
    hover: "assets/cut.jpg",
    badge: "Couture",
    colors: ["black", "gold"],
    sizes: ["XS", "S", "M"]
  }
];

const colorMap = {
  black: "#111111",
  ivory: "#f3eee5",
  gold: "#c8a97e",
  rose: "#d9a7a1"
};

const state = {
  cart: JSON.parse(localStorage.getItem("atelier-cart") || "[]"),
  wishlist: new Set(JSON.parse(localStorage.getItem("atelier-wishlist") || "[]")),
  testimonialIndex: 0
};

const money = (value) => `$${value.toLocaleString("en-US")}`;

function saveState() {
  localStorage.setItem("atelier-cart", JSON.stringify(state.cart));
  localStorage.setItem("atelier-wishlist", JSON.stringify([...state.wishlist]));
}

function getProduct(id) {
  return products.find((product) => product.id === id);
}

function productCard(product) {
  const swatches = product.colors
    .map((color) => `<span class="swatch" style="--swatch:${colorMap[color] || color}" title="${color}"></span>`)
    .join("");

  return `
    <article class="product-card" data-reveal>
      <a class="product-card__image" href="product.html" aria-label="${product.name}">
        <img src="${product.image}" alt="${product.name}">
        <img src="${product.hover}" alt="${product.name} alternate view">
        <span class="product-card__badge">${product.badge}</span>
      </a>
      <button class="wishlist-btn ${state.wishlist.has(product.id) ? "is-active" : ""}" type="button" data-wishlist="${product.id}" aria-label="Toggle wishlist">♡</button>
      <button class="btn btn--light quick-add" type="button" data-add-to-cart="${product.id}">Quick add</button>
      <div class="product-card__info">
        <a href="product.html"><h3>${product.name}</h3></a>
        <p>${money(product.price)}</p>
        <div class="swatches">${swatches}</div>
      </div>
    </article>
  `;
}

function renderProductGrid(grid, items) {
  if (!grid) return;
  grid.innerHTML = items.length ? items.map(productCard).join("") : `<div class="empty-state">No pieces match this edit. Try clearing filters.</div>`;
  observeReveals();
}

function initProductGrids() {
  document.querySelectorAll("[data-product-grid]").forEach((grid) => {
    const type = grid.dataset.productGrid;
    if (type === "featured") renderProductGrid(grid, products.slice(0, 4));
    if (type === "related") renderProductGrid(grid, products.slice(1, 5));
    if (type === "shop") applyFilters();
  });
}

function selectedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function applyFilters() {
  const grid = document.querySelector('[data-product-grid="shop"]');
  if (!grid) return;

  const categories = selectedValues("category");
  const sizes = selectedValues("size");
  const colors = selectedValues("color");
  const priceInput = document.querySelector("[data-price-filter]");
  const maxPrice = priceInput ? Number(priceInput.value) : 900;
  const sort = document.querySelector("[data-sort]")?.value || "featured";

  let filtered = products.filter((product) => {
    const categoryMatch = !categories.length || categories.includes(product.category);
    const sizeMatch = !sizes.length || sizes.some((size) => product.sizes.includes(size));
    const colorMatch = !colors.length || colors.some((color) => product.colors.includes(color));
    const priceMatch = product.price <= maxPrice;
    return categoryMatch && sizeMatch && colorMatch && priceMatch;
  });

  if (sort === "low-high") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high-low") filtered.sort((a, b) => b.price - a.price);
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  document.querySelector("[data-result-count]")?.replaceChildren(document.createTextNode(filtered.length));
  document.querySelector("[data-price-label]")?.replaceChildren(document.createTextNode(money(maxPrice)));
  renderActiveFilters([...categories, ...sizes, ...colors, `Under ${money(maxPrice)}`]);
  renderProductGrid(grid, filtered);
}

function renderActiveFilters(values) {
  const target = document.querySelector("[data-active-filters]");
  if (!target) return;
  target.innerHTML = values.map((value) => `<span class="filter-chip">${value}</span>`).join("");
}

function initFilters() {
  const filters = document.querySelector("[data-filters]");
  if (!filters) return;

  filters.addEventListener("input", applyFilters);
  document.querySelector("[data-sort]")?.addEventListener("change", applyFilters);
  document.querySelector("[data-clear-filters]")?.addEventListener("click", () => {
    filters.querySelectorAll("input[type='checkbox']").forEach((input) => (input.checked = false));
    const range = filters.querySelector("[data-price-filter]");
    if (range) range.value = range.max;
    applyFilters();
  });
}

function addToCart(id) {
  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.quantity += 1;
  else state.cart.push({ id, quantity: 1 });
  saveState();
  updateCart();
  openCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
  saveState();
  updateCart();
}

function updateCart() {
  const cartItems = document.querySelector("[data-cart-items]");
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  document.querySelectorAll("[data-cart-count]").forEach((el) => (el.textContent = count));
  document.querySelector("[data-cart-subtotal]")?.replaceChildren(document.createTextNode(money(subtotal)));

  if (!cartItems) return;
  if (!state.cart.length) {
    cartItems.innerHTML = `<p class="empty-cart">Your cart is waiting for its first piece.</p>`;
    return;
  }

  cartItems.innerHTML = state.cart
    .map((item) => {
      const product = getProduct(item.id);
      if (!product) return "";
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <h3>${product.name}</h3>
            <p>${money(product.price)} x ${item.quantity}</p>
          </div>
          <button type="button" data-remove-cart="${product.id}">Remove</button>
        </div>
      `;
    })
    .join("");
}

function toggleWishlist(id) {
  if (state.wishlist.has(id)) state.wishlist.delete(id);
  else state.wishlist.add(id);
  saveState();
  updateWishlist();
}

function updateWishlist() {
  document.querySelectorAll("[data-wishlist-count]").forEach((el) => (el.textContent = state.wishlist.size));
  document.querySelectorAll("[data-wishlist]").forEach((button) => {
    button.classList.toggle("is-active", state.wishlist.has(button.dataset.wishlist));
  });
}

function openCart() {
  document.querySelector("[data-cart]")?.classList.add("is-open");
  document.body.classList.add("drawer-open");
}

function closeCart() {
  document.querySelector("[data-cart]")?.classList.remove("is-open");
  document.body.classList.remove("drawer-open");
}

function initGlobalClicks() {
  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    const wishlistButton = event.target.closest("[data-wishlist]");
    const removeButton = event.target.closest("[data-remove-cart]");

    if (addButton) addToCart(addButton.dataset.addToCart);
    if (wishlistButton) toggleWishlist(wishlistButton.dataset.wishlist);
    if (removeButton) removeFromCart(removeButton.dataset.removeCart);
  });

  document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
  document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));
}

function initHeader() {
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector(".scroll-progress");

  const update = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 28);
    if (progress) {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = height > 0 ? `${(y / height) * 100}%` : "0%";
    }
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initMobileMenu() {
  const menu = document.querySelector("[data-mobile-menu]");
  const open = () => {
    menu?.classList.add("is-open");
    menu?.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  };
  const close = () => {
    menu?.classList.remove("is-open");
    menu?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  document.querySelector("[data-menu-toggle]")?.addEventListener("click", open);
  document.querySelector("[data-menu-close]")?.addEventListener("click", close);
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
}

function initSearch() {
  const layer = document.querySelector("[data-search]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const open = () => {
    layer?.classList.add("is-open");
    document.body.classList.add("search-open");
    setTimeout(() => input?.focus(), 120);
  };
  const close = () => {
    layer?.classList.remove("is-open");
    document.body.classList.remove("search-open");
  };

  document.querySelectorAll("[data-open-search]").forEach((button) => button.addEventListener("click", open));
  document.querySelector("[data-close-search]")?.addEventListener("click", close);

  input?.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    const matches = query
      ? products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query)).slice(0, 5)
      : [];

    if (!results) return;
    results.innerHTML = matches
      .map((product) => `<a class="search-result" href="product.html"><span>${product.name}</span><strong>${money(product.price)}</strong></a>`)
      .join("");
  });
}

let revealObserver;

function observeReveals() {
  const items = document.querySelectorAll("[data-reveal]:not(.is-observed)");
  if (!items.length) return;

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
  }

  items.forEach((item) => {
    item.classList.add("is-observed");
    revealObserver.observe(item);
  });
}

function initTestimonials() {
  const slider = document.querySelector("[data-testimonial-slider]");
  if (!slider) return;

  const testimonials = [...slider.querySelectorAll(".testimonial")];
  const dots = slider.querySelector("[data-slider-dots]");
  dots.innerHTML = testimonials.map((_, index) => `<button type="button" aria-label="Show testimonial ${index + 1}"></button>`).join("");
  const dotButtons = [...dots.querySelectorAll("button")];

  const show = (index) => {
    state.testimonialIndex = index % testimonials.length;
    testimonials.forEach((item, i) => item.classList.toggle("active", i === state.testimonialIndex));
    dotButtons.forEach((item, i) => item.classList.toggle("active", i === state.testimonialIndex));
  };

  dotButtons.forEach((button, index) => button.addEventListener("click", () => show(index)));
  show(0);
  setInterval(() => show(state.testimonialIndex + 1), 4800);
}

function initForms() {
  document.querySelectorAll("[data-newsletter], [data-contact-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector("[data-form-message]");
      if (message) message.textContent = "Thank you. Your request has been received.";
      form.reset();
    });
  });
}

function initGallery() {
  const gallery = document.querySelector("[data-product-gallery]");
  if (!gallery) return;

  const main = gallery.querySelector("[data-main-product-image]");
  gallery.querySelectorAll("[data-gallery-thumb]").forEach((button) => {
    button.addEventListener("click", () => {
      gallery.querySelectorAll("[data-gallery-thumb]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      if (main) main.src = button.dataset.galleryThumb;
    });
  });
}

function initOptionButtons() {
  document.querySelectorAll(".size-row button, .swatch-row .swatch").forEach((button) => {
    button.addEventListener("click", () => {
      button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
  });
}

function hideLoader() {
  const loader = document.querySelector("[data-loader]");
  if (!loader) return;
  setTimeout(() => loader.classList.add("is-hidden"), 450);
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileMenu();
  initSearch();
  initGlobalClicks();
  initFilters();
  initProductGrids();
  initTestimonials();
  initForms();
  initGallery();
  initOptionButtons();
  observeReveals();
  updateCart();
  updateWishlist();
  hideLoader();
});
