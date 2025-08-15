


function showLoading(button, text = 'Loading...') {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = text;
}

function hideLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
}

//  message notification
function showMessage(message, type = 'info') {
    alert(message); 
}

// Basic form validation
function validateForm(form) {
    const errors = [];
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            errors.push(`${field.name || 'Field'} is required`);
            field.style.borderColor = 'red';
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    
    return true;
}

async function get(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

async function post(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

window.BnbUtils = {
    showLoading,
    hideLoading,
    showMessage,
    validateForm,
    get,
    post
};
