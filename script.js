var cart = {
    empty: false,
    numItem1: 0,
    numItem2: 0,
    numItem3: 0,
    numItem4: 0,
    numItem5: 0,
    numItem6: 0,
    numItem7: 0,
    numItem8: 0
}

//Print header
function loadHeader() {
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header').innerHTML = data;
    })
    .catch(error => console.error('Header load failed:', error));
}

function goHome() {
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const shouldLoadHeader = document.body.dataset.loadHeader === "true";
  if (shouldLoadHeader) {
    loadHeader();
  }
});

//Image modal box feature
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('modal-close');

    const thumbnails = document.querySelectorAll('.focus-image, .focus-image-sm, .sml-image1, .sml-image2');

    thumbnails.forEach(img => {
        img.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modalImg.src = img.src;
            modalImg.alt = img.alt;
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modalImg.src = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modalImg.src = '';
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.product-card-grid');
    const allLinks = Array.from(grid.children);
    const products = allLinks.map(link => link.querySelector('.product-card'));

    //Search functionality
    document.querySelectorAll('.sort-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();

            document.querySelectorAll('.sort-dot').forEach(dot => dot.classList.remove('active'));
            document.querySelectorAll('.search-text').forEach(txt => txt.classList.remove('active'));

            link.querySelector('.sort-dot').classList.add('active');
            link.querySelector('.search-text').classList.add('active');

            const label = link.textContent.trim();
            let sorted = [...products];

            if (label.includes('Low to High')) {
                sorted.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
            } else if (label.includes('High to Low')) {
                sorted.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
            } else if (label.includes('A-Z')) {
                sorted.sort((a, b) => a.querySelector('.cover-title').textContent.localeCompare(b.querySelector('.cover-title').textContent));
            } else if (label.includes('Z-A')) {
                sorted.sort((a, b) => b.querySelector('.cover-title').textContent.localeCompare(a.querySelector('.cover-title').textContent));
            } else {
                sorted = products;
            }

            grid.innerHTML = '';
            sorted.forEach(card => {
                const wrapper = card.closest('a');
                grid.appendChild(wrapper);
            });
        });

        document.querySelector('.sort-link')?.click();
    });

    //Filter functionality
    document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();

        link.querySelector('.filter-dot').classList.toggle('active');
        link.querySelector('.search-text').classList.toggle('active');

        const activeFilters = Array.from(document.querySelectorAll('.filter-link .search-text.active'))
            .map(el => el.textContent.trim().toLowerCase());

        products.forEach(card => {
            const price = parseFloat(card.dataset.price);
            const category = card.dataset.category.toLowerCase();
            const wrapper = card.closest('a');

            let visible = true;

            if (activeFilters.length === 0) {
                visible = true; // Show all if no filters are selected
            } else {
                visible = activeFilters.some(filter => {
                    if (filter === 'protein' || filter === 'creatine' || filter === 'pre workout') {
                        return category.includes(filter.replace(/\s/g, ''));
                    } else if (filter === 'under $100') {
                        return price < 100;
                    } else if (filter === '$100 and over') {
                        return price >= 100;
                    }
                    return false;
                });
            }

            wrapper.style.display = visible ? 'inline-block' : 'none';
        });
    });
    });
});

//Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('.search-input');
    const isProductListPage = window.location.pathname.includes('product-list.html');
    const storedQuery = sessionStorage.getItem('searchQuery') || '';

    searchInputs.forEach(input => {
        const suggestionBox = document.createElement('ul');
        suggestionBox.classList.add('search-suggestions');
        suggestionBox.style.position = 'absolute';
        suggestionBox.style.background = '#fff';
        suggestionBox.style.zIndex = '1000';
        suggestionBox.style.listStyle = 'none';
        suggestionBox.style.margin = '0';
        suggestionBox.style.padding = '0';
        suggestionBox.style.width = input.offsetWidth + 'px';
        suggestionBox.style.display = 'none';

        input.parentNode.appendChild(suggestionBox);

        input.addEventListener('input', () => {
            const query = input.value.toLowerCase();
            suggestionBox.innerHTML = '';

            if (!query) {
                suggestionBox.style.display = 'none';
                return;
            }

            const matches = Array.from(document.querySelectorAll('[data-name]'))
                .map(el => ({
                    name: el.dataset.name,
                    link: el.closest('a')?.href || '#'
                }))
                .filter(item => item.name.toLowerCase().includes(query))
                .slice(0, 5); // Limit suggestions

            if (matches.length === 0) {
                suggestionBox.style.display = 'none';
                return;
            }

            matches.forEach(match => {
                const li = document.createElement('li');
                li.textContent = match.name;
                li.style.padding = '8px 12px';
                li.style.cursor = 'pointer';
                li.addEventListener('click', () => {
                    window.location.href = match.link;
                });
                suggestionBox.appendChild(li);
            });

            suggestionBox.style.display = 'block';
        });

        input.addEventListener('blur', () => {
            setTimeout(() => suggestionBox.style.display = 'none', 150);
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const query = input.value.trim();

                if (!isProductListPage && query) {
                    sessionStorage.setItem('searchQuery', query);
                    window.location.href = 'product-list.html';
                }

                if (isProductListPage && query) {
                    const productLinks = document.querySelectorAll('.product-card-grid > a');
                    const grid = document.querySelector('.product-card-grid');

                    let matchesFound = false;

                    productLinks.forEach(link => {
                        const card = link.querySelector('.product-card');
                        const name = card.dataset.name.toLowerCase();
                        const match = name.includes(query.toLowerCase());

                        link.style.display = match ? 'inline-block' : 'none';
                        if (match) matchesFound = true;
                    });

                    // Remove any previous message
                    const oldMessage = document.getElementById('no-results-message');
                    if (oldMessage) oldMessage.remove();

                    // If no matches, show message
                    if (!matchesFound) {
                        const message = document.createElement('div');
                        message.id = 'no-results-message';
                        message.textContent = 'NO ITEMS FOUND';
                        message.style.fontSize = '24px';
                        message.style.color = 'var(--color-text)';
                        message.style.padding = '48px';
                        message.style.textAlign = 'center';
                        message.style.gridColumn = '1 / -1';
                        grid.appendChild(message);
                    }
                }
            }
        });
    });

    // Auto-search when landing on product list page
    if (isProductListPage && storedQuery) {
        const input = document.querySelector('.search-input');
        if (input) {
            input.value = storedQuery;
            const productLinks = document.querySelectorAll('.product-card-grid > a');
            productLinks.forEach(link => {
                const card = link.querySelector('.product-card');
                const name = card.dataset.name.toLowerCase();
                link.style.display = name.includes(storedQuery.toLowerCase()) ? 'inline-block' : 'none';
            });
        }
        sessionStorage.removeItem('searchQuery');
    }
});