async function estimatePrice() {
  const platform = document.getElementById('platform').value;
  const serviceType = document.getElementById('serviceType').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const priceDiv = document.getElementById('priceDisplay');
  priceDiv.innerText = 'Checking best price...';

  const res = await fetch('/api/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, serviceType, quantity })
  });

  const data = await res.json();
  priceDiv.innerText = data.message || 'No result.';
}

async function submitOrder() {
  const platform = document.getElementById('platform').value;
  const serviceType = document.getElementById('serviceType').value;
  const target = document.getElementById('target').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const result = document.getElementById('resultText');
  result.innerText = 'Sending order...';

  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, serviceType, target, quantity })
  });

  const data = await res.json();
  result.innerText = data.message || 'Order sent.';
}