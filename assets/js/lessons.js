/**
 * JavaQuest Lessons Data
 * Contains all lesson content organized by learning stages
 */

window.lessonData = [
    // THE MAKER STAGE - Classes & Objects Basics
    {
        id: 'maker-001',
        title: 'ما هو الكلاس؟',
        description: 'تعلم أساسيات إنشاء الكلاسات في Java',
        stage: 'maker',
        xp: 50,
        prerequisites: [],
        phases: [
            {
                type: 'learn',
                title: 'فهم مفهوم الكلاس',
                description: 'الكلاس هو قالب لإنشاء الكائنات - مثل مخطط المنزل',
                content: {
                    explanation: `
                        <h4>🏗️ ما هو الكلاس؟</h4>
                        <p>الكلاس في Java هو بمثابة مخطط أو قالب لإنشاء الكائنات. فكر فيه كمخطط المنزل - يحدد ما سيحتويه المنزل ولكنه ليس المنزل نفسه.</p>
                        
                        <h5>عناصر الكلاس الأساسية:</h5>
                        <ul>
                            <li><strong>الاسم:</strong> يبدأ بحرف كبير ويصف الكائن</li>
                            <li><strong>الخصائص (Variables):</strong> تخزن بيانات الكائن</li>
                            <li><strong>الطرق (Methods):</strong> تحدد ما يمكن للكائن فعله</li>
                        </ul>
                    `,
                    example: `public class Robot {
    // خصائص الروبوت
    String name;
    String color;
    int batteryLevel;
    
    // طريقة للتعريف بالروبوت
    public void introduce() {
        System.out.println("مرحباً! أنا " + name);
        System.out.println("لوني " + color);
    }
}`,
                    visual: `
                        <div class="java-object robot">
                            <div class="object-title">🤖 Robot</div>
                            <div class="object-properties">
                                <div>الاسم: غير محدد</div>
                                <div>اللون: غير محدد</div>
                                <div>البطارية: 0%</div>
                            </div>
                        </div>
                    `
                }
            },
            {
                type: 'practice',
                title: 'أنشئ كلاس الروبوت الخاص بك',
                description: 'جرب إنشاء كلاس وإضافة خصائص له',
                content: {
                    task: `
                        <h4>🎯 المهمة:</h4>
                        <p>أضف خاصية جديدة للروبوت تسمى <code>model</code> من نوع String. ستلاحظ تغيير الروبوت في المعاينة المرئية!</p>
                    `,
                    starterCode: `public class Robot {
    String name;
    String color;
    int batteryLevel;
    // أضف خاصية model هنا
    
    public void introduce() {
        System.out.println("مرحباً! أنا " + name);
    }
}`
                }
            },
            {
                type: 'challenge',
                title: 'إنشاء كلاس من الصفر',
                description: 'اختبر مهاراتك في إنشاء كلاس جديد بالكامل',
                content: {
                    challenge: 'أنشئ كلاس Car يحتوي على الخصائص والطرق المطلوبة',
                    requirements: [
                        'إنشاء كلاس باسم Car',
                        'إضافة خاصية brand من نوع String',
                        'إضافة خاصية speed من نوع int',
                        'إضافة طريقة start() تطبع "تم تشغيل السيارة"',
                        'إضافة طريقة accelerate() تزيد السرعة بـ 10'
                    ]
                }
            }
        ]
    },
    {
        id: 'maker-002',
        title: 'إنشاء الكائنات',
        description: 'تعلم كيفية إنشاء كائنات من الكلاسات',
        stage: 'maker',
        xp: 60,
        prerequisites: ['maker-001'],
        phases: [
            {
                type: 'learn',
                title: 'من الكلاس إلى الكائن',
                description: 'تعلم الفرق بين الكلاس والكائن وكيفية إنشاء كائنات جديدة',
                content: {
                    explanation: `
                        <h4>🎭 الكائنات: تجسيد الكلاسات</h4>
                        <p>إذا كان الكلاس هو مخطط المنزل، فالكائن هو المنزل المبني فعلياً. يمكنك بناء عدة منازل من نفس المخطط!</p>
                        
                        <h5>كيفية إنشاء كائن:</h5>
                        <ol>
                            <li>استخدم الكلمة المفتاحية <code>new</code></li>
                            <li>اتبعها باسم الكلاس</li>
                            <li>أضف الأقواس <code>()</code></li>
                        </ol>
                        
                        <p><strong>مثال:</strong> <code>Robot myRobot = new Robot();</code></p>
                    `,
                    example: `public class Main {
    public static void main(String[] args) {
        // إنشاء كائن روبوت جديد
        Robot myRobot = new Robot();
        
        // تعيين خصائص الروبوت
        myRobot.name = "بيب";
        myRobot.color = "أزرق";
        myRobot.batteryLevel = 85;
        
        // استدعاء طريقة التعريف
        myRobot.introduce();
    }
}`,
                    visual: `
                        <div class="java-object robot active">
                            <div class="object-title">🤖 بيب</div>
                            <div class="object-properties">
                                <div>الاسم: بيب</div>
                                <div>اللون: أزرق</div>
                                <div>البطارية: 85%</div>
                            </div>
                        </div>
                    `
                }
            },
            {
                type: 'practice',
                title: 'أنشئ روبوتين مختلفين',
                description: 'جرب إنشاء عدة كائنات من نفس الكلاس',
                content: {
                    task: `
                        <h4>🎯 المهمة:</h4>
                        <p>أنشئ روبوت ثاني وأعطه اسماً ولوناً مختلفين. ستشاهد كلا الروبوتين في المعاينة!</p>
                    `,
                    starterCode: `public class Main {
    public static void main(String[] args) {
        Robot robot1 = new Robot();
        robot1.name = "بيب";
        robot1.color = "أزرق";
        
        // أنشئ robot2 هنا
        
        robot1.introduce();
        // استدعِ introduce() للروبوت الثاني
    }
}`
                }
            },
            {
                type: 'challenge',
                title: 'حديقة الكائنات',
                description: 'أنشئ عدة كائنات وتفاعل معها',
                content: {
                    challenge: 'أنشئ 3 سيارات مختلفة وشغلها جميعاً',
                    requirements: [
                        'إنشاء ثلاث كائنات Car مختلفة',
                        'إعطاء كل سيارة اسم ماركة مختلف',
                        'تشغيل جميع السيارات باستخدام start()',
                        'زيادة سرعة إحدى السيارات باستخدام accelerate()',
                        'طباعة معلومات كل سيارة'
                    ]
                }
            }
        ]
    },
    {
        id: 'maker-003',
        title: 'الكونستركتور',
        description: 'تعلم كيفية إنشاء كونستركتور لتهيئة الكائنات',
        stage: 'maker',
        xp: 70,
        prerequisites: ['maker-002'],
        phases: [
            {
                type: 'learn',
                title: 'الكونستركتور: المُهيئ الذكي',
                description: 'الكونستركتور يسمح لك بإعطاء قيم أولية للكائن عند إنشائه',
                content: {
                    explanation: `
                        <h4>🔧 ما هو الكونستركتور؟</h4>
                        <p>الكونستركتور هو طريقة خاصة تُستدعى تلقائياً عند إنشاء كائن جديد. يساعدك في إعطاء قيم أولية للكائن بدلاً من تعيينها واحدة تلو الأخرى.</p>
                        
                        <h5>قواعد الكونستركتور:</h5>
                        <ul>
                            <li>له نفس اسم الكلاس تماماً</li>
                            <li>لا يحتوي على نوع إرجاع (حتى void)</li>
                            <li>يُستدعى تلقائياً مع <code>new</code></li>
                        </ul>
                        
                        <p><strong>الفائدة:</strong> بدلاً من 3 أسطر لتعيين القيم، سطر واحد فقط!</p>
                    `,
                    example: `public class Robot {
    String name;
    String color;
    int batteryLevel;
    
    // الكونستركتور
    public Robot(String robotName, String robotColor, int battery) {
        name = robotName;
        color = robotColor;
        batteryLevel = battery;
        System.out.println("تم إنشاء روبوت جديد: " + name);
    }
    
    public void introduce() {
        System.out.println("مرحباً! أنا " + name + " وأنا " + color);
    }
}`,
                    visual: `
                        <div class="construction-animation">
                            <div class="java-object robot building">
                                <div class="object-title">🤖 جاري الإنشاء...</div>
                                <div class="object-properties">
                                    <div>⚡ تجميع المكونات...</div>
                                    <div>🎨 تطبيق اللون...</div>
                                    <div>🔋 شحن البطارية...</div>
                                </div>
                            </div>
                        </div>
                    `
                }
            },
            {
                type: 'practice',
                title: 'أضف كونستركتور للسيارة',
                description: 'جرب إضافة كونستركتور لكلاس Car',
                content: {
                    task: `
                        <h4>🎯 المهمة:</h4>
                        <p>أضف كونستركتور لكلاس Car يأخذ اسم الماركة والسرعة الأولية. ثم أنشئ سيارة باستخدام الكونستركتور الجديد!</p>
                    `,
                    starterCode: `public class Car {
    String brand;
    int speed;
    
    // أضف الكونستركتور هنا
    
    public void start() {
        System.out.println(brand + " تم تشغيلها!");
    }
    
    public void showInfo() {
        System.out.println("السيارة: " + brand + ", السرعة: " + speed);
    }
}

public class Main {
    public static void main(String[] args) {
        // أنشئ سيارة باستخدام الكونستركتور
    }
}`
                }
            },
            {
                type: 'challenge',
                title: 'مصنع الكائنات',
                description: 'أنشئ نظام كونستركتور متكامل',
                content: {
                    challenge: 'أنشئ كلاس Student مع كونستركتور وأنشئ عدة طلاب',
                    requirements: [
                        'إنشاء كلاس Student',
                        'خصائص: name (String), age (int), grade (String)',
                        'كونستركتور يأخذ جميع الخصائص كمعاملات',
                        'طريقة displayInfo() تعرض معلومات الطالب',
                        'إنشاء 3 طلاب مختلفين باستخدام الكونستركتور',
                        'عرض معلومات جميع الطلاب'
                    ]
                }
            }
        ]
    },

    // THE BUILDER STAGE - OOP Pillars
    {
        id: 'builder-001',
        title: 'التغليف (Encapsulation)',
        description: 'تعلم كيفية حماية البيانات باستخدام Private و Getters/Setters',
        stage: 'builder',
        xp: 80,
        prerequisites: ['maker-003'],
        phases: [
            {
                type: 'learn',
                title: 'حماية البيانات: Private و Public',
                description: 'تعلم كيفية التحكم في الوصول للخصائص والطرق',
                content: {
                    explanation: `
                        <h4>🔒 التغليف: حماية البيانات</h4>
                        <p>التغليف يعني إخفاء التفاصيل الداخلية للكائن وإظهار ما هو ضروري فقط. مثل جهاز التلفزيون - تستخدم الريموت ولا تحتاج لمعرفة الدوائر الداخلية.</p>
                        
                        <h5>مستويات الوصول:</h5>
                        <ul>
                            <li><strong>private:</strong> يمكن الوصول إليها من داخل الكلاس فقط</li>
                            <li><strong>public:</strong> يمكن الوصول إليها من أي مكان</li>
                        </ul>
                        
                        <h5>Getters و Setters:</h5>
                        <p>طرق خاصة للوصول وتعديل البيانات الخاصة بطريقة محكومة.</p>
                    `,
                    example: `public class BankAccount {
    private String accountNumber;
    private double balance;  // محمية من التعديل المباشر
    
    public BankAccount(String accNum, double initialBalance) {
        accountNumber = accNum;
        if (initialBalance >= 0) {
            balance = initialBalance;
        }
    }
    
    // Getter - للحصول على الرصيد
    public double getBalance() {
        return balance;
    }
    
    // Setter محكوم - لإيداع مبلغ
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("تم إيداع " + amount);
        }
    }
    
    // طريقة محكومة للسحب
    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("تم سحب " + amount);
            return true;
        }
        System.out.println("عملية سحب غير صالحة");
        return false;
    }
}`,
                    visual: `
                        <div class="encapsulation-demo">
                            <div class="java-object bank-account">
                                <div class="object-title">🏦 حساب بنكي</div>
                                <div class="private-section">
                                    <div class="section-title">🔒 بيانات خاصة</div>
                                    <div>رقم الحساب: ****1234</div>
                                    <div>الرصيد: 1000$</div>
                                </div>
                                <div class="public-section">
                                    <div class="section-title">🔓 عمليات متاحة</div>
                                    <div>- عرض الرصيد</div>
                                    <div>- إيداع مبلغ</div>
                                    <div>- سحب مبلغ</div>
                                </div>
                            </div>
                        </div>
                    `
                }
            },
            {
                type: 'practice',
                title: 'احمِ بيانات الطالب',
                description: 'حول كلاس Student ليستخدم التغليف',
                content: {
                    task: `
                        <h4>🎯 المهمة:</h4>
                        <p>اجعل خصائص الطالب private وأضف getters و setters مناسبة. تأكد من أن العمر لا يقل عن 0!</p>
                    `,
                    starterCode: `public class Student {
    // اجعل هذه الخصائص private
    String name;
    int age;
    double gpa;
    
    public Student(String name, int age, double gpa) {
        this.name = name;
        this.age = age;
        this.gpa = gpa;
    }
    
    // أضف getters و setters هنا
    
}

public class Main {
    public static void main(String[] args) {
        Student student = new Student("أحمد", 20, 3.5);
        // اختبر الـ getters و setters
    }
}`
                }
            },
            {
                type: 'challenge',
                title: 'نظام إدارة المكتبة',
                description: 'طبق التغليف في نظام أكثر تعقيداً',
                content: {
                    challenge: 'أنشئ كلاس Book مع تغليف كامل ونظام إعارة',
                    requirements: [
                        'كلاس Book مع خصائص private: title, author, isbn, isAvailable',
                        'كونستركتور مناسب',
                        'getters لجميع الخصائص',
                        'طريقة borrowBook() تغير حالة التوفر إلى false',
                        'طريقة returnBook() تعيد الكتاب (true)',
                        'طريقة isAvailable() للتحقق من التوفر',
                        'إنشاء مكتبة صغيرة مع 3 كتب واختبار النظام'
                    ]
                }
            }
        ]
    },
    {
        id: 'builder-002',
        title: 'الوراثة (Inheritance)',
        description: 'تعلم كيفية إنشاء كلاسات ترث من كلاسات أخرى',
        stage: 'builder',
        xp: 90,
        prerequisites: ['builder-001'],
        phases: [
            {
                type: 'learn',
                title: 'شجرة العائلة: Parent و Child',
                description: 'فهم مفهوم الوراثة وكيفية استخدام extends',
                content: {
                    explanation: `
                        <h4>🌳 الوراثة: شجرة الكلاسات</h4>
                        <p>الوراثة تسمح لكلاس (Child) بأن يرث خصائص وطرق كلاس آخر (Parent). مثل الطفل الذي يرث صفات من والديه!</p>
                        
                        <h5>فوائد الوراثة:</h5>
                        <ul>
                            <li><strong>إعادة الاستخدام:</strong> لا نكرر الكود</li>
                            <li><strong>التنظيم:</strong> هيكل واضح ومنطقي</li>
                            <li><strong>التوسيع:</strong> إضافة ميزات جديدة بسهولة</li>
                        </ul>
                        
                        <p><strong>الكلمة المفتاحية:</strong> <code>extends</code></p>
                    `,
                    example: `// الكلاس الأب (Parent)
public class Vehicle {
    protected String brand;
    protected int speed;
    
    public Vehicle(String brand) {
        this.brand = brand;
        this.speed = 0;
    }
    
    public void start() {
        System.out.println(brand + " تم تشغيلها");
    }
    
    public void accelerate() {
        speed += 10;
        System.out.println("السرعة الآن: " + speed);
    }
}

// الكلاس الابن (Child)
public class Car extends Vehicle {
    private int numberOfDoors;
    
    public Car(String brand, int doors) {
        super(brand);  // استدعاء كونستركتور الأب
        this.numberOfDoors = doors;
    }
    
    // طريقة جديدة خاصة بالسيارة
    public void openDoors() {
        System.out.println("فتح " + numberOfDoors + " أبواب");
    }
    
    // تخصيص طريقة من الأب
    @Override
    public void start() {
        System.out.println("تشغيل محرك السيارة " + brand);
        super.start();  // استدعاء طريقة الأب
    }
}`,
                    visual: `
                        <div class="inheritance-tree">
                            <div class="parent-class">
                                <div class="class-title">🚗 Vehicle (الأب)</div>
                                <div class="class-features">
                                    <div>+ brand: String</div>
                                    <div>+ speed: int</div>
                                    <div>+ start()</div>
                                    <div>+ accelerate()</div>
                                </div>
                            </div>
                            <div class="inheritance-arrow">⬇️ extends</div>
                            <div class="child-class">
                                <div class="class-title">🚙 Car (الابن)</div>
                                <div class="inherited-features">
                                    <div>وراثة: brand, speed, start(), accelerate()</div>
                                </div>
                                <div class="new-features">
                                    <div>+ numberOfDoors: int</div>
                                    <div>+ openDoors()</div>
                                </div>
                            </div>
                        </div>
                    `
                }
            },
            {
                type: 'practice',
                title: 'أنشئ عائلة الحيوانات',
                description: 'طبق الوراثة مع كلاس Animal',
                content: {
                    task: `
                        <h4>🎯 المهمة:</h4>
                        <p>أنشئ كلاس Dog يرث من Animal. أضف خاصية breed واجعله ينبح بدلاً من الصوت العام!</p>
                    `,
                    starterCode: `public class Animal {
    protected String name;
    protected int age;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void makeSound() {
        System.out.println(name + " يصدر صوتاً");
    }
    
    public void eat() {
        System.out.println(name + " يأكل");
    }
}

// أنشئ كلاس Dog هنا يرث من Animal

public class Main {
    public static void main(String[] args) {
        // اختبر الكلاس الجديد
    }
}`
                }
            },
            {
                type: 'challenge',
                title: 'نظام الموظفين',
                description: 'أنشئ هيكل وراثة متكامل للموظفين',
                content: {
                    challenge: 'أنشئ نظام موظفين مع أنواع مختلفة من الوظائف',
                    requirements: [
                        'كلاس Employee أساسي مع: name, id, salary',
                        'طريقة work() في Employee',
                        'كلاس Manager يرث من Employee مع: numberOfTeams',
                        'كلاس Developer يرث من Employee مع: programmingLanguage',
                        'تخصيص طريقة work() في كلا الكلاسين الفرعيين',
                        'إنشاء مدير ومطور واختبار جميع الطرق',
                        'طريقة displayInfo() في الكلاس الأساسي'
                    ]
                }
            }
        ]
    },

    // THE ARCHITECT STAGE - Integrated Systems
    {
        id: 'architect-001',
        title: 'نظام إدارة حديقة الحيوان',
        description: 'اطبق جميع مفاهيم OOP في مشروع متكامل',
        stage: 'architect',
        xp: 150,
        prerequisites: ['builder-002'],
        phases: [
            {
                type: 'learn',
                title: 'تصميم النظام',
                description: 'تعلم كيفية تحليل المتطلبات وتصميم النظام',
                content: {
                    explanation: `
                        <h4>🏗️ مرحلة المعماري: النظم المتكاملة</h4>
                        <p>الآن ستجمع كل ما تعلمته لبناء نظام متكامل. سنبني نظام إدارة حديقة الحيوان باستخدام:</p>
                        
                        <h5>المكونات الأساسية:</h5>
                        <ul>
                            <li><strong>الكلاسات:</strong> Animal, Lion, Elephant, Zoo</li>
                            <li><strong>التغليف:</strong> بيانات محمية ووصول محكوم</li>
                            <li><strong>الوراثة:</strong> هيكل حيوانات متنوع</li>
                            <li><strong>تعدد الأشكال:</strong> سلوكيات مختلفة لكل حيوان</li>
                        </ul>
                        
                        <h5>الوظائف المطلوبة:</h5>
                        <ul>
                            <li>إضافة حيوانات للحديقة</li>
                            <li>إطعام جميع الحيوانات</li>
                            <li>عرض معلومات الحديقة</li>
                            <li>محاكاة أصوات الحيوانات</li>
                        </ul>
                    `,
                    example: `// هذا مثال على التصميم المطلوب
public abstract class Animal {
    protected String name;
    protected int age;
    protected boolean isHungry;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
        this.isHungry = true;
    }
    
    // طريقة مجردة - كل حيوان له صوت مختلف
    public abstract void makeSound();
    
    public void feed() {
        if (isHungry) {
            System.out.println(name + " يتناول الطعام");
            isHungry = false;
        } else {
            System.out.println(name + " ليس جائعاً");
        }
    }
    
    // getters
    public String getName() { return name; }
    public boolean isHungry() { return isHungry; }
}`,
                    visual: `
                        <div class="zoo-system">
                            <div class="zoo-container">
                                <h4>🦁 حديقة الحيوان</h4>
                                <div class="animal-grid">
                                    <div class="animal-card lion">🦁 أسد</div>
                                    <div class="animal-card elephant">🐘 فيل</div>
                                    <div class="animal-card monkey">🐵 قرد</div>
                                </div>
                                <div class="zoo-stats">
                                    <div>إجمالي الحيوانات: 3</div>
                                    <div>الحيوانات الجائعة: 2</div>
                                </div>
                            </div>
                        </div>
                    `
                }
            },
            {
                type: 'practice',
                title: 'بناء الحيوانات',
                description: 'أنشئ كلاسات الحيوانات المختلفة',
                content: {
                    task: `
                        <h4>🎯 المهمة:</h4>
                        <p>أكمل كلاسات Lion و Elephant. كل حيوان له صوت مختلف وسلوك خاص!</p>
                    `,
                    starterCode: `public abstract class Animal {
    protected String name;
    protected int age;
    protected boolean isHungry;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
        this.isHungry = true;
    }
    
    public abstract void makeSound();
    
    public void feed() {
        if (isHungry) {
            System.out.println(name + " يتناول الطعام");
            isHungry = false;
        }
    }
    
    public String getName() { return name; }
    public boolean isHungry() { return isHungry; }
}

// أكمل كلاس Lion
public class Lion extends Animal {
    // أضف الكونستركتور والطرق
}

// أكمل كلاس Elephant  
public class Elephant extends Animal {
    // أضف الكونستركتور والطرق
}`
                }
            },
            {
                type: 'challenge',
                title: 'نظام الحديقة الكامل',
                description: 'اطبق جميع المفاهيم في نظام متكامل',
                content: {
                    challenge: 'أنشئ نظام إدارة حديقة حيوان كامل مع جميع الوظائف',
                    requirements: [
                        'كلاس Animal مجرد مع الخصائص والطرق الأساسية',
                        'كلاسات Lion, Elephant, Monkey ترث من Animal',
                        'كل حيوان له صوت مختلف (makeSound)',
                        'كلاس Zoo يحتوي على قائمة حيوانات',
                        'طريقة addAnimal() في Zoo',
                        'طريقة feedAllAnimals() تطعم جميع الحيوانات',
                        'طريقة makeAllSounds() تجعل كل الحيوانات تصدر أصواتها',
                        'طريقة displayZooInfo() تعرض معلومات الحديقة',
                        'إنشاء حديقة مع 5 حيوانات مختلفة واختبار جميع الوظائف'
                    ]
                }
            }
        ]
    }
];

// Initialize lessons when the data is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل', window.lessonData.length, 'درس');
});