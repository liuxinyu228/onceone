import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/components/work/compile/MainLayout.vue';
import TaskPage from '@/components/work/compile/TaskPage.vue';
import TaskTimeLine from '@/components/work/compile/timeline/TimeLineBar.vue';
import CreateTaskMange from '@/components/work/CreateWorkMange.vue';
import UserLogin from '@/components/UserLogin.vue';
import FileManager from '@/components/work/compile/filemanager/FileManagerBar.vue';
import AdminDashboard from '@/components/admin/AdminDashboard.vue';
// import config from '@/util/config';
import ImageViewer from '@/components/common/ImageViewer.vue';
import KnowledgeBar from '@/components/work/compile/AIknowledge/KnowledgeBar.vue';
import StatmentList from '@/components/work/compile/statment/statmentList.vue';
import EditorBar from '@/components/work/editor/editorView.vue';
import config from '@/util/config';

const routes = [
  {
    path: '/compile',
    component: MainLayout,
    children: [
      { path: '', component: TaskPage },
      { path: 'timeline', component: TaskTimeLine },
      { path: 'filemanager', component: FileManager},
      { path: 'knowledge', component:KnowledgeBar},
      { path: 'statement', component: StatmentList},
      { path: '/editor/:statement_name', component: EditorBar, props: true}
    ],
  },
  { path: '/opt', component: CreateTaskMange },
  { path: '/login', component: UserLogin },
  { path: '/admin', component: AdminDashboard },
  { path: '/imageViewer', component: ImageViewer },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 导航守卫
router.beforeEach(async (to, from, next) => {
  const response = await fetch(`${config.getSetting('API_BASE_URL')}/api/checkLogin`, {
    credentials: 'include' // 携带凭证
  });
  const data = await response.json();

  if (to.path !== '/login' && !data.loggedIn) {
    next('/login'); // 未登录，跳转到登录页面
  } else if (to.path === '/admin') {
    // 检查管理员权限
    const adminResponse = await fetch(`${config.getSetting('API_BASE_URL')}/api/checkAdmin`, {
      credentials: 'include'
    });
    const adminData = await adminResponse.json();

    if (adminData.isAdmin) {
      next(); // 是管理员，继续导航
    } else {
      next('/login'); // 不是管理员，重定向到主页或其他页面
    }
  } else {
    next(); // 已登录且不访问 /admin，继续导航
  }
});

export default router;
