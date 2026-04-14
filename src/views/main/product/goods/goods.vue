<template>
  <div class="goods">
    <!-- 页面头部 -->
    <div class="goods-header">
      <h2 class="page-title">商品管理</h2>
      <el-button type="primary" size="large" @click="handleAddGoods" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-card" :body-style="{ padding: '20px' }">
      <el-form :model="searchForm" label-width="100px" size="large">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="商品名称">
              <el-input v-model="searchForm.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品分类">
              <el-select v-model="searchForm.category_id" placeholder="请选择分类">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="价格范围" style="display: flex; align-items: center">
              <el-input-number
                v-model="searchForm.minPrice"
                placeholder="最低价格"
                size="large"
                style="width: 150px; margin-right: 10px"
              />
              <span class="price-range" style="margin-right: 10px">-</span>
              <el-input-number
                v-model="searchForm.maxPrice"
                placeholder="最高价格"
                size="large"
                style="width: 150px"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="search-buttons">
          <el-button size="large" icon="Refresh" @click="resetSearch">重置</el-button>
          <el-button size="large" type="primary" icon="Search" @click="handleSearch"
            >搜索</el-button
          >
        </div>
      </el-form>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="goods-card" :body-style="{ padding: '0' }">
      <div class="goods-list">
        <div
          v-for="goods in goodsList"
          :key="goods.id"
          class="goods-item"
          @mouseenter="hoveredItem = goods.id"
          @mouseleave="hoveredItem = null"
        >
          <div class="goods-image">
            <img :src="goods.image" :alt="goods.name" />
            <div class="image-overlay">
              <el-button size="small" type="primary" @click.stop="handleEditGoods(goods)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click.stop="handleDeleteGoods(goods.id)">
                删除
              </el-button>
            </div>
          </div>
          <div class="goods-info">
            <h3 class="goods-name">{{ goods.name }}</h3>
            <p class="goods-description">{{ goods.description }}</p>
            <div class="goods-meta">
              <span class="goods-category">{{ getCategoryName(goods.category_id) }}</span>
              <span class="goods-price">¥{{ goods.price.toLocaleString() }}</span>
              <span class="goods-stock" :class="{ 'low-stock': goods.stock < 20 }">
                库存: {{ goods.stock }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 商品编辑/新增弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="800px"
      :before-close="handleDialogClose"
    >
      <el-form :model="goodsForm" label-width="120px" ref="formRef" :rules="formRules">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="goodsForm.name" placeholder="请输入商品名称" />
            </el-form-item>
            <el-form-item label="商品分类" prop="category_id">
              <el-select v-model="goodsForm.category_id" placeholder="请选择分类">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="商品价格" prop="price">
              <el-input-number
                v-model="goodsForm.price"
                :min="0"
                :step="0.01"
                placeholder="请输入价格"
              />
            </el-form-item>
            <el-form-item label="商品库存" prop="stock">
              <el-input-number v-model="goodsForm.stock" :min="0" placeholder="请输入库存" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品图片" prop="image">
              <el-input v-model="goodsForm.image" placeholder="请输入图片URL" />
            </el-form-item>
            <el-form-item label="商品描述" prop="description">
              <el-input
                v-model="goodsForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入商品描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="goods">
import { ref, reactive, computed, onMounted } from "vue"
import { Plus, Search, Refresh, Edit, Delete } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"

// 模拟商品数据
import * as goodsData from "@/fixtures/product/goods/goods-list.json"
import * as categoryData from "@/fixtures/product/category/category-list.json"

// 商品列表数据
const allGoods = ref(goodsData.data.list)
const filteredGoods = ref([...allGoods.value])
const totalCount = ref(goodsData.data.totalCount)
const categories = ref(categoryData.data.list)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(12)
const hoveredItem = ref<number | null>(null)

// 计算当前页的商品列表
const goodsList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredGoods.value.slice(start, end)
})

// 搜索表单
const searchForm = reactive({
  name: "",
  category_id: undefined,
  minPrice: undefined,
  maxPrice: undefined
})

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const goodsForm = reactive({
  id: 0,
  name: "",
  category_id: undefined as number | undefined,
  price: 0,
  stock: 0,
  description: "",
  image: "",
  create_at: "",
  update_at: ""
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: "请输入商品名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ],
  category_id: [{ required: true, message: "请选择商品分类", trigger: "change" }],
  price: [
    { required: true, message: "请输入商品价格", trigger: "blur" },
    { type: "number", min: 0, message: "价格必须大于等于0", trigger: "blur" }
  ],
  stock: [
    { required: true, message: "请输入商品库存", trigger: "blur" },
    { type: "number", min: 0, message: "库存必须大于等于0", trigger: "blur" }
  ],
  description: [
    { required: true, message: "请输入商品描述", trigger: "blur" },
    { min: 5, max: 200, message: "长度在 5 到 200 个字符", trigger: "blur" }
  ],
  image: [{ required: true, message: "请输入商品图片URL", trigger: "blur" }]
}

// 初始化数据
onMounted(() => {
  // 这里可以添加初始化逻辑
})

// 获取分类名称
const getCategoryName = (categoryId: number) => {
  const category = categories.value.find((c) => c.id === categoryId)
  return category ? category.name : "未知分类"
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: "",
    category_id: undefined,
    minPrice: undefined,
    maxPrice: undefined
  })
  // 重置搜索结果
  filteredGoods.value = [...allGoods.value]
  totalCount.value = allGoods.value.length
  currentPage.value = 1 // 重置到第一页
  ElMessage.success("搜索条件已重置")
}

// 处理搜索
const handleSearch = () => {
  // 实现搜索逻辑
  filteredGoods.value = allGoods.value.filter((goods) => {
    // 商品名称搜索
    const nameMatch =
      !searchForm.name || goods.name.toLowerCase().includes(searchForm.name.toLowerCase())

    // 分类搜索
    const categoryMatch = !searchForm.category_id || goods.category_id === searchForm.category_id

    // 价格范围搜索
    const minPriceMatch = !searchForm.minPrice || goods.price >= searchForm.minPrice
    const maxPriceMatch = !searchForm.maxPrice || goods.price <= searchForm.maxPrice

    return nameMatch && categoryMatch && minPriceMatch && maxPriceMatch
  })

  totalCount.value = filteredGoods.value.length
  currentPage.value = 1 // 重置到第一页

  if (filteredGoods.value.length === 0) {
    ElMessage.info("没有找到符合条件的商品")
  } else {
    ElMessage.success(`找到 ${filteredGoods.value.length} 个符合条件的商品`)
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 新增商品
const handleAddGoods = () => {
  isEdit.value = false
  Object.assign(goodsForm, {
    id: 0,
    name: "",
    category_id: undefined,
    price: 0,
    stock: 0,
    description: "",
    image: "",
    create_at: "",
    update_at: ""
  })
  dialogVisible.value = true
}

// 编辑商品
const handleEditGoods = (goods: any) => {
  isEdit.value = true
  Object.assign(goodsForm, goods)
  dialogVisible.value = true
}

// 删除商品
const handleDeleteGoods = (id: number) => {
  ElMessageBox.confirm("此操作将永久删除该商品, 是否继续?", "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      // 实现删除逻辑
      const index = allGoods.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        allGoods.value.splice(index, 1)
        totalCount.value--
        // 如果当前页没有数据了，且不是第一页，返回上一页
        if (goodsList.value.length === 0 && currentPage.value > 1) {
          currentPage.value--
        }
        ElMessage.success("删除成功")
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除")
    })
}

// 确认保存
const handleConfirm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑商品
        const index = allGoods.value.findIndex((item) => item.id === goodsForm.id)
        if (index !== -1) {
          const updatedGoods = {
            ...goodsForm,
            category_id: goodsForm.category_id as number,
            update_at: new Date().toISOString()
          }
          allGoods.value[index] = updatedGoods
          ElMessage.success("编辑成功")
        }
      } else {
        // 新增商品
        const newGoods = {
          ...goodsForm,
          id: allGoods.value.length + 1, // 简单生成ID
          category_id: goodsForm.category_id as number,
          create_at: new Date().toISOString(),
          update_at: new Date().toISOString()
        }
        allGoods.value.unshift(newGoods)
        totalCount.value++
        ElMessage.success("新增成功")
      }
      dialogVisible.value = false
    }
  })
}

// 关闭弹窗
const handleDialogClose = () => {
  // 这里可以添加关闭弹窗的逻辑
  dialogVisible.value = false
}
</script>

<style lang="less" scoped>
.goods {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  // 页面头部
  .goods-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .add-btn {
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }

  // 搜索卡片
  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .price-range {
      margin: 0 10px;
      color: #909399;
    }

    .search-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;
      gap: 10px;
    }
  }

  // 商品卡片
  .goods-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .goods-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;

      .goods-item {
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }

        .goods-image {
          position: relative;
          height: 200px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
          }

          &:hover img {
            transform: scale(1.05);
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            opacity: 0;
            transition: opacity 0.3s ease;

            .el-button {
              transform: translateY(20px);
              transition: transform 0.3s ease;
            }
          }

          &:hover .image-overlay {
            opacity: 1;

            .el-button {
              transform: translateY(0);
            }
          }
        }

        .goods-info {
          padding: 15px;

          .goods-name {
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
          }

          .goods-description {
            margin: 0 0 15px 0;
            font-size: 14px;
            color: #666;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-clamp: 2;
            overflow: hidden;
          }

          .goods-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;

            .goods-category {
              background-color: #ecf5ff;
              color: #409eff;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
            }

            .goods-price {
              font-size: 18px;
              font-weight: 600;
              color: #f56c6c;
            }

            .goods-stock {
              font-size: 14px;
              color: #67c23a;

              &.low-stock {
                color: #e6a23c;
              }
            }
          }
        }
      }
    }
  }

  // 分页
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  // 弹窗样式
  .dialog-footer {
    text-align: right;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .goods {
    padding: 10px;

    .goods-list {
      grid-template-columns: 1fr;
    }

    .search-card {
      .el-row {
        .el-col {
          &:not(:last-child) {
            margin-bottom: 15px;
          }
        }
      }
    }
  }
}
</style>
