document.addEventListener('DOMContentLoaded', function() {
    // Inicializar SignaturePad
    const canvas = document.getElementById('signatureCanvas');
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        penColor: '#000000',
        minWidth: 1,
        maxWidth: 3
    });

    document.getElementById('clearSignature').addEventListener('click', function() {
        signaturePad.clear();
    });

    // Fecha automática en el contrato
    document.getElementById('contractDate').value = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Manejar métodos de pago
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const paymentSections = document.querySelectorAll('.payment-section');

    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            paymentSections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(`${this.value}Section`).style.display = 'block';
            
            // Actualizar clases activas
            document.querySelectorAll('.payment-method-card').forEach(card => {
                card.classList.remove('active');
            });
            this.closest('.payment-method-card').classList.add('active');
        });
    });

    // Botón de PayPal - Redirección real
    document.getElementById('payWithPaypal').addEventListener('click', function() {
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const userPhone = document.getElementById('userPhone').value;
        
        if (!userName || !userEmail) {
            showAlert('Por favor completa todos los campos', 'danger');
            return;
        }
        
        if (!validateEmail(userEmail)) {
            showAlert('Por favor ingresa un email válido', 'danger');
            return;
        }

        // Redirigir a PayPal REAL
        const productName = document.getElementById('modalProductName').textContent;
        const productPrice = document.getElementById('modalProductPrice').textContent.replace('$', '').replace(' USD', '');
        
        // URL real de PayPal
        window.location.href = `https://www.paypal.com/co/home`;
        
        // Generar documentos (se ejecuta aunque se redirija)
        generateDocuments('paypal');
    });

    // Botón para copiar datos bancarios
    document.getElementById('copyBankDetails').addEventListener('click', function() {
        const bankDetails = `Banco: NU\nTipo: Cuenta de Ahorros\nLlave: @WAV687\nBeneficiario: Trading Inteligente`;
        
        navigator.clipboard.writeText(bankDetails)
            .then(() => {
                showAlert('Datos bancarios copiados al portapapeles', 'success');
            })
            .catch(err => {
                showAlert('Error al copiar los datos', 'danger');
                console.error('Error al copiar: ', err);
            });
    });

    // Confirmar pago bancario
    document.getElementById('confirmBankPayment').addEventListener('click', function() {
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const userPhone = document.getElementById('userPhone').value;
        
        if (!userName || !userEmail) {
            showAlert('Por favor completa todos los campos', 'danger');
            return;
        }
        
        if (!validateEmail(userEmail)) {
            showAlert('Por favor ingresa un email válido', 'danger');
            return;
        }

        // Generar documentos
        generateDocuments('bank');
        
        // Mostrar instrucciones
        showAlert('Por favor realiza la transferencia a la cuenta NU: @WAV687 y envía el comprobante a tradinginteligenteap@gmail.com junto con los documentos descargados.', 'info');
    });

    // Función para generar documentos PDF
    function generateDocuments(paymentMethod) {
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const userPhone = document.getElementById('userPhone').value;
        const productName = document.getElementById('modalProductName').textContent;
        const productPrice = document.getElementById('modalProductPrice').textContent.replace('$', '').replace(' USD', '');
        
        // Datos del usuario
        const userData = {
            name: userName,
            email: userEmail,
            phone: userPhone,
            date: new Date().toLocaleDateString('es-ES'),
            signature: signaturePad.isEmpty() ? null : signaturePad.toDataURL()
        };

        // Datos del producto
        const productData = {
            name: productName,
            price: productPrice,
            description: `Robot de trading automatizado para MetaTrader 5 - ${productName}`
        };

        // Datos del pago
        const paymentData = {
            method: paymentMethod === 'paypal' ? 'PayPal' : 'Transferencia Bancaria',
            reference: paymentMethod === 'paypal' ? 'Pendiente de confirmación' : '@WAV687',
            date: new Date().toLocaleDateString('es-ES')
        };

        // Generar contrato
        const contractPDF = generateContractPDF(userData, productData);
        
        // Generar factura
        const invoicePDF = generateInvoicePDF(userData, productData, paymentData);
        
        // Mostrar mensaje de éxito
        showAlert('✅ Documentos generados correctamente. Por favor envía el comprobante de pago y estos documentos a tradinginteligenteap@gmail.com', 'success');
    }

    // Función para generar el contrato PDF
    function generateContractPDF(userData, productData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Logo y encabezado
        doc.setFontSize(16);
        doc.setTextColor(255, 193, 7);
        doc.text('TRADING INTELIGENTE', 105, 15, null, null, 'center');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text('Contrato de Licencia de Software', 105, 22, null, null, 'center');
        
        // Línea decorativa
        doc.setDrawColor(255, 193, 7);
        doc.setLineWidth(1);
        doc.line(20, 25, 190, 25);
        
        // Datos de las partes
        doc.setFontSize(10);
        doc.text('Datos del Vendedor:', 20, 35);
        doc.text('Trading Inteligente', 20, 40);
        doc.text('Email: tradinginteligenteap@gmail.com', 20, 45);
        doc.text('Teléfono: +573506194991', 20, 50);
        
        doc.text('Datos del Comprador:', 120, 35);
        doc.text(`Nombre: ${userData.name}`, 120, 40);
        doc.text(`Email: ${userData.email}`, 120, 45);
        doc.text(`Teléfono: ${userData.phone}`, 120, 50);
        doc.text(`Fecha: ${userData.date}`, 120, 55);
        
        // Términos del contrato
        doc.setFontSize(12);
        doc.setTextColor(255, 193, 7);
        doc.text('1. OBJETO DEL CONTRATO', 20, 65);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const contractText = [
            'TRADING INTELIGENTE (en adelante "EL VENDEDOR") celebra el presente contrato de',
            'licencia de software con EL COMPRADOR, quien declara haber proporcionado',
            'información veraz en el formulario de compra.',
            '',
            '2. GARANTÍAS DE FUNCIONAMIENTO',
            'EL VENDEDOR garantiza que el Software:',
            '• Opera exclusivamente cuando se cumplen los parámetros predefinidos de su estrategia central.',
            '• Puede permanecer inactivo por días, semanas o meses cuando detecta alto riesgo de pérdida.',
            '• Implementa un sistema de trailing stop dinámico para proteger las ganancias obtenidas.',
            '• Utiliza stop loss dinámico ajustado a la volatilidad del mercado.',
            '',
            '3. ALCANCE DE LAS GARANTÍAS',
            'EL VENDEDOR establece expresamente que:',
            '• No ofrece garantías sobre resultados financieros futuros.',
            '• Los resultados históricos mostrados no son indicativos de rendimientos futuros.',
            '• El Software está diseñado para operar con probabilidad estadística favorable.',
            '',
            '4. PROPIEDAD INTELECTUAL',
            'EL VENDEDOR conserva todos los derechos de propiedad intelectual sobre el Software.',
            'Este contrato otorga únicamente una licencia de uso limitada y no exclusiva.',
            '',
            '5. CONFIDENCIALIDAD',
            'El COMPRADOR se compromete a mantener la confidencialidad del Software y no',
            'revelar sus características técnicas o estratégicas a terceros.'
        ];
        
        let yPosition = 70;
        contractText.forEach(line => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            
            if (line.startsWith('•')) {
                doc.text('  ' + line, 20, yPosition);
            } else if (line.match(/^\d+\./)) {
                doc.setTextColor(255, 193, 7);
                doc.text(line, 20, yPosition);
                doc.setTextColor(0, 0, 0);
            } else {
                doc.text(line, 20, yPosition);
            }
            yPosition += 5;
        });
        
        // Firmas
        doc.addPage();
        doc.setTextColor(255, 193, 7);
        doc.text('FIRMAS', 105, 20, null, null, 'center');
        
        doc.setTextColor(0, 0, 0);
        doc.text('COMPRADOR', 50, 50);
        doc.text('VENDEDOR', 150, 50);
        
        if (userData.signature) {
            doc.addImage(userData.signature, 'PNG', 40, 60, 60, 30);
        } else {
            doc.line(40, 70, 90, 70);
            doc.text('Firma', 65, 75, null, null, 'center');
        }
        
        doc.line(140, 70, 190, 70);
        doc.text('Trading Inteligente', 165, 75, null, null, 'center');
        
        doc.text(`Fecha: ${userData.date}`, 105, 100, null, null, 'center');
        
        // Guardar PDF
        const fileName = `Contrato_LeidyBot1_${userData.name.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
        
        return doc;
    }

    // Función para generar factura PDF
    function generateInvoicePDF(userData, productData, paymentData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFontSize(16);
        doc.setTextColor(255, 193, 7);
        doc.text('TRADING INTELIGENTE', 105, 15, null, null, 'center');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('FACTURA DE VENTA', 105, 25, null, null, 'center');
        
        // Línea decorativa
        doc.setDrawColor(255, 193, 7);
        doc.setLineWidth(1);
        doc.line(20, 30, 190, 30);
        
        // Información de la factura
        doc.setFontSize(10);
        const invoiceNumber = `FAC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        doc.text(`No. Factura: ${invoiceNumber}`, 20, 40);
        doc.text(`Fecha: ${userData.date}`, 20, 45);
        
        // Información del cliente
        doc.text('CLIENTE:', 20, 55);
        doc.text(`Nombre: ${userData.name}`, 20, 60);
        doc.text(`Email: ${userData.email}`, 20, 65);
        doc.text(`Teléfono: ${userData.phone}`, 20, 70);
        
        // Detalles del producto
        doc.setFontSize(12);
        doc.setTextColor(255, 193, 7);
        doc.text('DESCRIPCIÓN DEL PRODUCTO', 20, 85);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 87, 190, 87);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Producto', 20, 95);
        doc.text('Precio', 180, 95, null, null, 'right');
        
        doc.line(20, 97, 190, 97);
        
        doc.text(productData.name, 20, 105);
        doc.text(`$${productData.price} USD`, 180, 105, null, null, 'right');
        
        // Totales
        doc.line(150, 115, 190, 115);
        doc.text('Subtotal:', 150, 125, null, null, 'right');
        doc.text(`$${productData.price} USD`, 180, 125, null, null, 'right');
        
        doc.text('IVA (0%):', 150, 135, null, null, 'right');
        doc.text('$0 USD', 180, 135, null, null, 'right');
        
        doc.setFontSize(12);
        doc.setTextColor(255, 193, 7);
        doc.text('TOTAL:', 150, 145, null, null, 'right');
        doc.text(`$${productData.price} USD`, 180, 145, null, null, 'right');
        
        // Información de pago
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('INFORMACIÓN DE PAGO:', 20, 160);
        doc.text(`Método: ${paymentData.method}`, 20, 165);
        doc.text(`Referencia: ${paymentData.reference}`, 20, 170);
        doc.text(`Fecha: ${paymentData.date}`, 20, 175);
        
        // Notas
        doc.text('NOTAS:', 20, 190);
        doc.text('• Software entregado por medios electrónicos', 20, 195);
        doc.text('• Enviar comprobante a: tradinginteligenteap@gmail.com', 20, 200);
        doc.text('• Soporte técnico: +573506194991', 20, 205);
        
        // Guardar PDF
        const fileName = `Factura_LeidyBot1_${userData.name.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
        
        return doc;
    }

    // Botones de descarga e impresión del contrato
    document.getElementById('downloadContract').addEventListener('click', function() {
        const userName = document.getElementById('contractName').value;
        const userEmail = document.getElementById('contractId').value;
        
        if (!userName || !userEmail) {
            showAlert('Por favor completa todos los campos del contrato', 'danger');
            return;
        }
        
        const userData = {
            name: userName,
            email: userEmail,
            date: new Date().toLocaleDateString('es-ES'),
            signature: signaturePad.isEmpty() ? null : signaturePad.toDataURL()
        };
        
        const productData = {
            name: 'LeidyBot1',
            price: '260',
            description: 'Robot de trading automatizado para MetaTrader 5'
        };
        
        generateContractPDF(userData, productData);
        showAlert('Contrato descargado correctamente', 'success');
    });

    document.getElementById('printContract').addEventListener('click', function() {
        window.print();
    });

    // Sistema de rating para testimonios
    const stars = document.querySelectorAll('.rating-input .fa-star');
    const ratingValue = document.getElementById('ratingValue');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            ratingValue.value = rating;
            
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseover', function() {
            const rating = this.getAttribute('data-rating');
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = ratingValue.value;
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= currentRating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
    });

    // Formulario de testimonios
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rating = ratingValue.value;
            if (rating === '0') {
                showAlert('Por favor selecciona una calificación', 'danger');
                return;
            }
            
            showAlert('¡Gracias por tu testimonio! Lo revisaremos y lo publicaremos pronto.', 'success');
            this.reset();
            
            // Reset stars
            stars.forEach(star => {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            });
            ratingValue.value = '0';
        });
    }

    // Funciones auxiliares
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showAlert(message, type) {
        // Crear elemento de alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'danger' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

    // Manejar el modal de pago
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            document.getElementById('modalProductName').textContent = 'LeidyBot1';
            document.getElementById('modalProductPrice').textContent = '$260 USD';
        });
    }
    
    // Manejar el modal de imágenes
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const imgSrc = button.getAttribute('data-img');
            document.getElementById('modalImage').src = imgSrc;
        });
    }
    
    // Validación de formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                showAlert('Por favor completa todos los campos', 'danger');
                return;
            }
            
            if (!validateEmail(email)) {
                showAlert('Por favor ingresa un email válido', 'danger');
                return;
            }
            
            showAlert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.', 'success');
            this.reset();
        });
    }

    // Efectos de animación al hacer scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .result-card, .testimonial-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Ejecutar una vez al cargar
});
