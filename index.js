document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const formTitle = document.getElementById('formTitle');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');


    // switch to registerform
    showRegister.addEventListener('click', () => {
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        formTitle.textContent = 'Register';
    });

    // switch to login form 
    showLogin.addEventListener('click', () => {
        registerForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
        formTitle.textContent = 'Login';
    });

    // hanlde submit login
   // handle submit login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    loginMessage.textContent = 'Attempting to log in...';
    loginMessage.style.color = 'black';

    try {
        const response = await fetch('https://task4-gous.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            loginMessage.textContent = 'Login successful';
            loginMessage.style.color = 'green';
            loginForm.reset();
        } else {
            loginMessage.textContent = data.message || 'Login failed';
            loginMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginMessage.textContent = 'Error connecting to server';
        loginMessage.style.color = 'red';
    }
});


    // handle submit register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        registerMessage.textContent = 'Attempting to register...';
        registerMessage.style.color = 'black';

        try {
            const response = await fetch('https://task4-gous.onrender.com/api/register', {

                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = 'Registration successful. You can now log in.';
                registerMessage.style.color = 'green';
                registerForm.reset();
            } else {
                registerMessage.textContent = data.message || 'Registration failed';
                registerMessage.style.color = 'red';
            }
        } catch (error) {
            registerMessage.textContent = 'Error connecting to server';
            registerMessage.style.color = 'red';
        }
    });
});
