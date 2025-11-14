/* Simple Add-to-cart logic using localStorage so cart persists while browsing.
   - Adds item to cart with id, title, price, qty
   - Update qty, remove item
   - Shows subtotal and cart count
   - Checkout button currently clears the cart (placeholder)
*/

const cartKey = 'ac_cart_v1';

function readCart(){
  try{
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  }catch(e){
    return [];
  }
}
function saveCart(cart){
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function formatPrice(n){
  return '$' + Number(n).toFixed(2);
}

function updateCartCount(){
  const cart = readCart();
  const count = cart.reduce((s,i)=> s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;
}

function renderCart(){
  const cart = readCart();
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  if(cart.length === 0){
    container.innerHTML = '<p class="muted" style="padding:12px">Your cart is empty.</p>';
  } else {
    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${item.image}" alt="${escapeHtml(item.title)}">
        <div class="cart-item-info">
          <div style="font-weight:600">${escapeHtml(item.title)}</div>
          <div style="color:#999">${formatPrice(item.price)}</div>
          <div class="qty-controls">
            <button class="qty-decrease" data-id="${item.id}">-</button>
            <div style="min-width:26px;text-align:center">${item.qty}</div>
            <button class="qty-increase" data-id="${item.id}">+</button>
            <button class="btn small" style="margin-left:8px" data-id="${item.id}" data-remove>Remove</button>
          </div>
        </div>
      `;
      container.appendChild(el);
    });
  }

  // subtotal
  const subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
  updateCartCount();
}

// small helper to escape text inserted in HTML
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
}

// Add product button behaviour
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', e => {
    const card = e.target.closest('.card');
    const id = card.dataset.id;
    const title = card.dataset.title;
    const price = parseFloat(card.dataset.price);
    const img = card.querySelector('img')?.getAttribute('src') || 'images/product1.jpg';

    const cart = readCart();
    const existing = cart.find(i=>i.id===id);
    if(existing){
      existing.qty += 1;
    } else {
      cart.push({id, title, price, qty:1, image: img});
    }
    saveCart(cart);
    renderCart();
    showCart();
  });
});

// Open/close cart UI
const cartEl = document.getElementById('cart');
const overlay = document.getElementById('overlay');

function showCart(){
  cartEl.style.right = '0';
  overlay.style.opacity = '1';
  overlay.style.visibility = 'visible';
  overlay.style.zIndex = '85';
}

function hideCart(){
  cartEl.style.right = '-420px';
  overlay.style.opacity = '0';
  overlay.style.visibility = 'hidden';
  overlay.style.zIndex = '-1';
}

document.getElementById('open-cart').addEventListener('click', showCart);
document.getElementById('close-cart').addEventListener('click', hideCart);
overlay.addEventListener('click', hideCart);

// Update qty / remove
document.getElementById('cart-items').addEventListener('click', function(e){
  const cart = readCart();
  if(e.target.matches('[data-remove]')){
    const id = e.target.dataset.id;
    const newCart = cart.filter(i=> i.id !== id);
    saveCart(newCart);
    renderCart();
  } else if(e.target.matches('.qty-increase')){
    const id = e.target.dataset.id;
    const item = cart.find(i=> i.id === id);
    if(item){ item.qty += 1; saveCart(cart); renderCart(); }
  } else if(e.target.matches('.qty-decrease')){
    const id = e.target.dataset.id;
    const item = cart.find(i=> i.id === id);
    if(item){
      item.qty = Math.max(1, item.qty - 1);
      saveCart(cart);
      renderCart();
    }
  }
});

// Clear cart button
document.getElementById('clear-cart').addEventListener('click', function(){
  if(confirm('Clear cart?')){
    saveCart([]);
    renderCart();
  }
});

// Checkout placeholder
document.getElementById('checkout').addEventListener('click', function(){
  const cart = readCart();
  if(cart.length === 0){
    alert('Your cart is empty.');
    return;
  }
  // Placeholder behaviour:
  const subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  const proceed = confirm('Checkout placeholder — total: ' + formatPrice(subtotal) + '\nPress OK to simulate purchase (this will clear the cart).');
  if(proceed){
    // Simulate order and clear cart
    saveCart([]);
    renderCart();
    alert('Thank you! Your order is simulated and cart has been cleared.');
    hideCart();
  }
});

// Init
renderCart();
updateCartCount();