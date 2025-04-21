
async function submitOrder() {
    const serviceElement = document.getElementById('service');
    const linkElement = document.getElementById('link');
    const quantityElement = document.getElementById('quantity');
    const responseMessage = document.getElementById('responseMessage');

    if (!serviceElement || !linkElement || !quantityElement) {
        console.error("Missing input elements.");
        return;
    }

    const service = serviceElement.value;
    const link = linkElement.value;
    const quantity = quantityElement.value;

    const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ service, link, quantity })
    });

    const result = await response.json();
    responseMessage.textContent = result.message || "שגיאה בהזמנה";
}
