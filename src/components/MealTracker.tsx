import { useState } from 'react';
import { motion } from 'motion/react';
import { UtensilsCrossed, Coffee, Sun, Moon } from 'lucide-react';

interface Meal {
    name: string;
    content: string;
    icon: typeof Coffee;
    gradient: string;
    glowColor: string;
}

export default function MealTracker() {
    const [meals, setMeals] = useState<Record<string, string>>({
        breakfast: '',
        lunch: '',
        dinner: '',
    });

    const mealConfig: Meal[] = [
        { name: 'breakfast', content: meals.breakfast, icon: Coffee, gradient: 'from-amber-400 to-orange-500', glowColor: 'rgba(251,191,36,0.15)' },
        { name: 'lunch', content: meals.lunch, icon: Sun, gradient: 'from-emerald-400 to-teal-500', glowColor: 'rgba(52,211,153,0.15)' },
        { name: 'dinner', content: meals.dinner, icon: Moon, gradient: 'from-violet-400 to-purple-500', glowColor: 'rgba(167,139,250,0.15)' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 relative overflow-hidden"
        >
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-amber-500/15 to-orange-500/15 rounded-full blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <UtensilsCrossed size={18} className="text-amber-400" />
                    </div>
                    <h2 className="font-heading text-lg font-bold text-white/90">Meals</h2>
                </div>

                <div className="space-y-3">
                    {mealConfig.map((meal) => (
                        <div key={meal.name} className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meal.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                                style={{ boxShadow: `0 4px 15px ${meal.glowColor}` }}
                            >
                                <meal.icon size={16} className="text-white" />
                            </div>
                            <input
                                type="text"
                                value={meal.content}
                                onChange={(e) => setMeals(prev => ({ ...prev, [meal.name]: e.target.value }))}
                                placeholder={`What's for ${meal.name}?`}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:ring-2 focus:ring-white/10 transition-all capitalize"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
