<template>
  <div class="bg-gray-900 rounded-xl p-4 border border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-green-400">练习计划</h3>
      <button
        @click="showSettings = !showSettings"
        class="text-gray-400 hover:text-white transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>

    <div v-if="showSettings" class="mb-4 p-3 bg-gray-800 rounded-lg space-y-3">
      <h4 class="text-sm font-medium text-green-400">设置周目标</h4>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-400">目标手数</label>
          <input
            type="number"
            v-model.number="tempGoal.targetHands"
            min="1"
            max="500"
            class="w-20 px-2 py-1 bg-gray-700 text-white rounded text-sm text-right"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-400">目标胜局</label>
          <input
            type="number"
            v-model.number="tempGoal.targetWins"
            min="0"
            max="200"
            class="w-20 px-2 py-1 bg-gray-700 text-white rounded text-sm text-right"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-400">目标胜率 %</label>
          <input
            type="number"
            v-model.number="tempGoal.targetWinRate"
            min="0"
            max="100"
            class="w-20 px-2 py-1 bg-gray-700 text-white rounded text-sm text-right"
          />
        </div>
      </div>
      <div class="border-t border-gray-700 pt-3">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm text-gray-400">每日提醒</label>
          <button
            @click="tempReminderEnabled = !tempReminderEnabled"
            class="w-12 h-6 rounded-full transition-colors relative"
            :class="tempReminderEnabled ? 'bg-green-600' : 'bg-gray-700'"
          >
            <span
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
              :class="tempReminderEnabled ? 'left-6' : 'left-0.5'"
            />
          </button>
        </div>
        <div v-if="tempReminderEnabled" class="flex items-center justify-between">
          <label class="text-sm text-gray-400">提醒时间</label>
          <input
            type="time"
            v-model="tempReminderTime"
            class="px-2 py-1 bg-gray-700 text-white rounded text-sm"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <button
          @click="saveSettings"
          class="flex-1 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium transition-colors"
        >
          保存
        </button>
        <button
          @click="cancelSettings"
          class="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
        >
          取消
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-400">本周进度</span>
        <span class="text-yellow-400">剩余 {{ practice.remainingDays }} 天</span>
      </div>

      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-400">手数</span>
            <span class="text-white">
              {{ practice.plan.weeklyProgress.handsPlayed }} / {{ practice.plan.weeklyGoal.targetHands }}
            </span>
          </div>
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-green-500 rounded-full transition-all duration-300"
              :style="{ width: `${practice.handsProgress}%` }"
            />
          </div>
        </div>

        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-400">胜局</span>
            <span class="text-white">
              {{ practice.plan.weeklyProgress.wins }} / {{ practice.plan.weeklyGoal.targetWins }}
            </span>
          </div>
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500 rounded-full transition-all duration-300"
              :style="{ width: `${practice.winsProgress}%` }"
            />
          </div>
        </div>

        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-400">胜率</span>
            <span class="text-white">
              {{ practice.winRate }}% / {{ practice.plan.weeklyGoal.targetWinRate }}%
            </span>
          </div>
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-purple-500 rounded-full transition-all duration-300"
              :style="{ width: `${practice.winRateProgress}%` }"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-2 text-center">
        <div class="p-2 bg-gray-800 rounded-lg">
          <div class="text-lg font-bold text-green-400">{{ practice.todayRecord.hands }}</div>
          <div class="text-xs text-gray-500">今日手数</div>
        </div>
        <div class="p-2 bg-gray-800 rounded-lg">
          <div class="text-lg font-bold text-blue-400">{{ practice.todayRecord.wins }}</div>
          <div class="text-xs text-gray-500">今日胜</div>
        </div>
        <div class="p-2 bg-gray-800 rounded-lg">
          <div class="text-lg font-bold text-red-400">{{ practice.todayRecord.losses }}</div>
          <div class="text-xs text-gray-500">今日负</div>
        </div>
        <div class="p-2 bg-gray-800 rounded-lg">
          <div class="text-lg font-bold text-yellow-400">{{ practice.currentStreak }}</div>
          <div class="text-xs text-gray-500">连胜</div>
        </div>
      </div>

      <div v-if="practice.dailyTarget > 0" class="p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-yellow-300">
            为达成周目标，建议每日完成 <span class="font-bold">{{ practice.dailyTarget }}</span> 手
          </span>
        </div>
      </div>

      <div class="border-t border-gray-700 pt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-green-400">通关任务</h4>
          <span class="text-xs text-gray-500">{{ practice.completedTasksCount }}/{{ practice.tasks.length }}</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="task in practice.tasks"
            :key="task.id"
            class="p-3 rounded-lg border transition-all"
            :class="task.completed ? 'bg-green-900/20 border-green-700/50' : 'bg-gray-800 border-gray-700'"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium" :class="task.completed ? 'text-green-400' : 'text-white'">
                {{ task.name }}
              </span>
              <span v-if="task.completed" class="text-green-400">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
            <p class="text-xs text-gray-500 mb-2">{{ task.description }}</p>
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="task.completed ? 'bg-green-500' : 'bg-blue-500'"
                  :style="{ width: `${Math.min(100, (task.current / task.target) * 100)}%` }"
                />
              </div>
              <span class="text-xs text-gray-400">{{ task.current }}/{{ task.target }}</span>
            </div>
            <div v-if="task.completed" class="mt-2 text-xs text-green-400">
              🎁 {{ task.reward }}
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="practice.plan.weeklyProgress.handsPlayed > 0"
        @click="confirmReset"
        class="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
      >
        重置本周进度
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePracticeStore } from '../store/practice';
import type { WeeklyGoal } from '../types';

const practice = usePracticeStore();

const showSettings = ref(false);
const tempGoal = ref<WeeklyGoal>({ ...practice.plan.weeklyGoal });
const tempReminderEnabled = ref(practice.plan.remindersEnabled);
const tempReminderTime = ref(practice.plan.reminderTime);

watch(showSettings, (val) => {
  if (val) {
    tempGoal.value = { ...practice.plan.weeklyGoal };
    tempReminderEnabled.value = practice.plan.remindersEnabled;
    tempReminderTime.value = practice.plan.reminderTime;
  }
});

function saveSettings() {
  practice.setWeeklyGoal(tempGoal.value);
  practice.setReminderSettings(tempReminderEnabled.value, tempReminderTime.value);
  showSettings.value = false;
}

function cancelSettings() {
  showSettings.value = false;
}

function confirmReset() {
  if (confirm('确定要重置本周进度吗？此操作不可撤销。')) {
    practice.resetWeek();
  }
}
</script>
