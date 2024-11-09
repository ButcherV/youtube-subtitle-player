<template>
  <Teleport to="body">
    <div class="auth-modal">
      <div class="modal-content">
        <button class="close-btn" @click="$emit('close')">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
        <template v-if="!showLanguageSelector">
          <div class="tabs">
            <button
              :class="{ 'tab-button': true, 'is-active': activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              登录
            </button>
            <button
              :class="{ 'tab-button': true, 'is-active': activeTab === 'register' }"
              @click="activeTab = 'register'"
            >
              注册
            </button>
          </div>
          <LoginForm
            v-if="activeTab === 'login'"
            @login-success="handleLoginSuccess"
          />
          <RegisterForm v-else @register-success="handleRegisterSuccess" />
        </template>
        <template v-if="showLanguageSelector">
          <h3 class="title">请选择语言偏好</h3>
          <LanguageSelector
            v-model="nativeLanguage"
            label="你的母语"
            type="native"
          />
          
          <LanguageSelector
            v-model="targetLanguage"
            label="目标语言"
            type="target"
          />

          <button 
            class="auth-button"
            @click="handleLanguageSubmit"
            :disabled="!nativeLanguage || !targetLanguage"
          >
            确认
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, getCurrentInstance, inject } from "vue";
import LoginForm from "./LoginForm.vue";
import RegisterForm from "./RegisterForm.vue";
import { SUCCESS_KEYS, getSuccessMessage } from '@/constants';
import LanguageSelector from '../LanguageSelector.vue';


export default {
  name: "AuthModal",
  components: { LoginForm, RegisterForm, LanguageSelector },
  emits: ["close"],
  setup() {
    const activeTab = ref("login");
    const showLanguageSelector = ref(false);
    const nativeLanguage = ref('');
    const targetLanguage = ref('');
    const { proxy } = getCurrentInstance();
    const auth = inject('auth');

    const handleRegisterSuccess = () => {
      proxy.$message.success(getSuccessMessage(SUCCESS_KEYS.REGISTRATION_SUCCESS));
      activeTab.value = 'login';
    };

    const handleLoginSuccess = (userData) => {
      if (userData.isFirstLogin) {
        showLanguageSelector.value = true;
      } else {
        auth.hideAuthModal();
      }
    };

    const handleLanguageSubmit = async () => {
      auth.hideAuthModal();
      proxy.$message.success('语言设置已更新');
      // try {
      //   await axios.post(`${API.BASE_URL}/user/language-settings`, {
      //     nativeLanguage: nativeLanguage.value,
      //     targetLanguage: targetLanguage.value
      //   });
        
      //   auth.closeAuthModal();
      //   proxy.$message.success('语言设置已更新');
        
      // } catch (error) {
      //   const errorMessage = error.response?.data?.error
      //     ? getErrorMessage(error.response.data.error)
      //     : getErrorMessage(ERROR_KEYS.UPDATE_FAILED);
      //   proxy.$message.error(errorMessage);
      // }
    };

    return { 
      activeTab,
      showLanguageSelector,
      nativeLanguage,
      targetLanguage,
      handleLoginSuccess,
      handleRegisterSuccess,
      handleLanguageSubmit
    };
  },
};
</script>

<style scoped lang="scss">
.auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: $zIndexModal;
}

.modal-content {
  background-color: white;
  padding: 16px;
  padding-top: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 90%;
  border: 6px solid $green;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: $green;
}

.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 20px;
  font-size: 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;

  &.is-active {
    font-weight: 900;
    border-bottom-color: $green;
    color: $green;
  }
}

.auth-button {
  margin-top: 32px;
  width: 100%;
  padding: 10px;
  background-color: $green;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  text-align: center;
}
</style>
