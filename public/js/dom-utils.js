 // Módulo de utilidades para manipulación del DOM
 // Centraliza operaciones comunes como búsqueda, creación y manipulación de elementos
class DomUtils {
    // Encuentra un elemento por selector
    static find(selector, parent = document) {
        return parent.querySelector(selector);
    }

    // Encuentra todos los elementos que coinciden con un selector
    static findAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    // Encuentra un elemento por atributos de datos
    static findByData(attribute, value, parent = document) {
        return parent.querySelector(`[data-${attribute}="${value}"]`);
    }

    // Crea un elemento DOM con propiedades y atributos
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

    // Elimina todos los hijos de un elemento
    static empty(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Añade un evento a un elemento con manejo de errores
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

    // Añade múltiples eventos a un elemento
    static addEvents(element, events, options) {
        if (!element) return;
        
        Object.entries(events).forEach(([eventType, handler]) => {
            this.addEvent(element, eventType, handler, options);
        });
    }

    // Obtiene un valor de un input, select o textarea, con conversión de tipos básica
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

    // Establece un valor en un input, select o textarea
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

    // Obtiene los valores de un formulario como objeto
    static getFormValues(formElement) {
        if (!formElement) return {};
        
        const formData = new FormData(formElement);
        const values = {};
        
        for (const [name, value] of formData.entries()) {
            values[name] = value;
        }
        
        return values;
    }

    // Rellena un formulario con valores de un objeto
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