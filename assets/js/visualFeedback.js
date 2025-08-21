/**
 * Visual Feedback System for JavaQuest
 * Handles real-time visual representation of Java code concepts
 */

class VisualFeedbackSystem {
    constructor() {
        this.visualizations = new Map();
        this.animationQueue = [];
        this.isAnimating = false;
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
}

// Global visual feedback instance
let visualFeedback;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    visualFeedback = new VisualFeedbackSystem();
});