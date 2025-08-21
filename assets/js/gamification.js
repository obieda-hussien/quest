/**
 * Gamification System for JavaQuest
 * Handles XP, levels, achievements, and progress tracking
 */

class GamificationSystem {
    constructor() {
        this.achievements = this.initializeAchievements();
        this.xpPerLevel = 100;
        this.streakCounter = 0;
        this.lastActivityDate = null;
    }

    initializeAchievements() {
        return [
            {
                id: 'first-lesson',
                title: 'البداية',
                description: 'أكمل أول درس لك',
                icon: '🌟',
                condition: (progress) => this.getCompletedLessonsCount(progress) >= 1,
                xpReward: 25
            },
            {
                id: 'first-class',
                title: 'أول كلاس',
                description: 'أنشئ أول كلاس Java',
                icon: '🏗️',
                condition: (progress) => progress.codeStats?.classesCreated >= 1,
                xpReward: 30
            },
            {
                id: 'constructor-master',
                title: 'خبير الكونستركتور',
                description: 'استخدم الكونستركتور في 3 كلاسات',
                icon: '🔧',
                condition: (progress) => progress.codeStats?.constructorsUsed >= 3,
                xpReward: 40
            },
            {
                id: 'encapsulation-expert',
                title: 'سيد التغليف',
                description: 'استخدم private و public بشكل صحيح',
                icon: '🔒',
                condition: (progress) => progress.codeStats?.encapsulationUsed >= 1,
                xpReward: 50
            },
            {
                id: 'inheritance-champion',
                title: 'بطل الوراثة',
                description: 'أنشئ هرمية وراثة من 3 مستويات',
                icon: '🌳',
                condition: (progress) => progress.codeStats?.inheritanceDepth >= 3,
                xpReward: 75
            },
            {
                id: 'maker-complete',
                title: 'الصانع المتمكن',
                description: 'أكمل جميع دروس مرحلة الصانع',
                icon: '🔨',
                condition: (progress) => this.isStageComplete(progress, 'maker'),
                xpReward: 100
            },
            {
                id: 'builder-complete',
                title: 'البنّاء الخبير',
                description: 'أكمل جميع دروس مرحلة البنّاء',
                icon: '🏗️',
                condition: (progress) => this.isStageComplete(progress, 'builder'),
                xpReward: 150
            },
            {
                id: 'architect-complete',
                title: 'المعماري المحترف',
                description: 'أكمل جميع دروس مرحلة المعماري',
                icon: '🏛️',
                condition: (progress) => this.isStageComplete(progress, 'architect'),
                xpReward: 200
            },
            {
                id: 'speed-coder',
                title: 'المبرمج السريع',
                description: 'أكمل درس في أقل من 10 دقائق',
                icon: '⚡',
                condition: (progress) => progress.fastestCompletion <= 600, // 10 minutes
                xpReward: 60
            },
            {
                id: 'perfectionist',
                title: 'الكمالي',
                description: 'أكمل 5 دروس بدون أخطاء',
                icon: '💎',
                condition: (progress) => progress.perfectLessons >= 5,
                xpReward: 80
            },
            {
                id: 'streak-warrior',
                title: 'محارب التتابع',
                description: 'حافظ على تتابع 7 أيام',
                icon: '🔥',
                condition: (progress) => progress.maxStreak >= 7,
                xpReward: 90
            },
            {
                id: 'code-explorer',
                title: 'مستكشف الكود',
                description: 'جرب أكثر من 50 مثال كود',
                icon: '🔍',
                condition: (progress) => progress.codeStats?.experimentsRun >= 50,
                xpReward: 70
            },
            {
                id: 'java-master',
                title: 'سيد الجافا',
                description: 'أكمل جميع الدروس بتقييم ممتاز',
                icon: '👑',
                condition: (progress) => this.isFullMastery(progress),
                xpReward: 300
            }
        ];
    }

    // XP and Level Management
    awardXP(amount, reason = 'إنجاز عام') {
        const oldXP = app.userProgress.xp;
        const oldLevel = app.userProgress.level;
        
        app.userProgress.xp += amount;
        const newLevel = this.calculateLevel(app.userProgress.xp);
        
        // Level up check
        if (newLevel > oldLevel) {
            app.userProgress.level = newLevel;
            this.triggerLevelUp(newLevel);
        }
        
        // Show XP gain animation
        this.showXPGainAnimation(amount, reason);
        
        // Update streak if applicable
        this.updateStreak();
        
        // Check for new achievements
        this.checkAchievements();
        
        return {
            oldXP,
            newXP: app.userProgress.xp,
            oldLevel,
            newLevel
        };
    }

    calculateLevel(xp) {
        return Math.floor(xp / this.xpPerLevel) + 1;
    }

    getXPForNextLevel(currentXP) {
        const currentLevel = this.calculateLevel(currentXP);
        return currentLevel * this.xpPerLevel;
    }

    getXPProgress(currentXP) {
        const levelXP = ((this.calculateLevel(currentXP) - 1) * this.xpPerLevel);
        const progressXP = currentXP - levelXP;
        return {
            current: progressXP,
            required: this.xpPerLevel,
            percentage: (progressXP / this.xpPerLevel) * 100
        };
    }

    // Streak Management
    updateStreak() {
        const today = new Date().toDateString();
        const lastActivity = app.userProgress.lastActivityDate;
        
        if (!lastActivity) {
            // First activity
            this.streakCounter = 1;
            app.userProgress.currentStreak = 1;
        } else {
            const lastDate = new Date(lastActivity);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                app.userProgress.currentStreak++;
                this.streakCounter = app.userProgress.currentStreak;
            } else if (diffDays > 1) {
                // Streak broken
                app.userProgress.currentStreak = 1;
                this.streakCounter = 1;
            }
            // Same day, no change needed
        }
        
        // Update max streak
        if (app.userProgress.currentStreak > (app.userProgress.maxStreak || 0)) {
            app.userProgress.maxStreak = app.userProgress.currentStreak;
        }
        
        app.userProgress.lastActivityDate = today;
        
        // Show streak notification if >= 3 days
        if (app.userProgress.currentStreak >= 3) {
            this.showStreakNotification(app.userProgress.currentStreak);
        }
    }

    // Achievement System
    checkAchievements() {
        const progress = app.userProgress;
        const newAchievements = [];
        
        this.achievements.forEach(achievement => {
            if (!progress.badges.includes(achievement.id) && achievement.condition(progress)) {
                newAchievements.push(achievement);
                this.awardAchievement(achievement);
            }
        });
        
        return newAchievements;
    }

    awardAchievement(achievement) {
        // Add to earned badges
        app.userProgress.badges.push(achievement.id);
        app.userProgress.badgeEarnedDates[achievement.id] = new Date().toISOString();
        
        // Award XP bonus
        if (achievement.xpReward) {
            app.userProgress.xp += achievement.xpReward;
        }
        
        // Show achievement animation
        this.showAchievementUnlock(achievement);
        
        // Update statistics
        this.updateAchievementStats();
    }

    updateAchievementStats() {
        const earnedCount = app.userProgress.badges.length;
        const totalCount = this.achievements.length;
        const completionPercentage = (earnedCount / totalCount) * 100;
        
        app.userProgress.achievementStats = {
            earned: earnedCount,
            total: totalCount,
            completion: completionPercentage
        };
    }

    // Code Statistics Tracking
    trackCodeStatistic(statName, increment = 1) {
        if (!app.userProgress.codeStats) {
            app.userProgress.codeStats = {};
        }
        
        if (!app.userProgress.codeStats[statName]) {
            app.userProgress.codeStats[statName] = 0;
        }
        
        app.userProgress.codeStats[statName] += increment;
        
        // Check achievements after updating stats
        this.checkAchievements();
    }

    // Lesson Completion Tracking
    trackLessonCompletion(lessonId, timeSpent, errorCount = 0) {
        const lessonProgress = app.userProgress.lessons[lessonId];
        
        // Track completion time
        if (!app.userProgress.fastestCompletion || timeSpent < app.userProgress.fastestCompletion) {
            app.userProgress.fastestCompletion = timeSpent;
        }
        
        // Track perfect lessons (no errors)
        if (errorCount === 0) {
            app.userProgress.perfectLessons = (app.userProgress.perfectLessons || 0) + 1;
        }
        
        // Award XP based on performance
        let xpAward = app.currentLesson.xp;
        
        // Bonus XP for fast completion
        if (timeSpent < 300) { // Less than 5 minutes
            xpAward += 20;
        }
        
        // Bonus XP for no errors
        if (errorCount === 0) {
            xpAward += 15;
        }
        
        this.awardXP(xpAward, 'إكمال الدرس');
    }

    // UI Animation Methods
    showXPGainAnimation(amount, reason) {
        const animation = document.createElement('div');
        animation.className = 'xp-gain';
        animation.innerHTML = `
            <div class="xp-amount">+${amount} XP</div>
            <div class="xp-reason">${reason}</div>
        `;
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 3000);
    }

    triggerLevelUp(newLevel) {
        const modal = document.createElement('div');
        modal.className = 'level-up-modal';
        modal.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <h2 class="level-up-title">تهانينا!</h2>
                <p class="level-up-message">لقد وصلت للمستوى ${newLevel}!</p>
                <div class="level-up-rewards">
                    <div class="reward-item">
                        <span class="reward-icon">🏆</span>
                        <span>مستوى جديد مفتوح</span>
                    </div>
                    <div class="reward-item">
                        <span class="reward-icon">⭐</span>
                        <span>دروس جديدة متاحة</span>
                    </div>
                </div>
                <button class="level-up-close" onclick="this.parentElement.parentElement.remove()">
                    رائع! 🚀
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 5000);
    }

    showAchievementUnlock(achievement) {
        const modal = document.createElement('div');
        modal.className = 'achievement-unlock';
        modal.innerHTML = `
            <div class="achievement-content">
                <h3 class="achievement-title">🏆 إنجاز جديد!</h3>
                <div class="achievement-badge">${achievement.icon}</div>
                <h4 class="achievement-name">${achievement.title}</h4>
                <p class="achievement-desc">${achievement.description}</p>
                ${achievement.xpReward ? `
                    <div class="achievement-reward">
                        <span class="reward-xp">+${achievement.xpReward} XP</span>
                    </div>
                ` : ''}
                <button onclick="this.parentElement.parentElement.remove()">
                    رائع! ✨
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-close after 6 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 6000);
    }

    showStreakNotification(streakDays) {
        const notification = document.createElement('div');
        notification.className = 'streak-indicator';
        notification.innerHTML = `
            <div class="streak-fire">🔥</div>
            <div class="streak-count">${streakDays}</div>
            <div class="streak-text">يوم متتالي</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Progress Analysis
    getProgressAnalysis() {
        const progress = app.userProgress;
        const completedLessons = this.getCompletedLessonsCount(progress);
        const totalLessons = app.lessons.length;
        
        return {
            level: progress.level,
            xp: progress.xp,
            xpProgress: this.getXPProgress(progress.xp),
            lessonsCompleted: completedLessons,
            totalLessons: totalLessons,
            completionPercentage: (completedLessons / totalLessons) * 100,
            achievementsEarned: progress.badges.length,
            totalAchievements: this.achievements.length,
            currentStreak: progress.currentStreak || 0,
            maxStreak: progress.maxStreak || 0,
            codeStats: progress.codeStats || {}
        };
    }

    // Helper Methods
    getCompletedLessonsCount(progress) {
        return Object.values(progress.lessons).filter(lesson => lesson.completed).length;
    }

    isStageComplete(progress, stage) {
        const stageLessons = app.lessons.filter(lesson => lesson.stage === stage);
        return stageLessons.every(lesson => {
            const lessonProgress = progress.lessons[lesson.id];
            return lessonProgress && lessonProgress.completed;
        });
    }

    isFullMastery(progress) {
        const allLessons = app.lessons;
        return allLessons.every(lesson => {
            const lessonProgress = progress.lessons[lesson.id];
            return lessonProgress && lessonProgress.completed && lessonProgress.rating === 'excellent';
        });
    }

    // Leaderboard and Social Features (for future expansion)
    getLeaderboardData() {
        return {
            level: app.userProgress.level,
            xp: app.userProgress.xp,
            achievements: app.userProgress.badges.length,
            streak: app.userProgress.maxStreak || 0
        };
    }
}

// Global gamification instance
let gamification;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    gamification = new GamificationSystem();
    
    // Enhance app with gamification methods
    if (typeof app !== 'undefined') {
        Object.assign(app, {
            awardXP(amount, reason) {
                return gamification.awardXP(amount, reason);
            },
            
            trackCodeStat(statName, increment) {
                gamification.trackCodeStatistic(statName, increment);
            },
            
            getProgressAnalysis() {
                return gamification.getProgressAnalysis();
            }
        });
    }
});