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