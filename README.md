# Traductor de Google (Clon)

Este proyecto es un clon de la interfaz de usuario de Google Translate, construido con HTML, CSS y JavaScript puro. Utiliza las nuevas capacidades de IA nativas del navegador para realizar traducciones y detección de idiomas en tiempo real.

## ✨ Características

- **Traducción en Tiempo Real:** El texto se traduce a medida que escribes, con un pequeño retardo para optimizar el rendimiento.
- **Detección Automática de Idioma:** Detecta automáticamente el idioma de origen mientras escribes.
- **Reconocimiento de Voz:** Utiliza la API de reconocimiento de voz del navegador (`SpeechRecognition`) para transcribir tu voz a texto en el área de entrada.
- **Texto a Voz (Text-to-Speech):** Lee el texto traducido en voz alta usando la API de síntesis de voz del navegador (`SpeechSynthesis`).
- **Intercambio de Idiomas:** Un botón permite intercambiar rápidamente los idiomas de origen y destino.
- **Modo Claro y Oscuro:** Un interruptor en la cabecera permite cambiar entre un tema claro y uno oscuro.
- **Diseño Responsivo:** La interfaz se adapta a diferentes tamaños de pantalla, desde móviles hasta ordenadores de escritorio.
- **Contador de Caracteres:** Muestra el número de caracteres en el área de entrada.
- **Botón de Limpieza:** Permite borrar el texto de entrada con un solo clic.

## 🛠️ Tecnologías Utilizadas

- **HTML5**
- **CSS3:**
  - CSS Custom Properties (Variables) para un fácil manejo de temas (modo claro/oscuro).
  - Flexbox para el layout.
- **JavaScript (ES6+):**
  - Módulos de ES6 para una estructura de código organizada.
  - Clases para encapsular la lógica del traductor.
- **APIs Nativas del Navegador:**
  - **AI Translator API (`window.Translator`):** Para la traducción de texto.
  - **AI Language Detector API (`window.LanguageDetector`):** Para la detección de idioma.
  - **Web Speech API (`SpeechRecognition`):** Para la entrada de voz.
  - **Web Speech API (`SpeechSynthesis`):** Para la salida de voz.
- **Google Fonts** y **Material Symbols** para la tipografía y los iconos.

## 🚀 Cómo Usarlo

No se requiere un servidor web ni un proceso de construcción.

1.  Clona o descarga este repositorio.
2.  Abre el archivo `index.html` en un navegador web moderno que soporte las APIs nativas de IA, como **Google Chrome** o **Microsoft Edge** en sus versiones más recientes.

**Nota:** Las APIs de IA del navegador son experimentales y pueden no estar disponibles en todos los navegadores o versiones.
