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
      text: 'Hola, soy el asistente virtual de Keysertron. ¿En qué puedo ayudarte?\n\nAyudamos a empresas a cumplir sus normativas ambientales, proteger su información y contribuir al medio ambiente. El servicio de recolección es sin costo.',
      quickReplies: ['¿Qué equipos aceptan?', '¿Qué servicios ofrecen?', '¿Cómo funciona?', 'Solicitar recolección', '¿Quiénes son sus clientes?']
    },
    servicios: {
      text: 'Ofrecemos un servicio integral, todo en un solo proveedor:\n\n— Recolección en sitio\n— Transporte especializado\n— Destrucción de datos (disco duro)\n— Clasificación y reciclaje\n— Certificado de destrucción\n\n¿Te interesa algún servicio en particular?',
      quickReplies: ['Destrucción de datos', 'Solicitar recolección', '¿Qué equipos aceptan?', '¿Cuánto cuesta?']
    },
    clientes: {
      text: 'Hemos trabajado con empresas líderes en México:\n\nBanca: Banamex, Bancomer, Scotiabank\nRetail: Walmart, Bodega Aurrerá, Sam\'s Club\nEnergía y telecomunicaciones: CFE, Telmex\nGobierno y academia: SEP, Cinvestav, Gobierno de Chiapas\nSector industrial y petrolero: Cotemar',
      quickReplies: ['¿Qué servicios ofrecen?', 'Solicitar recolección', '¿Por qué elegirnos?']
    },
    diferenciadores: {
      text: '¿Por qué elegir Keysertron?\n\n• Servicio sin fines de lucro\n• Todo en un solo proveedor\n• Protección total de información\n• Cumplimiento con normativas ambientales\n• Atención personalizada\n• Experiencia con grandes corporativos\n• Procesos controlados y documentados',
      quickReplies: ['¿Quiénes son sus clientes?', 'Solicitar recolección', '¿Cómo funciona?']
    },
    proceso: {
      text: 'Nuestro proceso en 7 pasos:\n\n1. Solicitud — indícanos volumen, tipo de equipo, ubicación y servicio requerido.\n2. Logística — evaluamos volumen y distancia.\n3. Programación — acordamos fecha y hora.\n4. Transporte — llegamos con unidades especializadas.\n5. Destrucción — destrucción controlada de equipos y datos.\n6. Reciclaje — clasificación y procesamiento ecológico.\n7. Certificado — entregamos el certificado oficial de destrucción.',
      quickReplies: ['Solicitar recolección', '¿Qué equipos aceptan?', '¿Cuánto cuesta?']
    },
    equipos: {
      text: 'Manejamos una amplia variedad de residuos electrónicos:\n\nCómputo y movilidad: CPU, laptops, tablets, teléfonos\nOficina: impresoras, módems, no-break\nRedes y telecomunicaciones: servidores, cableado, telefonía\nEquipos industriales: transformadores, medidores de luz, cajeros (ATM), terminales de punto de venta (TPV)\nComponentes: tarjetas eléctricas, componentes electrónicos',
      quickReplies: ['Solicitar recolección', '¿Qué servicios ofrecen?', '¿Cómo funciona?']
    },
    recoleccion: {
      text: 'Para solicitar una recolección necesitamos:\n\n• Volumen estimado (kg o toneladas)\n• Tipo de equipo\n• Ubicación\n• Servicio requerido\n\nEl servicio de recolección es sin costo. Llena el formulario de contacto y un asesor te contactará en menos de 24 horas.',
      quickReplies: ['Ir al formulario', '¿Qué equipos aceptan?', '¿Cuánto cuesta?']
    },
    ubicacion: {
      text: 'Estamos ubicados en México, Ciudad de México.\n\nHorario: lunes a viernes, 9:00 - 18:00\nCorreo: info@keysertron.com\nRedes: @keysertron en Facebook, Instagram y TikTok\n\nAtendemos en toda la República Mexicana.',
      quickReplies: ['Solicitar recolección', '¿Qué servicios ofrecen?', 'Ir al formulario']
    },
    cotizacion: {
      text: 'El costo depende de:\n\n• Volumen (kg o toneladas)\n• Tipo de equipo\n• Ubicación\n• Servicio requerido\n\nLa recolección básica es sin costo. Llena el formulario y recibirás una cotización en menos de 24 horas.',
      quickReplies: ['Ir al formulario', '¿Qué servicios ofrecen?', '¿Cómo funciona?']
    },
    reciclaje_corporativo: {
      text: 'Clasificación y reciclaje\n\nNuestro servicio incluye:\n\n• Evaluación de residuos electrónicos\n• Plan de gestión personalizado\n• Recolección en tus instalaciones\n• Procesamiento ecológico certificado\n• Certificado de destrucción oficial',
      quickReplies: ['Solicitar recolección', 'Destrucción de datos', '¿Cuánto cuesta?']
    },
    destruccion_datos: {
      text: 'Destrucción segura de datos\n\nGarantizamos la eliminación total de información sensible:\n\n• Borrado seguro certificado\n• Destrucción física de discos duros\n• Certificado de destrucción oficial\n• Cadena de custodia documentada\n• Protección total ante fugas de información',
      quickReplies: ['Solicitar recolección', '¿Qué servicios ofrecen?', '¿Cuánto cuesta?']
    },
    formulario: {
      text: 'De acuerdo. Baja un poco en la página y encontrarás el formulario de contacto. Recuerda indicar: volumen estimado, tipo de equipo, ubicación y servicio requerido.',
      quickReplies: ['¿Qué servicios ofrecen?', '¿Cómo funciona?', 'Otra pregunta'],
      action: 'scrollToContact'
    },
    gracias: {
      text: 'Gracias a ti. Si tienes más preguntas, escríbeme cuando gustes.\n\nEn Keysertron ayudamos a las empresas a cumplir sus normativas ambientales, proteger su información y contribuir al medio ambiente.',
      quickReplies: ['¿Qué servicios ofrecen?', '¿Cómo funciona?', 'Solicitar recolección']
    },
    default: {
      text: 'Disculpa, no entendí tu pregunta. ¿Puedo ayudarte con alguno de estos temas?',
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

  // ---- Note: chatbot stays open until user clicks toggle button ----
  // Removed auto-close-on-outside-click to prevent unintended closing

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
