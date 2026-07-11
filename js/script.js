const API_URL = 'https://flora-backend-983x.onrender.com/api/bouquets';

const openMenuButton = document.querySelector('[data-menu-open]');
const closeMenuButton = document.querySelector('[data-menu-close]');
const mobileMenu = document.querySelector('[data-menu]');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
const featuredList = document.querySelector('.top-selling .product-list');
const bouquetList = document.querySelector('.bouquets .product-list');
const loadMoreButton = document.querySelector('.bouquets .button');

const state = { page: 1, limit: 4, total: 0 };

function toggleMenu() {
  const isOpen = mobileMenu.classList.toggle('is-open');
  openMenuButton.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function createProductMarkup(product) {
  return `
    <li class="product-card">
      <img class="product-image" src="${product.photoURL}" width="1280" alt="${product.description}" />
      <h3>${product.title}</h3>
      <p>$${Number(product.price).toFixed(0)}</p>
    </li>`;
}

async function loadFeatured() {
  try {
    const { data } = await axios.get(API_URL, { params: { favorite: true, limit: 3 } });
    featuredList.innerHTML = '';
    featuredList.insertAdjacentHTML('beforeend', data.items.map(createProductMarkup).join(''));
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

  try {
    const { data } = await axios.get(API_URL, {
      params: { page: state.page, limit: state.limit, favorite: false },
    });
    state.total = data.total;
    bouquetList.insertAdjacentHTML('beforeend', data.items.map(createProductMarkup).join(''));
    state.page += 1;

    const loaded = bouquetList.querySelectorAll('.product-card').length;
    const hasMore = loaded < state.total;
    loadMoreButton.hidden = !hasMore;
    loadMoreButton.disabled = !hasMore;
    loadMoreButton.textContent = hasMore ? 'View more' : 'All bouquets are shown';
  } catch (error) {
    bouquetList.innerHTML = '<li>Unable to load bouquets. Please try again later.</li>';
    loadMoreButton.hidden = true;
  }
}

openMenuButton.addEventListener('click', toggleMenu);
closeMenuButton.addEventListener('click', toggleMenu);
mobileMenuLinks.forEach(link => link.addEventListener('click', toggleMenu));
loadMoreButton.addEventListener('click', () => loadBouquets());

loadFeatured();
loadBouquets(true);
