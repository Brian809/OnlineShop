<template>
  <div class="admin-layout">
    <slide-navigation-bar />
    <div class="admin-content">
      <div class="product-management">
        <div class="header">
          <h1>商品管理</h1>
          <div class="header-actions">
            <el-button type="success" @click="openAddProductDialog">添加商品</el-button>
            <el-button type="primary" @click="fetchProducts">刷新列表</el-button>
          </div>
        </div>

        <el-table :data="products" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="商品名称" width="200" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" />
          <el-table-column prop="rating" label="评分" width="100">
            <template #default="{ row }">
              <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && products.length === 0" description="暂无商品数据" />
      </div>
    </div>

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="productDialogVisible"
      :title="isEditMode ? '编辑商品' : '添加商品'"
      width="600px"
      @close="resetProductForm"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>

        <el-form-item label="商品分类" prop="category">
          <el-select v-model="productForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="电子产品" value="电子产品" />
            <el-option label="服装" value="服装" />
            <el-option label="食品" value="食品" />
            <el-option label="家居" value="家居" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="库存数量" prop="stock">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="商品评分" prop="rating">
          <el-rate v-model="productForm.rating" allow-half />
        </el-form-item>

        <el-form-item label="商品图片" prop="image">
          <ImageUpload v-model="productForm.image" />
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProduct" :loading="productLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, post, patch, del } from '@/utils/api'
import SlideNavigationBar from '@/components/admin/slideNavigationBar.vue'
import ImageUpload from '@/components/ImageUpload.vue'

const products = ref([])
const loading = ref(false)

// 商品对话框相关
const productDialogVisible = ref(false)
const isEditMode = ref(false)
const productLoading = ref(false)
const productFormRef = ref(null)
const currentProductId = ref(null)

const productForm = ref({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  rating: 0,
  image: '',
  description: ''
})

const productRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ]
}

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const data = await get('/products')
    products.value = data || []
  } catch (error) {
    ElMessage.error(error.message || '获取商品列表失败')
    console.error('获取商品列表错误:', error)
  } finally {
    loading.value = false
  }
}

// 打开添加商品对话框
const openAddProductDialog = () => {
  isEditMode.value = false
  currentProductId.value = null
  productDialogVisible.value = true
}

// 编辑商品
const handleEdit = (product) => {
  isEditMode.value = true
  currentProductId.value = product.id
  productForm.value = {
    name: product.name,
    category: product.category,
    price: parseFloat(product.price),
    stock: product.stock,
    rating: product.rating,
    image: product.image || '',
    description: product.description || ''
  }
  productDialogVisible.value = true
}

// 删除商品
const handleDelete = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${product.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await del(`/products/${product.id}`)
    ElMessage.success('删除成功')
    await fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
      console.error('删除商品错误:', error)
    }
  }
}

// 保存商品
const handleSaveProduct = async () => {
  if (!productFormRef.value) return

  try {
    await productFormRef.value.validate()

    productLoading.value = true

    if (isEditMode.value) {
      // 编辑模式
      await patch(`/products/${currentProductId.value}`, productForm.value)
      ElMessage.success('商品更新成功')
    } else {
      // 添加模式
      await post('/products', productForm.value)
      ElMessage.success('商品创建成功')
    }

    productDialogVisible.value = false
    resetProductForm()
    await fetchProducts()
  } catch (error) {
    if (error && typeof error === 'object' && error.errorFields) {
      console.log('表单验证未通过')
    } else {
      ElMessage.error(error.message || (isEditMode.value ? '更新商品失败' : '创建商品失败'))
      console.error('保存商品错误:', error)
    }
  } finally {
    productLoading.value = false
  }
}

// 重置商品表单
const resetProductForm = () => {
  productForm.value = {
    name: '',
    category: '',
    price: 0,
    stock: 0,
    rating: 0,
    image: '',
    description: ''
  }
  productFormRef.value?.clearValidate()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时获取商品列表
onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto;
}

.product-management {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>