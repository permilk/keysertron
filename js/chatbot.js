/* =============================================
   KEYSERTRON - Chatbot
   Interactive chatbot with Keysertron mascot
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('chatbot-toggle');
  const window_ = document.getElementById('chatbot-window');
  const messagesContainer = document.getElementById('chatbot-messages');
  const quickRepliesContainer = document.getElementById('chat-quick-replies');
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

  let isOpen = false;
  let isFirstOpen = true;

  // ---- Chatbot Knowledge Base ----
  const responses = {
    greeting: {
      text: '¡Hola! 👋 Soy el asistente virtual de Keysertron. ¿En qué puedo ayudarte hoy?\n\nEn Keysertron ayudamos a empresas a cumplir sus normativas ambientales, proteger su información y contribuir al medio ambiente. ¡Recolección SIN COSTO! 🌿',
      quickReplies: ['¿Qué equipos aceptan?', '¿Qué servicios ofrecen?', '¿Cómo funciona el proceso?', 'Solicitar recolección', '¿Quiénes son sus clientes?']
    },
    servicios: {
      text: '🌿 Ofrecemos un servicio integral "todo en uno":\n\n🚛 **Recolección en Sitio** — Recogemos tus equipos directamente en tus instalaciones.\n\n🔒 **Destrucción de Datos** — Borrado y destrucción física de discos duros con certificado.\n\n♻️ **Clasificación y Reciclaje** — Procesamiento ecológico de cada componente.\n\n📄 **Certificado de Destrucción** — Documento oficial para auditorías ambientales.\n\n✅ **Transporte Especializado** — Unidades equipadas y documentadas.\n\n¡Un solo proveedor para todo el proceso!',
      quickReplies: ['Destrucción de Datos', 'Solicitar recolección', '¿Qué equipos aceptan?', '¿Cuánto cuesta?']
    },
    clientes: {
      text: '🏆 Hemos trabajado con empresas líderes en México:\n\n🏦 **Banca:** Banamex, Bancomer, Scotiabank\n🛒 **Retail:** Walmart, Bodega Aurrerá, Sam\'s Club\n⚡ **Energía & Telecom:** CFE, Telmex\n🏛️ **Gobierno & Academia:** SEP, Cinvestav, Gobierno de Chiapas\n🏭 **Industrial & Petrolero:** Cotemar\n\n¡Confían en nosotros para proteger su información y cumplir con sus normativas ambientales!',
      quickReplies: ['¿Qué servicios ofrecen?', 'Solicitar recolección', '¿Por qué elegirnos?']
    },
    diferenciadores: {
      text: '🌟 ¿Por qué elegir Keysertron?\n\n✅ **Servicio sin fines de lucro** — Accesible para todos\n✅ **Todo en un solo proveedor** — Recolección, transporte, destrucción, reciclaje y certificado\n✅ **Protección total de información** — Manejo seguro y confidencial de datos\n✅ **Cumplimiento ambiental** — Normativas nacionales cumplidas\n✅ **Atención personalizada** — Trato directo y cercano\n✅ **Experiencia con grandes corporativos** — Banamex, Walmart, CFE, Telmex y más\n✅ **Procesos controlados** — Cada paso documentado y verificable',
      quickReplies: ['¿Quiénes son sus clientes?', 'Solicitar recolección', '¿Cómo funciona?']
    },
    proceso: {
      text: '📋 Nuestro proceso completo en 7 pasos:\n\n**1️⃣ Solicitud** — Indícanos volumen, tipo de equipo, ubicación y servicio requerido.\n\n**2️⃣ Logística** — Evaluamos volumen y distancia para planificar el servicio.\n\n**3️⃣ Programación** — Acordamos fecha y hora según tu operación.\n\n**4️⃣ Transporte** — Llegamos a tu sitio con unidades especializadas.\n\n**5️⃣ Destrucción** — Destrucción controlada de equipos y datos.\n\n**6️⃣ Reciclaje** — Clasificación y procesamiento ecológico.\n\n**7️⃣ Certificado** — Entregamos tu certificado oficial de destrucción.',
      quickReplies: ['Solicitar recolección', '¿Qué equipos aceptan?', '¿Cuánto cuesta?']
    },
    equipos: {
      text: '💻 Manejamos una amplia variedad de residuos electrónicos:\n\n🖥️ **Cómputo y Movilidad:** CPU, Laptops, Tablets, Teléfonos\n\n🖨️ **Oficina:** Impresoras, Módems, No-break\n\n🌐 **Redes y Telecomunicaciones:** Servidores, Cableado, Telefonía\n\n⚡ **Industriales y Corporativos:** Transformadores, Medidores de luz, Cajeros automáticos (ATM), Terminales punto de venta (TPV)\n\n🔌 **Componentes:** Tarjetas eléctricas, componentes electrónicos\n\n¡Consúltanos para cualquier equipo corporativo u obsoleto!',
      quickReplies: ['Solicitar recolección', '¿Qué servicios ofrecen?', '¿Cómo funciona?']
    },
    recoleccion: {
      text: '🚛 ¡Excelente! Para solicitar una recolección necesitamos:\n\n📌 **Volumen** — Kilogramos o toneladas aproximadas\n📌 **Tipo de equipo** — CPU, servidores, impresoras, industriales, etc.\n📌 **Ubicación** — Ciudad y dirección\n📌 **Servicio requerido** — Recolección, destrucción, reciclaje o integral\n\n⭐ **¡El servicio de recolección es SIN COSTO!**\n\n📝 Llena nuestro formulario de contacto y un asesor te contactará en menos de 24 horas.',
      quickReplies: ['Ir al formulario', '¿Qué equipos aceptan?', '¿Cuánto cuesta?']
    },
    ubicacion: {
      text: '📍 Estamos ubicados en:\n\n**México, Ciudad de México**\n\n🕐 Horario: Lunes a Viernes, 9:00 - 18:00\n📧 Email: info@keysertron.com\n📱 Redes sociales:\n• Facebook: @keysertron\n• Instagram: @keysertron\n• TikTok: @keysertron\n\n¡Atendemos en toda la República Mexicana!',
      quickReplies: ['Solicitar recolección', '¿Qué servicios ofrecen?', 'Ir al formulario']
    },
    cotizacion: {
      text: '💰 El costo depende de:\n\n• **Volumen** — Kilogramos o toneladas de residuos\n• **Tipo de equipo** — Cómputo, industrial, telecomunicaciones, etc.\n• **Ubicación** — Ciudad y distancia\n• **Servicio requerido** — Recolección, destrucción, reciclaje o integral\n\n⭐ **¡La recolección básica es SIN COSTO!**\n\n📝 Llena nuestro formulario y recibirás una cotización personalizada en menos de 24 horas.',
      quickReplies: ['Ir al formulario', '¿Qué servicios ofrecen?', '¿Cómo funciona?']
    },
    reciclaje_corporativo: {
      text: '♻️ **Clasificación y Reciclaje**\n\nNuestro servicio incluye:\n\n✅ Evaluación de residuos electrónicos\n✅ Plan de gestión personalizado\n✅ Recolección en tus instalaciones\n✅ Procesamiento ecológico certificado\n✅ Informe detallado de reciclaje\n✅ **Certificado de Destrucción** oficial\n\nIdeal para empresas que necesitan cumplir sus normativas ambientales.',
      quickReplies: ['Solicitar recolección', 'Destrucción de Datos', '¿Cuánto cuesta?']
    },
    destruccion_datos: {
      text: '🔒 **Destrucción Segura de Datos**\n\nGarantizamos la eliminación total de información sensible:\n\n✅ Borrado seguro certificado de medios digitales\n✅ Destrucción física de discos duros\n✅ **Certificado de Destrucción** oficial\n✅ Cadena de custodia documentada\n✅ Protección total ante fugas de información\n\n🛡️ Protege tu empresa y cumple con la normativa de protección de datos.',
      quickReplies: ['Solicitar recolección', '¿Qué servicios ofrecen?', '¿Cuánto cuesta?']
    },
    formulario: {
      text: '📝 ¡Perfecto! Te redirijo al formulario de contacto. Baja un poco en la página, completa tus datos y un asesor te contactará en menos de 24 horas.\n\n⭐ Recuerda indicar: volumen, tipo de equipo, ubicación y servicio requerido.',
      quickReplies: ['¿Qué servicios ofrecen?', '¿Cómo funciona?', 'Otra pregunta'],
      action: 'scrollToContact'
    },
    gracias: {
      text: '😊 ¡Gracias a ti! Fue un placer ayudarte. Si tienes más preguntas, no dudes en escribirme.\n\n🌿 En Keysertron ayudamos a las empresas a cumplir sus normativas ambientales, proteger su información y contribuir al medio ambiente. ¡Juntos hacemos la diferencia!',
      quickReplies: ['¿Qué servicios ofrecen?', '¿Cómo funciona?', 'Solicitar recolección']
    },
    default: {
      text: '🤔 Disculpa, no entendí tu pregunta. ¿Puedo ayudarte con alguno de estos temas?',
      quickReplies: ['¿Qué equipos aceptan?', '¿Qué servicios ofrecen?', '¿Cómo funciona?', 'Solicitar recolección', '¿Quiénes son sus clientes?']
    }
  };

  // ---- Keyword Matching ----
  function findResponse(message) {
    const msg = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (msg.match(/hola|buenos|buenas|hey|hi|saludos|que tal/)) return responses.greeting;
    if (msg.match(/cliente|trabaj|banamex|bancomer|walmart|cfe|telmex|scotiabank|cinvestav|sep|cotemar|chiapas|quienes/)) return responses.clientes;
    if (msg.match(/por que|diferenci|confiab|mejor|ventaj|elegirnos|elegir/)) return responses.diferenciadores;
    if (msg.match(/servicio|ofrec|hacen|brind|incluye/)) return responses.servicios;
    if (msg.match(/proceso|como funciona|pasos|etapas|como es|solicitud/)) return responses.proceso;
    if (msg.match(/equipo|acept|recib|compu|laptop|servidor|impresora|tablet|telefon|cajero|tpv|transformador|cableado|no.break|modem|que reciclan|industriale/)) return responses.equipos;
    if (msg.match(/recolec|recog|agenda|programar|pasar por|venir|solicitar/)) return responses.recoleccion;
    if (msg.match(/donde|ubicac|direccion|oficina|localiz|ciudad|pais/)) return responses.ubicacion;
    if (msg.match(/precio|costo|cuanto|cotiz|tarifa|valor|presupuesto|sin costo/)) return responses.cotizacion;
    if (msg.match(/reciclaje corporativo|reciclaje empresarial|reciclaje empresa/)) return responses.reciclaje_corporativo;
    if (msg.match(/destrucc|dato|segur|borr|informacion|disco/)) return responses.destruccion_datos;
    if (msg.match(/formulario|ir al form|llenar|contacto/)) return responses.formulario;
    if (msg.match(/gracia|thank|perfecto|ok|genial|excelente|entendido|vale|listo/)) return responses.gracias;
    
    return responses.default;
  }

  // ---- Format message text (Markdown-like) ----
  function formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // ---- Add Message to Chat ----
  function addMessage(text, isBot = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'chat-mini-avatar';
    avatar.textContent = isBot ? '' : '👤';
    if (isBot) {
      const img = document.createElement('img');
      img.src = 'assets/mascot-idle.png';
      img.alt = 'Bot';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
      avatar.appendChild(img);
    }
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = formatMessage(text);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // ---- Show Typing Indicator ----
  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'chat-mini-avatar';
    avatar.textContent = '🤖';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(indicator);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  // ---- Show Quick Replies ----
  function showQuickReplies(replies) {
    quickRepliesContainer.innerHTML = '';
    
    replies.forEach(reply => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = reply;
      btn.addEventListener('click', () => handleUserMessage(reply));
      quickRepliesContainer.appendChild(btn);
    });
  }

  // ---- Handle User Message ----
  function handleUserMessage(text) {
    // Add user message
    addMessage(text, false);
    
    // Clear quick replies
    quickRepliesContainer.innerHTML = '';
    
    // Show typing indicator
    showTyping();
    
    // Find and show response after delay
    const response = findResponse(text);
    const delay = Math.random() * 800 + 600; // 600-1400ms
    
    setTimeout(() => {
      removeTyping();
      addMessage(response.text, true);
      
      // Execute any action
      if (response.action === 'scrollToContact') {
        setTimeout(() => {
          const contactSection = document.getElementById('contacto');
          if (contactSection) {
            const offset = 80;
            const top = contactSection.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }, 500);
      }
      
      // Show quick replies after a short delay
      if (response.quickReplies) {
        setTimeout(() => showQuickReplies(response.quickReplies), 300);
      }
    }, delay);
  }

  // ---- Toggle Chatbot ----
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    window_.classList.toggle('open', isOpen);
    toggle.classList.toggle('active', isOpen);
    
    if (isOpen && isFirstOpen) {
      isFirstOpen = false;
      // Show greeting after opening
      setTimeout(() => {
        addMessage(responses.greeting.text, true);
        setTimeout(() => showQuickReplies(responses.greeting.quickReplies), 300);
      }, 500);
    }
    
    if (isOpen) {
      setTimeout(() => input.focus(), 400);
    }
  });

  // ---- Send Message ----
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    handleUserMessage(text);
  }

  sendBtn.addEventListener('click', sendMessage);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // ---- Close chatbot when clicking outside ----
  document.addEventListener('click', (e) => {
    if (isOpen && !window_.contains(e.target) && !toggle.contains(e.target)) {
      isOpen = false;
      window_.classList.remove('open');
      toggle.classList.remove('active');
    }
  });

  // ---- Auto-show chatbot hint after 5 seconds ----
  setTimeout(() => {
    if (!isOpen) {
      toggle.style.animation = 'none';
      toggle.offsetHeight; // force reflow
      toggle.style.animation = '';
      
      // Brief scale animation to draw attention
      toggle.style.transform = 'scale(1.15)';
      setTimeout(() => {
        toggle.style.transform = '';
      }, 300);
    }
  }, 5000);
});
