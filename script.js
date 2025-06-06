/*
    Author: Luca Villella
    Date: 6 June 2025
    File: script.js
    Description: JavaScript script for website functionality, such as product sort and filter, search, and user detail validation
*/

// Load header and initialize search
function loadHeader() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            setupMenuToggle(); // <- move here, after injection
            initialiseSearch(); // if needed
        })
        .catch(error => console.error('Header load failed:', error));
}

function goHome() {
    window.location.href = 'index.html';
}

//Side menu
function setupMenuToggle() {
    const menuButton = document.querySelector('.menu-button');
    const overlay = document.querySelector('.slide-menu-overlay');
    const slideMenu = document.querySelector('.slide-menu');
    const closeButton = document.querySelector('.close-menu');
    const bgClick = document.querySelector('.overlay-bg');

    if (!menuButton || !overlay || !slideMenu) return;

    menuButton.addEventListener('click', () => {
        overlay.classList.add('active');
        slideMenu.classList.add('active');
    });

    const closeMenu = () => {
        overlay.classList.remove('active');
        slideMenu.classList.remove('active');
    };

    closeButton?.addEventListener('click', closeMenu);
    bgClick?.addEventListener('click', closeMenu);
}

// Run header logic
document.addEventListener('DOMContentLoaded', () => {
    const shouldLoadHeader = document.body.dataset.loadHeader === "true";
    if (shouldLoadHeader) {
        loadHeader();
    } else {
        initialiseSearch();
        setupMenuToggle();
    }
});

// Modal image viewer
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('modal-close');

    if (!modal || !modalImg || !closeBtn) return;

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

// Sort & Filter Logic
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.product-card-grid');

    if (!grid) return;

    const allLinks = Array.from(grid.children);
    const products = allLinks.map(link => link.querySelector('.product-card'));

    // Sort
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
            }

            grid.innerHTML = '';
            sorted.forEach(card => {
                const wrapper = card.closest('a');
                grid.appendChild(wrapper);
            });
        });

        document.querySelector('.sort-link')?.click();
    });

    // Filter
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

                let visible = activeFilters.length === 0 || activeFilters.some(filter => {
                    if (['protein', 'creatine', 'pre workout'].includes(filter)) {
                        return category.includes(filter.replace(/\s/g, ''));
                    } else if (filter === 'under $100') {
                        return price < 100;
                    } else if (filter === '$100 and over') {
                        return price >= 100;
                    }
                    return false;
                });

                wrapper.style.display = visible ? 'inline-block' : 'none';
            });
        });
    });
});

// Search Logic
function initialiseSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    const isProductListPage = window.location.pathname.includes('product-list.html');
    const storedQuery = sessionStorage.getItem('searchQuery') || '';

    const productList = [
        { name: "GOLD STANDARD 100% WHEY", link: "product1.html" },
        { name: "DISORDER PRE WORKOUT", link: "product2.html" },
        { name: "SHRED SYSTEM CREATINE", link: "product3.html" },
        { name: "SLEEP AID RECOVERY", link: "product4.html" },
        { name: "EMRALD LABS CREATINE", link: "product5.html" },
        { name: "EMRALD LABS PRE LOAD BLACK", link: "product6.html" },
        { name: "R1 WHEY ISOLATE PROTEIN", link: "product7.html" },
        { name: "PER4M PRE WORKOUT", link: "product8.html" }
    ];

    function getMatches(query) {
        return productList.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    }

    searchInputs.forEach(input => {
        const suggestionBox = document.createElement('ul');
        suggestionBox.className = 'search-suggestions';
        input.parentNode.style.position = 'relative';
        suggestionBox.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            list-style: none;
            margin: 0;
            padding: 0;
            z-index: 1000;
            display: none;
        `;

        input.parentNode.appendChild(suggestionBox);

        input.addEventListener('input', () => {
            const query = input.value.trim();
            suggestionBox.innerHTML = '';

            if (!query) {
                suggestionBox.style.display = 'none';
                return;
            }

            const matches = getMatches(query);
            if (matches.length === 0) {
                suggestionBox.style.display = 'none';
                return;
            }

            matches.forEach(match => {
                const li = document.createElement('li');
                li.textContent = match.name;
                li.style.padding = '8px 12px';
                li.style.cursor = 'pointer';
                li.addEventListener('mousedown', () => {
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
            const query = input.value.trim();
            if (e.key === 'Enter') {
                if (!isProductListPage && query) {
                    sessionStorage.setItem('searchQuery', query);
                    window.location.href = 'product-list.html';
                }
            }
        });
    });

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
}

//Cart quantity selector
document.addEventListener('DOMContentLoaded', () => {
    const quantityDisplay = document.querySelector('.quantity-selector');
    const plusButton = document.querySelector('.plus-button');
    const minusButton = document.querySelector('.minus-button');

    if (!quantityDisplay || !plusButton || !minusButton) return;

    let quantity = parseInt(quantityDisplay.textContent, 10);

    plusButton.addEventListener('click', () => {
        quantity++;
        quantityDisplay.textContent = quantity;
    });

    minusButton.addEventListener('click', () => {
        if (quantity > 1) {
        quantity--;
        quantityDisplay.textContent = quantity;
        }
    });
});

//Add items to cart
document.addEventListener('DOMContentLoaded', () => {
    const quantityDisplay = document.querySelector('.quantity-selector');
    const plusButton = document.querySelector('.plus-button');
    const minusButton = document.querySelector('.minus-button');
    const addToCartButton = document.querySelector('.add-to-cart');

    // Use the product name as the ID
    const productName = addToCartButton?.dataset.name;

    if (!quantityDisplay || !plusButton || !minusButton || !addToCartButton || !productName) return;

    let quantity = parseInt(quantityDisplay.textContent, 10);

    plusButton.addEventListener('click', () => {
        quantity++;
        quantityDisplay.textContent = quantity;
    });

    minusButton.addEventListener('click', () => {
        if (quantity > 1) {
        quantity--;
        quantityDisplay.textContent = quantity;
        }
    });

    addToCartButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};

        // Use productName as the unique key
        if (cart[productName]) {
        cart[productName] += quantity;
        } else {
        cart[productName] = quantity;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCountBubble();

        console.log("Cart updated:", cart);
    });
});

//Update bubble quantity
function updateCartCountBubble() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const total = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

    document.querySelectorAll('.cart-count-bubble').forEach(bubble => {
        bubble.textContent = total;
    });
}

document.addEventListener('DOMContentLoaded', updateCartCountBubble);

//Cart page functionality
document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-items');
    const subtotalDisplay = document.getElementById('cart-subtotal');

    const productData = {
        "GOLD STANDARD 100% WHEY": { price: 48.90, image: "images/product1-image1.png" },
        "DISORDER PRE WORKOUT": { price: 69.90, image: "images/product2-image1.png" },
        "SHRED SYSTEM CREATINE": { price: 164.90, image: "images/product3-image1.png" },
        "SLEEP AID RECOVERY": { price: 69.90, image: "images/product4-image1.png" },
        "EMRALD LABS CREATINE": { price: 18.90, image: "images/product5-image1.png" },
        "EMRALD LABS PRE LOAD BLACK": { price: 74.90, image: "images/product6-image1.png" },
        "R1 WHEY ISOLATE PROTEIN": { price: 119.90, image: "images/product7-image1.png" },
        "PER4M PRE WORKOUT": { price: 79.90, image: "images/product8-image1.png" }
    };

    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        cartContainer.innerHTML = '';
        let subtotal = 0;

        for (const [productName, quantity] of Object.entries(cart)) {
            const { price, image } = productData[productName] || {};
            const itemTotal = price * quantity;
            subtotal += itemTotal;

            const item = document.createElement('div');
            item.className = 'cart-item';
            item.innerHTML = `
                <img src="${image}" alt="${productName}" class="cart-item-image">
                <div class="cart-item-info">
                    <h2>${productName}</h2>
                    <p>Price: $${price.toFixed(2)}</p>
                    <div class="quantity-box">
                        <button class="minus-button" data-name="${productName}">
                            <img src="images/minus-icon.png" alt="minus icon" class="minus-icon">
                        </button> 
                        <p class="quantity-selector">${quantity}</p>
                        <button class="plus-button" data-name="${productName}">
                            <img src="images/plus-icon.png" alt="plus icon" class="plus-icon">
                        </button> 
                        <button class="remove-btn" data-name="${productName}">
                            <img src="images/remove-icon.png" alt="remove icon" class="remove-icon">
                        </button>
                    </div>
                </div>
            `;

            item.querySelector('.minus-button').addEventListener('click', () => updateQuantity(productName, quantity - 1));
            item.querySelector('.plus-button').addEventListener('click', () => updateQuantity(productName, quantity + 1));
            item.querySelector('.remove-btn').addEventListener('click', () => removeItem(productName));

            cartContainer.appendChild(item);
        }

        subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
        updateCartCountBubble();
    }

    function updateQuantity(productName, newQuantity) {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        if (newQuantity < 1) {
            delete cart[productName];
        } else {
            cart[productName] = newQuantity;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    function removeItem(productName) {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        delete cart[productName];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    function updateCartCountBubble() {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const total = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        document.querySelectorAll('.cart-count-bubble').forEach(bubble => {
            bubble.textContent = total;
        });
    }

    renderCart();
});

//Checkout page authentication
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', function (e) {
        if (!form.checkValidity()) {
            alert("Please ensure all fields are correctly filled.");
            return;
        }
        e.preventDefault();
        window.location.href = 'purchase-successful.html';
    });
});