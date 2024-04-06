document.getElementById('logout-link').addEventListener('click', async (event) => {
    event.preventDefault();

    try {
        const response = await fetch('/check-session');
        const data = await response.json();

        if (data.sessionActive) {
            const logoutResponse = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (logoutResponse.ok) {
                alert('You have been successfully logged out.');
                window.location.href = '/home';
            } else {
                const message = await logoutResponse.text();
                alert(message);
            }
        } else {
            console.log('No active session found. Nothing to log out.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});