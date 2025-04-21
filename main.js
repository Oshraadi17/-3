async function submitOrder() {
  const platform = document.getElementById('platform').value;
  const serviceType = document.getElementById('serviceType').value;
  const target = document.getElementById('target').value;
  const quantity = document.getElementById('quantity').value;

  const response = await fetch('/api/order', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ platform, serviceType, target, quantity })
  });

  const result = await response.json();
  document.getElementById('resultText').innerText = result.message || 'בוצעה הזמנה';
}
