const http = require('http');
const PORT = 3000;

const express = require('express');
const fs = require('fs');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
const usersfilePath = path.join(__dirname, 'users.txt');
const petfilePath = path.join(__dirname, 'pet_information.txt');

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

function requireLogin(req, res, next) {
    if (!req.session.username) {
        return res.redirect('/login');
    }
    next();
}

function readUserAccounts() {
    try {
        const data = fs.readFileSync(usersfilePath, 'utf8');
        const accounts = data.trim().split('\n').map(line => {
            const [username, password] = line.split(':');
            return { username, password };
        });
        return accounts;
    } catch (error) {
        console.error('Error reading user accounts file:', error);
        return [];
    }
}

function writeUserAccount(username, password) {
    const newData = `${username}:${password}\n`;
    fs.appendFileSync(usersfilePath, newData);
}

app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/home', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/createAccount', (req, res) => {
    res.render('createAccount', { message: null });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/browse', (req, res) => {
    res.render('browse', { title: 'Browse' });
});

app.get('/logout', (req, res) => {
    if (req.session.username) {
        res.render('logout');
    } else {
        res.redirect('/home');
    }
});

app.get('/catcare', (req, res) => {
    res.render('catcare', { title: 'Cat Care' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

app.get('/dogcare', (req, res) => {
    res.render('dogcare', { title: 'Dog Care' });
});

app.get('/find', (req, res) => {
    res.render('find', { filteredPets: null });
});

app.get('/giveaway', requireLogin, (req, res) => {
    res.render('giveaway', { title: 'Give Away a Pet' });
});

app.get('/privacy_disclaimer', (req, res) => {
    res.render('privacy_disclaimer', { title: 'Privacy Disclaimer' });
});


app.post('/createAccount', (req, res) => {
    const { username, password } = req.body;

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
        return res.render('createaccount', { message: 'Invalid username format. Only letters and digits are allowed.' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;
    if (!passwordRegex.test(password)) {
        return res.render('createaccount', { message: 'Invalid password format. Password must be at least 4 characters long and contain at least one letter and one digit.' });
    }

    const existingUsers = readUserAccounts();
    if (existingUsers.some(user => user.username === username)) {
        return res.render('createaccount', { message: 'Username already exists. Please choose a different username.' });
    }

    writeUserAccount(username, password);
    return res.render('createaccount', { message: 'Account created successfully. You can now login.' });
});


app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        const users = readUserAccounts();

        const isValidUser = users.some(user => user.username === username && user.password === password);

        if (isValidUser) {
            req.session.username = username;
            res.status(200).send('Login successful.');
        } else {
            res.status(401).send('Login failed. Invalid username or password.');
        }
    } catch (error) {
        console.error('Error processing login request:', error);
        res.status(500).send('An error occurred while processing the login request.');
    }
});


function addPetInformation(username, petType, breed, age, gender, otherInfo) {
    const petId = getNextPetId();
    const petInfo = `${petId}:${username}:${petType}:${breed}:${age}:${gender}:${otherInfo.otherDogs}:${otherInfo.otherCats}:${otherInfo.smallChildren}\n`;
    fs.appendFileSync(petfilePath, petInfo);
}

function getNextPetId() {
    const petData = fs.readFileSync(petfilePath, 'utf8');
    const petEntries = petData.trim().split('\n');
    const lastPetEntry = petEntries[petEntries.length - 1];
    
    let lastPetId = 0;
    if (lastPetEntry) {
        const lastPetFields = lastPetEntry.split(':');
        lastPetId = parseInt(lastPetFields[0]);
    }
    const nextPetId = lastPetId + 1;
    
    return nextPetId;
}


app.post('/giveaway', requireLogin, (req, res) => {
    const { pettype, breed, age, gender, ownername, owneremail, otherDogs, otherCats, smallChildren } = req.body;
    const username = req.session.username;

    const otherInfo = {
        otherDogs: otherDogs === 'on',
        otherCats: otherCats === 'on',
        smallChildren: smallChildren === 'on'
    };
    
    addPetInformation(username, pettype, breed, age, gender, otherInfo);

    const responseMessage = 'Pet information added successfully.';
    res.render('giveaway', { responseMessage });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('An error occurred during logout.');
        } else {
            res.status(200).send('Logout successful.');
        }
    });
});

function getAllPets() {
    const data = fs.readFileSync('pet_information.txt', 'utf8');
    const lines = data.split('\n');

    const pets = lines.map(line => {
        const [index, username, animalType, breed, age, gender, otherDogs, otherCats, smallChildren] = line.split(':');
        return { index, username, animalType, breed, age, gender, otherDogs, otherCats, smallChildren };
    });

    return pets;
}

module.exports = {
    getAllPets
};

app.post('/find', (req, res) => {
    const { animaltype, breed, age, gender, otherDogs, otherCats, smallChildren } = req.body;

    const dogsCompatibility = otherDogs === 'on';
    const catsCompatibility = otherCats === 'on';
    const childrenCompatibility = smallChildren === 'on';

    fs.readFile('pet_information.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        const petList = data.trim().split('\n');

        const filteredPets = petList.filter(pet => {
            const [_, __, type, petBreed, petAge, petGender, dogs, cats, children] = pet.split(':');
            return (animaltype === 'any' || type === animaltype) &&
                (breed === 'any' || petBreed === breed) &&
                (age === 'any' || petAge === age) &&
                (gender === 'any' || petGender === gender) &&
                ((dogsCompatibility === false && dogs === 'false') || (dogsCompatibility === true && dogs === 'true')) &&
                ((catsCompatibility === false && cats === 'false') || (catsCompatibility === true && cats === 'true')) &&
                ((childrenCompatibility === false && children === 'false') || (childrenCompatibility === true && children === 'true'));
        });

        res.render('find', { filteredPets });
    });
});


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
