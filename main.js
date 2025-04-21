
async function estimatePrice() {
    const platform = document.getElementById('platform').value;
    const service = document.getElementById('service').value;
    const quantity = document.getElementById('quantity').value;

    const res = await fetch('/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, service, quantity })
    });

    const data = await res.json();
    document.getElementById('priceResult').textContent = data.message || `Estimated: $${data.price}`;
}

async function orderNow() {
    const platform = document.getElementById('platform').value;
    const service = document.getElementById('service').value;
    const usernameOrUrl = document.getElementById('usernameOrUrl').value;
    const quantity = document.getElementById('quantity').value;

    const res = await fetch('/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, service, usernameOrUrl, quantity })
    });

    const data = await res.json();
    document.getElementById('orderResult').textContent = data.message || `Order placed successfully.`;
}
