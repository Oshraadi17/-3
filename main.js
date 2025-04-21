
async function submitOrder() {
  const link = document.getElementById('link').value;
  const quantity = document.getElementById('quantity').value;
  const service = document.getElementById('service').value;

  const resBox = document.getElementById('response');
  resBox.textContent = 'שולח הזמנה...';

  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ link, quantity, service })
    });

    const data = await res.json();
    if (res.ok) {
      resBox.textContent = 'ההזמנה נשלחה בהצלחה! מס׳ הזמנה: ' + data.order;
    } else {
      resBox.textContent = 'שגיאה: ' + data.error;
    }
  } catch (err) {
    resBox.textContent = 'שגיאת רשת';
  }
}
