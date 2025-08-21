/* script.js - lógica completa mejorada con todas las funcionalidades */

document.addEventListener('DOMContentLoaded', function() {
  // --- NAVBAR SCROLL EFFECT ---
  const navbar = document.querySelector('.nav-gold');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // --- SIGNATURE PAD SETUP ---
  let signaturePad = null;
  const canvas = document.getElementById('signatureCanvas');
  if (canvas) {
    // Adjust canvas for high DPI displays
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    
    signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 1,
      maxWidth: 3,
    });
    
    const clearSignatureBtn = document.getElementById('clearSignature');
    if (clearSignatureBtn) {
      clearSignatureBtn.addEventListener('click', () => {
        if (signaturePad) {
          signaturePad.clear();
        }
      });
    }
    
    // Make signature pad responsive
    window.addEventListener('resize', function() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      
      // Reapply the signature if it exists
      if (signaturePad && !signaturePad.isEmpty()) {
        const data = signaturePad.toData();
        signaturePad.clear();
        signaturePad.fromData(data);
      }
    });
  }

  // --- SET CONTRACT DATE ---
  const contractDateInput = document.getElementById('contractDate');
  if (contractDateInput) {
    contractDateInput.value = new Date().toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  // --- PAYMENT MODAL SETUP ---
  const checkoutModalEl = document.getElementById('checkoutModal');
  if (checkoutModalEl) {
    checkoutModalEl.addEventListener('show.bs.modal', function(event) {
      const button = event.relatedTarget;
      const product = button?.getAttribute('data-product') || 'LeidyBot1';
      const price = button?.getAttribute('data-price') || '260';
      
      const modalProductName = document.getElementById('modalProductName');
      const modalProductPrice = document.getElementById('modalProductPrice');
      
      if (modalProductName) modalProductName.textContent = product;
      if (modalProductPrice) modalProductPrice.textContent = `$${price}`;
      
      // Reset form when modal opens
      const userName = document.getElementById('userName');
      const userEmail = document.getElementById('userEmail');
      const userPhone = document.getElementById('userPhone');
      const agreeTermsModal = document.getElementById('agreeTermsModal');
      
      if (userName) userName.value = '';
      if (userEmail) userEmail.value = '';
      if (userPhone) userPhone.value = '';
      if (agreeTermsModal) agreeTermsModal.checked = false;
    });
  }

  // --- TOGGLE PAYMENT INFO ---
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  function updatePaymentInfo() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const paypalInfo = document.getElementById('paypalInfo');
    const bankInfo = document.getElementById('bankInfo');
    
    if (paypalInfo) paypalInfo.style.display = selected === 'paypal' ? 'block' : 'none';
    if (bankInfo) bankInfo.style.display = selected === 'bank' ? 'block' : 'none';
  }
  
  if (paymentRadios.length > 0) {
    paymentRadios.forEach(r => r.addEventListener('change', updatePaymentInfo));
    updatePaymentInfo();
  }

  // --- COPY HELPERS ---
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showAlert('¡Copiado al portapapeles!', 'success');
    }).catch(() => {
      showAlert('Error al copiar. Por favor, copia manualmente.', 'danger');
    });
  }
  
  const copyPaypalBtn = document.getElementById('copyPaypal');
  if (copyPaypalBtn) {
    copyPaypalBtn.addEventListener('click', () => copyToClipboard('@williarvi'));
  }
  
  const copyBankKeyBtn = document.getElementById('copyBankKey');
  if (copyBankKeyBtn) {
    copyBankKeyBtn.addEventListener('click', () => copyToClipboard('@WAV687'));
  }

  // --- VALIDATION & UTILITIES ---
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function showAlert(message, type = 'success') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
        <div>${message}</div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
      }
    }, 5000);
  }

  // --- PDF GENERATION (Contract & Invoice) ---
  function generateContractPDFBlob(userData, productData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add header
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Add title
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('TRADING INTELIGENTE', 105, 20, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('CONTRATO DE LICENCIA DE SOFTWARE', 105, 30, { align: 'center' });
    
    // Seller info
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Datos del Vendedor:', 14, 50);
    doc.setTextColor(0, 0, 0);
    doc.text('Trading Inteligente', 14, 56);
    doc.text('Email: tradinginteligenteap@gmail.com', 14, 62);
    doc.text('Teléfono: +57 3506194991', 14, 68);
    
    // Buyer info
    doc.setTextColor(100, 100, 100);
    doc.text('Datos del Comprador:', 14, 80);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre: ${userData.name || 'No proporcionado'}`, 14, 86);
    doc.text(`Identificación: ${userData.id || 'No proporcionada'}`, 14, 92);
    doc.text(`Email: ${userData.email || 'No proporcionado'}`, 14, 98);
    doc.text(`Teléfono: ${userData.phone || 'No proporcionado'}`, 14, 104);
    doc.text(`Dirección: ${userData.address || 'No proporcionada'}`, 14, 110);
    doc.text(`Fecha: ${userData.date || new Date().toLocaleDateString('es-ES')}`, 14, 116);
    
    // Contract terms
    doc.setTextColor(100, 100, 100);
    doc.text('1. OBJETO DEL CONTRATO', 14, 132);
    doc.setTextColor(0, 0, 0);
    
    const terms = [
      'El vendedor transfiere al comprador los derechos de uso del software indicado.',
      'El vendedor no garantiza resultados financieros específicos.',
      'El comprador entiende que el software puede permanecer inactivo en periodos de riesgo elevado.',
      'Se aplican los términos y condiciones publicados en el sitio.'
    ];
    
    let y = 138;
    terms.forEach(line => { 
      doc.text('- ' + line, 14, y); 
      y += 6; 
    });
    
    // Add signature if available
    if (userData.signature) {
      try {
        doc.addImage(userData.signature, 'PNG', 14, y + 10, 60, 30);
        doc.text('Firma del Comprador', 14, y + 45);
      } catch (e) {
        console.error('Error adding signature image:', e);
      }
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento generado automáticamente por Trading Inteligente', 105, 280, { align: 'center' });
    
    // Return blob
    return doc.output('blob');
  }

  function generateInvoicePDFBlob(userData, productData, paymentData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add header
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Add title
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('TRADING INTELIGENTE', 105, 20, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('FACTURA DE VENTA', 105, 30, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const invoiceNumber = Math.floor(Math.random() * 900000) + 100000;
    doc.text(`Factura No: ${invoiceNumber}`, 14, 50);
    doc.text(`Fecha: ${userData.date || new Date().toLocaleDateString('es-ES')}`, 14, 56);
    
    // Seller and buyer info
    doc.text('Vendedor: Trading Inteligente', 14, 66);
    doc.text('Comprador:', 120, 66);
    doc.setTextColor(0, 0, 0);
    doc.text(`${userData.name || 'No proporcionado'}`, 120, 72);
    
    // Product details
    doc.setTextColor(100, 100, 100);
    doc.text('Descripción', 14, 90);
    doc.setTextColor(0, 0, 0);
    doc.text(productData.name, 14, 96);
    doc.text(`$${productData.price} USD`, 180, 96, { align: 'right' });
    
    // Total
    doc.line(14, 110, 196, 110);
    doc.setTextColor(100, 100, 100);
    doc.text('Total:', 150, 120, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`$${productData.price} USD`, 180, 120, { align: 'right' });
    
    // Payment info
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Método de pago: ${paymentData.method}`, 14, 136);
    doc.text(`Referencia: ${paymentData.reference}`, 14, 142);
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento generado automáticamente por Trading Inteligente', 105, 280, { align: 'center' });
    
    return doc.output('blob');
  }

  // Helper to force download blob
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Collect user data
  function collectUserDataFromPayment() {
    const name = document.getElementById('userName')?.value || document.getElementById('contractName')?.value || '';
    const email = document.getElementById('userEmail')?.value || '';
    const phone = document.getElementById('userPhone')?.value || document.getElementById('contractPhone')?.value || '';
    const address = document.getElementById('contractAddress')?.value || '';
    const id = document.getElementById('contractId')?.value || '';
    const signature = signaturePad && !signaturePad.isEmpty() ? signaturePad.toDataURL('image/png') : null;
    
    return {
      name, email, phone, address, id,
      date: new Date().toLocaleDateString('es-ES'),
      signature
    };
  }

  // --- PAYPAL FLOW ---
  const paypalBtn = document.getElementById('paypalBtn');
  if (paypalBtn) {
    paypalBtn.addEventListener('click', function() {
      const name = document.getElementById('userName')?.value;
      const email = document.getElementById('userEmail')?.value;
      const agree = document.getElementById('agreeTermsModal')?.checked;

      if (!name || !email || !agree) {
        showAlert('Completa nombre, email y acepta el contrato antes de continuar', 'danger');
        return;
      }
      if (!validateEmail(email)) {
        showAlert('Por favor, introduce un email válido', 'danger');
        return;
      }

      const productName = document.getElementById('modalProductName')?.textContent || 'LeidyBot1';
      const productPrice = (document.getElementById('modalProductPrice')?.textContent || '$260').replace('$', '').trim();

      const userData = collectUserDataFromPayment();
      const productData = { name: productName, price: productPrice };
      const paymentData = { method: 'PayPal', reference: '@williarvi', date: userData.date };

      // Generate PDFs
      const contractBlob = generateContractPDFBlob(userData, productData);
      const invoiceBlob = generateInvoicePDFBlob(userData, productData, paymentData);

      // Download both
      downloadBlob(contractBlob, `Contrato_${productName}_${userData.name.replace(/\s+/g, '_')}.pdf`);
      downloadBlob(invoiceBlob, `Factura_${productName}_${userData.name.replace(/\s+/g, '_')}.pdf`);

      showAlert('Factura y contrato generados. Serás redirigido a PayPal.', 'success');

      // Redirect to PayPal after a short delay
      setTimeout(() => {
        window.open('https://www.paypal.com/co/home', '_blank');
        
        // Close modal
        const modalElement = document.getElementById('checkoutModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }
        
        // Clear form fields
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userPhone = document.getElementById('userPhone');
        const agreeTermsModal = document.getElementById('agreeTermsModal');
        
        if (userName) userName.value = '';
        if (userEmail) userEmail.value = '';
        if (userPhone) userPhone.value = '';
        if (agreeTermsModal) agreeTermsModal.checked = false;
        
        if (signaturePad) {
          signaturePad.clear();
        }
      }, 1500);
    });
  }

  // --- BANK FLOW ---
  const confirmBankPaymentBtn = document.getElementById('confirmBankPayment');
  if (confirmBankPaymentBtn) {
    confirmBankPaymentBtn.addEventListener('click', function() {
      const name = document.getElementById('userName')?.value;
      const email = document.getElementById('userEmail')?.value;
      const agree = document.getElementById('agreeTermsModal')?.checked;

      if (!name || !email || !agree) {
        showAlert('Completa nombre, email y acepta el contrato antes de confirmar', 'danger');
        return;
      }
      if (!validateEmail(email)) {
        showAlert('Por favor, introduce un email válido', 'danger');
        return;
      }

      const productName = document.getElementById('modalProductName')?.textContent || 'LeidyBot1';
      const productPrice = (document.getElementById('modalProductPrice')?.textContent || '$260').replace('$', '').trim();

      const userData = collectUserDataFromPayment();
      const productData = { name: productName, price: productPrice };
      const paymentData = { method: 'Transferencia Bancaria', reference: '@WAV687', date: userData.date };

      // Generate PDFs
      const contractBlob = generateContractPDFBlob(userData, productData);
      const invoiceBlob = generateInvoicePDFBlob(userData, productData, paymentData);

      // Download both
      downloadBlob(contractBlob, `Contrato_${productName}_${userData.name.replace(/\s+/g, '_')}.pdf`);
      downloadBlob(invoiceBlob, `Factura_${productName}_${userData.name.replace(/\s+/g, '_')}.pdf`);

      showAlert('Documentos descargados. Realiza la transferencia a la cuenta NU (llave @WAV687) y envía el comprobante.', 'success');

      // Close modal
      const modalElement = document.getElementById('checkoutModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
    });
  }

  // --- DOWNLOAD CONTRACT BUTTON (contract section) ---
  const downloadContractBtn = document.getElementById('downloadContractBtn');
  if (downloadContractBtn) {
    downloadContractBtn.addEventListener('click', function() {
      const agreeContract = document.getElementById('agreeContract');
      if (!agreeContract?.checked) {
        showAlert('Debes aceptar el contrato antes de descargar.', 'danger');
        return;
      }
      
      const productName = 'LeidyBot1';
      const productPrice = '260';
      const userData = {
        name: document.getElementById('contractName')?.value || '',
        id: document.getElementById('contractId')?.value || '',
        email: '',
        phone: document.getElementById('contractPhone')?.value || '',
        address: document.getElementById('contractAddress')?.value || '',
        date: new Date().toLocaleDateString('es-ES'),
        signature: signaturePad && !signaturePad.isEmpty() ? signaturePad.toDataURL('image/png') : null
      };
      
      const productData = { name: productName, price: productPrice };
      const contractBlob = generateContractPDFBlob(userData, productData);
      
      downloadBlob(contractBlob, `Contrato_${productName}_${userData.name.replace(/\s+/g, '_')}.pdf`);
      showAlert('Contrato descargado correctamente', 'success');
    });
  }

  // --- WAITLIST FORM ---
  const waitlistForm = document.getElementById('waitlistForm');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('waitlistEmail')?.value;
      
      if (!email || !validateEmail(email)) { 
        showAlert('Introduce un email válido', 'danger'); 
        return; 
      }
      
      showAlert('¡Gracias por unirte a la lista de espera! Te notificaremos cuando WilliBot1 esté disponible.', 'success');
      waitlistForm.reset();
      
      setTimeout(() => { 
        const modalElement = document.getElementById('waitlistModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }
      }, 1500);
    });
  }

  // --- TESTIMONIALS (localStorage) ---
  const testimonialInner = document.getElementById('testimonialInner');
  const initialTestimonials = [
    { name: 'Carlos M.', text: '"LeidyBot1 ha transformado mi forma de operar. La gestión de riesgo es excepcional y los resultados son consistentes mes tras mes."' },
    { name: 'Ana R.', text: '"Estoy impaciente por probar WilliBot1. Si es la mitad de bueno como LeidyBot1, será una revolución en el trading automatizado."' },
    { name: 'Javier L.', text: '"Opero con LeidyBot1 en 3 cuentas diferentes con configuraciones distintas. Los resultados son consistentes en todas."' },
    { name: 'Laura T.', text: '"Invertí $500 en enero y hoy tengo más de $9,000. La mejor decisión financiera que he tomado."' }
  ];
  
  let testimonials = JSON.parse(localStorage.getItem('ti_testimonials')) || initialTestimonials;

  function renderTestimonials(list) {
    if (!testimonialInner) return;
    
    testimonialInner.innerHTML = '';
    list.forEach((t, idx) => {
      const item = document.createElement('div');
      item.className = `carousel-item ${idx === 0 ? 'active' : ''}`;
      item.innerHTML = `
        <div class="d-flex gap-3 align-items-center justify-content-center">
          <div class="testimonial-avatar">${t.name[0]}</div>
          <div class="text-start">
            <div class="small text-muted">${t.text}</div>
            <div class="mt-2"><strong>${t.name}</strong></div>
          </div>
        </div>
      `;
      testimonialInner.appendChild(item);
    });
  }
  
  renderTestimonials(testimonials);

  // Testimonial form submission
  const testimonialForm = document.getElementById('testimonialForm');
  if (testimonialForm) {
    testimonialForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('testName')?.value.trim();
      const message = document.getElementById('testMessage')?.value.trim();
      
      if (!name || !message) { 
        showAlert('Completa nombre y testimonio', 'danger'); 
        return; 
      }
      
      testimonials.unshift({ name: name, text: `"${message}"` });
      
      // Keep only the latest 10 testimonials
      if (testimonials.length > 10) {
        testimonials = testimonials.slice(0, 10);
      }
      
      localStorage.setItem('ti_testimonials', JSON.stringify(testimonials));
      renderTestimonials(testimonials);
      testimonialForm.reset();
      
      showAlert('¡Gracias por tu testimonio! Se ha añadido al carrusel.', 'success');
    });
  }

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Add animation to elements on scroll
  function animateOnScroll() {
    const elements = document.querySelectorAll('.card, .result-card, .pricing-card');
    
    elements.forEach(element => {
      const position = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      
      if (position < screenPosition) {
        element.style.opacity = 1;
        element.style.transform = 'translateY(0)';
      }
    });
  }
  
  // Set initial state for animation
  const animatedElements = document.querySelectorAll('.card, .result-card, .pricing-card');
  animatedElements.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  
  // Run on load and scroll
  window.addEventListener('load', animateOnScroll);
  window.addEventListener('scroll', animateOnScroll);
});
