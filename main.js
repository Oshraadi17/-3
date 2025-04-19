
document.getElementById("boostForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const service = document.getElementById("service").value;
    const link = document.getElementById("link").value;
    const quantity = document.getElementById("quantity").value;

    fetch("https://3-1-e8r9.onrender.com/api/order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ service, link, quantity }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("response").innerText = data.message;
    })
    .catch(err => {
        document.getElementById("response").innerText = "שגיאה בשליחה לשרת.";
    });
});
