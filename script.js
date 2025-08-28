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
      const userId = document.getElementById('userId');
      const userCity = document.getElementById('userCity');
      const agreeTermsModal = document.getElementById('agreeTermsModal');
      
      if (userName) userName.value = '';
      if (userEmail) userEmail.value = '';
      if (userPhone) userPhone.value = '';
      if (userId) userId.value = '';
      if (userCity) userCity.value = '';
      if (agreeTermsModal) agreeTermsModal.checked = false;
      
      // Reset payment method to PayPal
      const paypalRadio = document.getElementById('paypalMethod');
      if (paypalRadio) paypalRadio.checked = true;
      updatePaymentInfo();
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
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
        bsAlert.close();
      }
    }, 5000);
  }

  // --- PDF GENERATION (Contract & Invoice) ---
  function generateContractPDFBlob(userData, productData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración inicial
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    let y = margin;
    
    // Función para agregar texto con manejo de saltos de página
    function addText(text, x, y, maxWidth, lineHeight = 7) {
      const lines = doc.splitTextToSize(text, maxWidth);
      if (y + (lines.length * lineHeight) > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, x, y);
      return y + (lines.length * lineHeight);
    }
    
    // Header
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Título
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('TRADING INTELIGENTE', 105, 20, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('CONTRATO DE LICENCIA DE SOFTWARE', 105, 30, { align: 'center' });
    
    // Información del vendedor y comprador
    y = 50;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Datos del Vendedor:', margin, y);
    doc.setTextColor(0, 0, 0);
    y = addText('Trading Inteligente', margin, y + 6, 180);
    y = addText('Email: tradinginteligenteap@gmail.com', margin, y + 2, 180);
    y = addText('Teléfono: +57 3506194991', margin, y + 2, 180);
    
    y += 10;
    doc.setTextColor(100, 100, 100);
    doc.text('Datos del Comprador:', margin, y);
    doc.setTextColor(0, 0, 0);
    y = addText(`Nombre: ${userData.name || 'No proporcionado'}`, margin, y + 6, 180);
    y = addText(`Identificación: ${userData.id || 'No proporcionada'}`, margin, y + 2, 180);
    y = addText(`Email: ${userData.email || 'No proporcionado'}`, margin, y + 2, 180);
    y = addText(`Teléfono: ${userData.phone || 'No proporcionado'}`, margin, y + 2, 180);
    y = addText(`Dirección: ${userData.address || 'No proporcionada'}`, margin, y + 2, 180);
    y = addText(`Ciudad: ${userData.city || 'No proporcionada'}`, margin, y + 2, 180);
    y = addText(`Fecha: ${userData.date || new Date().toLocaleDateString('es-ES')}`, margin, y + 2, 180);
    
    y += 10;
    
    // Términos completos del contrato
    const contractTerms = [
      "1. OBJETO DEL CONTRATO",
      "TRADING INTELIGENTE, en adelante 'EL VENDEDOR', celebra el presente contrato de licencia de software con EL COMPRADOR, quien declara haber proporcionado información veraz en el formulario de compra. El objeto del presente contrato es la licencia de uso del software de trading automatizado (en adelante 'EL ROBOT'), bajo los términos y condiciones aquí establecidos.",
      "",
      "2. DERECHOS DE PROPIEDAD INTELECTUAL",
      "EL ROBOT es propiedad intelectual de TRADING INTELIGENTE y está protegido por las leyes de derechos de autor y tratados internacionales. EL COMPRADOR recibe únicamente una licencia de uso limitada, non-exclusiva, intransferible y revocable.",
      "",
      "3. PROHIBICIONES EXPLÍCITAS",
      "Queda estrictamente prohibido:",
      "- Realizar ingeniería inversa, descompilación, desensamblado o cualquier intento de derivar el código fuente del software.",
      "- Modificar, adaptar, traducir o crear trabajos derivados basados en EL ROBOT.",
      "- Distribuir, sublicenciar, arrendar, alquilar, prestar o transferir EL ROBOT a terceros.",
      "- Comercializar, revender o redistribuir EL ROBOT de cualquier forma.",
      "- Utilizar EL ROBOT para proveer servicios de trading a terceros sin autorización expresa.",
      "",
      "4. CLAÚSULA DE CONFIDENCIALIDAD",
      "EL COMPRADOR se compromete a mantener la estricta confidencialidad sobre la estrategia, parámetros de configuración, manuales y cualquier información relacionada con EL ROBOT. Esta obligación de confidencialidad permanecerá vigente incluso después de la finalización del presente contrato.",
      "",
      "5. GARANTÍAS Y LIMITACIONES DE RESPONSABILIDAD",
      "EL VENDEDOR garantiza que EL ROBOT funciona según las especificaciones técnicas descritas en la documentación proporcionada. Sin embargo, EL VENDEDOR no garantiza resultados financieros específicos ni rentabilidad, ya que el mercado financiero es inherentemente riesgoso y está sujeto a factores impredecibles.",
      "EL COMPRADOR reconoce y acepta que:",
      "- El trading conlleva riesgos financieros significativos y puede resultar en pérdidas.",
      "- EL ROBOT puede experimentar períodos de pérdidas debido a condiciones adversas del mercado.",
      "- El desempeño pasado no garantiza resultados futuros.",
      "- Es responsable de gestionar su capital y asumir los riesgos asociados.",
      "",
      "6. DURACIÓN Y TERMINACIÓN",
      "La licencia se concede por tiempo indefinido, pero podrá ser terminada por EL VENDEDOR en caso de incumplimiento de cualquiera de las cláusulas aquí establecidas, sin perjuicio de las acciones legales correspondientes.",
      "",
      "7. JURISDICCIÓN Y LEY APLICABLE",
      "Este contrato se regirá por las leyes de Colombia. Cualquier disputa surgida de este contrato será resuelta en los tribunales competentes de Bogotá, Colombia.",
      "",
      "8. ACEPTACIÓN DE TÉRMINOS",
      "Al proceder con la compra, EL COMPRADOR declara haber leído, entendido y aceptado todas las cláusulas aquí establecidas."
    ];
    
    // Agregar todos los términos del contrato
    doc.setFontSize(10);
    contractTerms.forEach(term => {
      if (term.startsWith("-") || term === "") {
        y = addText(term, margin, y + 4, 180, 5);
      } else if (term.includes(".")) {
        doc.setFont(undefined, 'bold');
        y = addText(term, margin, y + 8, 180, 6);
        doc.setFont(undefined, 'normal');
      } else {
        y = addText(term, margin, y + 4, 180, 5);
      }
    });
    
    // Agregar firma si está disponible
    if (userData.signature) {
      try {
        doc.addPage();
        y = margin;
        doc.text("FIRMA DEL COMPRADOR", margin, y);
        doc.addImage(userData.signature, 'PNG', margin, y + 10, 80, 40);
      } catch (e) {
        console.error('Error adding signature image:', e);
      }
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento generado automáticamente por Trading Inteligente', 105, pageHeight - 10, { align: 'center' });
    
    // Return blob
    return doc.output('blob');
  }

  function generateInvoicePDFBlob(userData, productData, paymentData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Título
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('TRADING INTELIGENTE', 105, 20, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('FACTURA DE VENTA', 105, 30, { align: 'center' });
    
    // Detalles de la factura
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const invoiceNumber = 'FAC-' + Math.floor(Math.random() * 900000) + 100000;
    const invoiceDate = new Date().toLocaleDateString('es-ES');
    
    doc.text(`Factura No: ${invoiceNumber}`, 14, 50);
    doc.text(`Fecha: ${invoiceDate}`, 14, 56);
    
    // Información del vendedor y comprador
    doc.text('Vendedor: Trading Inteligente', 14, 66);
    doc.text('Email: tradinginteligenteap@gmail.com', 14, 72);
    doc.text('Teléfono: +57 3506194991', 14, 78);
    
    doc.text('Comprador:', 120, 66);
    doc.setTextColor(0, 0, 0);
    doc.text(`${userData.name || 'No proporcionado'}`, 120, 72);
    doc.text(`${userData.email || 'No proporcionado'}`, 120, 78);
    doc.text(`${userData.phone || 'No proporcionado'}`, 120, 84);
    
    // Detalles del producto
    let y = 100;
    doc.setTextColor(100, 100, 100);
    doc.text('Descripción', 14, y);
    doc.text('Precio', 180, y, { align: 'right' });
    
    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.text(productData.name, 14, y);
    doc.text(`$${productData.price} USD`, 180, y, { align: 'right' });
    
    // Total
    y += 15;
    doc.line(14, y, 196, y);
    y += 10;
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal:', 150, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.text(`$${productData.price} USD`, 180, y, { align: 'right' });
    
    y += 8;
    doc.setTextColor(100, 100, 100);
    doc.text('IVA (0%):', 150, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.text('$0 USD', 180, y, { align: 'right' });
    
    y += 8;
    doc.setTextColor(100, 100, 100);
    doc.text('Total:', 150, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`$${productData.price} USD`, 180, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    
    // Información de pago
    y += 20;
    doc.setTextColor(100, 100, 100);
    doc.text('Información de Pago:', 14, y);
    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.text(`Método: ${paymentData.method}`, 14, y);
    y += 6;
    doc.text(`Referencia: ${paymentData.reference}`, 14, y);
    y += 6;
    doc.text(`Fecha: ${invoiceDate}`, 14, y);
    
    // Términos y condiciones
    y += 15;
    doc.setTextColor(100, 100, 100);
    doc.text('Términos y condiciones:', 14, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Esta factura sirve como comprobante de compra del software. No aplica para reembolsos una vez descargado el producto.', 14, y, { maxWidth: 180 });
    
    // Footer
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
    const id = document.getElementById('userId')?.value || document.getElementById('contractId')?.value || '';
    const city = document.getElementById('userCity')?.value || document.getElementById('contractCity')?.value || '';
    const signature = signaturePad && !signaturePad.isEmpty() ? signaturePad.toDataURL('image/png') : null;
    
    return {
      name, email, phone, address, id, city,
      date: new Date().toLocaleDateString('es-ES'),
      signature
    };
  }

  // --- BANK URLS ---
  const bankUrls = {
    'bancolombia': 'https://www.bancolombia.com',
    'davivienda': 'https://www.davivienda.com',
    'bbva': 'https://www.bbva.com.co',
    'banco-bogota': 'https://www.bancodebogota.com',
    'banco-popular': 'https://www.bancopopular.com.co',
    'colpatria': 'https://www.colpatria.com',
    'av-villas': 'https://www.avvillas.com.co',
    'banco-caja-social': 'https://www.bancocajasocial.com',
    'nequi': 'https://www.nequi.com.co',
    'daviplata': 'https://www.daviplata.com',
    'nu': 'https://nu.com.co'
  };

  // --- PAYPAL FLOW ---
  const paypalBtn = document.getElementById('paypalBtn');
  if (paypalBtn) {
    paypalBtn.addEventListener('click', function() {
      const name = document.getElementById('userName')?.value;
      const email = document.getElementById('userEmail')?.value;
      const phone = document.getElementById('userPhone')?.value;
      const id = document.getElementById('userId')?.value;
      const city = document.getElementById('userCity')?.value;
      const agree = document.getElementById('agreeTermsModal')?.checked;

      if (!name || !email || !phone || !id || !city || !agree) {
        showAlert('Completa todos los campos y acepta el contrato antes de continuar', 'danger');
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
        clearModalForm();
      }, 1500);
    });
  }

  // --- BANK FLOW ---
  const confirmBankPaymentBtn = document.getElementById('confirmBankPayment');
  if (confirmBankPaymentBtn) {
    confirmBankPaymentBtn.addEventListener('click', function() {
      const name = document.getElementById('userName')?.value;
      const email = document.getElementById('userEmail')?.value;
      const phone = document.getElementById('userPhone')?.value;
      const id = document.getElementById('userId')?.value;
      const city = document.getElementById('userCity')?.value;
      const agree = document.getElementById('agreeTermsModal')?.checked;

      if (!name || !email || !phone || !id || !city || !agree) {
        showAlert('Completa todos los campos y acepta el contrato antes de confirmar', 'danger');
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

  // Clear modal form function
  function clearModalForm() {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userPhone = document.getElementById('userPhone');
    const userId = document.getElementById('userId');
    const userCity = document.getElementById('userCity');
    const agreeTermsModal = document.getElementById('agreeTermsModal');
    
    if (userName) userName.value = '';
    if (userEmail) userEmail.value = '';
    if (userPhone) userPhone.value = '';
    if (userId) userId.value = '';
    if (userCity) userCity.value = '';
    if (agreeTermsModal) agreeTermsModal.checked = false;
    
    if (signaturePad) {
      signaturePad.clear();
    }
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
        city: document.getElementById('contractCity')?.value || '',
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
    { name: 'Laura T.', text: '"Invertí $500 en enero y hoy tengo más de $9,000. La mejor decisión financiera que he tomado."' },
    { name: 'Miguel Ángel', text: '"Llevo 4 meses usando LeidyBot1 y he obtenido un 25% de rentabilidad mensual. Superó todas mis expectativas."' },
    { name: 'Sofía R.', text: '"El soporte es excelente. Me ayudaron a configurar todo y resolver mis dudas rápidamente."' },
    { name: 'Ricardo P.', text: '"Después de probar varios EAs, finalmente encontró uno que realmente funciona. LeidyBot1 es increíble."' },
    { name: 'Elena C.', text: '"La gestión de riesgo es lo que más me gusta. Me siento seguro incluso en mercados volátiles."' },
    { name: 'Diego M.', text: '"Empecé con $200 y en 6 meses tengo $2,500. Los resultados hablan por sí solos."' },
    { name: 'Carolina V.', text: '"Recomiendo LeidyBot1 a todos mis amigos. Es transparente y cumple lo que promete."' }
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
            <div class="small text-white">${t.text}</div>
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
