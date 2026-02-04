<template>
  <Navbar />
  <div class="profile-page">
    <div class="container">
      <el-tabs v-model="activeTab" type="card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
              </div>
            </template>
            
            <el-form :model="userInfo" label-width="100px" style="max-width: 600px">
              <el-form-item label="用户名">
                <el-input v-model="userInfo.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="姓">
                <el-input v-model="userInfo.firstName" placeholder="请输入姓" />
              </el-form-item>
              <el-form-item label="名">
                <el-input v-model="userInfo.lastName" placeholder="请输入名" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="地址">
                <el-input v-model="userInfo.address" type="textarea" :rows="3" placeholder="请输入地址" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUpdateInfo" :loading="loading">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-card class="password-card">
            <template #header>
              <div class="card-header">
                <span>修改密码</span>
              </div>
            </template>
            
            <el-form :model="passwordForm" label-width="100px" style="max-width: 600px">
              <el-form-item label="旧密码">
                <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 地址管理 -->
        <el-tab-pane label="地址管理" name="address">
          <el-card class="address-card">
            <template #header>
              <div class="card-header">
                <span>收货地址</span>
                <el-button type="primary" size="small" @click="showAddressDialog()">
                  添加地址
                </el-button>
              </div>
            </template>

            <div v-if="loading" class="loading">
              加载中...
            </div>

            <el-empty v-else-if="addresses.length === 0" description="暂无地址" />

            <div v-else class="address-list">
              <div v-for="address in addresses" :key="address.id" class="address-item">
                <div class="address-content">
                  <div class="address-header">
                    <span class="receiver-name">{{ address.fullName }}</span>
                    <span class="receiver-phone">{{ address.phone }}</span>
                    <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
                  </div>
                  <div class="address-detail">
                    {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}
                  </div>
                  <div class="address-footer">
                    <el-button link type="primary" size="small" @click="showAddressDialog(address)">
                      编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click="handleDeleteAddress(address.id)">
                      删除
                    </el-button>
                    <el-button 
                      v-if="!address.isDefault" 
                      link 
                      type="warning" 
                      size="small" 
                      @click="handleSetDefault(address.id)"
                    >
                      设为默认
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 地址对话框 -->
    <el-dialog v-model="addressDialogVisible" :title="editingAddress ? '编辑地址' : '添加地址'" width="500px">
      <el-form :model="addressForm" label-width="80px" ref="addressFormRef">
        <el-form-item label="收货人" required>
          <el-input v-model="addressForm.fullName" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" required>
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省份" required>
          <el-input v-model="addressForm.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" required>
          <el-input v-model="addressForm.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="区县" required>
          <el-input v-model="addressForm.district" placeholder="请输入区县" />
        </el-form-item>
        <el-form-item label="详细地址" required>
          <el-input v-model="addressForm.detailAddress" type="textarea" :rows="2" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="邮政编码">
          <el-input v-model="addressForm.postalCode" placeholder="请输入邮政编码" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAddress" :loading="addressLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { get, patch, post, put, del, useUserStore } from '@/utils/api';
import { useRouter } from 'vue-router';
import Navbar from '@/components/navbar.vue';

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref('basic');
const loading = ref(false);
const passwordLoading = ref(false);
const addressLoading = ref(false);

// 用户信息
const userInfo = ref({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: ''
});

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: ''
});

// 地址列表
const addresses = ref([]);
const addressDialogVisible = ref(false);
const editingAddress = ref(null);

// 地址表单
const addressForm = ref({
  fullName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  postalCode: '',
  isDefault: false
});

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const data = await get('/users/me');
    userInfo.value = data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
  }
};

// 更新用户信息
const handleUpdateInfo = async () => {
  loading.value = true;
  try {
    await patch('/users/me', userInfo.value);
    ElMessage.success('用户信息更新成功');
    await loadUserInfo();
  } catch (error) {
    console.error('更新用户信息失败:', error);
    ElMessage.error(error.message || '更新用户信息失败');
  } finally {
    loading.value = false;
  }
};

// 修改密码
const handleChangePassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.warning('请输入旧密码和新密码');
    return;
  }

  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.warning('新密码长度至少为6位');
    return;
  }

  passwordLoading.value = true;
  try {
    await patch('/users/me/password', passwordForm.value);
    ElMessage.success('密码修改成功');
    passwordForm.value = {
      oldPassword: '',
      newPassword: ''
    };
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error(error.message || '修改密码失败');
  } finally {
    passwordLoading.value = false;
  }
};

// 加载地址列表
const loadAddresses = async () => {
  loading.value = true;
  try {
    const data = await get('/users/me/addresses');
    addresses.value = data;
  } catch (error) {
    console.error('获取地址列表失败:', error);
    ElMessage.error('获取地址列表失败');
  } finally {
    loading.value = false;
  }
};

// 显示地址对话框
const showAddressDialog = (address = null) => {
  if (address) {
    editingAddress.value = address;
    addressForm.value = {
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detailAddress: address.detailAddress,
      postalCode: address.postalCode || '',
      isDefault: address.isDefault
    };
  } else {
    editingAddress.value = null;
    addressForm.value = {
      fullName: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detailAddress: '',
      postalCode: '',
      isDefault: false
    };
  }
  addressDialogVisible.value = true;
};

// 保存地址
const handleSaveAddress = async () => {
  // 验证必填字段
  const requiredFields = ['fullName', 'phone', 'province', 'city', 'district', 'detailAddress'];
  for (const field of requiredFields) {
    if (!addressForm.value[field]) {
      ElMessage.warning('请填写完整的地址信息');
      return;
    }
  }

  addressLoading.value = true;
  try {
    if (editingAddress.value) {
      await put(`/users/me/addresses/${editingAddress.value.id}`, addressForm.value);
      ElMessage.success('地址更新成功');
    } else {
      await post('/users/me/addresses', addressForm.value);
      ElMessage.success('地址添加成功');
    }
    addressDialogVisible.value = false;
    await loadAddresses();
  } catch (error) {
    console.error('保存地址失败:', error);
    ElMessage.error(error.message || '保存地址失败');
  } finally {
    addressLoading.value = false;
  }
};

// 删除地址
const handleDeleteAddress = async (addressId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await del(`/users/me/addresses/${addressId}`);
    ElMessage.success('地址删除成功');
    await loadAddresses();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除地址失败:', error);
      ElMessage.error('删除地址失败');
    }
  }
};

// 设置默认地址
const handleSetDefault = async (addressId) => {
  try {
    await patch(`/users/me/addresses/${addressId}/default`);
    ElMessage.success('默认地址设置成功');
    await loadAddresses();
  } catch (error) {
    console.error('设置默认地址失败:', error);
    ElMessage.error('设置默认地址失败');
  }
};

onMounted(() => {
  loadUserInfo();
  if (activeTab.value === 'address') {
    loadAddresses();
  }
});

// 监听 tab 切换
const handleTabChange = (tabName) => {
  if (tabName === 'address') {
    loadAddresses();
  }
};
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.address-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.1);
}

.address-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.receiver-name {
  font-weight: 500;
  font-size: 16px;
  color: #303133;
}

.receiver-phone {
  font-size: 14px;
  color: #606266;
}

.address-detail {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.address-footer {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>