

const form = document.querySelector(".login-form");
const email = document.getElementById("email");
const password = document.getElementById("password");

const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    emailError.textContent = "";
    passwordError.textContent = "";

    let isValid = true;

    

    if (password.value.trim() === "") {
        passwordError.textContent = "Please enter your password.";
        isValid = false;
    }

    if (isValid) {
        alert("Your form passed the basic validation!");
    }
});