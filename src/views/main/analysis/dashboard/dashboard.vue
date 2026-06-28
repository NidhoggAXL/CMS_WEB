<template>
  <div v-loading="loading" class="product-dashboard">
    <section class="hero-panel">
      <div class="hero-copy">
        <h2 class="hero-title">商品统计可视化看板</h2>
        <p class="hero-subtitle">数据来自商品数据库，共 {{ totalGoods }} 款 · {{ leafCategoryCount }} 个在售分类</p>
        <div class="hero-tags">
          <el-tag v-for="item in parentCategoryStats" :key="item.id" effect="plain" round>
            {{ item.name }} · {{ item.goodsCount }} 款
          </el-tag>
        </div>
      </div>

      <div class="hero-metrics">
        <div class="hero-metric hero-metric--primary">
          <span class="hero-metric__label">库存总货值</span>
          <strong class="hero-metric__value">{{ formatCurrency(totalStockValue) }}</strong>
          <span class="hero-metric__hint">按单价×库存量汇总</span>
        </div>
        <div class="hero-metric">
          <span class="hero-metric__label">低库存预警</span>
          <strong class="hero-metric__value">{{ lowStockProducts.length }}</strong>
          <span class="hero-metric__hint">库存 ≤ 30 的商品</span>
        </div>
        <div class="hero-metric">
          <span class="hero-metric__label">最高货值品类</span>
          <strong class="hero-metric__value hero-metric__value--sm">{{ topCategoryName }}</strong>
          <span class="hero-metric__hint">{{ formatCurrency(topCategoryValue) }}</span>
        </div>
        <el-button :loading="loading" @click="refreshDashboard">刷新数据</el-button>
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
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>顶级分类货值</h3>
              <p>数码电子与家用电器货值、商品款数对比</p>
            </div>
          </div>
        </template>
        <div ref="parentBarRef" class="chart-canvas chart-canvas--small"></div>
      </el-card>

      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>库存健康度</h3>
              <p>紧张 ≤30 · 稳定 31-80 · 充足 &gt;80</p>
            </div>
          </div>
        </template>
        <div ref="stockPieRef" class="chart-canvas chart-canvas--small"></div>
      </el-card>

      <el-card class="panel-card panel-card--wide" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>子分类商品分布</h3>
              <p>各子分类商品款数占比（共 {{ categoryStats.length }} 类）</p>
            </div>
          </div>
        </template>
        <div ref="categoryPieRef" class="chart-canvas"></div>
      </el-card>

      <el-card class="panel-card panel-card--wide" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>分类库存货值排行</h3>
              <p>按分类库存货值降序，识别核心商品线</p>
            </div>
          </div>
        </template>
        <div ref="categoryBarRef" class="chart-canvas"></div>
      </el-card>

      <el-card class="panel-card panel-card--wide" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>价格区间分布</h3>
              <p>当前数据库商品价格带结构（均价 {{ formatCurrency(averagePrice) }}）</p>
            </div>
          </div>
        </template>
        <div ref="priceBarRef" class="chart-canvas chart-canvas--small"></div>
      </el-card>
    </section>

    <section class="table-section">
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>分类数据明细</h3>
              <p>基于数据库实时聚合的分类统计表</p>
            </div>
          </div>
        </template>
        <el-table :data="categoryStats" stripe style="width: 100%">
          <el-table-column prop="name" label="分类名称" min-width="120" />
          <el-table-column prop="parentName" label="所属大类" width="120" />
          <el-table-column prop="goodsCount" label="商品款数" width="100" align="center" />
          <el-table-column prop="stockTotal" label="总库存量" width="100" align="center" />
          <el-table-column label="平均单价" width="120" align="right">
            <template #default="{ row }">{{ formatCurrency(row.avgPrice) }}</template>
          </el-table-column>
          <el-table-column label="库存货值" min-width="130" align="right">
            <template #default="{ row }">
              <strong>{{ formatCurrency(row.stockValue) }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="货值占比" width="160">
            <template #default="{ row }">
              <el-progress
                :percentage="row.valuePercent"
                :stroke-width="10"
                :color="row.valuePercent >= 20 ? '#1768ac' : '#36a2eb'"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </section>

    <section class="bottom-grid">
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>货值前五名</h3>
              <p>按单品库存货值降序排列</p>
            </div>
          </div>
        </template>

        <div class="product-list">
          <div v-for="(item, index) in topValueProducts" :key="item.id" class="product-item">
            <span class="product-rank">{{ index + 1 }}</span>
            <div class="product-item__cover">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="product-item__content">
              <strong>{{ item.name }}</strong>
              <span>{{ item.categoryName }} · {{ item.parentCategoryName }}</span>
              <p>单价 {{ formatCurrency(Number(item.price)) }} · 库存量 {{ item.stock }} 件</p>
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
              <p>共 {{ lowStockProducts.length }} 款需关注补货</p>
            </div>
          </div>
        </template>

        <div v-if="lowStockProducts.length" class="alert-list">
          <div v-for="item in lowStockProducts.slice(0, 8)" :key="item.id" class="alert-item">
            <div class="alert-item__content">
              <strong>{{ item.name }}</strong>
              <span>{{ item.categoryName }} · 货值 {{ formatCurrency(item.stockValue) }}</span>
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
import { getAllGoodsData } from "@/servers/main/goods/index"
import { getCategoryListData } from "@/servers/main/category/index"

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
  price: number | string
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
  parentCategoryName: string
  stockValue: number
  unitPrice: number
}

interface CategoryStatRow {
  id: number
  name: string
  parentName: string
  goodsCount: number
  stockTotal: number
  stockValue: number
  avgPrice: number
  valuePercent: number
}

const loading = ref(false)
const goodsList = ref<GoodsItem[]>([])
const categoryList = ref<CategoryItem[]>([])

const categoryMap = computed(() => {
  const map = new Map<number, CategoryItem>()
  categoryList.value.forEach((item) => map.set(item.id, item))
  return map
})

function getRootCategory(categoryId: number) {
  let current = categoryMap.value.get(categoryId)
  if (!current) return { id: categoryId, name: "未分类" }
  while (current.parent_id !== 0) {
    const parent = categoryMap.value.get(current.parent_id)
    if (!parent) break
    current = parent
  }
  return { id: current.id, name: current.name }
}

const goodsWithCategory = computed<GoodsWithCategory[]>(() =>
  goodsList.value.map((item) => {
    const category = categoryMap.value.get(item.category_id)
    const root = getRootCategory(item.category_id)
    const unitPrice = Number(item.price)
    return {
      ...item,
      categoryName: category?.name ?? `未匹配 #${item.category_id}`,
      parentCategoryName: root.name,
      unitPrice,
      stockValue: unitPrice * item.stock
    }
  })
)

const totalGoods = computed(() => goodsList.value.length)
const leafCategoryCount = computed(() => categoryStats.value.length)
const totalStock = computed(() => goodsList.value.reduce((sum, item) => sum + item.stock, 0))
const totalStockValue = computed(() =>
  goodsWithCategory.value.reduce((sum, item) => sum + item.stockValue, 0)
)
const averagePrice = computed(() =>
  totalGoods.value
    ? Math.round(goodsWithCategory.value.reduce((sum, item) => sum + item.unitPrice, 0) / totalGoods.value)
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

const categoryStats = computed<CategoryStatRow[]>(() => {
  const statMap = new Map<
    number,
    { id: number; name: string; parentName: string; goodsCount: number; stockTotal: number; stockValue: number; priceSum: number }
  >()

  goodsWithCategory.value.forEach((item) => {
    const root = getRootCategory(item.category_id)
    const current = statMap.get(item.category_id) ?? {
      id: item.category_id,
      name: item.categoryName,
      parentName: root.name,
      goodsCount: 0,
      stockTotal: 0,
      stockValue: 0,
      priceSum: 0
    }
    current.goodsCount += 1
    current.stockTotal += item.stock
    current.stockValue += item.stockValue
    current.priceSum += item.unitPrice
    statMap.set(item.category_id, current)
  })

  const rows = [...statMap.values()]
    .map((item) => ({
      id: item.id,
      name: item.name,
      parentName: item.parentName,
      goodsCount: item.goodsCount,
      stockTotal: item.stockTotal,
      stockValue: item.stockValue,
      avgPrice: item.goodsCount ? Math.round(item.priceSum / item.goodsCount) : 0,
      valuePercent: 0
    }))
    .sort((a, b) => b.stockValue - a.stockValue)

  const total = totalStockValue.value || 1
  rows.forEach((row) => {
    row.valuePercent = Math.round((row.stockValue / total) * 100)
  })
  return rows
})

const parentCategoryStats = computed(() => {
  const statMap = new Map<number, { id: number; name: string; goodsCount: number; stockValue: number }>()

  goodsWithCategory.value.forEach((item) => {
    const root = getRootCategory(item.category_id)
    const current = statMap.get(root.id) ?? { id: root.id, name: root.name, goodsCount: 0, stockValue: 0 }
    current.goodsCount += 1
    current.stockValue += item.stockValue
    statMap.set(root.id, current)
  })

  return [...statMap.values()].sort((a, b) => b.stockValue - a.stockValue)
})

const topCategoryName = computed(() => categoryStats.value[0]?.name ?? "-")
const topCategoryValue = computed(() => categoryStats.value[0]?.stockValue ?? 0)

const priceBands = computed(() => {
  const bands = [
    { label: "0-999", min: 0, max: 999, count: 0 },
    { label: "1000-2999", min: 1000, max: 2999, count: 0 },
    { label: "3000-5999", min: 3000, max: 5999, count: 0 },
    { label: "6000-9999", min: 6000, max: 9999, count: 0 },
    { label: "10000+", min: 10000, max: Number.POSITIVE_INFINITY, count: 0 }
  ]

  goodsWithCategory.value.forEach((item) => {
    const target = bands.find((band) => item.unitPrice >= band.min && item.unitPrice <= band.max)
    if (target) target.count += 1
  })

  return bands
})

const stockHealth = computed(() => [
  { label: "紧张", count: goodsWithCategory.value.filter((item) => item.stock <= 30).length, color: "#f56c6c" },
  { label: "稳定", count: goodsWithCategory.value.filter((item) => item.stock > 30 && item.stock <= 80).length, color: "#e6a23c" },
  { label: "充足", count: goodsWithCategory.value.filter((item) => item.stock > 80).length, color: "#67c23a" }
])

const overviewCards = computed(() => [
  {
    label: "商品款数",
    value: `${totalGoods.value}`,
    hint: `覆盖 ${leafCategoryCount.value} 个子分类`,
    tag: "实时",
    tagType: "primary" as const
  },
  {
    label: "总库存量",
    value: `${totalStock.value.toLocaleString("zh-CN")}`,
    hint: `单款平均库存 ${averageStock.value} 件`,
    tag: "库存",
    tagType: "success" as const
  },
  {
    label: "库存货值",
    value: formatCurrency(totalStockValue.value),
    hint: "全库单价×库存量",
    tag: "核心",
    tagType: "warning" as const
  },
  {
    label: "平均单价",
    value: formatCurrency(averagePrice.value),
    hint: `最高单价 ${formatCurrency(maxPrice.value)}`,
    tag: "价格",
    tagType: "info" as const
  },
  {
    label: "低库存商品",
    value: `${lowStockProducts.value.length}`,
    hint: "库存 ≤ 30 件需补货",
    tag: "预警",
    tagType: "danger" as const
  },
  {
    label: "顶级大类",
    value: `${parentCategoryStats.value.length}`,
    hint: parentCategoryStats.value.map((item) => item.name).join(" / ") || "-",
    tag: "结构",
    tagType: "success" as const
  }
])

const maxPrice = computed(() =>
  goodsWithCategory.value.length
    ? Math.max(...goodsWithCategory.value.map((item) => item.unitPrice))
    : 0
)

const categoryPieRef = ref<HTMLDivElement>()
const categoryBarRef = ref<HTMLDivElement>()
const stockPieRef = ref<HTMLDivElement>()
const priceBarRef = ref<HTMLDivElement>()
const parentBarRef = ref<HTMLDivElement>()

let categoryPieChart: ECharts | null = null
let categoryBarChart: ECharts | null = null
let stockPieChart: ECharts | null = null
let priceBarChart: ECharts | null = null
let parentBarChart: ECharts | null = null

const CHART_COLORS = [
  "#1768ac", "#36a2eb", "#5bc0eb", "#4f46e5", "#0f766e",
  "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#65a30d",
  "#ca8a04", "#dc2626", "#9333ea"
]

const parentBarOption = computed<EChartsCoreOption>(() => ({
  color: ["#1768ac", "#36a2eb"],
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: Array<{ seriesName: string; name: string; value: number }>) => {
      const first = params[0]
      if (!first) return ""
      const lines = params.map((p) => `${p.seriesName}: ${p.seriesName === "库存货值" ? formatCurrency(p.value) : p.value}`)
      return `${first.name}<br/>${lines.join("<br/>")}`
    }
  },
  legend: { top: 0, icon: "circle" },
  grid: { left: 20, right: 20, top: 40, bottom: 20, containLabel: true },
  xAxis: { type: "category", data: parentCategoryStats.value.map((item) => item.name), axisTick: { show: false } },
  yAxis: [
    { type: "value", name: "货值", axisLabel: { formatter: (v: number) => `¥${Math.round(v / 10000)}万` } },
    { type: "value", name: "款数", minInterval: 1, splitLine: { show: false } }
  ],
  series: [
    {
      name: "库存货值",
      type: "bar",
      data: parentCategoryStats.value.map((item) => item.stockValue),
      barWidth: 36,
      itemStyle: { borderRadius: [10, 10, 0, 0] }
    },
    {
      name: "商品款数",
      type: "bar",
      yAxisIndex: 1,
      data: parentCategoryStats.value.map((item) => item.goodsCount),
      barWidth: 36,
      itemStyle: { borderRadius: [10, 10, 0, 0], color: "#7dd3fc" }
    }
  ]
}))

const categoryPieOption = computed<EChartsCoreOption>(() => ({
  color: CHART_COLORS,
  tooltip: { trigger: "item", formatter: "{b}<br/>商品款数：{c}（{d}%）" },
  legend: { type: "scroll", bottom: 0, icon: "circle" },
  series: [{
    type: "pie",
    radius: ["38%", "65%"],
    center: ["50%", "42%"],
    avoidLabelOverlap: true,
    label: { formatter: "{b}\n{c}款" },
    data: categoryStats.value.map((item) => ({ name: item.name, value: item.goodsCount }))
  }]
}))

const categoryBarOption = computed<EChartsCoreOption>(() => ({
  color: ["#1768ac"],
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: Array<{ axisValue: string; value: number }>) => {
      const current = params[0]
      if (!current) return ""
      const stat = categoryStats.value.find((item) => item.name === current.axisValue)
      return `${current.axisValue}<br/>货值：${formatCurrency(current.value)}<br/>商品款数：${stat?.goodsCount ?? 0} 款 · 库存量：${stat?.stockTotal ?? 0} 件`
    }
  },
  grid: { left: 16, right: 24, top: 16, bottom: 16, containLabel: true },
  xAxis: { type: "value", axisLabel: { formatter: (v: number) => `¥${Math.round(v / 10000)}万` } },
  yAxis: { type: "category", data: [...categoryStats.value].reverse().map((item) => item.name), axisTick: { show: false } },
  series: [{
    type: "bar",
    barWidth: 14,
    data: [...categoryStats.value].reverse().map((item) => item.stockValue),
    itemStyle: { borderRadius: [0, 8, 8, 0] }
  }]
}))

const stockPieOption = computed<EChartsCoreOption>(() => ({
  color: stockHealth.value.map((item) => item.color),
  tooltip: { trigger: "item", formatter: "{b}<br/>{c} 款（{d}%）" },
  legend: { bottom: 0, icon: "circle" },
  series: [{
    type: "pie",
    radius: ["38%", "66%"],
    center: ["50%", "42%"],
    label: { formatter: "{b}\n{c}" },
    data: stockHealth.value.map((item) => ({ name: item.label, value: item.count }))
  }]
}))

const priceBarOption = computed<EChartsCoreOption>(() => ({
  color: ["#36a2eb"],
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { left: 12, right: 12, top: 16, bottom: 24, containLabel: true },
  xAxis: { type: "category", data: priceBands.value.map((item) => item.label), axisTick: { show: false } },
  yAxis: { type: "value", minInterval: 1, name: "商品款数（款）" },
  series: [{
    type: "bar",
    data: priceBands.value.map((item) => item.count),
    barWidth: 32,
    itemStyle: { borderRadius: [10, 10, 0, 0] },
    label: { show: true, position: "top" }
  }]
}))

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`
}

async function loadDashboardData() {
  loading.value = true
  try {
    const [goodsResult, categoryResult] = await Promise.all([getAllGoodsData(), getCategoryListData()])
    goodsList.value = goodsResult.data.data.list
    categoryList.value = categoryResult.data.data.list
  } finally {
    loading.value = false
  }
}

async function refreshDashboard() {
  await loadDashboardData()
  await nextTick()
  renderCharts()
}

function initCharts() {
  if (categoryPieRef.value) categoryPieChart = echarts.init(categoryPieRef.value)
  if (categoryBarRef.value) categoryBarChart = echarts.init(categoryBarRef.value)
  if (stockPieRef.value) stockPieChart = echarts.init(stockPieRef.value)
  if (priceBarRef.value) priceBarChart = echarts.init(priceBarRef.value)
  if (parentBarRef.value) parentBarChart = echarts.init(parentBarRef.value)
  renderCharts()
}

function renderCharts() {
  categoryPieChart?.setOption(categoryPieOption.value, true)
  categoryBarChart?.setOption(categoryBarOption.value, true)
  stockPieChart?.setOption(stockPieOption.value, true)
  priceBarChart?.setOption(priceBarOption.value, true)
  parentBarChart?.setOption(parentBarOption.value, true)
}

function resizeCharts() {
  categoryPieChart?.resize()
  categoryBarChart?.resize()
  stockPieChart?.resize()
  priceBarChart?.resize()
  parentBarChart?.resize()
}

function disposeCharts() {
  categoryPieChart?.dispose()
  categoryBarChart?.dispose()
  stockPieChart?.dispose()
  priceBarChart?.dispose()
  parentBarChart?.dispose()
  categoryPieChart = null
  categoryBarChart = null
  stockPieChart = null
  priceBarChart = null
  parentBarChart = null
}

watch([categoryPieOption, categoryBarOption, stockPieOption, priceBarOption, parentBarOption], async () => {
  await nextTick()
  renderCharts()
})

onMounted(async () => {
  await loadDashboardData()
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

.hero-title {
  margin: 0;
  color: #102a43;
  font-size: 32px;
  line-height: 1.2;
}

.hero-subtitle {
  margin: 10px 0 0;
  color: #486581;
  font-size: 14px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.hero-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 280px;
}

.hero-metric {
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #d9e2ec;
}

.hero-metric--primary {
  background: linear-gradient(135deg, #1768ac 0%, #36a2eb 100%);
  border: none;
  color: #fff;

  .hero-metric__label,
  .hero-metric__hint {
    color: rgba(255, 255, 255, 0.85);
  }

  .hero-metric__value {
    color: #fff;
  }
}

.hero-metric__label {
  display: block;
  color: #7b8794;
  font-size: 12px;
}

.hero-metric__value {
  display: block;
  margin: 6px 0 4px;
  color: #102a43;
  font-size: 28px;
  line-height: 1.1;
}

.hero-metric__value--sm {
  font-size: 18px;
}

.hero-metric__hint {
  color: #7b8794;
  font-size: 12px;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.table-section {
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
  height: 300px;
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

.product-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1768ac;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  align-self: center;
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

  .hero-panel {
    flex-direction: column;
  }

  .hero-metrics {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .product-item,
  .alert-item {
    flex-direction: column;
  }

  .chart-canvas,
  .chart-canvas--small {
    height: 280px;
  }
}
</style>
