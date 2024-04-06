document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: usernameField.value, 
                    password: passwordField.value 
                })
            });
        
            if (response.ok) {
                window.location.href = '/giveaway';
            } else {
                const message = await response.text();
                document.getElementById('login-message').textContent = message;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
