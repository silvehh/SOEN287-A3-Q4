function updateTime() {
    var now = new Date();

    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var seconds = now.getSeconds().toString().padStart(2, '0');

    var year = now.getFullYear();
    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');

    document.getElementById("datetime").textContent = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

setInterval(updateTime, 1000);

function toggleInterested(button) {
    button.classList.toggle("interested");
}

function validateGiveAwayForm() {
    var petType = document.getElementById('pettype').value;
    var breed = document.getElementById('breed').value;
    var age = document.getElementById('age').value;
    var gender = document.getElementById('gender').value;
    var otherDogsChecked = document.getElementById('other-dogs').checked;
    var otherCatsChecked = document.getElementById('other-cats').checked;
    var smallChildrenChecked = document.getElementById('smallchildren').checked;
    var ownerName = document.getElementById('ownername').value;
    var ownerEmail = document.getElementById('owneremail').value;

    if (
        petType === '' || breed === '' || age === '' || gender === '' || ownerName === '' || ownerEmail === '' || (!otherDogsChecked && !otherCatsChecked && !smallChildrenChecked)) {
        alert('Please fill out all fields correctly before submitting the form.');
        return false;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(ownerEmail)) {
        alert('Please enter a valid email address.');
        return false;
    }

    return true;
}

document.getElementById('logout-link').addEventListener('click', async (event) => {
    event.preventDefault();

    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('You have been successfully logged out.');
            window.location.href = '/home';
        } else {
            const message = await response.text();
            alert(message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});