
function updatePlaceholder() {
  const type = document.getElementById('serviceType').value;
  const input = document.getElementById('target');
  input.placeholder = (type === 'followers' || type === 'live')
    ? 'שם משתמש (ללא @)'
    : 'קישור לסרטון';
}

async function submitOrder() {
  const platform = document.getElementById('platform').value;
  const serviceType = document.getElementById('serviceType').value;
  const target = document.getElementById('target').value.trim();
  const quantity = parseInt(document.getElementById('quantity').value);
  const resultDiv = document.getElementById('resultText');

  if (!platform || !serviceType || !target || !quantity) {
    resultDiv.innerText = 'נא למלא את כל השדות.';
    return;
  }

  try {
    resultDiv.innerText = 'שולח הזמנה...';
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, serviceType, target, quantity })
    });
    const result = await response.json();
    resultDiv.innerText = result.message || 'בוצעה הזמנה בהצלחה';
  } catch (err) {
    resultDiv.innerText = 'שגיאה בשליחת ההזמנה';
  }
}
