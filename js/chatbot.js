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
      text: '¡Hola! 👋 Soy el asistente virtual de Keysertron. ¿En qué puedo ayudarte hoy?',
      quickReplies: ['¿Qué servicios ofrecen?', '¿Cómo funciona el proceso?', '¿Qué equipos aceptan?', 'Agendar recolección', '¿Dónde están ubicados?']
    },
    servicios: {
      text: '🌿 Ofrecemos 4 servicios principales:\n\n♻️ **Reciclaje Corporativo** — Gestión integral de residuos electrónicos para empresas.\n\n🔒 **Destrucción Segura de Datos** — Eliminación garantizada con certificado legal.\n\n🚛 **Recolección Certificada** — Logística especializada y documentada.\n\n🛡️ **Seguridad Empresarial** — Protección de activos digitales en la disposición final.\n\n¿Te interesa algún servicio en particular?',
      quickReplies: ['Reciclaje Corporativo', 'Destrucción de Datos', 'Solicitar cotización', '¿Cómo funciona?']
    },
    proceso: {
      text: '📋 ¡Es muy sencillo! Nuestro proceso consta de 4 pasos:\n\n**1️⃣ Contacto** — Nos comunicas tus necesidades.\n\n**2️⃣ Recolección** — Recogemos tus equipos con logística segura.\n\n**3️⃣ Procesamiento** — Clasificamos y procesamos cada componente.\n\n**4️⃣ Certificación** — Recibes un certificado de destrucción y reciclaje.\n\n¡Todo el proceso es seguro, documentado y cumple normativas ambientales!',
      quickReplies: ['Agendar recolección', '¿Qué equipos aceptan?', 'Solicitar cotización']
    },
    equipos: {
      text: '💻 Aceptamos una amplia variedad de residuos electrónicos:\n\n• Computadoras de escritorio y laptops\n• Servidores y equipos de red\n• Impresoras y escáneres\n• Monitores y pantallas\n• Teléfonos y tablets\n• Cables y accesorios\n• Discos duros y memorias\n• Equipos de telecomunicaciones\n• Baterías electrónicas\n• Componentes electrónicos\n\n¡Si no ves tu equipo en la lista, pregúntanos! 😊',
      quickReplies: ['Agendar recolección', 'Solicitar cotización', '¿Cómo funciona?']
    },
    recoleccion: {
      text: '🚛 ¡Excelente! Para agendar una recolección necesitamos:\n\n📌 Nombre de tu empresa\n📌 Dirección de recolección\n📌 Tipo y cantidad aproximada de equipos\n📌 Fecha preferida\n\n📝 Te invito a llenar nuestro **formulario de contacto** para que un asesor te contacte en menos de 24 horas.\n\n👉 ¿Te redirijo al formulario?',
      quickReplies: ['Ir al formulario', '¿Qué equipos aceptan?', '¿Cuánto cuesta?']
    },
    ubicacion: {
      text: '📍 Estamos ubicados en:\n\n**México, Ciudad de México**\n\n🕐 Horario: Lunes a Viernes, 9:00 - 18:00\n📧 Email: info@keysertron.com\n📱 Síguenos en redes:\n• Facebook: @keysertron\n• Instagram: @keysertron\n• TikTok: @keysertron\n\n¡Estamos siempre disponibles para atenderte!',
      quickReplies: ['Agendar recolección', '¿Qué servicios ofrecen?', 'Solicitar cotización']
    },
    cotizacion: {
      text: '💰 El costo de nuestros servicios depende de:\n\n• Tipo de residuos electrónicos\n• Cantidad de equipos\n• Ubicación de recolección\n• Servicios adicionales (destrucción de datos, certificados)\n\n📝 Te invito a completar nuestro **formulario de contacto** y un asesor te enviará una cotización personalizada en menos de 24 horas.\n\n¿Te redirijo al formulario?',
      quickReplies: ['Ir al formulario', '¿Qué servicios ofrecen?', '¿Cómo funciona?']
    },
    reciclaje_corporativo: {
      text: '♻️ **Reciclaje Corporativo**\n\nNuestro servicio de reciclaje corporativo incluye:\n\n✅ Evaluación de los residuos electrónicos\n✅ Plan de gestión personalizado\n✅ Recolección en tus instalaciones\n✅ Procesamiento ecológico certificado\n✅ Informe detallado de reciclaje\n✅ Certificado de cumplimiento ambiental\n\nIdeal para empresas que necesitan renovar su parque tecnológico de forma responsable.',
      quickReplies: ['Solicitar cotización', 'Destrucción de Datos', 'Agendar recolección']
    },
    destruccion_datos: {
      text: '🔒 **Destrucción Segura de Datos**\n\nGarantizamos la eliminación total de información sensible:\n\n✅ Borrado seguro certificado (NIST 800-88)\n✅ Destrucción física de medios de almacenamiento\n✅ Certificado legal de destrucción\n✅ Cadena de custodia documentada\n✅ Cumplimiento con LFPDPPP\n\n🛡️ Protege tu empresa de fuga de datos y cumple con la normativa.',
      quickReplies: ['Solicitar cotización', 'Reciclaje Corporativo', 'Agendar recolección']
    },
    formulario: {
      text: '📝 ¡Perfecto! Te redirijo al formulario de contacto ahora mismo. Solo baja un poco en la página y encontrarás el formulario.',
      quickReplies: ['¿Qué servicios ofrecen?', '¿Cómo funciona?', 'Otra pregunta'],
      action: 'scrollToContact'
    },
    gracias: {
      text: '😊 ¡Gracias a ti! Fue un placer ayudarte. Si tienes más preguntas, no dudes en escribirme.\n\n🌿 Recuerda: ¡Reciclar es cuidar nuestro planeta!',
      quickReplies: ['¿Qué servicios ofrecen?', '¿Cómo funciona?', 'Agendar recolección']
    },
    default: {
      text: '🤔 Disculpa, no entendí tu pregunta. ¿Puedo ayudarte con alguno de estos temas?',
      quickReplies: ['¿Qué servicios ofrecen?', '¿Cómo funciona el proceso?', '¿Qué equipos aceptan?', 'Agendar recolección', 'Solicitar cotización']
    }
  };

  // ---- Keyword Matching ----
  function findResponse(message) {
    const msg = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (msg.match(/hola|buenos|buenas|hey|hi|saludos|que tal/)) return responses.greeting;
    if (msg.match(/servicio|ofrec|hacen|brind/)) return responses.servicios;
    if (msg.match(/proceso|como funciona|pasos|etapas|como es/)) return responses.proceso;
    if (msg.match(/equipo|acept|recib|compu|laptop|servidor|impresora|monitor|dispositivo|que reciclan/)) return responses.equipos;
    if (msg.match(/recolec|recog|agenda|programar|pasar por|venir/)) return responses.recoleccion;
    if (msg.match(/donde|ubicac|direccion|oficina|localiz|ciudad|pais/)) return responses.ubicacion;
    if (msg.match(/precio|costo|cuanto|cotiz|tarifa|valor|presupuesto/)) return responses.cotizacion;
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
    avatar.textContent = isBot ? '🤖' : '👤';
    
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
