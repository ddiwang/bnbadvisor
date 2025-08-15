


document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    initEmailValidation();
});


// Form Submission Validation

function initFormValidation() {
    const forms = document.querySelectorAll('form[action*="/users/"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            field.style.borderColor = 'red';
        } else {
            field.classList.remove('error');
            field.style.borderColor = '';
        }
    });
    
    // Check email format
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value && !validateEmail(emailField.value)) {
        isValid = false;
        emailField.classList.add('error');
        emailField.style.borderColor = 'red';
    }
    
    
    const emailStatus = document.getElementById('email-status');
    if (emailStatus && emailStatus.className === 'email-taken') {
        isValid = false;
        alert('Please use a different email address as this one is already registered.');
        return false;
    }
    
    // Check password 
    const password = form.querySelector('#password');
    const confirmPassword = form.querySelector('#confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        isValid = false;
        confirmPassword.classList.add('error');
        confirmPassword.style.borderColor = 'red';
    }
    
    if (!isValid) {
        alert('Please check the form and try again');
    }
    
    return isValid;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


//  Email Validation

function initEmailValidation() {
    const signupForm = document.querySelector('form[action*="/signup"]');
    if (!signupForm) return;
    
    const emailField = signupForm.querySelector('input[type="email"]');
    if (!emailField) return;
    
    let emailCheckTimeout;
    
    // status message 
    const statusDiv = document.createElement('div');
    statusDiv.id = 'email-status';
    statusDiv.style.fontSize = '12px';
    statusDiv.style.marginTop = '5px';
    statusDiv.style.minHeight = '18px';
    emailField.parentNode.appendChild(statusDiv);
    
    emailField.addEventListener('input', function() {
        clearTimeout(emailCheckTimeout);
        const email = this.value.trim();
        
      
        statusDiv.textContent = '';
        statusDiv.className = '';
        
        if (email && validateEmail(email)) {
            
            statusDiv.textContent = 'Checking...';
            statusDiv.style.color = '#666';
            emailCheckTimeout = setTimeout(() => {
                checkEmailAvailability(email, statusDiv);
            }, 500);
        }
    });
}

async function checkEmailAvailability(email, statusDiv) {
    try {
        const response = await fetch(`/users/api/check-email/${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (data.exists) {
            statusDiv.textContent = '✗ This email is already registered';
            statusDiv.style.color = '#e74c3c';
            statusDiv.className = 'email-taken';
        } else {
            statusDiv.textContent = '✓ Email is available';
            statusDiv.style.color = '#27ae60';
            statusDiv.className = 'email-available';
        }
    } catch (error) {
        console.error('Error checking email:', error);
        statusDiv.textContent = 'Unable to check email availability';
        statusDiv.style.color = '#e67e22';
    }
}
