
async function submitOrder() {
    const serviceType = document.getElementById("serviceType")?.value;
    const link = document.getElementById("link")?.value;
    const quantity = document.getElementById("quantity")?.value;

    if (!serviceType || !link || !quantity) {
        document.getElementById("response").innerText = "נא למלא את כל השדות";
        return;
    }

    try {
        const response = await fetch("/api/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ serviceType, link, quantity })
        });

        const result = await response.json();
        document.getElementById("response").innerText = result.message || "ההזמנה בוצעה בהצלחה";
    } catch (error) {
        document.getElementById("response").innerText = "שגיאה בשליחת ההזמנה";
        console.error("Error:", error);
    }
}
