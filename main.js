
async function submitOrder() {
  const link = document.getElementById('link').value;
  const quantity = document.getElementById('quantity').value;
  const serviceType = document.getElementById('serviceType').value;

  const resBox = document.getElementById('response');
  resBox.textContent = 'שולח הזמנה...';

  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ link, quantity, service: serviceType })
    });

    const data = await res.json();
    if (res.ok) {
      resBox.textContent = data.message || 'ההזמנה נשלחה!';
    } else {
      resBox.textContent = 'שגיאה: ' + (data.message || 'קרתה שגיאה');
    }
  } catch (err) {
    resBox.textContent = 'שגיאת רשת';
  }
}
