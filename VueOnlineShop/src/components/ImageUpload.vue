<template>
  <div class="image-upload">
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      accept="image/*"
      :limit="1"
      drag
    >
      <div class="upload-area" v-if="!imageUrl">
        <el-icon class="upload-icon"><Plus /></el-icon>
        <div class="upload-text">
          <div class="upload-text-primary">点击或拖拽上传</div>
          <div class="upload-text-secondary">支持 PNG、JPG、GIF 格式</div>
        </div>
      </div>
      <div class="upload-area" v-else>
        <el-image :src="imageUrl" fit="contain" class="preview-image" />
        <div class="preview-overlay">
          <el-icon @click.stop="handleRemove"><Delete /></el-icon>
        </div>
      </div>
    </el-upload>

    <el-progress
      v-if="uploading"
      :percentage="uploadProgress"
      :status="uploadProgress === 100 ? 'success' : ''"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { post } from '@/utils/api'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const uploadRef = ref(null)
const imageUrl = ref(props.modelValue)
const uploading = ref(false)
const uploadProgress = ref(0)

// 监听外部变化
watch(() => props.modelValue, (newVal) => {
  imageUrl.value = newVal
})

// 监听内部变化
watch(imageUrl, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleFileChange = (file) => {
  if (!file.raw) return

  // 检查文件类型
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return
  }

  // 检查文件大小（限制为 2MB）
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return
  }

  // 读取文件并转换为 base64
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadImage(e.target.result)
  }
  reader.readAsDataURL(file.raw)
}

const uploadImage = async (base64Data) => {
  uploading.value = true
  uploadProgress.value = 30

  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 70) {
        uploadProgress.value += 10
      }
    }, 100)

    const data = await post('/normal/uploadImage', {
      imageData: base64Data
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    imageUrl.value = data.imageUrl
    ElMessage.success('图片上传成功')

    setTimeout(() => {
      uploading.value = false
      uploadProgress.value = 0
    }, 500)
  } catch (error) {
    uploading.value = false
    uploadProgress.value = 0
    ElMessage.error(error.message || '图片上传失败')
    console.error('图片上传错误:', error)
  }
}

const handleRemove = () => {
  imageUrl.value = ''
  ElMessage.info('图片已移除')
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  width: 100%;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-text-primary {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.upload-text-secondary {
  color: #909399;
  font-size: 12px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-area:hover .preview-overlay {
  opacity: 1;
}

.preview-overlay .el-icon {
  font-size: 32px;
  color: white;
  cursor: pointer;
}

.preview-overlay .el-icon:hover {
  color: #f56c6c;
}
</style>