/**
 * JavaQuest - Main Application Controller
 * Handles the core SPA functionality, routing, and state management
 */

class JavaQuestApp {
    constructor() {
        this.currentView = 'skill-map-view';
        this.currentLesson = null;
        this.currentPhase = 0;
        this.userProgress = this.loadProgress();
        this.lessons = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLessons();
        this.hideLoadingScreen();
        this.updateUI();
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.showView(view + '-view');
                this.updateNavigation(e.target);
            });
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });

        // Auto-save progress every 30 seconds
        setInterval(() => {
            this.saveProgress();
        }, 30000);
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const app = document.getElementById('app');
            
            loadingScreen.style.opacity = '0';
            app.classList.remove('hidden');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 2000);
    }

    showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewId;
        }

        // Update content based on view
        if (viewId === 'profile-view') {
            this.updateProfileView();
        } else if (viewId === 'skill-map-view') {
            this.updateSkillMapView();
        }
    }

    updateNavigation(activeBtn) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    updateUI() {
        this.updateUserStats();
        this.updateSkillMapView();
        this.updateProfileView();
    }

    updateUserStats() {
        const xpElement = document.getElementById('user-xp');
        const levelElement = document.getElementById('user-level');
        
        if (xpElement) xpElement.textContent = this.userProgress.xp;
        if (levelElement) levelElement.textContent = this.userProgress.level;
    }

    updateSkillMapView() {
        this.renderLessonsGrid('maker-lessons', 'maker');
        this.renderLessonsGrid('builder-lessons', 'builder');
        this.renderLessonsGrid('architect-lessons', 'architect');
    }

    renderLessonsGrid(containerId, stage) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stageLessons = this.lessons.filter(lesson => lesson.stage === stage);
        
        container.innerHTML = stageLessons.map(lesson => {
            const status = this.getLessonStatus(lesson.id);
            const statusIcon = this.getStatusIcon(status);
            
            return `
                <div class="lesson-card ${status}" data-lesson-id="${lesson.id}">
                    <h3 class="lesson-title">${lesson.title}</h3>
                    <p class="lesson-description">${lesson.description}</p>
                    <div class="lesson-meta">
                        <span class="lesson-xp">+${lesson.xp} XP</span>
                        <div class="lesson-status">
                            <span class="status-icon">${statusIcon}</span>
                            <span>${this.getStatusText(status)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        container.querySelectorAll('.lesson-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const lessonId = e.currentTarget.getAttribute('data-lesson-id');
                const lesson = this.lessons.find(l => l.id === lessonId);
                
                if (lesson && this.isLessonUnlocked(lesson.id)) {
                    this.startLesson(lesson);
                }
            });
        });
    }

    getLessonStatus(lessonId) {
        const progress = this.userProgress.lessons[lessonId];
        
        if (!this.isLessonUnlocked(lessonId)) {
            return 'locked';
        }
        
        if (progress && progress.completed) {
            return 'completed';
        }
        
        if (progress && progress.started) {
            return 'current';
        }
        
        return 'available';
    }

    isLessonUnlocked(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return false;

        // First lesson of each stage is always unlocked
        if (lesson.prerequisites.length === 0) {
            return true;
        }

        // Check if all prerequisites are completed
        return lesson.prerequisites.every(prereqId => {
            const prereqProgress = this.userProgress.lessons[prereqId];
            return prereqProgress && prereqProgress.completed;
        });
    }

    getStatusIcon(status) {
        switch (status) {
            case 'completed': return '✅';
            case 'current': return '🎯';
            case 'available': return '▶️';
            case 'locked': return '🔒';
            default: return '❓';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'current': return 'جاري';
            case 'available': return 'متاح';
            case 'locked': return 'مقفل';
            default: return 'غير معروف';
        }
    }

    startLesson(lesson) {
        this.currentLesson = lesson;
        this.currentPhase = 0;
        
        // Mark lesson as started
        if (!this.userProgress.lessons[lesson.id]) {
            this.userProgress.lessons[lesson.id] = {};
        }
        this.userProgress.lessons[lesson.id].started = true;
        this.saveProgress();

        // Show lesson view
        this.showView('lesson-view');
        this.renderLesson();
    }

    renderLesson() {
        if (!this.currentLesson) return;

        const titleElement = document.getElementById('lesson-title');
        const contentElement = document.getElementById('lesson-content');
        
        if (titleElement) {
            titleElement.textContent = this.currentLesson.title;
        }

        if (contentElement) {
            contentElement.innerHTML = this.generateLessonContent();
        }

        this.updateLessonProgress();
        
        // Initialize code editors after content is rendered
        this.initializeCodeEditors();
    }

    /**
     * Initialize code editors for the current phase
     */
    initializeCodeEditors() {
        if (!this.currentLesson || !this.currentLesson.phases) return;
        
        const currentPhase = this.currentLesson.phases[this.currentPhase];
        if (!currentPhase) return;

        // Wait for DOM to be ready, then initialize editors
        setTimeout(() => {
            if (typeof codeEditor !== 'undefined' && codeEditor) {
                switch (currentPhase.type) {
                    case 'learn':
                        // Initialize example editor if present
                        if (document.getElementById('example-editor')) {
                            codeEditor.createEditor('example-editor', currentPhase.content.example || '', true);
                        }
                        break;
                    case 'practice':
                        // Initialize practice editor
                        if (document.getElementById('practice-editor')) {
                            codeEditor.createEditor('practice-editor', currentPhase.content.starterCode || '');
                        }
                        break;
                    case 'challenge':
                        // Initialize challenge editor
                        if (document.getElementById('challenge-editor')) {
                            codeEditor.createEditor('challenge-editor', '// اكتب الكود هنا...');
                        }
                        break;
                }
            }
        }, 100);
    }

    generateLessonContent() {
        if (!this.currentLesson || !this.currentLesson.phases) return '';

        const phases = this.currentLesson.phases;
        const currentPhase = phases[this.currentPhase];

        if (!currentPhase) return '';

        return `
            <div class="lesson-phase active">
                <div class="phase-header">
                    <div class="phase-icon ${currentPhase.type}">
                        ${this.getPhaseIcon(currentPhase.type)}
                    </div>
                    <div>
                        <h3 class="phase-title">${currentPhase.title}</h3>
                        <p class="phase-description">${currentPhase.description}</p>
                    </div>
                </div>
                
                <div class="phase-content">
                    ${this.renderPhaseContent(currentPhase)}
                </div>

                <div class="phase-navigation">
                    <div class="nav-btn-group">
                        ${this.currentPhase > 0 ? 
                            '<button class="phase-nav-btn" onclick="app.previousPhase()">← السابق</button>' : 
                            ''
                        }
                    </div>
                    
                    <div class="nav-btn-group">
                        ${this.currentPhase < phases.length - 1 ? 
                            '<button class="phase-nav-btn primary" onclick="app.nextPhase()">التالي →</button>' : 
                            '<button class="phase-nav-btn primary" onclick="app.completeLesson()">إنهاء الدرس</button>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    getPhaseIcon(type) {
        switch (type) {
            case 'learn': return '📖';
            case 'practice': return '⚡';
            case 'challenge': return '🏆';
            default: return '❓';
        }
    }

    renderPhaseContent(phase) {
        switch (phase.type) {
            case 'learn':
                return this.renderLearnPhase(phase);
            case 'practice':
                return this.renderPracticePhase(phase);
            case 'challenge':
                return this.renderChallengePhase(phase);
            default:
                return '<p>نوع المرحلة غير معروف</p>';
        }
    }

    renderLearnPhase(phase) {
        return `
            <div class="learn-content">
                <div class="explanation">
                    ${phase.content.explanation}
                </div>
                
                ${phase.content.example ? `
                    <div class="code-editor-container">
                        <div class="code-editor-header">
                            <span class="editor-title">مثال تطبيقي</span>
                        </div>
                        <div class="code-editor" id="example-editor">${phase.content.example}</div>
                    </div>
                ` : ''}

                ${phase.content.visual ? `
                    <div class="visual-feedback active">
                        <div class="feedback-content">
                            ${phase.content.visual}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderPracticePhase(phase) {
        return `
            <div class="practice-content">
                <div class="task-description">
                    ${phase.content.task}
                </div>
                
                <div class="code-editor-container">
                    <div class="code-editor-header">
                        <span class="editor-title">محرر الكود</span>
                        <div class="editor-actions">
                            <button class="editor-btn run" onclick="app.runCode()">تشغيل</button>
                            <button class="editor-btn" onclick="app.resetCode()">إعادة تعيين</button>
                        </div>
                    </div>
                    <div class="code-editor" id="practice-editor">${phase.content.starterCode || ''}</div>
                </div>

                <div class="visual-feedback" id="practice-feedback">
                    <div class="feedback-content">
                        <div class="feedback-placeholder">النتيجة ستظهر هنا بعد تشغيل الكود</div>
                    </div>
                </div>

                <div class="console-output" id="console-output"></div>
            </div>
        `;
    }

    renderChallengePhase(phase) {
        return `
            <div class="challenge-content">
                <div class="challenge-task">
                    <h4>🏆 التحدي النهائي</h4>
                    <p>${phase.content.challenge}</p>
                </div>
                
                <div class="challenge-requirements">
                    <h5>المتطلبات:</h5>
                    <div class="requirements-list">
                        ${phase.content.requirements.map(req => `
                            <div class="requirement-item incomplete">
                                <span>❌</span>
                                <span>${req}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="code-editor-container">
                    <div class="code-editor-header">
                        <span class="editor-title">اكتب الحل من الصفر</span>
                        <div class="editor-actions">
                            <button class="editor-btn run" onclick="app.runCode()">تشغيل واختبار</button>
                            <button class="editor-btn" onclick="app.resetCode()">إعادة تعيين</button>
                        </div>
                    </div>
                    <div class="code-editor" id="challenge-editor">// اكتب الكود هنا...</div>
                </div>

                <div class="visual-feedback" id="challenge-feedback">
                    <div class="feedback-content">
                        <div class="feedback-placeholder">النتيجة ستظهر هنا بعد تشغيل الكود</div>
                    </div>
                </div>

                <div class="console-output" id="console-output"></div>
            </div>
        `;
    }

    updateLessonProgress() {
        const progressFill = document.getElementById('lesson-progress-fill');
        const progressText = document.getElementById('lesson-progress-text');
        
        if (progressFill && progressText && this.currentLesson) {
            const totalPhases = this.currentLesson.phases.length;
            const currentProgress = this.currentPhase + 1;
            const percentage = (currentProgress / totalPhases) * 100;
            
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${currentProgress} / ${totalPhases}`;
        }
    }

    nextPhase() {
        if (this.currentLesson && this.currentPhase < this.currentLesson.phases.length - 1) {
            this.currentPhase++;
            this.renderLesson();
        }
    }

    previousPhase() {
        if (this.currentPhase > 0) {
            this.currentPhase--;
            this.renderLesson();
        }
    }

    completeLesson() {
        if (!this.currentLesson) return;

        // Mark lesson as completed
        if (!this.userProgress.lessons[this.currentLesson.id]) {
            this.userProgress.lessons[this.currentLesson.id] = {};
        }
        
        this.userProgress.lessons[this.currentLesson.id].completed = true;
        this.userProgress.lessons[this.currentLesson.id].completedAt = new Date().toISOString();

        // Award XP
        this.awardXP(this.currentLesson.xp);

        // Check for achievements
        this.checkAchievements();

        // Save progress
        this.saveProgress();

        // Show completion effects
        this.showLessonCompletion();

        // Return to skill map
        setTimeout(() => {
            this.showView('skill-map-view');
            this.updateNavigation(document.querySelector('[data-view="map"]'));
        }, 2000);
    }

    /**
     * Update user level based on current XP
     */
    updateLevel() {
        const oldLevel = this.userProgress.level;
        const newLevel = Math.floor(this.userProgress.xp / 100) + 1;
        
        if (newLevel > oldLevel) {
            this.userProgress.level = newLevel;
            this.showLevelUp(newLevel);
        }
        
        this.updateUserStats();
    }

    awardXP(amount) {
        const oldLevel = this.userProgress.level;
        this.userProgress.xp += amount;
        
        // Calculate new level (100 XP per level)
        const newLevel = Math.floor(this.userProgress.xp / 100) + 1;
        
        if (newLevel > oldLevel) {
            this.userProgress.level = newLevel;
            this.showLevelUp(newLevel);
        }

        // Show XP gain animation
        this.showXPGain(amount);
        this.updateUserStats();
    }

    showXPGain(amount) {
        const xpElement = document.createElement('div');
        xpElement.className = 'xp-gain';
        xpElement.textContent = `+${amount} XP`;
        document.body.appendChild(xpElement);

        setTimeout(() => {
            xpElement.remove();
        }, 3000);
    }

    showLevelUp(newLevel) {
        const modal = document.createElement('div');
        modal.className = 'level-up-modal';
        modal.innerHTML = `
            <div class="level-up-content">
                <h2 class="level-up-title">🎉 تهانينا!</h2>
                <p class="level-up-message">لقد وصلت للمستوى ${newLevel}!</p>
                <button class="level-up-close" onclick="this.parentElement.parentElement.remove()">
                    رائع!
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showLessonCompletion() {
        // Add completion effect to current lesson card
        const lessonCard = document.querySelector(`[data-lesson-id="${this.currentLesson.id}"]`);
        if (lessonCard) {
            const effect = document.createElement('div');
            effect.className = 'lesson-complete-effect';
            lessonCard.appendChild(effect);
            
            setTimeout(() => {
                effect.remove();
                lessonCard.classList.add('completed');
            }, 1000);
        }
    }

    updateProfileView() {
        // Update profile stats
        document.getElementById('profile-level').textContent = this.userProgress.level;
        document.getElementById('profile-xp').textContent = this.userProgress.xp;
        
        // Count completed lessons
        const completedCount = Object.values(this.userProgress.lessons)
            .filter(lesson => lesson.completed).length;
        document.getElementById('profile-completed').textContent = completedCount;
        
        // Count earned badges
        const badgeCount = this.userProgress.badges.length;
        document.getElementById('profile-badges').textContent = badgeCount;

        // Render badges
        this.renderBadges();
    }

    renderBadges() {
        const badgesGrid = document.getElementById('badges-grid');
        if (!badgesGrid) return;

        const allBadges = this.getAllBadges();
        
        badgesGrid.innerHTML = allBadges.map(badge => {
            const isEarned = this.userProgress.badges.includes(badge.id);
            const earnedDate = isEarned ? 
                this.userProgress.badgeEarnedDates[badge.id] : null;
            
            return `
                <div class="badge-card ${isEarned ? 'earned' : 'locked'}">
                    <span class="badge-icon">${badge.icon}</span>
                    <h4 class="badge-title">${badge.title}</h4>
                    <p class="badge-description">${badge.description}</p>
                    ${earnedDate ? `
                        <div class="badge-earned-date">
                            حصل عليه: ${new Date(earnedDate).toLocaleDateString('ar')}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    checkAchievements() {
        const completedLessons = Object.values(this.userProgress.lessons)
            .filter(lesson => lesson.completed).length;

        // First lesson completion
        if (completedLessons === 1 && !this.userProgress.badges.includes('first-lesson')) {
            this.awardBadge('first-lesson');
        }

        // Stage completions
        if (completedLessons >= 5 && !this.userProgress.badges.includes('maker-complete')) {
            this.awardBadge('maker-complete');
        }

        // Level achievements
        if (this.userProgress.level >= 5 && !this.userProgress.badges.includes('level-5')) {
            this.awardBadge('level-5');
        }
    }

    awardBadge(badgeId) {
        if (!this.userProgress.badges.includes(badgeId)) {
            this.userProgress.badges.push(badgeId);
            this.userProgress.badgeEarnedDates[badgeId] = new Date().toISOString();
            this.showBadgeUnlock(badgeId);
        }
    }

    showBadgeUnlock(badgeId) {
        const badge = this.getAllBadges().find(b => b.id === badgeId);
        if (!badge) return;

        const modal = document.createElement('div');
        modal.className = 'achievement-unlock';
        modal.innerHTML = `
            <h3 class="achievement-unlock-title">🏆 إنجاز جديد!</h3>
            <div class="achievement-unlock-badge">${badge.icon}</div>
            <h4 class="achievement-unlock-name">${badge.title}</h4>
            <p class="achievement-unlock-desc">${badge.description}</p>
            <button onclick="this.parentElement.remove()">رائع!</button>
        `;
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.remove();
        }, 5000);
    }

    getAllBadges() {
        return [
            {
                id: 'first-lesson',
                title: 'البداية',
                description: 'أكمل أول درس لك',
                icon: '🌟'
            },
            {
                id: 'maker-complete',
                title: 'الصانع المتمكن',
                description: 'أكمل مرحلة الصانع',
                icon: '🔨'
            },
            {
                id: 'builder-complete',
                title: 'البنّاء الخبير',
                description: 'أكمل مرحلة البنّاء',
                icon: '🏗️'
            },
            {
                id: 'architect-complete',
                title: 'المعماري المحترف',
                description: 'أكمل مرحلة المعماري',
                icon: '🏛️'
            },
            {
                id: 'level-5',
                title: 'مستوى متقدم',
                description: 'وصل للمستوى 5',
                icon: '⚡'
            },
            {
                id: 'perfectionist',
                title: 'الكمالي',
                description: 'أكمل 10 دروس بدون أخطاء',
                icon: '💎'
            }
        ];
    }

    loadLessons() {
        // This will be populated by lessons.js
        this.lessons = window.lessonData || [];
    }

    loadProgress() {
        const saved = localStorage.getItem('javaquest-progress');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default progress
        return {
            xp: 0,
            level: 1,
            lessons: {},
            badges: [],
            badgeEarnedDates: {},
            settings: {
                soundEnabled: true,
                animationsEnabled: true
            }
        };
    }

    saveProgress() {
        localStorage.setItem('javaquest-progress', JSON.stringify(this.userProgress));
    }

    // Code execution methods (will be enhanced by codeEditor.js)
    runCode() {
        console.log('Running code...');
    }

    resetCode() {
        console.log('Resetting code...');
    }

    /**
     * Complete a challenge successfully
     */
    completeChallenge() {
        if (!this.currentLesson || !this.currentLesson.phases[this.currentPhase]) {
            console.error('No current challenge to complete');
            return;
        }

        const lessonId = this.currentLesson.id;
        const phaseIndex = this.currentPhase;

        // Update progress
        if (!this.userProgress.lessons[lessonId]) {
            this.userProgress.lessons[lessonId] = {
                completed: false,
                completedPhases: [],
                timeSpent: 0,
                attempts: 0
            };
        }

        const lessonProgress = this.userProgress.lessons[lessonId];
        
        // Ensure completedPhases is an array
        if (!lessonProgress.completedPhases) {
            lessonProgress.completedPhases = [];
        }
        
        // Mark phase as completed
        if (!lessonProgress.completedPhases.includes(phaseIndex)) {
            lessonProgress.completedPhases.push(phaseIndex);
        }

        // Award XP for challenge completion
        const xpAward = 100; // More XP for challenges
        this.userProgress.xp += xpAward;
        this.updateLevel();

        // Show success message
        this.showSuccessMessage(`🎉 تم إكمال التحدي بنجاح! حصلت على ${xpAward} نقطة خبرة`);

        // Save progress
        this.saveProgress();

        // Move to next phase or complete lesson
        setTimeout(() => {
            this.nextPhase();
        }, 2000);
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.innerHTML = `
            <div class="success-content">
                <div class="success-icon">🏆</div>
                <div class="success-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Animate in
        setTimeout(() => {
            overlay.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }, 3000);
    }
}

// Global app instance
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new JavaQuestApp();
});

// Global function to show views (for HTML onclick handlers)
function showView(viewId) {
    if (app) {
        app.showView(viewId);
    }
}