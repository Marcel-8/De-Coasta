document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('#step-indicators .step');
    let currentStep = 1;

    // --- Payment Method Elements ---
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const cardPaymentForm = document.getElementById('card-payment-form');
    const momoPaymentForm = document.getElementById('momo-payment-form');
    const cardInputs = cardPaymentForm.querySelectorAll('input, select');
    const momoInputs = momoPaymentForm.querySelectorAll('input, select');

    const togglePaymentForms = (method) => {
        if (method === 'card') {
            cardPaymentForm.classList.remove('hidden');
            momoPaymentForm.classList.add('hidden');
            cardInputs.forEach(input => input.setAttribute('required', ''));
            momoInputs.forEach(input => input.removeAttribute('required'));
        } else { // 'momo'
            cardPaymentForm.classList.add('hidden');
            momoPaymentForm.classList.remove('hidden');
            cardInputs.forEach(input => input.removeAttribute('required'));
            momoInputs.forEach(input => input.setAttribute('required', ''));
        }
    };

    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            togglePaymentForms(e.target.value);
        });
    });
    // --- End of Payment Method Logic ---

    const showStep = (stepNumber) => {
        steps.forEach(step => step.classList.remove('form-step-active'));
        document.querySelector(`#step-${stepNumber}`).classList.add('form-step-active');

        stepIndicators.forEach((indicator, index) => {
            const indicatorNumber = index + 1;
            indicator.classList.remove('step-active', 'step-completed');
            if (indicatorNumber < stepNumber) {
                indicator.classList.add('step-completed');
            } else if (indicatorNumber === stepNumber) {
                indicator.classList.add('step-active');
            }
        });
    };

    const validateStep = (stepNumber) => {
        const currentStepElement = document.getElementById(`step-${stepNumber}`);
        const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (input.offsetParent === null) return;
            if (!input.value.trim()) {
                input.classList.add('border-red-500');
                isValid = false;
            } else {
                input.classList.remove('border-red-500');
            }
        });
        return isValid;
    };

    document.querySelectorAll('.next-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll('.prev-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    });

    document.getElementById('pay-btn').addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
            startOtpTimer();
        }
    });
    
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key >= 0 && e.key <= 9) {
                input.value = '';
                setTimeout(() => {
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                }, 10);
            } else if (e.key === 'Backspace') {
                 setTimeout(() => {
                    if (index > 0) {
                        otpInputs[index - 1].focus();
                    }
                }, 10);
            }
        });
    });

    let timerInterval;
    const startOtpTimer = () => {
        let timeLeft = 60;
        const timerElement = document.getElementById('otp-timer');
        timerElement.textContent = timeLeft;
        
        clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = '0';
            }
        }, 1000);
    };

    document.getElementById('verify-otp-btn').addEventListener('click', () => {
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        if (otp.length === 6 && /^\d{6}$/.test(otp)) {
            clearInterval(timerInterval);
            currentStep++;
            showStep(currentStep);
            document.getElementById('step-indicator-4').classList.remove('step-active');
            document.getElementById('step-indicator-4').classList.add('step-completed');
        } else {
            alert('Invalid OTP. Please enter the 6-digit code.');
            otpInputs.forEach(input => {
                input.classList.add('border-red-500');
            });
        }
    });

    // Initialize the form
    togglePaymentForms('card');
    showStep(currentStep);
});