//   contact  
const form = document.getElementById('contactForm');
const successMsg = document.getElementById('successMsg');
const charCount = document.getElementById('charCount');
const messageArea = document.getElementById('message');

// Character counter
messageArea.addEventListener('input', (e) => {
  const len = e.target.value.length;
  charCount.textContent = len;
  if (len > 1000) {
    charCount.style.color = 'var(--error)';
  } else {
    charCount.style.color = '';
  }
});

// validation - real tie
form.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    // Clear error when typing
    const error = field.parentElement.querySelector('.error');
    if (error) error.textContent = '';
    field.style.borderColor = '';
  });
});

function validateField(field) {
  const errorSpan = field.parentElement.querySelector('.error');
  let error = '';
  
  if (!field.value.trim()) {
    error = 'This field is required';
  } else {
    switch(field.id) {
      case 'name':
        if (field.value.trim().length < 2) error = 'Name too short (min 2 chars)';
        else if (field.value.trim().length > 50) error = 'Name too long (max 50 chars)';
        else if (!/^[a-zA-Z\s]+$/.test(field.value)) error = 'Letters only';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          error = 'Please enter a valid email';
        }
        break;
      case 'subject':
        if (field.value.trim().length < 2) error = 'Subject too short';
        break;
      case 'message':
        if (field.value.trim().length < 10) error = 'Message too short (min 10 chars)';
        if (field.value.trim().length > 1000) error = 'Message too long (max 1000 chars)';
        break;
    }
  }
  
  if (error) {
    errorSpan.textContent = error;
    field.style.borderColor = 'var(--error)';
    return false;
  }
  return true;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // validate all
  let isValid = true;
  form.querySelectorAll('input, textarea').forEach(field => {
    if (!validateField(field)) isValid = false;
  });
  
  if (isValid) {
    // save locally
    const data = {
      name: form.name.value,
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value,
      date: new Date().toISOString()
    };
    localStorage.setItem('contactMsg', JSON.stringify(data));
    
    // sucess display
    form.classList.add('hidden');
    successMsg.classList.remove('hidden');
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});