import { $ } from './dom.js';

class GoogleTranslator {
    static SUPPORTED_LANGUAGES = [
        'en',
        'es',
        'fr',
        'de',
        'it',
        'pt',
        'zh',
        'ja',
        'ru',
        'ar',
        'hi',
        'ko',
    ]

    static FULL_LANGUAGE_CODES = {
        es: 'es-ES',
        en: 'en-US',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        pt: 'pt-PT',
        zh: 'zh-CN',
        ja: 'ja-JP',
        ru: 'ru-RU',
        ar: 'ar-SA',
        hi: 'hi-IN',
        ko: 'ko-KR',
    }

    static DEFAUL_SOURCE_LANGUAGE = 'es';
    static DEFAUL_TARGET_LANGUAGE = 'en';

    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupThemeToggle();

        this.translationTimeout = null;
        this.currentTranslator = null;
        this.currentTranslatorKey = null;
        this.currentDetector = null;
    }

    init() {
        this.inputText = $('#inputText');
        this.outputText = $('#outputText');

        this.sourceLanguage = $('#sourceLanguage');
        this.targetLanguage = $('#targetLanguage');
        

        this.micButton = $('#micButton');
        this.clearButton = $('#clearButton');
        this.clearButton.style.display = 'none'; // Ocultar el botón al inicio
        this.copyButton = $('#copyButton');
        this.swapLanguagesButton = $('#swapLanguages');
        this.speakButton = $('#speakButton');

        //Confiuguracion inicial
        this.targetLanguage.value = GoogleTranslator.DEFAUL_TARGET_LANGUAGE;

        //Verificar que el usuario tiene soporte para la API de traduccion
        this.checkApiSupport();
    }

    checkApiSupport() {
        this.hasNativeTranslator = "Translator" in window;
        this.hasNativeDetector = "LanguageDetector" in window;

        if (!this.hasNativeTranslator || !this.hasNativeDetector) {
            console.warn("Tu navegador no soporta la API de traducción nativa de Google. Por favor, actualiza a la última versión de Chrome o Edge.");
            //this.showWarning();
        } else {
            console.log("✅ API nativas de AI disponibles");
        }
    }

    setupEventListeners() {
        this.inputText.addEventListener('input', () => {
            //Actualizar contador de letras
            this.updateClearButtonVisibility(); // Actualizar visibilidad del botón de borrar
            //traducir el texto con un debunce
            this.debounceTraslate();
        });

        this.sourceLanguage.addEventListener('change', () => this.translate());
        this.targetLanguage.addEventListener('change', () => this.translate());

        this.swapLanguagesButton.addEventListener('click', () => this.swapLanguages());
        this.micButton.addEventListener('click', () => this.startVoiceRecognition());
        this.speakButton.addEventListener('click', () => this.speakTranslation());
        this.clearButton.addEventListener('click', () => this.clearContent());
        this.copyButton.addEventListener('click', () => this.copyTranslation());

    }

    setupThemeToggle() {
        const themeToggle = $('#theme-toggle');
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
        });
    }

    updateClearButtonVisibility() {
    const hasContent = this.inputText.value.trim().length > 0;
    this.clearButton.style.display = hasContent ? 'block' : 'none';
    }

    clearContent() {
    // Clear input and output text
        this.inputText.value = '';
        this.outputText.textContent = '';

        // Reset char count
        const charCount = $('#charCount');
        charCount.textContent = '0/5000';

        // Reset detected language if source is set to auto
        if (this.sourceLanguage.value === 'auto') {
            const autoOption = this.sourceLanguage.querySelector('option[value="auto"]');
            if (autoOption) {
                autoOption.textContent = 'Detectar idioma';
            }
        }
    this.updateClearButtonVisibility(); // Actualizar visibilidad después de limpiar
    }

    async copyTranslation() {
    const textToCopy = this.outputText.textContent.trim();
    
    if (!textToCopy) return;

    try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Feedback visual temporal
        this.copyButton.style.backgroundColor = 'var(--google-green)';
        this.copyButton.style.color = 'white';
        
        // Restaurar estilo después de 1 segundo
        setTimeout(() => {
            this.copyButton.style.backgroundColor = '';
            this.copyButton.style.color = '';
        }, 1000);
        
    } catch (error) {
        console.error('Error al copiar:', error);
    }
}

    debounceTraslate() {
        clearTimeout(this.translationTimeout)
        this.translationTimeout = setTimeout(() => {
            this.translate();
        }, 500); // Espera 500ms antes de traducir
    }

    updateDetectedLanguage(detectedLanguage) {
        //Actualizar visualmente el idioma detectado
        const option = this.sourceLanguage.querySelector(`option[value="${detectedLanguage}"]`);

        if (option) {
            const autoOption = this.sourceLanguage.querySelector(`option[value="auto"]`)
            autoOption.textContent = `Dectetar idioma (${option.textContent})`
        }
    }

    async getTraslation(text) {

        const sourceLanguage = this.sourceLanguage.value === 'auto'
            ? await this.detectLanguage(text)
            : this.sourceLanguage.value;
        const targetLanguage = this.targetLanguage.value;

        if (sourceLanguage === targetLanguage) return text;

        //1 Verificar si realmente tenemos disponibilidad entre orig3en y destino
        try {
            const status = await window.Translator.availability({
                sourceLanguage,
                targetLanguage
            })

            if (status === 'unavailable') {
                throw new Error(`Traducción de ${sourceLanguage} a ${targetLanguage} no disponible`)
            }
        } catch (error){
            console.log(error)

            throw new Error(`Traducción de ${sourceLanguage} a ${targetLanguage} no disponible`)   
        }

        //2 Realizar la traduccion
        const translatorKey = `${sourceLanguage} - ${targetLanguage}`

        try{

            if (!this.currentTranslator || this.currentTranslatorKey !== translatorKey) {
            this.currentTranslator = await window.Translator.create({
                sourceLanguage,
                targetLanguage,
                monitor: (monitor) => {
                    monitor.addEventListener("downloadprogress", (e) => {
                        this.outputText.innerHTML = `<span class="loading">Descargando modelo: ${Math.floor(e.loaded * 100)}%</span>`
                    })
                }
            })
        }

        this.currentTranslatorKey = translatorKey

        const translation = await this.currentTranslator.translate(text)
        return translation

        } catch (error) {
            console.error(error)
            return 'Error al traducir'
        }

        
    }

    async translate() {

        const text = this.inputText.value.trim();
        console.log('Texto a traducir:', text);
        const charCount = $('#charCount');
        charCount.textContent = `${text.length}/5000`;

        if (!text) {
            this.outputText.value = '';
            return;
        }

        this.outputText.value = 'Traduciendo...';

        if (this.sourceLanguage.value === 'auto') {
            const detectedLanguage = await this.detectLanguage(text)
            this.updateDetectedLanguage(detectedLanguage)
        }

        try {
            const translation = await this.getTraslation(text)
            this.outputText.textContent = translation

        } catch (error) {
            console.error(error);
            const hasSupport = this.checkApiSupport();
            if (!hasSupport) {
                this.outputText.textContent = 'Error!!! no tiene soporte nativo a la API  de traducción con IA';
                return;
            }
            this.outputText.textContent = 'Error al traducir.';
            
        }
    }

    async swapLanguages() {
        //Intercambiar los idiomas primero dectetar  si source es 'auto' para saber que idioma
        //hay que pasar el output
        if (this.sourceLanguage.value === 'auto') {
            const detectedLanguage = await this.detectLanguage(this.inputText.value)
            this.sourceLanguage.value = detectedLanguage
        }

        //intercambiar los valores
        const temporalLanguage = this.sourceLanguage.value;
        this.sourceLanguage.value = this.targetLanguage.value;
        this.targetLanguage.value = temporalLanguage;

        //intercambiar lo textos
        this.inputText.value = this.outputText.value;
        this.outputText.value = "";

        if (this.inputText.value.trim()) {
            this.translate();
        }

        //Restaurar la opcion de auto dectetar
    }

    getFullLanguageCode(languageCode) {
        return GoogleTranslator.FULL_LANGUAGE_CODES[languageCode] ?? GoogleTranslator.DEFAUL_SOURCE_LANGUAGE;
    }

    async startVoiceRecognition() {
        const hasNativeRecongnitionSupport = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
        if (!hasNativeRecongnitionSupport) return

        const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false; // No continuar reconociendo después de una pausa
        recognition.interimResults = false; // No mostrar resultados intermedios
        
        const language = this.sourceLanguage.value === 'auto'
             ? await this.detectLanguage(this.inputText.value)
             : this.sourceLanguage.value;

        recognition.lang = this.getFullLanguageCode(language);

        recognition.onstart = () => {
            this.micButton.style.backgroundColor =  "var(--google-red)"
            this.micButton.color = "white";
        }

        recognition.onend = () => {
            this.micButton.style.backgroundColor =  ""
            this.micButton.color = "";
        }

        recognition.onresult = (event) => {
            console.log(event.results)

            const [{ transcript }] = event.results[0];
            this.inputText.value = transcript;
            this.translate();
        } 

        recognition.onerror = (event) => {
            console.error("Error en el reconocimiento de voz:", event.error);
        }

        recognition.start();
    }

    speakTranslation() {
        const hasNativeSupportSynthesis = "SpeechSynthesis" in window;
        if (!hasNativeSupportSynthesis) return

        const text = this.outputText.textContent
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getFullLanguageCode(this.targetLanguage.value);
        utterance.rate = 0.8

        utterance.onstart = () => {
            this.speakButton.style.backgroundColor = "var(--google-green)";
            this.speakButton.style.color = "white";
        }

        utterance.onend = () => {
            this.speakButton.style.backgroundColor = "";
            this.speakButton.style.color = "";
        }

        window.speechSynthesis.speak(utterance);
    }

    

    async detectLanguage(text) {
        try {
            if (!this.currentDetector) {
                this.currentDetector = await window.LanguageDetector.create({
                    expectedInputLanguages: GoogleTranslator.SUPPORTED_LANGUAGES
                });
            }

            const results = await this.currentDetector.detect(text);
            const detectedLanguage = results[0]?.detectedLanguage;
            

            return detectedLanguage === 'und' ? GoogleTranslator.DEFAUL_SOURCE_LANGUAGE : detectedLanguage;
        } catch (error) {
            console.error("No he podido averiguar el idioma: ", error);
            return GoogleTranslator.DEFAUL_SOURCE_LANGUAGE;
        }
    }
}

const googleTranslator = new GoogleTranslator();
