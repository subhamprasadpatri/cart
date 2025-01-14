// Example form validation for the contact form
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (name && email && message) {
        alert('Thank you for contacting us!');
        // You can add an AJAX request here to send the data to the server.
    } else {
        alert('Please fill out all fields!');
    }
});
