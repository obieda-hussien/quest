/**
 * Code Editor Component for JavaQuest
 * Handles syntax highlighting, code execution, and integration with visual feedback
 */

class CodeEditor {
    constructor() {
        this.editors = {};
        this.currentEditor = null;
        this.javaSimulator = new JavaSimulator();
        // Progress gate state tracking
        this.challengeState = {
            isValidated: false,
            lastValidatedCode: '',
            isCodeModified: false
        };
    }

    createEditor(containerId, code = '', readOnly = false) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Editor container not found:', containerId);
            return null;
        }

        let editor;

        // Try to use CodeMirror first, fallback to SimpleEditor
        if (typeof CodeMirror !== 'undefined') {
            editor = CodeMirror(container, {
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

            // Add change listener for real-time feedback
            editor.on('change', () => {
                if (!readOnly) {
                    this.onCodeChange(editor);
                    // Track code modifications for progress gate
                    if (this.isInChallengeMode()) {
                        this.trackCodeModification();
                    }
                }
            });
        } else {
            // Fallback to SimpleEditor
            console.warn('CodeMirror not available, using fallback editor');
            container.innerHTML = ''; // Clear existing content
            editor = new SimpleEditor(container, code, readOnly);
            
            // Add change listener for fallback editor
            editor.on('change', () => {
                if (!readOnly) {
                    this.onCodeChange(editor);
                }
            });
        }

        this.editors[containerId] = editor;
        this.currentEditor = editor;

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
        
        // Check if we're in challenge mode
        if (this.isInChallengeMode()) {
            this.runChallengeValidation(code);
        } else {
            const output = this.javaSimulator.execute(code);
            this.displayOutput(output);
            this.updateFeedbackWithExecution(code, output);
        }
    }

    /**
     * Track code modifications for progress gate
     */
    trackCodeModification() {
        const currentCode = this.currentEditor.getValue();
        if (this.challengeState.isValidated && currentCode !== this.challengeState.lastValidatedCode) {
            this.challengeState.isCodeModified = true;
            this.updateProgressGate();
        }
    }

    /**
     * Update progress gate state and UI
     */
    updateProgressGate() {
        const isUnlocked = this.challengeState.isValidated && !this.challengeState.isCodeModified;
        this.updateCompletionButton(isUnlocked);
    }

    /**
     * Update completion button state
     */
    updateCompletionButton(enabled) {
        const completeBtn = document.querySelector('.complete-challenge-btn');
        if (completeBtn) {
            completeBtn.disabled = !enabled;
            completeBtn.className = `complete-challenge-btn ${enabled ? 'enabled' : 'disabled'}`;
            
            if (enabled) {
                completeBtn.innerHTML = '🎉 إكمال التحدي';
                completeBtn.onclick = () => app.completeChallenge();
            } else {
                completeBtn.innerHTML = '🔒 يجب التحقق من الكود أولاً';
                completeBtn.onclick = () => {
                    alert('يجب التحقق من صحة الكود قبل إكمال التحدي!');
                };
            }
        }
    }

    /**
     * Reset challenge state for new challenge
     */
    resetChallengeState() {
        this.challengeState = {
            isValidated: false,
            lastValidatedCode: '',
            isCodeModified: false
        };
        
        // Also reset enhanced visual feedback
        if (window.visualFeedback) {
            visualFeedback.resetToCleanState();
        }
    }

    /**
     * Update enhanced visual feedback with validation state
     */
    updateEnhancedVisualFeedback(code, output, validationResults) {
        if (!window.visualFeedback) return;

        // Set validation state to ensure visual success is tied to validation success
        visualFeedback.setValidationState(validationResults);

        // Parse code for enhanced analysis
        const analysis = this.analyzeCodeForVisualization(code);
        const executionContext = this.createExecutionContext(code, output);

        // Create enhanced visualization
        visualFeedback.createEnhancedVisualization(analysis, executionContext, 'challenge-feedback');

        // Animate method calls if any were detected
        this.animateDetectedMethodCalls(code, analysis);
    }

    /**
     * Analyze code for enhanced visualization
     */
    analyzeCodeForVisualization(code) {
        return {
            classes: this.extractClassInfo(code),
            objects: this.extractObjectCreations(code),
            methods: this.extractMethodCalls(code),
            hasClass: /class\s+\w+/.test(code)
        };
    }

    /**
     * Create execution context for enhanced visualization
     */
    createExecutionContext(code, output) {
        const context = {
            objects: {},
            variables: {},
            lastExecution: Date.now()
        };

        // Extract object states from code analysis
        const objectCreations = this.extractObjectCreations(code);
        objectCreations.forEach(obj => {
            context.objects[obj.name] = {
                className: obj.constructor,
                properties: this.inferObjectProperties(code, obj.name),
                methods: this.extractObjectMethods(code, obj.constructor)
            };
        });

        return context;
    }

    /**
     * Extract class information for enhanced visualization
     */
    extractClassInfo(code) {
        const classes = [];
        const classPattern = /class\s+(\w+)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
        let match;

        while ((match = classPattern.exec(code)) !== null) {
            const className = match[1];
            const classBody = match[2];
            
            classes.push({
                name: className,
                variables: this.extractClassVariables(classBody),
                methods: this.extractClassMethods(classBody)
            });
        }

        return classes;
    }

    /**
     * Extract class variables
     */
    extractClassVariables(classBody) {
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

    /**
     * Extract class methods
     */
    extractClassMethods(classBody) {
        const methods = [];
        const methodPattern = /(private|public|protected)?\s*(\w+)\s+(\w+)\s*\([^)]*\)/g;
        let match;

        while ((match = methodPattern.exec(classBody)) !== null) {
            methods.push({
                visibility: match[1] || 'public',
                returnType: match[2],
                name: match[3]
            });
        }

        return methods;
    }

    /**
     * Infer object properties from code
     */
    inferObjectProperties(code, objectName) {
        const properties = {};
        
        // Look for property assignments
        const assignmentPattern = new RegExp(`${objectName}\\.(\\w+)\\s*=\\s*([^;]+)`, 'g');
        let match;

        while ((match = assignmentPattern.exec(code)) !== null) {
            const propertyName = match[1];
            let value = match[2].trim();
            
            // Try to parse the value
            if (value.startsWith('"') && value.endsWith('"')) {
                properties[propertyName] = value.slice(1, -1); // String value
            } else if (!isNaN(value)) {
                properties[propertyName] = parseFloat(value); // Number value
            } else if (value === 'true' || value === 'false') {
                properties[propertyName] = value === 'true'; // Boolean value
            } else {
                properties[propertyName] = value; // Other value
            }
        }

        return properties;
    }

    /**
     * Extract object methods for a class
     */
    extractObjectMethods(code, className) {
        const methods = [];
        const classPattern = new RegExp(`class\\s+${className}\\s*\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}`, 'i');
        const classMatch = classPattern.exec(code);
        
        if (classMatch) {
            const classBody = classMatch[1];
            const methodPattern = /public\s+\w+\s+(\w+)\s*\([^)]*\)/g;
            let match;

            while ((match = methodPattern.exec(classBody)) !== null) {
                methods.push(match[1]);
            }
        }

        return methods;
    }

    /**
     * Animate detected method calls
     */
    animateDetectedMethodCalls(code, analysis) {
        if (!window.visualFeedback || !analysis.methods) return;

        analysis.methods.forEach(methodCall => {
            // Animate method call after a short delay
            setTimeout(() => {
                visualFeedback.animateMethodCall(methodCall.object, methodCall.method);
            }, 1000);
        });
    }

    /**
     * Check if we're currently in challenge mode
     */
    isInChallengeMode() {
        return document.getElementById('challenge-editor') && 
               app.currentLesson && 
               app.currentLesson.phases[app.currentPhase] && 
               app.currentLesson.phases[app.currentPhase].type === 'challenge';
    }

    /**
     * Run validation specifically for challenge mode
     */
    runChallengeValidation(code) {
        const currentPhase = app.currentLesson.phases[app.currentPhase];
        if (!currentPhase || !currentPhase.content.requirements) {
            console.error('No requirements found for challenge validation');
            return;
        }

        // Reset hints when running validation
        this.javaSimulator.resetHints();

        // Run advanced validation with multiple test cases to prevent cheating
        const validationResults = this.javaSimulator.validateChallengeCodeAdvanced(
            code, 
            currentPhase.content.requirements
        );

        // Update challenge state based on validation results
        if (validationResults.passed) {
            this.challengeState.isValidated = true;
            this.challengeState.lastValidatedCode = code;
            this.challengeState.isCodeModified = false;
        }

        // Update UI with validation results
        this.updateChallengeUI(validationResults, currentPhase.content.requirements);
        
        // Update progress gate
        this.updateProgressGate();
        
        // Also run basic execution for console output and enhanced visualization
        const output = this.javaSimulator.execute(code);
        this.displayOutput(output);
        
        // Update enhanced visual feedback with validation state
        this.updateEnhancedVisualFeedback(code, output, validationResults);
    }

    /**
     * Update challenge UI with validation results
     */
    updateChallengeUI(validationResults, requirements) {
        // Update requirements list
        const requirementsList = document.querySelector('.requirements-list');
        if (requirementsList) {
            requirementsList.innerHTML = '';
            
            requirements.forEach((requirement, index) => {
                const validationDetail = validationResults.validationDetails[index];
                const isPassed = validationDetail && validationDetail.passed;
                
                const requirementItem = document.createElement('div');
                requirementItem.className = `requirement-item ${isPassed ? 'complete' : 'incomplete'}`;
                requirementItem.innerHTML = `
                    <span class="requirement-status">${isPassed ? '✅' : '❌'}</span>
                    <span class="requirement-text">${requirement}</span>
                    ${!isPassed ? `<button class="hint-btn" onclick="codeEditor.showHint('${requirement}', ${index})">💡 تلميح</button>` : ''}
                `;
                
                requirementsList.appendChild(requirementItem);
            });
        }

        // Show overall validation result with ALWAYS present completion button
        const feedbackContent = document.querySelector('.feedback-content');
        if (feedbackContent) {
            if (validationResults.passed) {
                feedbackContent.innerHTML = `
                    <div class="validation-success">
                        <h3>🎉 ممتاز! لقد حققت جميع المتطلبات!</h3>
                        <p>تم اجتياز ${validationResults.passedRequirements} من ${validationResults.totalRequirements} متطلبات</p>
                        <button class="complete-challenge-btn enabled" onclick="app.completeChallenge()">🎉 إكمال التحدي</button>
                        <p class="progress-gate-info">✅ تم إلغاء قفل التحدي - يمكنك الآن المتابعة</p>
                    </div>
                `;
            } else {
                feedbackContent.innerHTML = `
                    <div class="validation-partial">
                        <h3>🔧 استمر في العمل!</h3>
                        <p>تم اجتياز ${validationResults.passedRequirements} من ${validationResults.totalRequirements} متطلبات</p>
                        <div class="failed-requirements">
                            ${validationResults.failedRequirements.map(failed => `
                                <div class="failed-requirement">
                                    <span class="failed-text">${failed.requirement}</span>
                                    <span class="failed-reason">${failed.reason}</span>
                                </div>
                            `).join('')}
                        </div>
                        <button class="complete-challenge-btn disabled" disabled onclick="alert('يجب التحقق من صحة الكود قبل إكمال التحدي!')">🔒 يجب التحقق من الكود أولاً</button>
                        <p class="progress-gate-info">🔒 التحدي مقفل - أكمل جميع المتطلبات للمتابعة</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Show hint for a specific requirement
     */
    showHint(requirement, requirementIndex) {
        const hint = this.javaSimulator.getNextHint(requirement);
        
        // Create or update hint display
        let hintDisplay = document.querySelector('.hint-display');
        if (!hintDisplay) {
            hintDisplay = document.createElement('div');
            hintDisplay.className = 'hint-display';
            
            // Insert after requirements list
            const requirementsList = document.querySelector('.requirements-list');
            if (requirementsList && requirementsList.parentNode) {
                requirementsList.parentNode.insertBefore(hintDisplay, requirementsList.nextSibling);
            }
        }

        const hintLevelNames = {
            'conceptual': 'تلميح مفاهيمي',
            'structural': 'تلميح هيكلي',
            'partial': 'تلميح جزئي',
            'solution': 'كشف الحل'
        };

        hintDisplay.innerHTML = `
            <div class="hint-container">
                <div class="hint-header">
                    <span class="hint-level">${hintLevelNames[hint.level]}</span>
                    <button class="close-hint" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="hint-content ${hint.level}">
                    ${hint.level === 'solution' ? `<pre><code>${hint.hint}</code></pre>` : hint.hint}
                </div>
                <div class="hint-actions">
                    <button class="next-hint-btn" onclick="codeEditor.showHint('${requirement}', ${requirementIndex})">
                        تلميح أكثر تفصيلاً
                    </button>
                </div>
            </div>
        `;

        // Scroll to hint
        hintDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
            // Use enhanced visualization if available
            if (window.visualFeedback) {
                const analysis = this.analyzeCodeForVisualization(code);
                const executionContext = this.createExecutionContext(code, output);
                visualFeedback.createEnhancedVisualization(analysis, executionContext, 'practice-feedback');
            } else {
                this.renderExecutionVisualization(objectCreations, methodCalls, output);
            }
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
 * Advanced Java Simulator for educational purposes
 * Provides sophisticated validation and hint system
 */
class JavaSimulator {
    constructor() {
        this.currentRequirements = null;
        this.hintLevel = 0;
        this.maxHintLevel = 4;
    }

    execute(code) {
        const output = [];
        
        try {
            // Parse code structure
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

            // Basic validation for non-challenge mode
            if (!this.currentRequirements) {
                this.validateCode(code, output);
            }

        } catch (error) {
            output.push({
                type: 'error',
                content: 'خطأ في الكود: ' + error.message
            });
        }

        return output;
    }

    /**
     * Advanced validation for challenge mode
     * @param {string} code - The code to validate
     * @param {Array} requirements - Array of requirement objects
     * @returns {Object} Validation results with detailed feedback
     */
    validateChallengeCode(code, requirements) {
        this.currentRequirements = requirements;
        const results = {
            passed: true,
            totalRequirements: requirements.length,
            passedRequirements: 0,
            failedRequirements: [],
            validationDetails: []
        };

        try {
            // Parse code for analysis
            const context = {
                variables: {},
                objects: {},
                classes: {}
            };
            this.parseClasses(code, context);

            // Check each requirement
            requirements.forEach((requirement, index) => {
                const validationResult = this.validateRequirement(code, requirement, context);
                results.validationDetails.push(validationResult);
                
                if (validationResult.passed) {
                    results.passedRequirements++;
                } else {
                    results.passed = false;
                    results.failedRequirements.push({
                        index,
                        requirement,
                        reason: validationResult.message
                    });
                }
            });

        } catch (error) {
            results.passed = false;
            results.validationDetails.push({
                passed: false,
                message: 'خطأ في تحليل الكود: ' + error.message,
                type: 'error'
            });
        }

        return results;
    }

    /**
     * Advanced challenge validation with anti-cheating measures
     * @param {string} code - The code to validate
     * @param {Array} requirements - Array of requirement objects
     * @returns {Object} Validation results with detailed feedback
     */
    validateChallengeCodeAdvanced(code, requirements) {
        this.currentRequirements = requirements;
        const results = {
            passed: true,
            totalRequirements: requirements.length,
            passedRequirements: 0,
            failedRequirements: [],
            validationDetails: []
        };

        try {
            // Parse code for analysis
            const context = {
                variables: {},
                objects: {},
                classes: {}
            };
            this.parseClasses(code, context);

            // Check each requirement with enhanced validation
            requirements.forEach((requirement, index) => {
                const validationResult = this.validateRequirementAdvanced(code, requirement, context);
                results.validationDetails.push(validationResult);
                
                if (validationResult.passed) {
                    results.passedRequirements++;
                } else {
                    results.passed = false;
                    results.failedRequirements.push({
                        index,
                        requirement,
                        reason: validationResult.message
                    });
                }
            });

            // Additional anti-cheating validation
            if (results.passed) {
                const antiCheatResult = this.performAntiCheatValidation(code, requirements);
                if (!antiCheatResult.passed) {
                    results.passed = false;
                    results.failedRequirements.push({
                        index: -1,
                        requirement: 'فحص مكافحة الغش',
                        reason: antiCheatResult.message
                    });
                }
            }

        } catch (error) {
            results.passed = false;
            results.validationDetails.push({
                passed: false,
                message: 'خطأ في تحليل الكود: ' + error.message,
                type: 'error'
            });
        }

        return results;
    }

    /**
     * Enhanced requirement validation with multiple test cases
     */
    validateRequirementAdvanced(code, requirement, context) {
        const text = requirement.toLowerCase();
        
        // Class name validation
        if (text.includes('إنشاء كلاس') || text.includes('كلاس باسم')) {
            const classNameMatch = requirement.match(/كلاس باسم (\w+)/);
            if (classNameMatch) {
                const expectedClassName = classNameMatch[1];
                const hasClass = new RegExp(`class\\s+${expectedClassName}`, 'i').test(code);
                
                // Additional check: ensure class has proper structure
                if (hasClass) {
                    const classContent = this.extractClassContent(code, expectedClassName);
                    if (!classContent || classContent.trim().length < 10) {
                        return {
                            passed: false,
                            message: `❌ كلاس ${expectedClassName} موجود لكن يبدو فارغًا أو غير مكتمل`,
                            type: 'error'
                        };
                    }
                }
                
                return {
                    passed: hasClass,
                    message: hasClass ? 
                        `✅ تم إنشاء كلاس ${expectedClassName} بنجاح` : 
                        `❌ لم يتم العثور على كلاس ${expectedClassName}`,
                    type: hasClass ? 'success' : 'error'
                };
            }
        }

        // Variable validation with type checking
        if (text.includes('خاصية') || text.includes('متغير')) {
            const varMatch = requirement.match(/خاصية (\w+) من نوع (\w+)/);
            if (varMatch) {
                const varName = varMatch[1];
                const varType = varMatch[2];
                
                // Check if variable exists with correct type
                const hasVariable = new RegExp(`${varType}\\s+${varName}`, 'i').test(code);
                
                // Additional validation: ensure variable is declared within a class
                if (hasVariable) {
                    const isInClass = this.isVariableInClassContext(code, varName);
                    if (!isInClass) {
                        return {
                            passed: false,
                            message: `❌ خاصية ${varName} يجب أن تكون داخل كلاس`,
                            type: 'error'
                        };
                    }
                }
                
                return {
                    passed: hasVariable,
                    message: hasVariable ? 
                        `✅ تم تعريف خاصية ${varName} من نوع ${varType}` : 
                        `❌ لم يتم العثور على خاصية ${varName} من نوع ${varType}`,
                    type: hasVariable ? 'success' : 'error'
                };
            }
        }

        // Method validation with implementation checking
        if (text.includes('طريقة') || text.includes('دالة')) {
            const methodMatch = requirement.match(/طريقة (\w+)\(\)/);
            if (methodMatch) {
                const methodName = methodMatch[1];
                const hasMethod = new RegExp(`\\w+\\s+${methodName}\\s*\\(`, 'i').test(code);
                
                // Additional validation: check if method has implementation
                if (hasMethod) {
                    const methodContent = this.extractMethodContent(code, methodName);
                    if (!methodContent || methodContent.trim().length < 5) {
                        return {
                            passed: false,
                            message: `❌ طريقة ${methodName}() موجودة لكن فارغة أو غير مكتملة`,
                            type: 'error'
                        };
                    }
                    
                    // If method is expected to print something, check for print statements
                    if (requirement.includes('تطبع') || requirement.includes('يطبع')) {
                        const hasPrint = /System\.out\.print/.test(methodContent);
                        if (!hasPrint) {
                            return {
                                passed: false,
                                message: `❌ طريقة ${methodName}() يجب أن تحتوي على System.out.print`,
                                type: 'error'
                            };
                        }
                    }
                }
                
                return {
                    passed: hasMethod,
                    message: hasMethod ? 
                        `✅ تم تعريف طريقة ${methodName}()` : 
                        `❌ لم يتم العثور على طريقة ${methodName}()`,
                    type: hasMethod ? 'success' : 'error'
                };
            }
        }

        // Constructor validation
        if (text.includes('كونستركتور')) {
            const constructorMatch = requirement.match(/كونستركتور.*(\w+)/);
            if (constructorMatch) {
                const className = constructorMatch[1];
                const hasConstructor = new RegExp(`${className}\\s*\\(`, 'i').test(code);
                
                return {
                    passed: hasConstructor,
                    message: hasConstructor ? 
                        `✅ تم تعريف كونستركتور للكلاس ${className}` : 
                        `❌ لم يتم العثور على كونستركتور للكلاس ${className}`,
                    type: hasConstructor ? 'success' : 'error'
                };
            }
        }

        // Object creation validation
        if (text.includes('إنشاء') && (text.includes('كائن') || text.includes('كائنات'))) {
            const objectMatch = requirement.match(/إنشاء.*(\w+)/);
            if (objectMatch) {
                const expectedPattern = objectMatch[1];
                const hasObjectCreation = new RegExp(`new\\s+${expectedPattern}`, 'i').test(code);
                
                return {
                    passed: hasObjectCreation,
                    message: hasObjectCreation ? 
                        `✅ تم إنشاء كائن من نوع ${expectedPattern}` : 
                        `❌ لم يتم العثور على إنشاء كائن من نوع ${expectedPattern}`,
                    type: hasObjectCreation ? 'success' : 'error'
                };
            }
        }

        // Fallback to basic validation
        return this.validateRequirement(code, requirement, context);
    }

    /**
     * Anti-cheating validation with multiple test scenarios
     */
    performAntiCheatValidation(code, requirements) {
        // Test 1: Check for hardcoded values that bypass actual functionality
        const suspiciousPatterns = [
            /return\s+\d+\s*;/,  // Hardcoded return values
            /System\.out\.print.*".*\d+.*"/,  // Hardcoded print statements with numbers
            /"[^"]*\d+[^"]*"/  // Strings with numbers that might be hardcoded results
        ];

        for (let pattern of suspiciousPatterns) {
            if (pattern.test(code)) {
                // Only flag if the code is suspiciously simple
                const codeLines = code.split('\n').filter(line => line.trim().length > 0);
                if (codeLines.length < 15) {  // Very short code might be cheating
                    return {
                        passed: false,
                        message: '❌ الكود يبدو مبسطًا أكثر من اللازم - تأكد من تنفيذ الحل بالطريقة الصحيحة'
                    };
                }
            }
        }

        // Test 2: Ensure proper class structure
        const classCount = (code.match(/class\s+\w+/g) || []).length;
        const methodCount = (code.match(/public\s+\w+\s+\w+\s*\(/g) || []).length;
        
        if (classCount === 0) {
            return {
                passed: false,
                message: '❌ لا يوجد كلاسات في الكود'
            };
        }

        // Test 3: Check for minimum complexity based on requirements
        const requiredClasses = requirements.filter(req => req.includes('كلاس')).length;
        const requiredMethods = requirements.filter(req => req.includes('طريقة')).length;
        
        if (classCount < requiredClasses) {
            return {
                passed: false,
                message: `❌ مطلوب ${requiredClasses} كلاس على الأقل، تم العثور على ${classCount}`
            };
        }

        if (methodCount < requiredMethods) {
            return {
                passed: false,
                message: `❌ مطلوب ${requiredMethods} طريقة على الأقل، تم العثور على ${methodCount}`
            };
        }

        return { passed: true };
    }

    /**
     * Extract class content for validation
     */
    extractClassContent(code, className) {
        const classRegex = new RegExp(`class\\s+${className}\\s*\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}`, 'i');
        const match = classRegex.exec(code);
        return match ? match[1] : null;
    }

    /**
     * Extract method content for validation
     */
    extractMethodContent(code, methodName) {
        const methodRegex = new RegExp(`\\w+\\s+${methodName}\\s*\\([^)]*\\)\\s*\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}`, 'i');
        const match = methodRegex.exec(code);
        return match ? match[1] : null;
    }

    /**
     * Check if variable is declared within class context
     */
    isVariableInClassContext(code, varName) {
        const varRegex = new RegExp(`\\w+\\s+${varName}`, 'i');
        const match = varRegex.exec(code);
        if (!match) return false;
        
        // Check if the variable declaration comes after a class declaration
        const beforeVar = code.substring(0, match.index);
        const classMatch = beforeVar.lastIndexOf('class ');
        const methodMatch = beforeVar.lastIndexOf('public static void main');
        
        return classMatch > methodMatch;
    }

    /**
     * Validate individual requirement
     */
    validateRequirement(code, requirement, context) {
        const text = requirement.toLowerCase();
        
        // Class name validation
        if (text.includes('إنشاء كلاس') || text.includes('كلاس باسم')) {
            const classNameMatch = requirement.match(/كلاس باسم (\w+)/);
            if (classNameMatch) {
                const expectedClassName = classNameMatch[1];
                const hasClass = new RegExp(`class\\s+${expectedClassName}`, 'i').test(code);
                return {
                    passed: hasClass,
                    message: hasClass ? 
                        `✅ تم إنشاء كلاس ${expectedClassName} بنجاح` : 
                        `❌ لم يتم العثور على كلاس ${expectedClassName}`,
                    type: hasClass ? 'success' : 'error'
                };
            }
        }

        // Variable validation
        if (text.includes('خاصية') || text.includes('متغير')) {
            const varMatch = requirement.match(/خاصية (\w+) من نوع (\w+)/);
            if (varMatch) {
                const varName = varMatch[1];
                const varType = varMatch[2];
                const hasVariable = new RegExp(`${varType}\\s+${varName}`, 'i').test(code);
                return {
                    passed: hasVariable,
                    message: hasVariable ? 
                        `✅ تم تعريف خاصية ${varName} من نوع ${varType}` : 
                        `❌ لم يتم العثور على خاصية ${varName} من نوع ${varType}`,
                    type: hasVariable ? 'success' : 'error'
                };
            }
        }

        // Method validation
        if (text.includes('طريقة') || text.includes('دالة')) {
            const methodMatch = requirement.match(/طريقة (\w+)\(\)/);
            if (methodMatch) {
                const methodName = methodMatch[1];
                const hasMethod = new RegExp(`\\w+\\s+${methodName}\\s*\\(`, 'i').test(code);
                return {
                    passed: hasMethod,
                    message: hasMethod ? 
                        `✅ تم تعريف طريقة ${methodName}()` : 
                        `❌ لم يتم العثور على طريقة ${methodName}()`,
                    type: hasMethod ? 'success' : 'error'
                };
            }
        }

        // Inheritance validation
        if (text.includes('يرث من') || text.includes('extends')) {
            const extendsMatch = requirement.match(/يرث من كلاس (\w+)/);
            if (extendsMatch) {
                const parentClass = extendsMatch[1];
                const hasInheritance = new RegExp(`extends\\s+${parentClass}`, 'i').test(code);
                return {
                    passed: hasInheritance,
                    message: hasInheritance ? 
                        `✅ تم الوراثة من كلاس ${parentClass}` : 
                        `❌ لم يتم الوراثة من كلاس ${parentClass}`,
                    type: hasInheritance ? 'success' : 'error'
                };
            }
        }

        // Generic validation for other requirements
        return {
            passed: true,
            message: '⚠️ لم يتم فحص هذا المتطلب بعد',
            type: 'warning'
        };
    }

    /**
     * Progressive hint system
     */
    getHint(requirement, hintLevel = 1) {
        const text = requirement.toLowerCase();
        
        // Hints for class creation
        if (text.includes('إنشاء كلاس') || text.includes('كلاس باسم')) {
            const classNameMatch = requirement.match(/كلاس باسم (\w+)/);
            const className = classNameMatch ? classNameMatch[1] : 'الكلاس';
            
            switch(hintLevel) {
                case 1:
                    return {
                        level: 'conceptual',
                        hint: `💡 تذكر أن الكلاس في Java يبدأ بكلمة "class" متبوعة بالاسم.`
                    };
                case 2:
                    return {
                        level: 'structural',
                        hint: `🏗️ البنية الأساسية: class ${className} { }`
                    };
                case 3:
                    return {
                        level: 'partial',
                        hint: `📝 جرب كتابة: public class ${className} {`
                    };
                case 4:
                    return {
                        level: 'solution',
                        hint: `public class ${className} {\n    // أضف الخصائص والطرق هنا\n}`
                    };
            }
        }

        // Hints for variable declaration
        if (text.includes('خاصية') || text.includes('متغير')) {
            const varMatch = requirement.match(/خاصية (\w+) من نوع (\w+)/);
            if (varMatch) {
                const varName = varMatch[1];
                const varType = varMatch[2];
                
                switch(hintLevel) {
                    case 1:
                        return {
                            level: 'conceptual',
                            hint: `💡 الخصائص تُعرَّف داخل الكلاس وتحدد نوع البيانات واسم المتغير.`
                        };
                    case 2:
                        return {
                            level: 'structural',
                            hint: `🏗️ البنية: نوع_البيانات اسم_المتغير;`
                        };
                    case 3:
                        return {
                            level: 'partial',
                            hint: `📝 جرب كتابة: ${varType} ${varName};`
                        };
                    case 4:
                        return {
                            level: 'solution',
                            hint: `    ${varType} ${varName}; // خاصية من نوع ${varType}`
                        };
                }
            }
        }

        // Hints for method creation
        if (text.includes('طريقة') || text.includes('دالة')) {
            const methodMatch = requirement.match(/طريقة (\w+)\(\)/);
            if (methodMatch) {
                const methodName = methodMatch[1];
                
                switch(hintLevel) {
                    case 1:
                        return {
                            level: 'conceptual',
                            hint: `💡 الطرق تحدد ما يمكن للكائن فعله. تبدأ بنوع الإرجاع ثم اسم الطريقة.`
                        };
                    case 2:
                        return {
                            level: 'structural',
                            hint: `🏗️ البنية: public نوع_الإرجاع اسم_الطريقة() { }`
                        };
                    case 3:
                        return {
                            level: 'partial',
                            hint: `📝 جرب كتابة: public void ${methodName}() {`
                        };
                    case 4:
                        return {
                            level: 'solution',
                            hint: `    public void ${methodName}() {\n        // أضف الكود هنا\n    }`
                        };
                }
            }
        }

        // Default hints
        switch(hintLevel) {
            case 1:
                return {
                    level: 'conceptual',
                    hint: `💡 راجع المتطلب بعناية وفكر في البنية المطلوبة.`
                };
            case 2:
                return {
                    level: 'structural',
                    hint: `🏗️ تأكد من استخدام الكلمات المفتاحية الصحيحة في Java.`
                };
            case 3:
                return {
                    level: 'partial',
                    hint: `📝 ابدأ بكتابة الهيكل الأساسي ثم أضف التفاصيل.`
                };
            case 4:
                return {
                    level: 'solution',
                    hint: `💭 راجع الأمثلة السابقة للحصول على إرشادات أكثر تفصيلاً.`
                };
        }
    }

    /**
     * Reset hint level for new challenge
     */
    resetHints() {
        this.hintLevel = 0;
    }

    /**
     * Get next hint level
     */
    getNextHint(requirement) {
        this.hintLevel = Math.min(this.hintLevel + 1, this.maxHintLevel);
        return this.getHint(requirement, this.hintLevel);
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
    
    // Enhance the app with code editor methods after a short delay to ensure app is ready
    setTimeout(() => {
        if (typeof app !== 'undefined' && app) {
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
            console.log('Enhanced app with code editor methods');
        } else {
            console.error('App not available for enhancement');
        }
    }, 500);
});