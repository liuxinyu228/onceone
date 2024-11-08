<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-6 rounded-xl shadow-md">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {{ isNewTask ? '新增任务' : '选择已存在的任务' }}
          </h2>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <!-- 表单内容 -->
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="business_system_name" class="sr-only">业务系统名称</label>
              <input id="business_system_name" v-model="form.businessSystemName" name="business_system_name" type="text" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="业务系统名称" />
            </div>
            <div>
              <label for="superintendent_name" class="sr-only">业务负责人姓名</label>
              <input id="superintendent_name" v-model="form.superintendentName" name="superintendent_name" type="text" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="业务负责人姓名" />
            </div>
            <div>
              <label for="superintendent_phone" class="sr-only">业务负责人联系电话</label>
              <input id="superintendent_phone" v-model="form.superintendentPhone" name="superintendent_phone" type="tel" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="业务负责人联系电话" />
            </div>
            <div>
              <label for="superintendent_email" class="sr-only">业务负责人邮箱地址</label>
              <input id="superintendent_email" v-model="form.superintendentEmail" name="superintendent_email" type="mail" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="业务负责人邮箱地址" />
            </div>
          </div>

          <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700">评估类型</label>
            <div class="mt-2 space-y-2">
              <div class="flex items-center">
                <input id="new-tech" v-model="form.workClassification" name="evaluation-type" type="radio" value="101"
                  class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                <label for="new-tech" class="ml-3 block text-sm font-medium text-gray-700">
                  新技术新业务评估
                </label>
              </div>
              <div class="flex items-center">
                <input id="risk-assessment" v-model="form.workClassification" name="evaluation-type" type="radio"
                  value="102" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                <label for="risk-assessment" class="ml-3 block text-sm font-medium text-gray-700">
                  涉诈风险安全评估
                </label>
              </div>
            </div>
          </div>

          <div>
            <label for="creation-date" class="block text-sm font-medium text-gray-700">创建时间</label>
            <input type="date" id="creation-date" v-model="form.creationDate" name="creation-date" required
              class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        </div>
  
          <div class="flex flex-col space-y-4">
            <button type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              开始评估
            </button>
          </div>

        <!-- 返回按钮 -->
        <div class="flex justify-center mt-4">
          <button
            @click="$emit('back')"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            返回
          </button>
        </div>
        </form>
      </div>
    </div>

    <!-- 消息弹窗 -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ modalType === 'exists' ? '任务已存在' : '错误' }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ modalMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="handleModalConfirm" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
            确定
          </button>
          <button @click="handleModalCancel" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
            返回
          </button>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script>
  import { reactive } from 'vue'
  import { encrypt } from '@/util/util.js'
  import Cookies from 'js-cookie'
  import config from '@/util/config'

  export default {
    data() {
      return {
        form: reactive({
          businessSystemName: '',
          superintendentName: '',
          superintendentPhone: '',
          superintendentEmail: '',
          workClassification: '',
          creationDate: ''
        }),
        isNewTask: true,
        showModal: false,
        modalMessage: '',
        modalType: '' // 'error' or 'exists'
      }
    },
    setup() {
      
    },
    methods: {
      async handleSubmit() {
        try {
          const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/addUserWork`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // 携带凭证
            body: JSON.stringify(this.form)
          });
          const data = await response.json();
          if (response.ok) {
            console.log('提交的表单数据:', this.form);
            const taskInfo = {
              system_name: this.form.businessSystemName,
              work_classification: this.form.workClassification
            }
            Cookies.set('taskInfo', encrypt(JSON.stringify(taskInfo)), { path: '/' })
            this.$router.push({
              path: '/compile',
            });
          } else if (response.status === 400) {
            this.modalMessage = data.message;
            this.modalType = 'error';
            this.showModal = true;
          } else {
            const errorData = await response.json();
            this.modalMessage = `错误: ${errorData.error}`;
            this.modalType = 'error';
            this.showModal = true;
          }
        } catch (error) {
          console.error('提交表单时出错:', error);
          this.modalMessage = `提交表单时出错: ${error.message}`;
          this.modalType = 'error';
          this.showModal = true;
        }
      },
      handleModalConfirm() {
        if (this.modalType === 'exists') {
          const taskInfo = {
            system_name: this.form.businessSystemName,
            work_classification: this.form.workClassification
          }
          Cookies.set('taskInfo', encrypt(JSON.stringify(taskInfo)), { path: '/' })
          this.$router.push({
            path: '/compile',
          });
        }
        this.showModal = false;
      },
      handleModalCancel() {
        this.showModal = false;
      }
    }
  }
  </script>