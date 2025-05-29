/**
 * Módulo de utilidades para manipulación del DOM
 * Centraliza operaciones comunes como búsqueda, creación y manipulación de elementos
 */

class DomUtils {
    /**
     * Encuentra un elemento por selector
     * @param {string} selector - Selector CSS
     * @param {Element} [parent=document] - Elemento padre (opcional)
     * @returns {Element|null} - Elemento encontrado o null
     */
    static find(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * Encuentra todos los elementos que coinciden con un selector
     * @param {string} selector - Selector CSS
     * @param {Element} [parent=document] - Elemento padre (opcional)
     * @returns {NodeList} - Lista de elementos encontrados
     */
    static findAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    /**
     * Encuentra un elemento por atributos de datos
     * @param {string} attribute - Nombre del atributo data- sin el prefijo "data-"
     * @param {string} value - Valor del atributo
     * @param {Element} [parent=document] - Elemento padre (opcional)
     * @returns {Element|null} - Elemento encontrado o null
     */
    static findByData(attribute, value, parent = document) {
        return parent.querySelector(`[data-${attribute}="${value}"]`);
    }

    /**
     * Crea un elemento DOM con propiedades y atributos
     * @param {string} tagName - Nombre de la etiqueta HTML
     * @param {Object} [options={}] - Opciones como clases, atributos, etc.
     * @param {string|string[]} [options.classes] - Clases CSS
     * @param {Object} [options.attributes] - Atributos HTML
     * @param {Object} [options.dataset] - Atributos data-*
     * @param {Object} [options.style] - Estilos CSS
     * @param {string} [options.text] - Texto contenido
     * @param {string} [options.html] - HTML contenido
     * @param {Element[]} [options.children] - Elementos hijos
     * @returns {Element} - Elemento creado
     */
    static create(tagName, options = {}) {
        const element = document.createElement(tagName);
        
        // Añadir clases
        if (options.classes) {
            const classes = Array.isArray(options.classes) ? options.classes : [options.classes];
            element.classList.add(...classes);
        }
        
        // Añadir atributos
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        // Añadir atributos data-*
        if (options.dataset) {
            Object.entries(options.dataset).forEach(([key, value]) => {
                element.dataset[key] = value;
            });
        }
        
        // Añadir estilos
        if (options.style) {
            Object.entries(options.style).forEach(([key, value]) => {
                element.style[key] = value;
            });
        }
        
        // Añadir texto
        if (options.text !== undefined) {
            element.textContent = options.text;
        }
        
        // Añadir HTML
        if (options.html !== undefined) {
            element.innerHTML = options.html;
        }
        
        // Añadir hijos
        if (options.children) {
            options.children.forEach(child => {
                element.appendChild(child);
            });
        }
        
        return element;
    }

    /**
     * Elimina todos los hijos de un elemento
     * @param {Element} element - Elemento del que se eliminarán los hijos
     */
    static empty(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Añade un evento a un elemento con manejo de errores
     * @param {Element} element - Elemento al que se añadirá el evento
     * @param {string} eventType - Tipo de evento (click, change, etc.)
     * @param {Function} handler - Función manejadora
     * @param {Object} [options] - Opciones del addEventListener
     */
    static addEvent(element, eventType, handler, options) {
        if (!element) return;
        
        element.addEventListener(eventType, async (event) => {
            try {
                await handler(event);
            } catch (error) {
                console.error(`Error en el evento ${eventType}:`, error);
            }
        }, options);
    }

    /**
     * Añade múltiples eventos a un elemento
     * @param {Element} element - Elemento al que se añadirán eventos
     * @param {Object} events - Objeto con tipos de eventos como claves y manejadores como valores
     * @param {Object} [options] - Opciones del addEventListener
     */
    static addEvents(element, events, options) {
        if (!element) return;
        
        Object.entries(events).forEach(([eventType, handler]) => {
            this.addEvent(element, eventType, handler, options);
        });
    }

    /**
     * Obtiene un valor de un input, select o textarea, con conversión de tipos básica
     * @param {Element} element - Elemento del que se obtendrá el valor
     * @param {string} [type] - Tipo de dato al que convertir ('number', 'boolean', etc.)
     * @returns {*} - Valor obtenido convertido al tipo especificado
     */
    static getValue(element, type) {
        if (!element) return null;
        
        let value;
        
        if (element.type === 'checkbox') {
            value = element.checked;
        } else if (element.type === 'select-multiple') {
            value = Array.from(element.selectedOptions).map(option => option.value);
        } else {
            value = element.value;
        }
        
        // Convertir según el tipo solicitado
        if (type === 'number') {
            return value === '' ? null : Number(value);
        } else if (type === 'boolean') {
            return Boolean(value);
        } else if (type === 'date') {
            return value === '' ? null : new Date(value);
        }
        
        return value;
    }

    /**
     * Establece un valor en un input, select o textarea
     * @param {Element} element - Elemento en el que se establecerá el valor
     * @param {*} value - Valor a establecer
     */
    static setValue(element, value) {
        if (!element) return;
        
        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
        } else if (element.type === 'select-multiple' && Array.isArray(value)) {
            Array.from(element.options).forEach(option => {
                option.selected = value.includes(option.value);
            });
        } else {
            element.value = value !== null && value !== undefined ? value : '';
        }
    }

    /**
     * Obtiene los valores de un formulario como objeto
     * @param {Element} formElement - Elemento del formulario
     * @returns {Object} - Objeto con los valores del formulario
     */
    static getFormValues(formElement) {
        if (!formElement) return {};
        
        const formData = new FormData(formElement);
        const values = {};
        
        for (const [name, value] of formData.entries()) {
            values[name] = value;
        }
        
        return values;
    }

    /**
     * Rellena un formulario con valores de un objeto
     * @param {Element} formElement - Elemento del formulario
     * @param {Object} values - Objeto con los valores a establecer
     */
    static setFormValues(formElement, values) {
        if (!formElement || !values) return;
        
        Object.entries(values).forEach(([name, value]) => {
            const element = formElement.elements[name];
            if (element) {
                this.setValue(element, value);
            }
        });
    }
}

// Exponer globalmente
window.DomUtils = DomUtils; 