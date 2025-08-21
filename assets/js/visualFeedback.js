/**
 * Visual Feedback System for JavaQuest
 * Handles real-time visual representation of Java code concepts
 */

class VisualFeedbackSystem {
    constructor() {
        this.visualizations = new Map();
        this.animationQueue = [];
        this.isAnimating = false;
        // Enhanced preview state tracking
        this.objectStates = new Map();
        this.methodAnimations = new Map();
        this.validationState = null;
        this.isHighFidelityMode = true;
    }

    // Create visual representation based on code analysis
    createVisualization(codeAnalysis, containerId = 'practice-feedback') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const visualization = this.generateVisualizationHTML(codeAnalysis);
        
        // Add to container with smooth transition
        container.innerHTML = visualization;
        container.classList.add('active');
        
        // Trigger animations
        this.triggerVisualizationAnimations(container);
    }

    generateVisualizationHTML(analysis) {
        let html = '<div class="visualization-container">';

        // Render classes as objects
        if (analysis.classes && analysis.classes.length > 0) {
            html += this.renderClasses(analysis.classes);
        }

        // Render objects if any were created
        if (analysis.objects && analysis.objects.length > 0) {
            html += this.renderObjects(analysis.objects);
        }

        // Render inheritance relationships
        if (analysis.inheritance && analysis.inheritance.length > 0) {
            html += this.renderInheritance(analysis.inheritance);
        }

        html += '</div>';
        return html;
    }

    renderClasses(classes) {
        let html = '<div class="classes-visualization">';
        
        classes.forEach((cls, index) => {
            const colorClass = this.getClassColorClass(cls.name);
            html += `
                <div class="java-class ${colorClass}" data-class="${cls.name}" style="animation-delay: ${index * 0.2}s">
                    <div class="class-header">
                        <div class="class-icon">${this.getClassIcon(cls.name)}</div>
                        <div class="class-name">${cls.name}</div>
                    </div>
                    
                    ${cls.variables && cls.variables.length > 0 ? `
                        <div class="class-variables">
                            <div class="section-title">🏷️ الخصائص</div>
                            ${cls.variables.map(variable => `
                                <div class="variable-item ${variable.visibility}">
                                    <span class="visibility-icon">${this.getVisibilityIcon(variable.visibility)}</span>
                                    <span class="variable-type">${variable.type}</span>
                                    <span class="variable-name">${variable.name}</span>
                                    ${variable.value !== undefined ? `
                                        <span class="variable-value">= ${variable.value}</span>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${cls.methods && cls.methods.length > 0 ? `
                        <div class="class-methods">
                            <div class="section-title">⚙️ الطرق</div>
                            ${cls.methods.map(method => `
                                <div class="method-item ${method.visibility}">
                                    <span class="visibility-icon">${this.getVisibilityIcon(method.visibility)}</span>
                                    <span class="method-signature">
                                        ${method.returnType} ${method.name}()
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    renderObjects(objects) {
        let html = '<div class="objects-visualization">';
        
        objects.forEach((obj, index) => {
            const colorClass = this.getClassColorClass(obj.className);
            html += `
                <div class="java-object-instance ${colorClass}" data-object="${obj.name}" style="animation-delay: ${index * 0.3}s">
                    <div class="object-header">
                        <div class="object-icon">📦</div>
                        <div class="object-info">
                            <div class="object-name">${obj.name}</div>
                            <div class="object-type">نوع: ${obj.className}</div>
                        </div>
                        <div class="creation-badge">جديد ✨</div>
                    </div>
                    
                    ${obj.properties && Object.keys(obj.properties).length > 0 ? `
                        <div class="object-properties">
                            ${Object.entries(obj.properties).map(([key, value]) => `
                                <div class="property-item">
                                    <span class="property-key">${key}:</span>
                                    <span class="property-value">${this.formatValue(value)}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${obj.state ? `
                        <div class="object-state">
                            <div class="state-indicator ${obj.state}">
                                ${this.getStateText(obj.state)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    renderInheritance(inheritanceRelations) {
        let html = '<div class="inheritance-visualization">';
        
        inheritanceRelations.forEach(relation => {
            html += `
                <div class="inheritance-relation">
                    <div class="parent-class">
                        <div class="class-box parent">
                            <div class="class-title">👑 ${relation.parent}</div>
                            <div class="class-role">الكلاس الأب</div>
                        </div>
                    </div>
                    
                    <div class="inheritance-arrow">
                        <div class="arrow-line"></div>
                        <div class="arrow-head">⬇️</div>
                        <div class="inheritance-label">extends</div>
                    </div>
                    
                    <div class="child-class">
                        <div class="class-box child">
                            <div class="class-title">👶 ${relation.child}</div>
                            <div class="class-role">الكلاس الابن</div>
                        </div>
                    </div>
                    
                    <div class="inherited-features">
                        <div class="features-title">الميزات الموروثة:</div>
                        ${relation.inheritedFeatures.map(feature => `
                            <div class="inherited-feature">✅ ${feature}</div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    // Visual feedback for specific Java concepts
    showEncapsulationDemo(privateFields, publicMethods) {
        const html = `
            <div class="encapsulation-demo">
                <div class="encapsulation-container">
                    <div class="private-section">
                        <div class="section-header">
                            <span class="lock-icon">🔒</span>
                            <span class="section-title">بيانات خاصة</span>
                        </div>
                        ${privateFields.map(field => `
                            <div class="private-field">
                                <span class="field-type">${field.type}</span>
                                <span class="field-name">${field.name}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="public-section">
                        <div class="section-header">
                            <span class="key-icon">🔓</span>
                            <span class="section-title">طرق الوصول</span>
                        </div>
                        ${publicMethods.map(method => `
                            <div class="public-method">
                                <span class="method-name">${method.name}()</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.updateFeedback(html);
    }

    showPolymorphismDemo(objects, method) {
        const html = `
            <div class="polymorphism-demo">
                <div class="demo-title">
                    🎭 تعدد الأشكال - طريقة ${method}()
                </div>
                <div class="objects-grid">
                    ${objects.map((obj, index) => `
                        <div class="polymorphic-object" style="animation-delay: ${index * 0.4}s">
                            <div class="object-visual">
                                ${this.getObjectEmoji(obj.type)}
                            </div>
                            <div class="object-type">${obj.type}</div>
                            <div class="method-call">
                                ${obj.name}.${method}()
                            </div>
                            <div class="method-result">
                                "${obj.result}"
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.updateFeedback(html);
    }

    // Animation system
    triggerVisualizationAnimations(container) {
        const elements = container.querySelectorAll('.java-class, .java-object-instance, .inheritance-relation');
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * 200);
        });
    }

    animateClassCreation(className) {
        const element = document.querySelector(`[data-class="${className}"]`);
        if (element) {
            element.classList.add('creating');
            setTimeout(() => {
                element.classList.remove('creating');
                element.classList.add('created');
            }, 1000);
        }
    }

    animateObjectCreation(objectName) {
        const element = document.querySelector(`[data-object="${objectName}"]`);
        if (element) {
            element.classList.add('spawning');
            setTimeout(() => {
                element.classList.remove('spawning');
                element.classList.add('active');
            }, 800);
        }
    }

    animateMethodCall(objectName, methodName) {
        const element = document.querySelector(`[data-object="${objectName}"]`);
        if (element) {
            const pulse = document.createElement('div');
            pulse.className = 'method-pulse';
            pulse.textContent = `${methodName}()`;
            element.appendChild(pulse);
            
            setTimeout(() => {
                pulse.remove();
            }, 2000);
        }
    }

    // Helper methods
    getClassIcon(className) {
        const icons = {
            'Robot': '🤖',
            'Car': '🚗',
            'Animal': '🐾',
            'Dog': '🐕',
            'Cat': '🐱',
            'Lion': '🦁',
            'Elephant': '🐘',
            'Student': '🎓',
            'Teacher': '👨‍🏫',
            'Employee': '👨‍💼',
            'Manager': '👔',
            'Developer': '👨‍💻'
        };
        return icons[className] || '📦';
    }

    getObjectEmoji(type) {
        const emojis = {
            'Dog': '🐕',
            'Cat': '🐱',
            'Lion': '🦁',
            'Bird': '🐦',
            'Car': '🚗',
            'Truck': '🚚'
        };
        return emojis[type] || '📦';
    }

    getClassColorClass(className) {
        const colors = ['blue', 'green', 'purple', 'orange', 'red'];
        const hash = className.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }

    getVisibilityIcon(visibility) {
        const icons = {
            'private': '🔒',
            'public': '🔓',
            'protected': '🛡️'
        };
        return icons[visibility] || '🔓';
    }

    formatValue(value) {
        if (typeof value === 'string') {
            return `"${value}"`;
        }
        return String(value);
    }

    getStateText(state) {
        const states = {
            'active': '🟢 نشط',
            'inactive': '🔴 غير نشط',
            'processing': '🟡 جاري المعالجة',
            'error': '❌ خطأ'
        };
        return states[state] || state;
    }

    updateFeedback(html) {
        const feedbackContainer = document.querySelector('.visual-feedback .feedback-content');
        if (feedbackContainer) {
            feedbackContainer.innerHTML = html;
            feedbackContainer.parentElement.classList.add('active');
        }
    }

    clearFeedback() {
        const feedbackContainer = document.querySelector('.visual-feedback');
        if (feedbackContainer) {
            feedbackContainer.classList.remove('active');
            feedbackContainer.querySelector('.feedback-content').innerHTML = `
                <div class="feedback-placeholder">
                    💡 اكتب كود Java لترى النتيجة المرئية هنا
                </div>
            `;
        }
    }

    // Challenge validation visual feedback
    showChallengeProgress(requirements, completedRequirements) {
        const html = `
            <div class="challenge-progress">
                <div class="progress-title">🎯 تقدم التحدي</div>
                <div class="requirements-list">
                    ${requirements.map((req, index) => {
                        const isCompleted = completedRequirements.includes(index);
                        return `
                            <div class="requirement-item ${isCompleted ? 'completed' : 'pending'}">
                                <span class="requirement-icon">
                                    ${isCompleted ? '✅' : '⏳'}
                                </span>
                                <span class="requirement-text">${req}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(completedRequirements.length / requirements.length) * 100}%"></div>
                </div>
                <div class="progress-text">
                    ${completedRequirements.length} من ${requirements.length} مكتمل
                </div>
            </div>
        `;
        
        this.updateFeedback(html);
    }

    /**
     * ENHANCED HIGH-FIDELITY INTERACTIVE PREVIEW ENGINE
     */

    /**
     * Create enhanced interactive visualization with real-time state tracking
     */
    createEnhancedVisualization(codeAnalysis, executionContext, containerId = 'challenge-feedback') {
        if (!this.isHighFidelityMode) {
            return this.createVisualization(codeAnalysis, containerId);
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        // Update object states from execution context
        this.updateObjectStates(executionContext);

        // Generate enhanced visualization with interactive elements
        const visualization = this.generateEnhancedVisualizationHTML(codeAnalysis, executionContext);
        
        // Add to container with smooth transition
        container.innerHTML = visualization;
        container.classList.add('active', 'enhanced');
        
        // Add click handlers for interactive elements
        this.addInteractiveHandlers(container);
        
        // Trigger animations
        this.triggerEnhancedAnimations(container);
    }

    /**
     * Update object states for real-time tracking
     */
    updateObjectStates(executionContext) {
        if (!executionContext || !executionContext.objects) return;

        Object.entries(executionContext.objects).forEach(([objectName, objectData]) => {
            this.objectStates.set(objectName, {
                ...objectData,
                lastModified: Date.now(),
                isValid: this.validateObjectState(objectData)
            });
        });
    }

    /**
     * Validate object state for edge case handling
     */
    validateObjectState(objectData) {
        if (!objectData || !objectData.properties) return true;

        // Check for logical inconsistencies
        const props = objectData.properties;
        
        // Example: negative speed for vehicles
        if (props.speed && props.speed < 0) return false;
        
        // Example: empty name
        if (props.name && props.name.trim() === '') return false;
        
        // Example: invalid percentage values
        if (props.batteryLevel && (props.batteryLevel < 0 || props.batteryLevel > 100)) return false;

        return true;
    }

    /**
     * Generate enhanced HTML with interactive elements
     */
    generateEnhancedVisualizationHTML(analysis, executionContext) {
        let html = '<div class="enhanced-visualization-container">';

        // Only show visual representation if validation is tied to success
        if (this.validationState && !this.validationState.passed) {
            html += this.renderValidationFailedState();
        } else if (analysis.objects && analysis.objects.length > 0) {
            html += this.renderInteractiveObjects(analysis.objects, executionContext);
        } else if (analysis.classes && analysis.classes.length > 0) {
            html += this.renderInteractiveClasses(analysis.classes);
        } else {
            html += this.renderPlaceholderState();
        }

        html += '</div>';
        return html;
    }

    /**
     * Render interactive objects with click handlers and real-time state
     */
    renderInteractiveObjects(objects, executionContext) {
        let html = '<div class="interactive-objects-grid">';
        
        objects.forEach((obj, index) => {
            const objectState = this.objectStates.get(obj.name);
            const isValid = objectState ? objectState.isValid : true;
            const colorClass = this.getClassColorClass(obj.className);
            
            html += `
                <div class="interactive-object ${colorClass} ${!isValid ? 'invalid-state' : ''}" 
                     data-object="${obj.name}" 
                     onclick="visualFeedback.showObjectDetails('${obj.name}')"
                     style="animation-delay: ${index * 0.2}s">
                     
                    <div class="object-visual">
                        ${this.getObjectVisualIcon(obj.className)}
                        ${!isValid ? '<div class="warning-badge">⚠️</div>' : ''}
                    </div>
                    
                    <div class="object-header">
                        <div class="object-name">${obj.name}</div>
                        <div class="object-type">${obj.className}</div>
                    </div>
                    
                    <div class="object-status">
                        <div class="status-indicator ${isValid ? 'valid' : 'invalid'}">
                            ${isValid ? '✅ حالة صحيحة' : '❌ حالة غير منطقية'}
                        </div>
                    </div>
                    
                    <div class="object-preview-props">
                        ${obj.properties && Object.keys(obj.properties).length > 0 ? 
                            Object.entries(obj.properties).slice(0, 2).map(([key, value]) => `
                                <div class="preview-prop">
                                    <span class="prop-key">${key}:</span>
                                    <span class="prop-value">${this.formatValue(value)}</span>
                                </div>
                            `).join('')
                        : '<div class="no-props">لا توجد خصائص</div>'}
                        ${Object.keys(obj.properties || {}).length > 2 ? 
                            '<div class="more-props">...اضغط لرؤية المزيد</div>' : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Render interactive classes
     */
    renderInteractiveClasses(classes) {
        let html = '<div class="interactive-classes-grid">';
        
        classes.forEach((cls, index) => {
            const colorClass = this.getClassColorClass(cls.name);
            html += `
                <div class="interactive-class ${colorClass}" 
                     data-class="${cls.name}"
                     onclick="visualFeedback.showClassDetails('${cls.name}')"
                     style="animation-delay: ${index * 0.2}s">
                     
                    <div class="class-visual">
                        ${this.getClassIcon(cls.name)}
                    </div>
                    
                    <div class="class-info">
                        <div class="class-name">${cls.name}</div>
                        <div class="class-stats">
                            ${cls.variables ? cls.variables.length : 0} خصائص • 
                            ${cls.methods ? cls.methods.length : 0} طرق
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Show object details in a popup when clicked
     */
    showObjectDetails(objectName) {
        const objectState = this.objectStates.get(objectName);
        if (!objectState) return;

        const popup = document.createElement('div');
        popup.className = 'object-details-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>📦 ${objectName}</h3>
                    <button class="close-popup" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="popup-body">
                    <div class="object-full-info">
                        <div class="info-section">
                            <h4>الخصائص الحالية:</h4>
                            ${objectState.properties ? 
                                Object.entries(objectState.properties).map(([key, value]) => `
                                    <div class="detail-prop">
                                        <span class="detail-key">${key}:</span>
                                        <span class="detail-value ${this.getValueTypeClass(value)}">${this.formatValue(value)}</span>
                                        <span class="detail-type">(${typeof value})</span>
                                    </div>
                                `).join('') 
                                : '<div class="no-properties">لا توجد خصائص محددة</div>'
                            }
                        </div>
                        
                        <div class="info-section">
                            <h4>حالة الكائن:</h4>
                            <div class="state-display ${objectState.isValid ? 'valid' : 'invalid'}">
                                ${objectState.isValid ? 
                                    '✅ الكائن في حالة صحيحة ومنطقية' : 
                                    '❌ الكائن في حالة غير منطقية - تحقق من القيم'
                                }
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4>آخر تحديث:</h4>
                            <div class="timestamp">${new Date(objectState.lastModified).toLocaleTimeString('ar')}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        popup.style.animation = 'popupFadeIn 0.3s ease';
    }

    /**
     * Animate method calls
     */
    animateMethodCall(objectName, methodName) {
        const objectElement = document.querySelector(`[data-object="${objectName}"]`);
        if (!objectElement) return;

        // Create animation effect
        const animationElement = document.createElement('div');
        animationElement.className = 'method-call-animation';
        animationElement.innerHTML = `⚡ ${methodName}()`;
        
        objectElement.appendChild(animationElement);
        
        // Remove animation after completion
        setTimeout(() => {
            if (animationElement.parentNode) {
                animationElement.parentNode.removeChild(animationElement);
            }
        }, 2000);

        // Add visual effect to object
        objectElement.classList.add('method-executing');
        setTimeout(() => {
            objectElement.classList.remove('method-executing');
        }, 1000);
    }

    /**
     * Render validation failed state
     */
    renderValidationFailedState() {
        return `
            <div class="validation-failed-preview">
                <div class="failed-icon">🚫</div>
                <div class="failed-message">
                    <h3>المعاينة غير متاحة</h3>
                    <p>لا يمكن عرض النتيجة المرئية لأن الكود لا يحقق المتطلبات بشكل صحيح.</p>
                    <p>أكمل جميع المتطلبات لرؤية النتيجة المرئية.</p>
                </div>
            </div>
        `;
    }

    /**
     * Render placeholder state
     */
    renderPlaceholderState() {
        return `
            <div class="preview-placeholder">
                <div class="placeholder-icon">💡</div>
                <div class="placeholder-message">
                    <h3>ابدأ بكتابة الكود</h3>
                    <p>ستظهر النتيجة المرئية هنا عند إنشاء الكائنات والتفاعل معها.</p>
                </div>
            </div>
        `;
    }

    /**
     * Get visual icon for object types
     */
    getObjectVisualIcon(className) {
        const icons = {
            'Car': '🚗',
            'Robot': '🤖', 
            'Student': '🧑‍🎓',
            'Book': '📚',
            'Animal': '🐾',
            'Lion': '🦁',
            'Elephant': '🐘',
            'Monkey': '🐒',
            'Employee': '👨‍💼',
            'Manager': '👔',
            'Developer': '👨‍💻'
        };
        return icons[className] || '📦';
    }

    /**
     * Get value type class for styling
     */
    getValueTypeClass(value) {
        if (typeof value === 'string') return 'string-value';
        if (typeof value === 'number') return 'number-value';
        if (typeof value === 'boolean') return 'boolean-value';
        return 'other-value';
    }

    /**
     * Add interactive handlers to elements
     */
    addInteractiveHandlers(container) {
        // Add hover effects
        const interactiveElements = container.querySelectorAll('.interactive-object, .interactive-class');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.05)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });
    }

    /**
     * Trigger enhanced animations
     */
    triggerEnhancedAnimations(container) {
        const animatedElements = container.querySelectorAll('.interactive-object, .interactive-class');
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * Set validation state (ensures visual success is tied to validation success)
     */
    setValidationState(validationState) {
        this.validationState = validationState;
    }

    /**
     * Reset to clean state
     */
    resetToCleanState() {
        this.objectStates.clear();
        this.methodAnimations.clear();
        this.validationState = null;
        this.clearFeedback();
    }
}
}

// Global visual feedback instance
let visualFeedback;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    visualFeedback = new VisualFeedbackSystem();
});