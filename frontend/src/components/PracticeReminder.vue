<template>
  <Teleport to="body">
    <Transition name="reminder">
      <div
        v-if="practice.showReminder"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="practice.dismissReminder()"
      >
        <div
          class="w-full max-w-md bg-gray-900 rounded-2xl border shadow-2xl overflow-hidden"
          :class="reminderBorderClass"
        >
          <div
            class="p-6"
            :class="reminderBgClass"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="iconBgClass"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="iconPath"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ reminderTitle }}</h3>
                <p class="text-sm text-gray-400">{{ reminderSubtitle }}</p>
              </div>
            </div>

            <p class="text-gray-300 mb-6 leading-relaxed">
              {{ practice.reminderMessage }}
            </p>

            <div v-if="practice.reminderType === 'makeup'" class="mb-6 p-4 bg-gray-800 rounded-xl">
              <h4 class="text-sm font-medium text-white mb-2">补练建议</h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="text-center p-2 bg-gray-700 rounded-lg">
                  <div class="text-xl font-bold text-yellow-400">{{ practice.dailyTarget }}</div>
                  <div class="text-xs text-gray-400">每日需完成</div>
                </div>
                <div class="text-center p-2 bg-gray-700 rounded-lg">
                  <div class="text-xl font-bold text-orange-400">{{ practice.remainingDays }}</div>
                  <div class="text-xs text-gray-400">剩余天数</div>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="practice.dismissReminder()"
                class="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                稍后再说
              </button>
              <button
                @click="startPractice"
                class="flex-1 py-2.5 text-white rounded-xl font-medium transition-colors"
                :class="btnClass"
              >
                开始练习
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePracticeStore } from '../store/practice';
import { useGameStore } from '../store/game';

const practice = usePracticeStore();
const gameStore = useGameStore();

const reminderTitle = computed(() => {
  switch (practice.reminderType) {
    case 'daily':
      return '每日练习提醒';
    case 'weekly':
      return '周进度提醒';
    case 'makeup':
      return '补练提醒';
    default:
      return '练习提醒';
  }
});

const reminderSubtitle = computed(() => {
  switch (practice.reminderType) {
    case 'daily':
      return '今天的目标还没完成哦';
    case 'weekly':
      return '本周进度需要关注';
    case 'makeup':
      return '周目标可能无法达成';
    default:
      return '记得完成练习目标';
  }
});

const reminderBorderClass = computed(() => {
  switch (practice.reminderType) {
    case 'daily':
      return 'border-blue-600';
    case 'weekly':
      return 'border-purple-600';
    case 'makeup':
      return 'border-orange-600';
    default:
      return 'border-gray-700';
  }
});

const reminderBgClass = computed(() => {
  switch (practice.reminderType) {
    case 'daily':
      return 'bg-gradient-to-br from-blue-900/30 to-gray-900';
    case 'weekly':
      return 'bg-gradient-to-br from-purple-900/30 to-gray-900';
    case 'makeup':
      return 'bg-gradient-to-br from-orange-900/30 to-gray-900';
    default:
      return '';
  }
});

const iconBgClass = computed(() => {
  switch (practice.reminderType) {
    case 'daily':
      return 'bg-blue-500/20 text-blue-400';
    case 'weekly':
      return 'bg-purple-500/20 text-purple-400';
    case 'makeup':
      return 'bg-orange-500/20 text-orange-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
});

const iconPath = computed(() => {
  switch (practice.reminderType) {
    case 'daily':
      return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'weekly':
      return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
    case 'makeup':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    default:
      return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
  }
});

const btnClass = computed(() => {
  switch (practice.reminderType) {
    case 'daily':
      return 'bg-blue-600 hover:bg-blue-500';
    case 'weekly':
      return 'bg-purple-600 hover:bg-purple-500';
    case 'makeup':
      return 'bg-orange-600 hover:bg-orange-500';
    default:
      return 'bg-green-600 hover:bg-green-500';
  }
});

function startPractice() {
  practice.dismissReminder();
  if (gameStore.status !== 'playing') {
    gameStore.startGame();
  }
}
</script>

<style scoped>
.reminder-enter-active,
.reminder-leave-active {
  transition: all 0.3s ease;
}

.reminder-enter-from,
.reminder-leave-to {
  opacity: 0;
}

.reminder-enter-from > div,
.reminder-leave-to > div {
  transform: scale(0.9) translateY(20px);
}
</style>
