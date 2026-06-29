<template>
  <div class="menu">
    <div class="header">
      <span class="title">菜单管理</span>
      <el-button type="primary" v-permission="PERMISSION.SYSTEM_MENU_CREATE" @click="handleNewMenu">新建菜单</el-button>
    </div>
    <div class="content">
      <el-tree
        :data="menuList"
        :props="treeProps"
        :expand-on-click-node="false"
        default-expand-all
        :indent="20"
        node-key="id"
        class="menu-tree"
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <i :class="data.icon" v-if="data.icon"></i>
            <span class="node-name">{{ data.name }}</span>
            <span class="node-type">({{ data.type === 1 ? "一级" : "二级" }}菜单)</span>
            <span class="node-url" v-if="data.url">{{ data.url }}</span>
            <div class="node-actions">
              <el-button type="primary" size="small" v-permission="PERMISSION.SYSTEM_MENU_UPDATE" @click.stop="handleEditMenu(data)">
                编辑
              </el-button>
              <el-button type="danger" size="small" v-permission="PERMISSION.SYSTEM_MENU_DELETE" @click.stop="handleDeleteMenu(data.id)">
                删除
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 菜单编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : '新建菜单'" width="600px">
      <el-form :model="menuForm" label-width="120px" ref="formRef" :rules="formRules">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="menuForm.type">
            <el-radio :label="1">一级菜单</el-radio>
            <el-radio :label="2">二级菜单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parent_id" v-if="menuForm.type === 2">
          <el-select v-model="menuForm.parent_id" placeholder="请选择上级菜单" style="width: 100%">
            <el-option
              v-for="menu in getParentMenus()"
              :key="menu.id"
              :label="menu.name"
              :value="menu.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单URL" prop="url">
          <el-input v-model="menuForm.url" placeholder="请输入菜单URL" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="menuForm.icon" placeholder="请输入菜单图标类名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmMenu">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="menu">
import { ref, reactive } from "vue"
import { useSystemStore } from "@/stores/main/system/system"
import { storeToRefs } from "pinia"
import { ElMessage, ElMessageBox } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import type { IMenuItem } from "@/types/main/system/system"
import { PERMISSION } from "@/global/constant"

// 发起action，请求菜单数据
const systemStore = useSystemStore()

// 获取菜单列表
const { menuList } = storeToRefs(systemStore)

// 弹窗相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editingId = ref(0)
const menuForm = reactive({
  name: "",
  type: 1,
  parent_id: 0,
  url: "",
  icon: ""
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: "请输入菜单名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  type: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  parent_id: [
    {
      required: true,
      validator: (rule, value, callback) => {
        // 如果是二级菜单，必须选择上级菜单
        if (menuForm.type === 2 && (!value || value === 0)) {
          callback(new Error("请选择上级菜单"))
        } else {
          callback()
        }
      },
      trigger: "change"
    }
  ],
  url: [{ required: true, message: "请输入菜单URL", trigger: "blur" }]
}

// 树形组件配置
const treeProps = {
  children: "children",
  label: "label"
}

// 初始化数据
fetchMenuData()

// 获取菜单数据
function fetchMenuData() {
  systemStore.getMenuListAction()
}

// 获取所有可能的父级菜单（用于上级菜单选择）
function getParentMenus(): IMenuItem[] {
  // 返回所有一级菜单项，但排除当前正在编辑的菜单（避免自己成为自己的父级）
  return menuList.value.filter((menu) => menu.type === 1 && menu.id !== editingId.value)
}

// 节点点击事件
function handleNodeClick(data: any) {
  console.log("Node clicked:", data)
}

// 新建菜单
function handleNewMenu() {
  isEdit.value = false
  editingId.value = 0
  Object.assign(menuForm, {
    name: "",
    type: 1,
    parent_id: 0,
    url: "",
    icon: ""
  })
  dialogVisible.value = true
}

// 编辑菜单
function handleEditMenu(menu: IMenuItem) {
  isEdit.value = true
  editingId.value = menu.id
  Object.assign(menuForm, {
    name: menu.name,
    type: menu.type,
    parent_id: menu.parent_id || 0,
    url: menu.url || "",
    icon: menu.icon || ""
  })
  dialogVisible.value = true
}

// 删除菜单
function handleDeleteMenu(id: number) {
  ElMessageBox.confirm("此操作将永久删除该菜单, 是否继续?", "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      await systemStore.deleteMenuByIdAction(id)
    })
    .catch(() => {
      ElMessage.info("已取消删除")
    })
}

// 确认保存菜单
const confirmMenu = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑菜单
          const updatedMenu = { ...menuForm, id: editingId.value }
          await systemStore.updateMenuAction(updatedMenu)
        } else {
          // 新建菜单
          await systemStore.createMenuAction(menuForm)
        }
        dialogVisible.value = false
        // 重新获取数据
        fetchMenuData()
      } catch (error) {
        console.error("操作失败:", error)
      }
    }
  })
}
</script>

<style lang="less" scoped>
.menu {
  margin-top: 10px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 60px;
    background-color: #fff;
    font-size: 22px;
    font-weight: 700;
  }

  .content {
    background-color: #fff;
    margin-top: 10px;
    padding: 20px;

    .menu-tree {
      :deep(.el-tree-node__content) {
        height: 60px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        border-bottom: 1px solid #ebeef5;
      }

      :deep(.el-tree-node__content):last-child {
        border-bottom: none;
      }

      // 添加树形连接线
      :deep(.el-tree) {
        .el-tree-node {
          position: relative;
        }

        .el-tree-node::before {
          content: "";
          position: absolute;
          top: 0;
          left: -20px;
          bottom: -24px;
          width: 1px;
          background-color: #d9d9d9;
          z-index: 1;
        }

        .el-tree-node:last-child::before {
          display: none;
        }

        .el-tree-node__children {
          position: relative;
        }

        .el-tree-node__children::after {
          content: "";
          position: absolute;
          top: 12px;
          left: -20px;
          width: 20px;
          height: 24px;
          border: 1px solid #d9d9d9;
          border-top: none;
          border-right: none;
          z-index: 1;
        }
      }

      :deep(.el-tree-node__content) {
        position: relative;
        z-index: 2;
      }

      :deep(.el-tree-node__expand-icon) {
        color: #409eff;
      }

      .tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 8px 0;

        i {
          margin-right: 10px;
          color: #409eff;
          font-size: 18px;
          width: 20px;
        }

        .node-name {
          flex: 1;
          font-weight: 500;
          color: #303133;
          font-size: 14px;
        }

        .node-type {
          margin-left: 15px;
          font-size: 12px;
          color: #909399;
          background-color: #ecf5ff;
          padding: 2px 8px;
          border-radius: 12px;
          white-space: nowrap;
          border: 1px solid #d9ecff;
        }

        .node-url {
          margin-left: 15px;
          font-size: 12px;
          color: #909399;
          flex: 1;
          text-align: left;
          margin-right: 15px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .node-actions {
          display: flex;
          gap: 8px;

          .el-button--small {
            padding: 4px 8px;
            font-size: 12px;
          }
        }
      }

      // 一级菜单样式
      :deep(.el-tree-node__content .tree-node) {
        .node-name {
          font-weight: 600;
          color: #303133;
        }

        .node-type {
          background-color: #ecf5ff;
          border: 1px solid #b3d8ff;
          color: #409eff;
        }
      }

      // 二级菜单样式
      :deep(.el-tree-node__children .tree-node) {
        .node-name {
          font-weight: 400;
          color: #606266;
        }

        .node-type {
          background-color: #f4f4f5;
          border: 1px solid #dcdfe6;
          color: #909399;
        }
      }
    }
  }
}
</style>
