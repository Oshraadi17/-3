async function submitOrder() {
  const type = document.getElementById("type").value;
  const link = document.getElementById("link").value;
  const amount = document.getElementById("amount").value;
  const responseMsg = document.getElementById("responseMsg");

  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, link, amount })
    });

    const data = await response.json();
    responseMsg.textContent = data.message || "ההזמנה בוצעה בהצלחה!";
  } catch (err) {
    responseMsg.textContent = "שגיאה בשליחה לשרת.";
  }
}
