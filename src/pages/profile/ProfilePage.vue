<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { API_URL } from '@/js/api';
import { useAuthStore } from '@/js/auth';

const router = useRouter();
const authStore = useAuthStore();

const profile = ref({})
const department = ref({})
const pos = ref({})
const loading = ref(false)
const saving = ref(false)
const isEditing = ref(false)

// Отдельный объект для редактируемых полей
const editableFields = ref({
    fio: '',
    email: '',
    phone: ''
})

const load = async () => {
    loading.value = true;
    try {
        const resp = await fetch(API_URL + '/teacher/me', {
            credentials: 'include'
        });
        
        if (resp.ok) {
            profile.value = await resp.json();
            
            // Заполняем редактируемые поля
            editableFields.value = {
                fio: profile.value.fio || '',
                email: profile.value.email || '',
                phone: profile.value.phone || ''
            }
            
            await Promise.all([
                loadDepartment(profile.value.departmentId),
                loadPosition(profile.value.positionId)
            ]);
        } else {
            console.error('Ошибка загрузки профиля');
        }
    } catch (err) {
        console.error('Ошибка загрузки', err);
    } finally {
        loading.value = false;
    }
}

const loadDepartment = async (departmentId) => {
    try {
        const resp = await fetch(API_URL + '/department/' + departmentId)
        department.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки кафедры', err);
    }
}

const loadPosition = async (posId) => {
    try {
        const resp = await fetch(API_URL + '/position/' + posId)
        pos.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки должности', err);
    }
}

const enableEditing = () => {
    isEditing.value = true;
}

const cancelEditing = () => {
    isEditing.value = false;
    // Сбрасываем изменения в редактируемых полях
    editableFields.value = {
        fio: profile.value.fio || '',
        email: profile.value.email || '',
        phone: profile.value.phone || '',
        roleId: profile.value.roleId
    }
}

const saveProfile = async () => {
    saving.value = true;
    try {
        const updateData = {
            fio: editableFields.value.fio,
            email: editableFields.value.email,
            phone: editableFields.value.phone,
            isActive: profile.value.isActive,
            departmentId: profile.value.departmentId,
            positionId: profile.value.positionId,
            roleId: profile.value.roleId
        }

        const resp = await fetch(API_URL + '/teacher/' + profile.value.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updateData)
        });

        if (resp.ok) {
            const updatedProfile = await resp.json();
            profile.value = updatedProfile;
            isEditing.value = false;
            
            // Обновляем данные в store
            authStore.currentUser = updatedProfile;
            
            alert('Профиль успешно обновлен!');
        } else {
            throw new Error('Ошибка сохранения');
        }
    } catch (err) {
        console.error('Ошибка сохранения', err);
        alert('Ошибка при сохранении профиля');
    } finally {
        saving.value = false;
    }
}

onMounted(() => {
    load();
})
</script>

<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Профиль преподавателя</h2>
            <button 
                v-if="!isEditing" 
                @click="enableEditing" 
                class="btn btn-primary"
                :disabled="loading"
            >
                Редактировать
            </button>
        </div>

        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
        </div>

        <div v-else class="card">
            <div class="card-header bg-light">
                <h4 class="mb-0">Основная информация</h4>
            </div>
            <div class="card-body">
                <form @submit.prevent="saveProfile" v-if="isEditing">
                    <div class="row">
                        <div class="col-md-6">
                            <!-- Редактируемые поля -->
                            <div class="mb-3">
                                <label class="form-label"><strong>ФИО:</strong></label>
                                <input 
                                    v-model="editableFields.fio" 
                                    type="text" 
                                    class="form-control"
                                    required
                                >
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><strong>Email:</strong></label>
                                <input 
                                    v-model="editableFields.email" 
                                    type="email" 
                                    class="form-control"
                                    required
                                >
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><strong>Телефон:</strong></label>
                                <input 
                                    v-model="editableFields.phone" 
                                    type="tel" 
                                    class="form-control"
                                    placeholder="+7 (XXX) XXX-XX-XX"
                                >
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <!-- Нередактируемые поля -->
                            <div class="mb-3">
                                <label class="form-label"><strong>Статус:</strong></label>
                                <input 
                                    :value="profile.isActive ? 'Активен' : 'Неактивен'" 
                                    type="text" 
                                    class="form-control"
                                    readonly
                                >
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><strong>Кафедра:</strong></label>
                                <input 
                                    :value="department.name" 
                                    type="text" 
                                    class="form-control"
                                    readonly
                                >
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><strong>Должность:</strong></label>
                                <input 
                                    :value="pos.name" 
                                    type="text" 
                                    class="form-control"
                                    readonly
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2 justify-content-end mt-4">
                        <button 
                            type="button" 
                            @click="cancelEditing" 
                            class="btn btn-secondary"
                            :disabled="saving"
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            class="btn btn-primary"
                            :disabled="saving"
                        >
                            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                            {{ saving ? 'Сохранение...' : 'Сохранить' }}
                        </button>
                    </div>
                </form>
                
                <div v-else>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>ФИО:</strong> {{ profile.fio }}</p>
                            <p><strong>Email:</strong> {{ profile.email }}</p>
                            <p><strong>Телефон:</strong> {{ profile.phone || 'Не указан' }}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Статус: </strong> 
                                <span :class="profile.isActive ? 'text-success' : 'text-danger'">
                                    {{ profile.isActive ? 'Активен' : 'Неактивен' }}
                                </span>
                            </p>
                            <p><strong>Кафедра:</strong> {{ department.name || 'Загрузка...' }}</p>
                            <p><strong>Должность:</strong> {{ pos.name || 'Загрузка...' }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Системная информация -->
        <div class="card mt-4">
            <div class="card-header bg-light">
                <h5 class="mb-0">Системная информация</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>ID пользователя:</strong> {{ profile.id }}</p>
                        <p><strong>Логин:</strong> {{ profile.login }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.form-control:read-only {
    background-color: #f8f9fa;
    border-color: #e9ecef;
    color: #6c757d;
}
</style>