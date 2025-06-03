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

    const thumbnails = document.querySelectorAll('.focus-image, .sml-image1, .sml-image2');

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