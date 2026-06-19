import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WeeklyGoal, WeeklyProgress, DailyRecord, PracticePlan, ClearanceTask, ReminderType } from '../types';

const STORAGE_KEY = 'gobang_practice_plan';

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function createDefaultWeeklyGoal(): WeeklyGoal {
  return {
    targetHands: 50,
    targetWins: 20,
    targetWinRate: 50,
    startDate: getWeekStart(),
  };
}

function createDefaultWeeklyProgress(): WeeklyProgress {
  return {
    handsPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    weekStart: getWeekStart(),
    dailyRecords: [],
  };
}

function createDefaultClearanceTasks(): ClearanceTask[] {
  return [
    {
      id: 'task-1',
      name: '初出茅庐',
      description: '完成 10 手对弈',
      target: 10,
      current: 0,
      completed: false,
      type: 'hands',
      reward: '称号：初学者',
    },
    {
      id: 'task-2',
      name: '旗开得胜',
      description: '赢得 5 局比赛',
      target: 5,
      current: 0,
      completed: false,
      type: 'wins',
      reward: '称号：小试牛刀',
    },
    {
      id: 'task-3',
      name: '稳扎稳打',
      description: '胜率达到 40%',
      target: 40,
      current: 0,
      completed: false,
      type: 'winRate',
      reward: '称号：稳步前进',
    },
    {
      id: 'task-4',
      name: '连战连胜',
      description: '连续赢得 3 局',
      target: 3,
      current: 0,
      completed: false,
      type: 'streak',
      reward: '称号：势如破竹',
    },
  ];
}

function createDefaultPracticePlan(): PracticePlan {
  return {
    weeklyGoal: createDefaultWeeklyGoal(),
    weeklyProgress: createDefaultWeeklyProgress(),
    remindersEnabled: true,
    reminderTime: '20:00',
    lastRemindedDate: '',
  };
}

function loadFromStorage(): { plan: PracticePlan; tasks: ClearanceTask[] } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        plan: data.plan || createDefaultPracticePlan(),
        tasks: data.tasks || createDefaultClearanceTasks(),
      };
    }
  } catch (e) {
    console.error('Failed to load practice plan from storage', e);
  }
  return {
    plan: createDefaultPracticePlan(),
    tasks: createDefaultClearanceTasks(),
  };
}

function saveToStorage(plan: PracticePlan, tasks: ClearanceTask[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan, tasks }));
  } catch (e) {
    console.error('Failed to save practice plan to storage', e);
  }
}

export const usePracticeStore = defineStore('practice', () => {
  const initialData = loadFromStorage();
  const plan = ref<PracticePlan>(initialData.plan);
  const tasks = ref<ClearanceTask[]>(initialData.tasks);
  const currentStreak = ref(0);
  const showReminder = ref(false);
  const reminderMessage = ref('');
  const reminderType = ref<ReminderType>('daily');

  const winRate = computed(() => {
    const total = plan.value.weeklyProgress.wins + plan.value.weeklyProgress.losses;
    if (total === 0) return 0;
    return Math.round((plan.value.weeklyProgress.wins / total) * 100);
  });

  const handsProgress = computed(() => {
    const target = plan.value.weeklyGoal.targetHands;
    if (target === 0) return 0;
    return Math.min(100, Math.round((plan.value.weeklyProgress.handsPlayed / target) * 100));
  });

  const winsProgress = computed(() => {
    const target = plan.value.weeklyGoal.targetWins;
    if (target === 0) return 0;
    return Math.min(100, Math.round((plan.value.weeklyProgress.wins / target) * 100));
  });

  const winRateProgress = computed(() => {
    const target = plan.value.weeklyGoal.targetWinRate;
    if (target === 0) return 0;
    return Math.min(100, Math.round((winRate.value / target) * 100));
  });

  const remainingDays = computed(() => {
    const today = new Date();
    const weekStart = new Date(plan.value.weeklyProgress.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const diff = Math.ceil((weekEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  });

  const dailyTarget = computed(() => {
    const remaining = plan.value.weeklyGoal.targetHands - plan.value.weeklyProgress.handsPlayed;
    const days = remainingDays.value;
    if (days <= 0) return remaining;
    return Math.ceil(remaining / days);
  });

  const todayRecord = computed((): DailyRecord => {
    const today = getTodayString();
    return plan.value.weeklyProgress.dailyRecords.find(r => r.date === today) || {
      date: today,
      hands: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
  });

  const completedTasksCount = computed(() => {
    return tasks.value.filter(t => t.completed).length;
  });

  function checkWeekReset() {
    const currentWeekStart = getWeekStart();
    if (plan.value.weeklyProgress.weekStart !== currentWeekStart) {
      plan.value.weeklyProgress = createDefaultWeeklyProgress();
      plan.value.weeklyGoal.startDate = currentWeekStart;
      currentStreak.value = 0;
      tasks.value.forEach(t => {
        t.current = 0;
        t.completed = false;
      });
      persist();
    }
  }

  function recordGameResult(winner: number | null) {
    checkWeekReset();

    const today = getTodayString();
    let daily = plan.value.weeklyProgress.dailyRecords.find(r => r.date === today);
    if (!daily) {
      daily = { date: today, hands: 0, wins: 0, losses: 0, draws: 0 };
      plan.value.weeklyProgress.dailyRecords.push(daily);
    }

    plan.value.weeklyProgress.handsPlayed++;
    daily.hands++;

    if (winner === 1) {
      plan.value.weeklyProgress.wins++;
      daily.wins++;
      currentStreak.value++;
    } else if (winner === 2) {
      plan.value.weeklyProgress.losses++;
      daily.losses++;
      currentStreak.value = 0;
    } else if (winner === 0) {
      plan.value.weeklyProgress.draws++;
      daily.draws++;
    }

    updateTasks();
    persist();
  }

  function updateTasks() {
    tasks.value.forEach(task => {
      if (task.completed) return;

      switch (task.type) {
        case 'hands':
          task.current = plan.value.weeklyProgress.handsPlayed;
          break;
        case 'wins':
          task.current = plan.value.weeklyProgress.wins;
          break;
        case 'winRate':
          task.current = winRate.value;
          break;
        case 'streak':
          task.current = currentStreak.value;
          break;
      }

      if (task.current >= task.target) {
        task.completed = true;
      }
    });
  }

  function setWeeklyGoal(goal: Partial<WeeklyGoal>) {
    plan.value.weeklyGoal = { ...plan.value.weeklyGoal, ...goal };
    persist();
  }

  function setReminderSettings(enabled: boolean, time?: string) {
    plan.value.remindersEnabled = enabled;
    if (time) {
      plan.value.reminderTime = time;
    }
    persist();
  }

  function checkReminders() {
    if (!plan.value.remindersEnabled) return;

    const today = getTodayString();
    if (plan.value.lastRemindedDate === today) return;

    const now = new Date();
    const [hours, minutes] = plan.value.reminderTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    if (now >= reminderTime) {
      const todayHands = todayRecord.value.hands;
      const dailyGoal = Math.ceil(plan.value.weeklyGoal.targetHands / 7);

      if (todayHands < dailyGoal) {
        const needed = dailyGoal - todayHands;
        reminderMessage.value = `今日目标 ${dailyGoal} 手，已完成 ${todayHands} 手，还需 ${needed} 手才能完成日目标！`;
        reminderType.value = 'daily';
        showReminder.value = true;
      } else if (handsProgress.value < 100 && remainingDays.value <= 2) {
        const needed = plan.value.weeklyGoal.targetHands - plan.value.weeklyProgress.handsPlayed;
        reminderMessage.value = `本周还剩 ${remainingDays.value} 天，还需完成 ${needed} 手才能达成周目标，加油！`;
        reminderType.value = 'makeup';
        showReminder.value = true;
      }

      plan.value.lastRemindedDate = today;
      persist();
    }
  }

  function dismissReminder() {
    showReminder.value = false;
  }

  function triggerMakeupReminder() {
    const needed = plan.value.weeklyGoal.targetHands - plan.value.weeklyProgress.handsPlayed;
    if (needed > 0 && remainingDays.value <= 2) {
      reminderMessage.value = `周目标提醒：还需完成 ${needed} 手，剩余 ${remainingDays.value} 天，建议每日补练 ${dailyTarget.value} 手。`;
      reminderType.value = 'makeup';
      showReminder.value = true;
    }
  }

  function resetWeek() {
    plan.value.weeklyProgress = createDefaultWeeklyProgress();
    currentStreak.value = 0;
    tasks.value.forEach(t => {
      t.current = 0;
      t.completed = false;
    });
    persist();
  }

  function persist() {
    saveToStorage(plan.value, tasks.value);
  }

  checkWeekReset();

  return {
    plan,
    tasks,
    currentStreak,
    showReminder,
    reminderMessage,
    reminderType,
    winRate,
    handsProgress,
    winsProgress,
    winRateProgress,
    remainingDays,
    dailyTarget,
    todayRecord,
    completedTasksCount,
    recordGameResult,
    setWeeklyGoal,
    setReminderSettings,
    checkReminders,
    dismissReminder,
    triggerMakeupReminder,
    resetWeek,
  };
});
