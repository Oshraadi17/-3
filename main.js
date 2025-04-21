
function updateInputPlaceholder() {
    const service = document.getElementById("serviceType").value;
    const input = document.getElementById("inputField");
    if (service === "followers" || service === "live") {
        input.placeholder = "שם משתמש (ללא @)";
    } else {
        input.placeholder = "קישור לסרטון";
    }
}

async function submitOrder() {
    const serviceType = document.getElementById("serviceType").value;
    const inputValue = document.getElementById("inputField").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value);
    const responseDiv = document.getElementById("response");

    if (!serviceType || !inputValue || !quantity) {
        responseDiv.innerText = "נא למלא את כל השדות.";
        return;
    }

    responseDiv.innerText = "שולח הזמנה...";

    try {
        const response = await fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceType, link: inputValue, quantity })
        });

        const result = await response.json();
        if (result.success) {
            responseDiv.innerHTML = `
                <p style="color:lime">ההזמנה נשלחה בהצלחה!</p>
                <p><strong>ספק:</strong> ${result.message}</p>
                <p><strong>Service ID:</strong> ${result.serviceId}</p>
                <p><strong>זמן ממוצע:</strong> ${result.averageTime} דקות</p>
            `;
        } else {
            responseDiv.innerHTML = `<p style="color:orange">${result.message}</p>`;
        }
    } catch (error) {
        responseDiv.innerHTML = "<p style='color:red'>שגיאה בשליחת ההזמנה.</p>";
        console.error("שגיאה:", error);
    }
}
