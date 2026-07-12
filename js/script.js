const API_URL = 'https://flora-backend-983x.onrender.com/api/bouquets';

const openMenuButton = document.querySelector('[data-menu-open]');
const closeMenuButton = document.querySelector('[data-menu-close]');
const mobileMenu = document.querySelector('[data-menu]');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
const featuredList = document.querySelector('.top-selling .product-list');
const bouquetList = document.querySelector('.bouquets .product-list');
const loadMoreButton = document.querySelector('[data-load-more]');
const previousFeaturedButton = document.querySelector('[data-featured-prev]');
const nextFeaturedButton = document.querySelector('[data-featured-next]');
const bouquetSearchInput = document.querySelector('[data-bouquet-search]');
const orderModal = document.querySelector('[data-order-modal]');
const orderOpenButtons = document.querySelectorAll('[data-order-open]');
const orderCloseButton = document.querySelector('[data-order-close]');
const orderForm = document.querySelector('[data-order-form]');
const formMessage = document.querySelector('[data-form-message]');
const productModal = document.querySelector('[data-product-modal]');
const productCloseButton = document.querySelector('[data-product-close]');
const productBuyButton = document.querySelector('[data-product-buy]');
const reviewCards = [...document.querySelectorAll('.review-card')];
const previousReviewsButton = document.querySelector('[data-reviews-prev]');
const nextReviewsButton = document.querySelector('[data-reviews-next]');
const products = new Map();
let searchTimeout;
let bouquetsRequestId = 0;
let reviewsPage = 0;

const state = { page: 1, limit: 4, total: 0, search: '' };
const featuredState = { page: 1, limit: 3, total: 0 };

function toggleMenu() {
  const isOpen = mobileMenu.classList.toggle('is-open');
  openMenuButton.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function toggleOrderModal() {
  const isOpen = orderModal.classList.toggle('is-open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function createProductMarkup(product) {
  return `
    <li class="product-card" data-product-id="${product.id}">
      <img class="product-image" src="${product.photoURL}" width="1280" alt="${product.description}" />
      <h3>${product.title}</h3>
      <p>$${Number(product.price).toFixed(0)}</p>
    </li>`;
}

function toggleProductModal() { const isOpen = productModal.classList.toggle('is-open'); document.body.style.overflow = isOpen ? 'hidden' : ''; }
function showProduct(product) {
  productModal.querySelector('[data-product-image]').src = product.photoURL;
  productModal.querySelector('[data-product-image]').alt = product.description;
  productModal.querySelector('[data-product-title]').textContent = product.title;
  productModal.querySelector('[data-product-price]').textContent = `$${Number(product.price).toFixed(0)}`;
  productModal.querySelector('[data-product-description]').textContent = product.description;
  toggleProductModal();
}

function showReviews() {
  reviewCards.forEach((card, index) => {
    card.hidden = index < reviewsPage * 3 || index >= reviewsPage * 3 + 3;
  });
  previousReviewsButton.disabled = reviewsPage === 0;
  nextReviewsButton.disabled = (reviewsPage + 1) * 3 >= reviewCards.length;
}

async function loadFeatured() {
  try {
    const { data } = await axios.get(API_URL, { params: { page: featuredState.page, limit: featuredState.limit } });
    featuredList.innerHTML = '';
    data.items.forEach(product => products.set(String(product.id), product));
    featuredList.insertAdjacentHTML('beforeend', data.items.map(createProductMarkup).join(''));
    featuredState.total = data.total;
    previousFeaturedButton.disabled = featuredState.page === 1;
    nextFeaturedButton.disabled = featuredState.page * featuredState.limit >= featuredState.total;
  } catch (error) {
    featuredList.innerHTML = '<li>Unable to load bouquets. Please try again later.</li>';
  }
}

async function loadBouquets(reset = false) {
  if (reset) {
    state.page = 1;
    bouquetList.innerHTML = '';
  }
  loadMoreButton.disabled = true;
  loadMoreButton.textContent = 'Loading...';
  const requestId = ++bouquetsRequestId;

  try {
    const { data } = await axios.get(API_URL, {
      params: { page: state.page, limit: state.limit, favorite: false, search: state.search },
    });
    if (requestId !== bouquetsRequestId) return;
    state.total = data.total;
    data.items.forEach(product => products.set(String(product.id), product));
    bouquetList.insertAdjacentHTML('beforeend', data.items.map(createProductMarkup).join(''));
    state.page += 1;
    const loaded = bouquetList.querySelectorAll('.product-card').length;
    const hasMore = loaded < state.total;
    loadMoreButton.hidden = !hasMore;
    loadMoreButton.disabled = !hasMore;
    loadMoreButton.textContent = 'Show more';
  } catch (error) {
    if (requestId !== bouquetsRequestId) return;
    bouquetList.innerHTML = '<li>Unable to load bouquets. Please try again later.</li>';
    loadMoreButton.hidden = true;
  }
}

openMenuButton.addEventListener('click', toggleMenu);
closeMenuButton.addEventListener('click', toggleMenu);
mobileMenuLinks.forEach(link => link.addEventListener('click', toggleMenu));
loadMoreButton.addEventListener('click', () => loadBouquets());
previousFeaturedButton.addEventListener('click', () => { featuredState.page -= 1; loadFeatured(); });
nextFeaturedButton.addEventListener('click', () => { featuredState.page += 1; loadFeatured(); });
bouquetSearchInput.addEventListener('input', event => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    state.search = event.target.value.trim();
    loadBouquets(true);
  }, 350);
});
orderOpenButtons.forEach(button => button.addEventListener('click', () => {
  if (mobileMenu.classList.contains('is-open')) toggleMenu();
  toggleOrderModal();
}));
orderCloseButton.addEventListener('click', toggleOrderModal);
orderModal.addEventListener('click', event => { if (event.target === orderModal) toggleOrderModal(); });
orderForm.addEventListener('submit', event => {
  event.preventDefault();
  formMessage.textContent = 'Thank you! Your order request has been sent.';
  orderForm.reset();
});
document.addEventListener('click', event => {
  const card = event.target.closest('.product-card');
  if (card && products.has(card.dataset.productId)) showProduct(products.get(card.dataset.productId));
});
productCloseButton.addEventListener('click', toggleProductModal);
productModal.addEventListener('click', event => { if (event.target === productModal) toggleProductModal(); });
productBuyButton.addEventListener('click', () => { toggleProductModal(); toggleOrderModal(); });
previousReviewsButton.addEventListener('click', () => { reviewsPage -= 1; showReviews(); });
nextReviewsButton.addEventListener('click', () => { reviewsPage += 1; showReviews(); });

loadFeatured();
loadBouquets(true);
showReviews();
