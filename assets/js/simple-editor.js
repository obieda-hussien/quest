/**
 * Simple code editor fallback when CodeMirror is not available
 */

class SimpleEditor {
    constructor(container, code = '', readOnly = false) {
        this.container = container;
        this.readOnly = readOnly;
        this.value = code;
        this.changeListeners = [];
        
        this.createElement();
        this.setValue(code);
    }

    createElement() {
        this.element = document.createElement('textarea');
        this.element.className = 'code-editor';
        this.element.readOnly = this.readOnly;
        this.element.spellcheck = false;
        this.element.autocomplete = 'off';
        this.element.autocorrect = 'off';
        this.element.autocapitalize = 'off';
        
        // Add Java-like styling
        this.element.classList.add('java-highlighted');
        
        // Add event listeners
        this.element.addEventListener('input', () => {
            this.value = this.element.value;
            this.triggerChange();
        });
        
        this.element.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        this.container.appendChild(this.element);
    }

    handleKeyDown(e) {
        // Tab handling
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.element.selectionStart;
            const end = this.element.selectionEnd;
            
            // Insert 4 spaces for tab
            const tabString = '    ';
            this.element.value = this.element.value.substring(0, start) + 
                               tabString + 
                               this.element.value.substring(end);
            
            this.element.selectionStart = this.element.selectionEnd = start + tabString.length;
            this.triggerChange();
        }
        
        // Auto-indentation on Enter
        if (e.key === 'Enter') {
            const start = this.element.selectionStart;
            const lines = this.element.value.substring(0, start).split('\n');
            const currentLine = lines[lines.length - 1];
            const indent = currentLine.match(/^(\s*)/)[1];
            
            // Add extra indent if line ends with {
            const extraIndent = currentLine.trim().endsWith('{') ? '    ' : '';
            
            setTimeout(() => {
                const newStart = this.element.selectionStart;
                this.element.value = this.element.value.substring(0, newStart) + 
                                   indent + extraIndent + 
                                   this.element.value.substring(newStart);
                this.element.selectionStart = this.element.selectionEnd = newStart + indent.length + extraIndent.length;
            }, 0);
        }
    }

    getValue() {
        return this.element.value;
    }

    setValue(value) {
        this.value = value;
        this.element.value = value;
    }

    on(event, callback) {
        if (event === 'change') {
            this.changeListeners.push(callback);
        }
    }

    triggerChange() {
        this.changeListeners.forEach(callback => callback());
    }

    focus() {
        this.element.focus();
    }

    refresh() {
        // No-op for compatibility with CodeMirror
    }

    setOption(option, value) {
        // Basic option handling for compatibility
        if (option === 'readOnly') {
            this.element.readOnly = value;
        }
    }

    getOption(option) {
        if (option === 'readOnly') {
            return this.element.readOnly;
        }
        return undefined;
    }
}

// Check if CodeMirror is available, otherwise use fallback
window.CodeMirrorFallback = {
    isAvailable: () => typeof CodeMirror !== 'undefined',
    
    create: (container, options = {}) => {
        if (window.CodeMirrorFallback.isAvailable()) {
            // Use CodeMirror if available
            return CodeMirror(container, {
                value: options.value || '',
                mode: 'text/x-java',
                theme: 'monokai',
                lineNumbers: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                indentUnit: 4,
                indentWithTabs: false,
                lineWrapping: true,
                readOnly: options.readOnly || false,
                ...options
            });
        } else {
            // Use simple fallback editor
            console.warn('CodeMirror not available, using simple editor fallback');
            return new SimpleEditor(container, options.value || '', options.readOnly || false);
        }
    }
};

// Patch the codeEditor.js to use the fallback
document.addEventListener('DOMContentLoaded', () => {
    // Override CodeMirror usage in codeEditor.js
    if (typeof CodeEditor !== 'undefined' && !window.CodeMirrorFallback.isAvailable()) {
        const originalCreateEditor = CodeEditor.prototype.createEditor;
        
        CodeEditor.prototype.createEditor = function(containerId, code = '', readOnly = false) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Editor container not found:', containerId);
                return null;
            }

            const editor = window.CodeMirrorFallback.create(container, {
                value: code,
                readOnly: readOnly
            });

            this.editors[containerId] = editor;
            this.currentEditor = editor;

            // Add change listener for real-time feedback
            editor.on('change', () => {
                if (!readOnly) {
                    this.onCodeChange(editor);
                }
            });

            return editor;
        };
    }
});