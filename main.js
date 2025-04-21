
async function estimatePrice() {
  const platform = document.getElementById('platform').value;
  const serviceType = document.getElementById('serviceType').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const priceDiv = document.getElementById('priceResult');
  const resultDiv = document.getElementById('resultText');

  priceDiv.innerText = 'Calculating price...';
  resultDiv.innerText = '';

  try {
    const response = await fetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, serviceType, quantity })
    });
    const result = await response.json();
    priceDiv.innerText = result.message;
  } catch (err) {
    priceDiv.innerText = 'Error calculating price.';
  }
}

async function submitOrder() {
  const platform = document.getElementById('platform').value;
  const serviceType = document.getElementById('serviceType').value;
  const target = document.getElementById('target').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const resultDiv = document.getElementById('resultText');

  resultDiv.innerText = 'Placing order...';

  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, serviceType, target, quantity })
    });
    const result = await response.json();
    resultDiv.innerText = result.message || 'Order placed.';
  } catch (err) {
    resultDiv.innerText = 'Error placing order.';
  }
}
