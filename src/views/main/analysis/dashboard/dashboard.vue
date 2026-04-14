<template>
  <div class="product-dashboard">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="hero-eyebrow">Product Analytics</p>
        <h2 class="hero-title">商品统计可视化看板</h2>
      </div>

      <div class="hero-summary">
        <span class="hero-summary__label">库存预警商品</span>
        <strong class="hero-summary__value">{{ lowStockProducts.length }}</strong>
        <span class="hero-summary__hint">库存小于等于 30 的商品数量</span>
      </div>
    </section>

    <section class="stats-grid">
      <el-card v-for="item in overviewCards" :key="item.label" shadow="hover" class="stat-card">
        <div class="stat-card__top">
          <span class="stat-card__label">{{ item.label }}</span>
          <el-tag :type="item.tagType" round effect="light">{{ item.tag }}</el-tag>
        </div>
        <strong class="stat-card__value">{{ item.value }}</strong>
        <p class="stat-card__hint">{{ item.hint }}</p>
      </el-card>
    </section>

    <section class="chart-grid">
      <el-card class="panel-card panel-card--wide" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>分类商品分布</h3>
              <p>查看各分类承载的商品数量占比</p>
            </div>
          </div>
        </template>
        <div ref="categoryPieRef" class="chart-canvas"></div>
      </el-card>

      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>库存健康度</h3>
              <p>按库存状态拆分商品结构</p>
            </div>
          </div>
        </template>
        <div ref="stockPieRef" class="chart-canvas chart-canvas--small"></div>
      </el-card>

      <el-card class="panel-card panel-card--wide" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>分类库存货值</h3>
              <p>按分类统计库存总货值，便于识别核心商品线</p>
            </div>
          </div>
        </template>
        <div ref="categoryBarRef" class="chart-canvas"></div>
      </el-card>

      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>价格区间分布</h3>
              <p>观察商品价格带分层情况</p>
            </div>
          </div>
        </template>
        <div ref="priceBarRef" class="chart-canvas chart-canvas--small"></div>
      </el-card>
    </section>

    <section class="bottom-grid">
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>货值 Top 5</h3>
              <p>按单品库存货值降序排列</p>
            </div>
          </div>
        </template>

        <div class="product-list">
          <div v-for="item in topValueProducts" :key="item.id" class="product-item">
            <div class="product-item__cover">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="product-item__content">
              <strong>{{ item.name }}</strong>
              <span>{{ item.categoryName }}</span>
              <p>单价 {{ formatCurrency(item.price) }} · 库存 {{ item.stock }}</p>
              <p>库存货值 {{ formatCurrency(item.stockValue) }}</p>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>低库存提醒</h3>
              <p>便于快速定位需要补货的商品</p>
            </div>
          </div>
        </template>

        <div v-if="lowStockProducts.length" class="alert-list">
          <div v-for="item in lowStockProducts" :key="item.id" class="alert-item">
            <div class="alert-item__content">
              <strong>{{ item.name }}</strong>
              <span>{{ item.categoryName }}</span>
            </div>
            <el-tag :type="item.stock <= 20 ? 'danger' : 'warning'" round effect="light">
              剩余 {{ item.stock }}
            </el-tag>
          </div>
        </div>
        <el-empty v-else description="当前没有低库存商品" />
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts" name="dashboard">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import * as echarts from "echarts/core"
import { BarChart, PieChart } from "echarts/charts"
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent
} from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"
import type { ECharts, EChartsCoreOption } from "echarts/core"
import goodsData from "@/fixtures/product/goods/goods-list.json"
import categoryData from "@/fixtures/product/category/category-list.json"

echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer
])

interface GoodsItem {
  id: number
  name: string
  category_id: number
  price: number
  stock: number
  description: string
  image: string
  create_at: string
  update_at: string
}

interface CategoryItem {
  id: number
  name: string
  parent_id: number
  sort: number
  create_at: string
  update_at: string
}

interface GoodsWithCategory extends GoodsItem {
  categoryName: string
  stockValue: number
}

const goodsList = computed<GoodsItem[]>(() =>
  Array.isArray(goodsData?.data?.list) ? goodsData.data.list : []
)

const categoryList = computed<CategoryItem[]>(() =>
  Array.isArray(categoryData?.data?.list) ? categoryData.data.list : []
)

const categoryMap = computed(() => {
  const map = new Map<number, CategoryItem>()
  categoryList.value.forEach((item) => map.set(item.id, item))
  return map
})

const goodsWithCategory = computed<GoodsWithCategory[]>(() =>
  goodsList.value.map((item) => ({
    ...item,
    categoryName: categoryMap.value.get(item.category_id)?.name ?? `未匹配分类 #${item.category_id}`,
    stockValue: item.price * item.stock
  }))
)

const totalGoods = computed(() => goodsList.value.length)
const totalCategories = computed(() => categoryList.value.length)
const totalStock = computed(() => goodsList.value.reduce((sum, item) => sum + item.stock, 0))
const totalStockValue = computed(() =>
  goodsList.value.reduce((sum, item) => sum + item.price * item.stock, 0)
)
const averagePrice = computed(() =>
  totalGoods.value
    ? Math.round(goodsList.value.reduce((sum, item) => sum + item.price, 0) / totalGoods.value)
    : 0
)
const averageStock = computed(() =>
  totalGoods.value ? Math.round(totalStock.value / totalGoods.value) : 0
)

const lowStockProducts = computed(() =>
  [...goodsWithCategory.value]
    .filter((item) => item.stock <= 30)
    .sort((a, b) => a.stock - b.stock || b.stockValue - a.stockValue)
)

const topValueProducts = computed(() =>
  [...goodsWithCategory.value].sort((a, b) => b.stockValue - a.stockValue).slice(0, 5)
)

const categoryStats = computed(() => {
  const statMap = new Map<
    number,
    { id: number; name: string; goodsCount: number; stockTotal: number; stockValue: number }
  >()

  goodsWithCategory.value.forEach((item) => {
    const current = statMap.get(item.category_id) ?? {
      id: item.category_id,
      name: item.categoryName,
      goodsCount: 0,
      stockTotal: 0,
      stockValue: 0
    }

    current.goodsCount += 1
    current.stockTotal += item.stock
    current.stockValue += item.stockValue
    statMap.set(item.category_id, current)
  })

  return [...statMap.values()].sort((a, b) => b.stockValue - a.stockValue || b.goodsCount - a.goodsCount)
})

const priceBands = computed(() => {
  const bands = [
    { label: "0 - 1999", min: 0, max: 1999, count: 0 },
    { label: "2000 - 4999", min: 2000, max: 4999, count: 0 },
    { label: "5000 - 9999", min: 5000, max: 9999, count: 0 },
    { label: "10000+", min: 10000, max: Number.POSITIVE_INFINITY, count: 0 }
  ]

  goodsList.value.forEach((item) => {
    const target = bands.find((band) => item.price >= band.min && item.price <= band.max)
    if (target) target.count += 1
  })

  return bands
})

const stockHealth = computed(() => [
  {
    label: "紧张",
    count: goodsList.value.filter((item) => item.stock <= 30).length,
    color: "#f56c6c"
  },
  {
    label: "稳定",
    count: goodsList.value.filter((item) => item.stock > 30 && item.stock <= 80).length,
    color: "#e6a23c"
  },
  {
    label: "充足",
    count: goodsList.value.filter((item) => item.stock > 80).length,
    color: "#67c23a"
  }
])

const unmatchedCategoryCount = computed(
  () => goodsWithCategory.value.filter((item) => !categoryMap.value.has(item.category_id)).length
)

const overviewCards = computed(() => [
  {
    label: "商品总数",
    value: `${totalGoods.value}`,
    hint: `当前关联 ${totalCategories.value} 个分类`,
    tag: "实时汇总",
    tagType: "primary" as const
  },
  {
    label: "总库存",
    value: `${totalStock.value}`,
    hint: `平均每件商品库存 ${averageStock.value}`,
    tag: "库存规模",
    tagType: "success" as const
  },
  {
    label: "库存货值",
    value: formatCurrency(totalStockValue.value),
    hint: "按 price × stock 计算",
    tag: "核心指标",
    tagType: "warning" as const
  },
  {
    label: "平均单价",
    value: formatCurrency(averagePrice.value),
    hint: "基于全部商品价格均值",
    tag: "价格概览",
    tagType: "info" as const
  },
  {
    label: "低库存商品",
    value: `${lowStockProducts.value.length}`,
    hint: "库存小于等于 30 的商品数",
    tag: "补货提醒",
    tagType: "danger" as const
  },
  {
    label: "分类缺口",
    value: `${unmatchedCategoryCount.value}`,
    hint: "商品分类未在分类夹具中匹配到",
    tag: "数据校验",
    tagType: unmatchedCategoryCount.value ? ("danger" as const) : ("success" as const)
  }
])

const categoryPieRef = ref<HTMLDivElement>()
const categoryBarRef = ref<HTMLDivElement>()
const stockPieRef = ref<HTMLDivElement>()
const priceBarRef = ref<HTMLDivElement>()

let categoryPieChart: ECharts | null = null
let categoryBarChart: ECharts | null = null
let stockPieChart: ECharts | null = null
let priceBarChart: ECharts | null = null

const categoryPieOption = computed<EChartsCoreOption>(() => ({
  color: ["#1768ac", "#36a2eb", "#5bc0eb", "#7dd3fc", "#4f46e5", "#0f766e"],
  tooltip: {
    trigger: "item",
    formatter: "{b}<br/>商品数: {c} ({d}%)"
  },
  legend: {
    bottom: 0,
    icon: "circle"
  },
  series: [
    {
      type: "pie",
      radius: ["40%", "68%"],
      center: ["50%", "44%"],
      avoidLabelOverlap: true,
      label: {
        formatter: "{b}\n{c} 件"
      },
      data: categoryStats.value.map((item) => ({
        name: item.name,
        value: item.goodsCount
      }))
    }
  ]
}))

const categoryBarOption = computed<EChartsCoreOption>(() => ({
  color: ["#1768ac"],
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: Array<{ axisValue: string; value: number }>) => {
      const current = params[0]
      if (!current) return ""
      return `${current.axisValue}<br/>库存货值: ${formatCurrency(current.value)}`
    }
  },
  grid: {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
    containLabel: true
  },
  xAxis: {
    type: "value",
    axisLabel: {
      formatter: (value: number) => `¥${Math.round(value / 1000)}k`
    }
  },
  yAxis: {
    type: "category",
    data: categoryStats.value.map((item) => item.name),
    axisTick: { show: false }
  },
  series: [
    {
      type: "bar",
      barWidth: 18,
      data: categoryStats.value.map((item) => item.stockValue),
      itemStyle: {
        borderRadius: [0, 10, 10, 0]
      }
    }
  ]
}))

const stockPieOption = computed<EChartsCoreOption>(() => ({
  color: stockHealth.value.map((item) => item.color),
  tooltip: {
    trigger: "item",
    formatter: "{b}<br/>商品数: {c} ({d}%)"
  },
  legend: {
    bottom: 0,
    icon: "circle"
  },
  series: [
    {
      type: "pie",
      radius: ["38%", "66%"],
      center: ["50%", "42%"],
      label: {
        formatter: "{b}\n{c}"
      },
      data: stockHealth.value.map((item) => ({
        name: item.label,
        value: item.count
      }))
    }
  ]
}))

const priceBarOption = computed<EChartsCoreOption>(() => ({
  color: ["#36a2eb"],
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" }
  },
  grid: {
    left: 12,
    right: 12,
    top: 16,
    bottom: 24,
    containLabel: true
  },
  xAxis: {
    type: "category",
    data: priceBands.value.map((item) => item.label),
    axisTick: { show: false }
  },
  yAxis: {
    type: "value",
    minInterval: 1
  },
  series: [
    {
      type: "bar",
      data: priceBands.value.map((item) => item.count),
      barWidth: 28,
      itemStyle: {
        borderRadius: [10, 10, 0, 0]
      },
      label: {
        show: true,
        position: "top"
      }
    }
  ]
}))

function formatCurrency(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`
}

function initCharts() {
  if (categoryPieRef.value) categoryPieChart = echarts.init(categoryPieRef.value)
  if (categoryBarRef.value) categoryBarChart = echarts.init(categoryBarRef.value)
  if (stockPieRef.value) stockPieChart = echarts.init(stockPieRef.value)
  if (priceBarRef.value) priceBarChart = echarts.init(priceBarRef.value)
  renderCharts()
}

function renderCharts() {
  categoryPieChart?.setOption(categoryPieOption.value, true)
  categoryBarChart?.setOption(categoryBarOption.value, true)
  stockPieChart?.setOption(stockPieOption.value, true)
  priceBarChart?.setOption(priceBarOption.value, true)
}

function resizeCharts() {
  categoryPieChart?.resize()
  categoryBarChart?.resize()
  stockPieChart?.resize()
  priceBarChart?.resize()
}

function disposeCharts() {
  categoryPieChart?.dispose()
  categoryBarChart?.dispose()
  stockPieChart?.dispose()
  priceBarChart?.dispose()
  categoryPieChart = null
  categoryBarChart = null
  stockPieChart = null
  priceBarChart = null
}

watch([categoryPieOption, categoryBarOption, stockPieOption, priceBarOption], async () => {
  await nextTick()
  renderCharts()
})

onMounted(async () => {
  await nextTick()
  initCharts()
  window.addEventListener("resize", resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts)
  disposeCharts()
})
</script>

<style scoped lang="less">
.product-dashboard {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background:
    radial-gradient(circle at top left, rgba(23, 104, 172, 0.2), transparent 24%),
    radial-gradient(circle at right bottom, rgba(54, 162, 235, 0.16), transparent 26%),
    linear-gradient(180deg, #f4f9ff 0%, #eef4f8 100%);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  padding: 28px 30px;
  border: 1px solid rgba(23, 104, 172, 0.1);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 50px rgba(16, 42, 67, 0.08);
}

.hero-copy {
  max-width: 760px;
}

.hero-eyebrow {
  margin: 0 0 8px;
  color: #1768ac;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-title {
  margin: 0;
  color: #102a43;
  font-size: 32px;
  line-height: 1.2;
}

.hero-description {
  margin: 14px 0 0;
  color: #486581;
  font-size: 14px;
  line-height: 1.8;
}

.hero-summary {
  min-width: 240px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(135deg, #1768ac 0%, #36a2eb 100%);
  color: #fff;
}

.hero-summary__label {
  font-size: 13px;
  opacity: 0.82;
}

.hero-summary__value {
  margin: 10px 0 6px;
  font-size: 44px;
  line-height: 1;
}

.hero-summary__hint {
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card,
.panel-card {
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 40px rgba(16, 42, 67, 0.06);
}

.stat-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.stat-card__label {
  color: #7b8794;
  font-size: 13px;
}

.stat-card__value {
  display: block;
  margin: 14px 0 10px;
  color: #102a43;
  font-size: 34px;
  line-height: 1.1;
}

.stat-card__hint {
  margin: 0;
  color: #486581;
  font-size: 13px;
}

.chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.panel-card--wide {
  grid-column: span 2;
}

.panel-header {
  h3 {
    margin: 0 0 4px;
    color: #102a43;
    font-size: 20px;
  }

  p {
    margin: 0;
    color: #7b8794;
    font-size: 13px;
  }
}

.chart-canvas {
  width: 100%;
  height: 360px;
}

.chart-canvas--small {
  height: 320px;
}

.product-list,
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.product-item,
.alert-item {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid #d9e2ec;
  border-radius: 18px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
}

.product-item__cover {
  width: 72px;
  height: 72px;
  overflow: hidden;
  border-radius: 16px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

.product-item__content,
.alert-item__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;

  strong {
    color: #102a43;
    font-size: 15px;
  }

  span,
  p {
    margin: 0;
    color: #7b8794;
    font-size: 13px;
    line-height: 1.6;
  }
}

.alert-item {
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 1080px) {
  .stats-grid,
  .chart-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .panel-card--wide {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .hero-panel,
  .product-item,
  .alert-item {
    flex-direction: column;
  }

  .hero-summary {
    min-width: auto;
  }

  .chart-canvas,
  .chart-canvas--small {
    height: 300px;
  }
}
</style>
