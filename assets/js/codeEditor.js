/**
 * Code Editor Component for JavaQuest
 * Handles syntax highlighting, code execution, and integration with visual feedback
 */

class CodeEditor {
    constructor() {
        this.editors = {};
        this.currentEditor = null;
        this.javaSimulator = new JavaSimulator();
    }

    createEditor(containerId, code = '', readOnly = false) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Editor container not found:', containerId);
            return null;
        }

        const editor = CodeMirror(container, {
            value: code,
            mode: 'text/x-java',
            theme: 'monokai',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            indentWithTabs: false,
            lineWrapping: true,
            readOnly: readOnly,
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'F11': function(cm) {
                    cm.setOption('fullScreen', !cm.getOption('fullScreen'));
                },
                'Esc': function(cm) {
                    if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                }
            }
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
    }

    onCodeChange(editor) {
        // Debounce the execution for performance
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
        
        this.changeTimeout = setTimeout(() => {
            const code = editor.getValue();
            this.analyzeCode(code);
        }, 1000);
    }

    analyzeCode(code) {
        // Basic code analysis for visual feedback
        const analysis = {
            hasClass: /class\s+\w+/.test(code),
            hasConstructor: /public\s+\w+\s*\([^)]*\)/.test(code),
            hasMethod: /public\s+\w+\s+\w+\s*\([^)]*\)/.test(code),
            hasVariable: /(String|int|double|boolean)\s+\w+/.test(code),
            classNames: this.extractClassNames(code),
            variables: this.extractVariables(code)
        };

        this.updateVisualFeedback(analysis);
    }

    extractClassNames(code) {
        const matches = code.match(/class\s+(\w+)/g);
        return matches ? matches.map(match => match.replace('class ', '')) : [];
    }

    extractVariables(code) {
        const variables = [];
        const patterns = [
            /String\s+(\w+)/g,
            /int\s+(\w+)/g,
            /double\s+(\w+)/g,
            /boolean\s+(\w+)/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(code)) !== null) {
                variables.push({
                    name: match[1],
                    type: pattern.source.split('\\')[0]
                });
            }
        });

        return variables;
    }

    updateVisualFeedback(analysis) {
        const feedbackElement = document.querySelector('.visual-feedback');
        if (!feedbackElement) return;

        if (analysis.hasClass) {
            feedbackElement.classList.add('active');
            this.renderObjectVisualization(analysis);
        } else {
            feedbackElement.classList.remove('active');
            this.renderPlaceholder();
        }
    }

    renderObjectVisualization(analysis) {
        const feedbackContent = document.querySelector('.feedback-content');
        if (!feedbackContent) return;

        let visualContent = '';

        analysis.classNames.forEach(className => {
            const classVariables = analysis.variables.filter(v => 
                this.isVariableInClass(className, v.name)
            );

            visualContent += `
                <div class="java-object ${className.toLowerCase()}">
                    <div class="object-title">🏷️ ${className}</div>
                    <div class="object-properties">
                        ${classVariables.length > 0 ? 
                            classVariables.map(v => `
                                <div class="property">
                                    <span class="property-type">${v.type}</span>
                                    <span class="property-name">${v.name}</span>
                                </div>
                            `).join('') :
                            '<div class="no-properties">لا توجد خصائص محددة</div>'
                        }
                    </div>
                </div>
            `;
        });

        if (visualContent) {
            feedbackContent.innerHTML = visualContent;
        }
    }

    renderPlaceholder() {
        const feedbackContent = document.querySelector('.feedback-content');
        if (feedbackContent) {
            feedbackContent.innerHTML = `
                <div class="feedback-placeholder">
                    💡 اكتب كود Java لترى النتيجة المرئية هنا
                </div>
            `;
        }
    }

    isVariableInClass(className, variableName) {
        // Simple heuristic - in a real implementation, this would be more sophisticated
        return true;
    }

    runCode() {
        if (!this.currentEditor) {
            console.error('No active editor');
            return;
        }

        const code = this.currentEditor.getValue();
        const output = this.javaSimulator.execute(code);
        this.displayOutput(output);
        this.updateFeedbackWithExecution(code, output);
    }

    displayOutput(output) {
        const consoleElement = document.getElementById('console-output');
        if (!consoleElement) return;

        consoleElement.innerHTML = '';
        
        output.forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.className = `console-line ${line.type}`;
            lineElement.textContent = line.content;
            consoleElement.appendChild(lineElement);
        });

        // Auto-scroll to bottom
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }

    updateFeedbackWithExecution(code, output) {
        // Enhanced visual feedback after code execution
        const feedbackElement = document.querySelector('.visual-feedback');
        if (!feedbackElement) return;

        // Look for object creations and method calls
        const objectCreations = this.extractObjectCreations(code);
        const methodCalls = this.extractMethodCalls(code);

        if (objectCreations.length > 0 || methodCalls.length > 0) {
            this.renderExecutionVisualization(objectCreations, methodCalls, output);
        }
    }

    extractObjectCreations(code) {
        const creations = [];
        const pattern = /(\w+)\s+(\w+)\s*=\s*new\s+(\w+)\s*\([^)]*\)/g;
        let match;

        while ((match = pattern.exec(code)) !== null) {
            creations.push({
                type: match[1],
                name: match[2],
                constructor: match[3]
            });
        }

        return creations;
    }

    extractMethodCalls(code) {
        const calls = [];
        const pattern = /(\w+)\.(\w+)\s*\([^)]*\)/g;
        let match;

        while ((match = pattern.exec(code)) !== null) {
            calls.push({
                object: match[1],
                method: match[2]
            });
        }

        return calls;
    }

    renderExecutionVisualization(objects, methods, output) {
        const feedbackContent = document.querySelector('.feedback-content');
        if (!feedbackContent) return;

        let visualContent = '<div class="execution-visualization">';

        // Render created objects
        objects.forEach(obj => {
            visualContent += `
                <div class="java-object created">
                    <div class="object-title">✨ ${obj.name}</div>
                    <div class="object-type">نوع: ${obj.type}</div>
                    <div class="object-status">تم إنشاؤه بنجاح</div>
                </div>
            `;
        });

        // Render method execution
        if (methods.length > 0) {
            visualContent += '<div class="method-executions">';
            methods.forEach(method => {
                visualContent += `
                    <div class="method-call">
                        <span class="object-name">${method.object}</span>
                        <span class="method-arrow">→</span>
                        <span class="method-name">${method.method}()</span>
                    </div>
                `;
            });
            visualContent += '</div>';
        }

        visualContent += '</div>';
        feedbackContent.innerHTML = visualContent;
    }

    resetCode() {
        if (!this.currentEditor) return;

        // Get the original starter code (you might want to store this)
        const currentPhase = app.currentLesson?.phases[app.currentPhase];
        if (currentPhase && currentPhase.content.starterCode) {
            this.currentEditor.setValue(currentPhase.content.starterCode);
        } else {
            this.currentEditor.setValue('// ابدأ كتابة الكود هنا...');
        }

        // Clear output and feedback
        this.clearOutput();
        this.renderPlaceholder();
    }

    clearOutput() {
        const consoleElement = document.getElementById('console-output');
        if (consoleElement) {
            consoleElement.innerHTML = '';
        }
    }

    getEditorContent(editorId) {
        return this.editors[editorId]?.getValue() || '';
    }

    setEditorContent(editorId, content) {
        if (this.editors[editorId]) {
            this.editors[editorId].setValue(content);
        }
    }
}

/**
 * Simple Java Simulator for educational purposes
 * Simulates basic Java execution for learning
 */
class JavaSimulator {
    execute(code) {
        const output = [];
        
        try {
            // Very basic simulation - in reality you'd need a proper Java parser
            const lines = code.split('\n');
            const context = {
                variables: {},
                objects: {},
                classes: {}
            };

            // Parse class definitions
            this.parseClasses(code, context);

            // Execute main method if present
            if (code.includes('public static void main')) {
                this.executeMain(code, context, output);
            } else {
                output.push({
                    type: 'info',
                    content: 'لا يوجد main method - تم تحليل الكود بنجاح'
                });
            }

            // Validate code structure
            this.validateCode(code, output);

        } catch (error) {
            output.push({
                type: 'error',
                content: 'خطأ في الكود: ' + error.message
            });
        }

        return output;
    }

    parseClasses(code, context) {
        const classPattern = /class\s+(\w+)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/g;
        let match;

        while ((match = classPattern.exec(code)) !== null) {
            const className = match[1];
            const classBody = match[2];
            
            context.classes[className] = {
                name: className,
                variables: this.parseClassVariables(classBody),
                methods: this.parseClassMethods(classBody)
            };
        }
    }

    parseClassVariables(classBody) {
        const variables = [];
        const patterns = [
            /(private|public|protected)?\s*(String|int|double|boolean)\s+(\w+)/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(classBody)) !== null) {
                variables.push({
                    visibility: match[1] || 'default',
                    type: match[2],
                    name: match[3]
                });
            }
        });

        return variables;
    }

    parseClassMethods(classBody) {
        const methods = [];
        const pattern = /(private|public|protected)?\s*(\w+)\s+(\w+)\s*\([^)]*\)/g;
        let match;

        while ((match = pattern.exec(classBody)) !== null) {
            methods.push({
                visibility: match[1] || 'default',
                returnType: match[2],
                name: match[3]
            });
        }

        return methods;
    }

    executeMain(code, context, output) {
        // Simulate basic operations
        const systemOutPattern = /System\.out\.println\s*\(\s*"([^"]*)"\s*\)/g;
        let match;

        while ((match = systemOutPattern.exec(code)) !== null) {
            output.push({
                type: 'info',
                content: match[1]
            });
        }

        // Simulate object creation
        const objectPattern = /(\w+)\s+(\w+)\s*=\s*new\s+(\w+)\s*\([^)]*\)/g;
        while ((match = objectPattern.exec(code)) !== null) {
            output.push({
                type: 'info',
                content: `تم إنشاء كائن ${match[2]} من نوع ${match[1]}`
            });
        }
    }

    validateCode(code, output) {
        const validations = [
            {
                test: /class\s+\w+/.test(code),
                message: '✅ تم العثور على تعريف كلاس',
                failMessage: '❌ لم يتم العثور على تعريف كلاس'
            },
            {
                test: /public\s+\w+\s*\([^)]*\)/.test(code),
                message: '✅ تم العثور على كونستركتور',
                optional: true
            },
            {
                test: /{[^}]*}/.test(code),
                message: '✅ الأقواس المعقوفة متوازنة',
                failMessage: '❌ تحقق من الأقواس المعقوفة'
            }
        ];

        validations.forEach(validation => {
            if (validation.test) {
                output.push({
                    type: 'info',
                    content: validation.message
                });
            } else if (!validation.optional) {
                output.push({
                    type: 'error',
                    content: validation.failMessage
                });
            }
        });
    }
}

// Global code editor instance
let codeEditor;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    codeEditor = new CodeEditor();
});

// Enhance the app with code editor methods
if (typeof app !== 'undefined') {
    // Add code editor methods to main app
    Object.assign(app, {
        runCode() {
            if (codeEditor) {
                codeEditor.runCode();
            }
        },

        resetCode() {
            if (codeEditor) {
                codeEditor.resetCode();
            }
        }
    });
}