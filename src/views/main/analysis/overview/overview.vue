<template>
  <div class="tech-overview">
    <!-- 页面标题 -->
    <div class="tech-header">
      <h2>项目核心技术介绍</h2>
      <el-button type="primary" size="small" @click="scrollToSection('backend')">
        <el-icon><ArrowDown /></el-icon>
        查看后端技术
      </el-button>
    </div>

    <!-- 技术概览 -->
    <el-card class="overview-card" :body-style="{ padding: '30px' }">
      <h3>技术栈概览</h3>
    </el-card>

    <!-- 前端技术 -->
    <el-card class="tech-card" id="frontend" :body-style="{ padding: '30px' }">
      <template #header>
        <div class="card-header">
          <span class="tech-icon" style="color: #409eff"><Monitor /></span>
          <h3>前端核心技术</h3>
        </div>
      </template>

      <div class="tech-content">
        <div class="tech-item" v-for="tech in frontendTech" :key="tech.name">
          <div class="tech-name">{{ tech.name }}</div>
          <div class="tech-desc">{{ tech.description }}</div>
          <div class="tech-features">
            <el-tag size="small" v-for="feature in tech.features" :key="feature">{{
              feature
            }}</el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 后端技术 -->
    <el-card class="tech-card" id="backend" :body-style="{ padding: '30px' }">
      <template #header>
        <div class="card-header">
          <span class="tech-icon" style="color: #409eff"><Setting /></span>
          <h3>后端核心技术</h3>
        </div>
      </template>

      <div class="tech-content">
        <div class="tech-item" v-for="tech in backendTech" :key="tech.name">
          <div class="tech-name">{{ tech.name }}</div>
          <div class="tech-desc">{{ tech.description }}</div>
          <div class="tech-features">
            <el-tag size="small" v-for="feature in tech.features" :key="feature">{{
              feature
            }}</el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Token 校验机制 -->
    <el-card class="tech-card" id="token" :body-style="{ padding: '30px' }">
      <template #header>
        <div class="card-header">
          <span class="tech-icon" style="color: #409eff"><Lock /></span>
          <h3>Token 校验机制</h3>
        </div>
      </template>

      <div class="token-content">
        <div class="token-flow">
          <h4>认证流程</h4>
          <div class="flow-steps">
            <div class="step" v-for="(step, index) in tokenFlow" :key="index">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-desc">{{ step }}</div>
            </div>
          </div>
        </div>

        <div class="token-security">
          <h4>安全特性</h4>
          <ul class="security-features">
            <li v-for="feature in securityFeatures" :key="feature">
              <el-icon class="feature-icon" style="color: #67c23a"><Check /></el-icon>
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </el-card>

    <!-- 架构图 -->
    <el-card class="architecture-card" :body-style="{ padding: '30px' }">
      <template #header>
        <div class="card-header">
          <span class="tech-icon" style="color: #409eff"><Grid /></span>
          <h3>系统架构</h3>
        </div>
      </template>

      <div class="architecture-diagram">
        <div class="arch-layer">
          <div class="layer-title">前端层</div>
          <div class="layer-components">
            <div class="component">Vue 3</div>
            <div class="component">TypeScript</div>
            <div class="component">Element Plus</div>
            <div class="component">Vue Router</div>
            <div class="component">Pinia</div>
          </div>
        </div>

        <div class="arch-connection">API 调用</div>

        <div class="arch-layer">
          <div class="layer-title">后端层</div>
          <div class="layer-components">
            <div class="component">Node.js</div>
            <div class="component">Koa</div>
            <div class="component">JSON Web Token</div>
            <div class="component">MySQL/MongoDB</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="techOverview">
import { ref } from "vue"
import { ArrowDown, Monitor, Setting, Lock, Grid, Check } from "@element-plus/icons-vue"

// 前端技术栈数据
const frontendTech = ref([
  {
    name: "Vue 3",
    description: "采用 Composition API 实现响应式状态管理，提供更好的代码组织和复用性",
    features: ["Composition API", "Teleport", "Suspense", "Fragment"]
  },
  {
    name: "TypeScript",
    description: "提供类型安全保障，减少运行时错误，提高代码可维护性",
    features: ["类型系统", "接口定义", "泛型", "类型推断"]
  },
  {
    name: "Element Plus",
    description: "提供丰富的 UI 组件，快速构建现代化的用户界面",
    features: ["组件库", "主题定制", "响应式布局", "国际化"]
  },
  {
    name: "Vue Router",
    description: "实现前端路由管理，支持嵌套路由和路由守卫",
    features: ["路由配置", "导航守卫", "动态路由", "路由懒加载"]
  },
  {
    name: "Pinia",
    description: "轻量级状态管理库，替代 Vuex，提供更简洁的 API",
    features: ["模块化", "TypeScript 支持", "DevTools 集成", "持久化存储"]
  }
])

// 后端技术栈数据
const backendTech = ref([
  {
    name: "Node.js",
    description: "基于 Chrome V8 引擎的 JavaScript 运行时，用于构建高性能的后端服务",
    features: ["非阻塞 I/O", "事件驱动", "模块化", "跨平台"]
  },
  {
    name: "Koa",
    description: "轻量级 Web 框架，由 Express 团队开发，提供更简洁的中间件机制",
    features: ["异步处理", "中间件链", "错误处理", "上下文对象"]
  },
  {
    name: "JSON Web Token",
    description: "用于身份验证的安全令牌，实现无状态的认证机制",
    features: ["无状态", "可扩展", "跨域支持", "安全加密"]
  },
  {
    name: "数据库",
    description: "支持 MySQL、MongoDB 等多种数据库，根据业务需求选择合适的存储方案",
    features: ["数据持久化", "事务支持", "索引优化", "备份恢复"]
  }
])

// Token 认证流程
const tokenFlow = ref([
  "用户登录时，前端发送账号密码到后端",
  "后端验证用户信息，生成 JWT token",
  "前端存储 token 到本地（localStorage 或 sessionStorage）",
  "后续请求携带 token 到后端",
  "后端验证 token 有效性，返回数据或拒绝请求"
])

// 安全特性
const securityFeatures = ref([
  "Token 过期时间设置",
  "密码加密存储",
  "HTTPS 传输加密",
  "API 请求频率限制",
  "XSS 和 CSRF 防护"
])

// 滚动到指定区域
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: "smooth" })
  }
}
</script>

<style scoped lang="less">
.tech-overview {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  // 页面头部
  .tech-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }

  // 概览卡片
  .overview-card {
    margin-bottom: 30px;

    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
      color: #333;
    }

    .overview-desc {
      line-height: 1.6;
      color: #666;
      font-size: 16px;
    }
  }

  // 技术卡片
  .tech-card {
    margin-bottom: 30px;

    // 修复卡片头部样式
    :deep(.el-card__header) {
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      padding: 0 !important;
    }

    .card-header {
      display: flex;
      align-items: center;
      padding: 20px;

      .tech-icon {
        font-size: 24px;
        margin-right: 10px;
        color: #409eff;
      }

      h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }
    }

    .tech-content {
      .tech-item {
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e4e7ed;

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .tech-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .tech-desc {
          color: #666;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .tech-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }
  }

  // Token 内容
  .token-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;

    .token-flow,
    .token-security {
      h4 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 16px;
        color: #333;
      }
    }

    .flow-steps {
      .step {
        display: flex;
        margin-bottom: 15px;

        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #409eff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .step-desc {
          color: #666;
          line-height: 1.5;
        }
      }
    }

    .security-features {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        color: #666;

        .feature-icon {
          margin-right: 8px;
          color: #67c23a;
        }
      }
    }
  }

  // 架构图
  .architecture-card {
    // 修复卡片头部样式
    :deep(.el-card__header) {
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      padding: 0 !important;
    }

    .card-header {
      display: flex;
      align-items: center;
      padding: 20px;

      .tech-icon {
        font-size: 24px;
        margin-right: 10px;
        color: #409eff;
      }

      h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }
    }

    .architecture-diagram {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;

      .arch-layer {
        width: 100%;
        background-color: #f0f2f5;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;

        .layer-title {
          text-align: center;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
        }

        .layer-components {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;

          .component {
            background-color: #fff;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            color: #409eff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }
      }

      .arch-connection {
        margin: 10px 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .tech-overview {
    .token-content {
      grid-template-columns: 1fr;
    }

    .tech-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
}
</style>
