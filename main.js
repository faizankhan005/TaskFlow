// main.js - Core JavaScript for Task Manager & Progress Tracker
// Global Variables
let currentUser = null;
let tasks = [];
let isLoggedIn = false;
let progressChart = null;
let categoryChart = null;
let weeklyChart = null;
let editingTaskId = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadStoredData();
    updateAuthState();
    loadTasks();
    updateProgressData();
});

// Initialize Application
function initializeApp() {
    console.log('TaskFlow initialized successfully!');
    
    // Initialize charts when needed
    setTimeout(() => {
        if (document.getElementById('progressChart')) {
            initializeCharts();
        }
    }, 100);

    if (!getFromStorage('taskflow_first_visit')) {
        showWelcomeMessage();
        saveToStorage('taskflow_first_visit', 'true');
    }
}

// Storage Helper Functions (with fallback for localStorage issues)
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
    } catch (error) {
        console.warn('LocalStorage not available, using memory storage');
        // Fallback to memory storage if localStorage fails
        window.memoryStorage = window.memoryStorage || {};
        window.memoryStorage[key] = value;
    }
}

function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        
        // Try to parse JSON, if it fails return the string
        try {
            return JSON.parse(item);
        } catch {
            return item;
        }
    } catch (error) {
        console.warn('LocalStorage not available, using memory storage');
        return window.memoryStorage && window.memoryStorage[key] ? window.memoryStorage[key] : defaultValue;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        if (window.memoryStorage) {
            delete window.memoryStorage[key];
        }
    }
}

// Load stored data on initialization
function loadStoredData() {
    tasks = getFromStorage('taskflow_tasks', []);
    isLoggedIn = getFromStorage('taskflow_logged_in') === 'true' || getFromStorage('taskflow_logged_in') === true;
    
    if (isLoggedIn) {
        currentUser = getFromStorage('taskflow_user');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Get started button
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => showPage('tasks'));
    }

    // Mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Task management
    const addTaskBtn = document.getElementById('add-task-btn');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const taskForm = document.getElementById('task-form');

    if (addTaskBtn) addTaskBtn.addEventListener('click', showTaskForm);
    if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', hideTaskForm);
    if (taskForm) taskForm.addEventListener('submit', handleTaskSubmit);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });

    // Auth buttons
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) loginBtn.addEventListener('click', () => showModal('login-modal'));
    if (registerBtn) registerBtn.addEventListener('click', () => showModal('register-modal'));
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => showModal('login-modal'));
    if (mobileRegisterBtn) mobileRegisterBtn.addEventListener('click', () => showModal('register-modal'));
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Modal close buttons
    const closeLoginModal = document.getElementById('close-login-modal');
    const closeRegisterModal = document.getElementById('close-register-modal');

    if (closeLoginModal) closeLoginModal.addEventListener('click', () => hideModal('login-modal'));
    if (closeRegisterModal) closeRegisterModal.addEventListener('click', () => hideModal('register-modal'));

    // Switch between modals
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('login-modal');
            showModal('register-modal');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('register-modal');
            showModal('login-modal');
        });
    }

    // Auth forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // Chatbot
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const sendChat = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');

    if (chatbotToggle) chatbotToggle.addEventListener('click', toggleChatbot);
    if (sendChat) sendChat.addEventListener('click', sendChatMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    // WhatsApp form
    const whatsappForm = document.getElementById('whatsapp-form');
    if (whatsappForm) whatsappForm.addEventListener('submit', handleWhatsAppMessage);
}

// Navigation Functions
function handleNavigation(e) {
    e.preventDefault();
    const pageName = e.target.closest('.nav-link').getAttribute('data-page');
    showPage(pageName);
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });

    // Show selected page
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Page-specific actions
        switch(pageName) {
            case 'tasks':
                loadTasks();
                break;
            case 'progress':
                updateProgressData();
                setTimeout(() => updateCharts(), 100);
                generateSuggestions();
                break;
            case 'analytics':
                updateAnalytics();
                setTimeout(() => updateCharts(), 100);
                break;
        }
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Task Management Functions
function showTaskForm() {
    const formContainer = document.getElementById('task-form-container');
    const taskTitle = document.getElementById('task-title');
    
    if (formContainer) {
        formContainer.classList.remove('hidden');
        if (taskTitle) taskTitle.focus();
    }
}

function hideTaskForm() {
    const formContainer = document.getElementById('task-form-container');
    const taskForm = document.getElementById('task-form');
    
    if (formContainer) formContainer.classList.add('hidden');
    if (taskForm) taskForm.reset();
    
    // Reset editing state
    editingTaskId = null;
    
    // Reset button text
    const submitBtn = taskForm?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Add Task';
}

function handleTaskSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const title = formData.get('title')?.trim();
    const description = formData.get('description')?.trim();
    const priority = formData.get('priority');
    const category = formData.get('category');

    if (!title) {
        showNotification('Task title is required!', 'error');
        return;
    }

    if (editingTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title,
                description,
                priority,
                category,
                updatedAt: new Date().toISOString()
            };
            showNotification('Task updated successfully!', 'success');
        }
    } else {
        // Create new task
        const task = {
            id: generateId(),
            title,
            description,
            priority,
            category,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tasks.push(task);
        showNotification('Task added successfully!', 'success');
    }

    saveData();
    loadTasks();
    hideTaskForm();
    updateProgressData();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        showNotification('Task not found!', 'error');
        return;
    }

    // Set editing mode
    editingTaskId = taskId;

    // Fill form with task data
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        document.getElementById('task-title').value = task.title || '';
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-priority').value = task.priority || 'medium';
        document.getElementById('task-category').value = task.category || 'personal';
        
        // Change submit button text
        const submitBtn = taskForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update Task';
    }

    // Show form
    showTaskForm();
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const initialLength = tasks.length;
        tasks = tasks.filter(task => task.id !== taskId);
        
        if (tasks.length < initialLength) {
            saveData();
            loadTasks();
            showNotification('Task deleted successfully!', 'success');
            updateProgressData();
        } else {
            showNotification('Task not found!', 'error');
        }
    }
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        saveData();
        loadTasks();
        showNotification(
            task.completed ? 'Task completed! Great job!' : 'Task marked as pending',
            task.completed ? 'success' : 'info'
        );
        updateProgressData();
    }
}

function loadTasks() {
    const tasksList = document.getElementById('tasks-list');
    const emptyTasks = document.getElementById('empty-tasks');
    
    if (!tasksList) return;

    if (tasks.length === 0) {
        tasksList.innerHTML = '';
        if (emptyTasks) emptyTasks.style.display = 'block';
        return;
    }

    if (emptyTasks) emptyTasks.style.display = 'none';
    
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
    let filteredTasks = [...tasks]; // Create a copy to avoid mutating original array

    switch(activeFilter) {
        case 'pending':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
        case 'high':
            filteredTasks = tasks.filter(task => task.priority === 'high');
            break;
        case 'all':
        default:
            filteredTasks = tasks;
            break;
    }

    // Sort tasks: pending first, then by priority, then by creation date
    filteredTasks.sort((a, b) => {
        // First, sort by completion status (pending tasks first)
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Then by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
            return bPriority - aPriority; // Higher priority first
        }
        
        // Finally by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-card bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 ${task.completed ? 'opacity-75' : ''}" data-task-id="${task.id}">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleTaskComplete('${task.id}')"
                           class="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 cursor-pointer">
                    <h3 class="text-lg font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-white'}">${escapeHtml(task.title)}</h3>
                    <span class="px-2 py-1 ${getPriorityColor(task.priority)} text-xs rounded-full border ${getPriorityBorder(task.priority)}">
                        ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="editTask('${task.id}')" class="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTask('${task.id}')" class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${task.description ? `<p class="text-gray-400 mb-2">${escapeHtml(task.description)}</p>` : ''}
            <div class="flex items-center justify-between text-sm text-gray-500">
                <span class="flex items-center">
                    <i class="fas ${getCategoryIcon(task.category)} mr-1"></i> 
                    ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                </span>
                <span class="flex items-center">
                    <i class="fas ${task.completed ? 'fa-check' : 'fa-clock'} mr-1"></i> 
                    ${task.completed ? 'Completed' : 'Pending'}
                </span>
            </div>
            <div class="text-xs text-gray-600 mt-2">
                Created: ${formatDate(task.createdAt)}
                ${task.updatedAt !== task.createdAt ? ` • Updated: ${formatDate(task.updatedAt)}` : ''}
            </div>
        </div>
    `).join('');
}

function handleFilterClick(e) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-purple-600', 'text-white');
        btn.classList.add('bg-gray-700', 'text-gray-300');
    });
    
    e.target.classList.remove('bg-gray-700', 'text-gray-300');
    e.target.classList.add('active', 'bg-purple-600', 'text-white');
    
    loadTasks();
}

// Utility Functions for Tasks
function getPriorityColor(priority) {
    switch(priority) {
        case 'high': return 'bg-red-500/20 text-red-400';
        case 'medium': return 'bg-yellow-500/20 text-yellow-400';
        case 'low': return 'bg-green-500/20 text-green-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
}

function getPriorityBorder(priority) {
    switch(priority) {
        case 'high': return 'border-red-500/30';
        case 'medium': return 'border-yellow-500/30';
        case 'low': return 'border-green-500/30';
        default: return 'border-gray-500/30';
    }
}

function getCategoryIcon(category) {
    switch(category) {
        case 'work': return 'fa-briefcase';
        case 'personal': return 'fa-user';
        case 'study': return 'fa-book';
        case 'health': return 'fa-heart';
        default: return 'fa-folder';
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Authentication Functions (keeping existing ones)
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email')?.trim().toLowerCase();
    const password = formData.get('password');

    if (email && password && password.length >= 6) {
        currentUser = {
            id: generateId(),
            name: email.split('@')[0],
            email: email,
            loginTime: new Date().toISOString()
        };

        isLoggedIn = true;
        saveToStorage('taskflow_logged_in', true);
        saveToStorage('taskflow_user', currentUser);

        updateAuthState();
        hideModal('login-modal');
        showNotification(`Welcome back, ${currentUser.name}!`, 'success');
    } else {
        showNotification('Invalid email or password (min 6 characters)', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim().toLowerCase();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!name || name.length < 2) {
        showNotification('Name must be at least 2 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    currentUser = {
        id: generateId(),
        name: name,
        email: email,
        loginTime: new Date().toISOString()
    };

    isLoggedIn = true;
    saveToStorage('taskflow_logged_in', true);
    saveToStorage('taskflow_user', currentUser);

    updateAuthState();
    hideModal('register-modal');
    showNotification(`Welcome to TaskFlow, ${name}!`, 'success');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        isLoggedIn = false;
        removeFromStorage('taskflow_logged_in');
        removeFromStorage('taskflow_user');

        updateAuthState();
        showPage('home');
        showNotification('You have been logged out successfully.', 'info');
    }
}

function updateAuthState() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (isLoggedIn) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');

        if (!currentUser) {
            currentUser = getFromStorage('taskflow_user');
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
}

// Progress and Analytics Functions
function getTaskStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const categoryStats = {
        personal: tasks.filter(task => task.category === 'personal').length,
        work: tasks.filter(task => task.category === 'work').length,
        study: tasks.filter(task => task.category === 'study').length,
        health: tasks.filter(task => task.category === 'health').length
    };

    return { completed, pending, total, completionRate, categoryStats };
}

function updateProgressData() {
    const stats = getTaskStats();

    const elements = {
        'completed-count': stats.completed,
        'pending-count': stats.pending,
        'completion-rate': `${stats.completionRate}%`,
        'current-streak': calculateStreak()
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function calculateStreak() {
    const completedTasks = tasks
        .filter(task => task.completed)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (completedTasks.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const task of completedTasks) {
        const taskDate = new Date(task.updatedAt);
        taskDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((currentDate - taskDate) / (1000 * 60 * 60 * 24));

        if (diffDays === streak) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (diffDays > streak) {
            break;
        }
    }

    return streak;
}

// Chart Functions (keeping existing ones but with safety checks)
function initializeCharts() {
    if (typeof Chart !== 'undefined') {
        initializeProgressChart();
        initializeCategoryChart();
        initializeWeeklyChart();
    }
}

function initializeProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const stats = getTaskStats();

    if (progressChart) {
        progressChart.destroy();
    }

    progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [stats.completed, stats.pending],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: '#fff'
                    }
                }
            }
        }
    });
}

function initializeCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const stats = getTaskStats();

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Personal', 'Work', 'Study', 'Health'],
            datasets: [{
                label: 'Tasks by Category',
                data: [
                    stats.categoryStats.personal,
                    stats.categoryStats.work,
                    stats.categoryStats.study,
                    stats.categoryStats.health
                ],
                backgroundColor: ['#6366f1', '#8b5cf6', '#06d6a0', '#f59e0b'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', stepSize: 1 },
                    grid: { color: '#374151' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            }
        }
    });
}

function initializeWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const weeklyData = getWeeklyProgress();

    if (weeklyChart) {
        weeklyChart.destroy();
    }

    weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weeklyData.labels,
            datasets: [{
                label: 'Tasks Completed',
                data: weeklyData.completed,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Tasks Created',
                data: weeklyData.created,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', stepSize: 1 },
                    grid: { color: '#374151' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: '#374151' }
                }
            }
        }
    });
}

function getWeeklyProgress() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    const completed = [];
    const created = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        labels.push(days[date.getDay()]);

        const completedCount = tasks.filter(task => {
            if (!task.completed) return false;
            const taskDate = new Date(task.updatedAt);
            return taskDate >= date && taskDate < nextDate;
        }).length;

        const createdCount = tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= date && taskDate < nextDate;
        }).length;

        completed.push(completedCount);
        created.push(createdCount);
    }

    return { labels, completed, created };
}

function updateCharts() {
    if (progressChart) {
        const stats = getTaskStats();
        progressChart.data.datasets[0].data = [stats.completed, stats.pending];
        progressChart.update();
    }

    if (categoryChart) {
        const stats = getTaskStats();
        categoryChart.data.datasets[0].data = [
            stats.categoryStats.personal,
            stats.categoryStats.work,
            stats.categoryStats.study,
            stats.categoryStats.health
        ];
        categoryChart.update();
    }

    if (weeklyChart) {
        const weeklyData = getWeeklyProgress();
        weeklyChart.data.labels = weeklyData.labels;
        weeklyChart.data.datasets[0].data = weeklyData.completed;
        weeklyChart.data.datasets[1].data = weeklyData.created;
        weeklyChart.update();
    }
}

function generateSuggestions() {
    const suggestionsList = document.getElementById('suggestions-list');
    if (!suggestionsList) return;

    const stats = getTaskStats();
    const suggestions = [];

    if (stats.completionRate < 50) {
        suggestions.push({
            icon: 'fas fa-target',
            title: 'Break Down Large Tasks',
            description: 'Your completion rate is low. Try breaking large tasks into smaller, manageable chunks.',
            priority: 'high'
        });
    }

    const highPriorityPending = tasks.filter(task => !task.completed && task.priority === 'high').length;
    if (highPriorityPending > 0) {
        suggestions.push({
            icon: 'fas fa-exclamation-triangle',
            title: 'Focus on High Priority Tasks',
            description: `You have ${highPriorityPending} high priority tasks pending. Consider tackling these first.`,
            priority: 'high'
        });
    }

    const streak = calculateStreak();
    if (streak === 0) {
        suggestions.push({
            icon: 'fas fa-fire',
            title: 'Start Your Streak',
            description: 'Complete a task today to start building your completion streak!',
            priority: 'medium'
        });
    } else if (streak >= 7) {
        suggestions.push({
            icon: 'fas fa-trophy',
            title: 'Excellent Streak!',
            description: `Amazing! You have a ${streak}-day streak. Keep up the great work!`,
            priority: 'low'
        });
    }

    if (suggestions.length < 3) {
        suggestions.push({
            icon: 'fas fa-clock',
            title: 'Time Blocking',
            description: 'Try dedicating specific time blocks to different categories of tasks.',
            priority: 'low'
        });
    }

    suggestionsList.innerHTML = suggestions.map(suggestion => `
        <div class="bg-gray-700 rounded-lg p-4 border-l-4 ${getSuggestionColor(suggestion.priority)}">
            <div class="flex items-start space-x-3">
                <div class="text-xl ${getSuggestionIconColor(suggestion.priority)}">
                    <i class="${suggestion.icon}"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-white mb-1">${suggestion.title}</h4>
                    <p class="text-gray-300 text-sm">${suggestion.description}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function getSuggestionColor(priority) {
    switch(priority) {
        case 'high': return 'border-red-500';
        case 'medium': return 'border-yellow-500';
        case 'low': return 'border-green-500';
        default: return 'border-blue-500';
    }
}

function getSuggestionIconColor(priority) {
    switch(priority) {
        case 'high': return 'text-red-400';
        case 'medium': return 'text-yellow-400';
        case 'low': return 'text-green-400';
        default: return 'text-blue-400';
    }
}

function updateAnalytics() {
    const insights = generateInsights();
    const insightsList = document.getElementById('insights-list');

    if (insightsList) {
        insightsList.innerHTML = insights.map(insight => `
            <div class="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div class="text-2xl ${insight.color}">
                    <i class="${insight.icon}"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-white">${insight.title}</h4>
                    <p class="text-gray-300 text-sm">${insight.description}</p>
                    <span class="text-lg font-bold text-white">${insight.value}</span>
                </div>
            </div>
        `).join('');
    }
}

function generateInsights() {
    const stats = getTaskStats();
    const insights = [];

    const weeklyData = getWeeklyProgress();
    const maxCompletedIndex = weeklyData.completed.indexOf(Math.max(...weeklyData.completed));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostProductiveDay = days[maxCompletedIndex];

    insights.push({
        icon: 'fas fa-calendar-check',
        title: 'Most Productive Day',
        description: 'Your most productive day of the week',
        value: mostProductiveDay,
        color: 'text-green-400'
    });

    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length > 0) {
        const avgTime = completedTasks.reduce((acc, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.updatedAt);
            return acc + (completed - created);
        }, 0) / completedTasks.length;

        const avgHours = Math.round(avgTime / (1000 * 60 * 60));

        insights.push({
            icon: 'fas fa-hourglass-half',
            title: 'Average Completion Time',
            description: 'Average time to complete a task',
            value: avgHours > 24 ? `${Math.round(avgHours / 24)} days` : `${avgHours} hours`,
            color: 'text-blue-400'
        });
    }

    const last7Days = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return taskDate >= weekAgo;
    }).length;

    insights.push({
        icon: 'fas fa-tachometer-alt',
        title: 'Task Velocity',
        description: 'Tasks created in the last 7 days',
        value: `${last7Days} tasks`,
        color: 'text-purple-400'
    });

    insights.push({
        icon: 'fas fa-chart-line',
        title: 'Completion Efficiency',
        description: 'Overall task completion rate',
        value: `${stats.completionRate}%`,
        color: 'text-orange-400'
    });

    return insights;
}

// Chatbot Functions
function toggleChatbot() {
    const chatbot = document.getElementById('chatbot-widget');
    const toggle = document.getElementById('chatbot-toggle');
    
    if (chatbot && toggle) {
        if (chatbot.classList.contains('h-96')) {
            chatbot.classList.remove('h-96');
            chatbot.classList.add('h-14');
            toggle.innerHTML = '<i class="fas fa-plus"></i>';
        } else {
            chatbot.classList.remove('h-14');
            chatbot.classList.add('h-96');
            toggle.innerHTML = '<i class="fas fa-minus"></i>';
        }
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!input || !chatMessages) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    chatMessages.innerHTML += `
        <div class="flex items-start space-x-3 mb-4 justify-end">
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 max-w-xs">
                <p class="text-sm text-white">${escapeHtml(message)}</p>
            </div>
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                <i class="fas fa-user text-white text-sm"></i>
            </div>
        </div>
    `;

    // Add bot response
    const response = getChatbotResponse(message);
    chatMessages.innerHTML += `
        <div class="flex items-start space-x-3 mb-4">
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="bg-gray-700 rounded-lg p-3 max-w-xs">
                <p class="text-sm text-white">${response}</p>
            </div>
        </div>
    `;

    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getChatbotResponse(message) {
    const lowerMessage = message.toLowerCase();
    const stats = getTaskStats();
    
    // Context-aware responses based on user's current tasks
    if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
        if (stats.pending > 0) {
            return "I see you have pending tasks! Try breaking them into smaller steps or tackling the highest priority ones first.";
        }
        return "I'm here to help you stay productive! What specific challenge are you facing with your tasks?";
    }
    
    if (lowerMessage.includes('motivation') || lowerMessage.includes('motivated')) {
        if (stats.completed > 0) {
            return `You've already completed ${stats.completed} tasks! That's progress worth celebrating. Keep going!`;
        }
        return "Remember, every big achievement starts with small steps. Complete just one task to build momentum!";
    }
    
    if (lowerMessage.includes('priority') || lowerMessage.includes('important')) {
        const highPriority = tasks.filter(task => !task.completed && task.priority === 'high').length;
        if (highPriority > 0) {
            return `You have ${highPriority} high priority tasks waiting. Focus on those first for maximum impact!`;
        }
        return "Consider marking your most important tasks as high priority to stay focused on what matters most.";
    }
    
    const responses = [
        "I'm here to help you stay productive! Try breaking down large tasks into smaller ones.",
        "Consider using the Pomodoro technique - 25 minutes of focused work, then 5 minutes break.",
        "Based on your tasks, I suggest focusing on high priority items first. You've got this!",
        "Time blocking can really help! Dedicate specific hours to different task categories.",
        "Remember to celebrate small wins! Each completed task is progress toward your goals.",
        "Try batch processing similar tasks together for better efficiency.",
        "Don't forget to take breaks! Your brain needs rest to maintain peak productivity."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// WhatsApp Integration
function handleWhatsAppMessage(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    const whatsappMessage = `Hello! I'm ${name} (${email}). ${message}`;
    const whatsappUrl = `https://wa.me/919671636548?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    e.target.reset();
    showNotification('Opening WhatsApp...', 'info');
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveData() {
    saveToStorage('taskflow_tasks', tasks);
}

function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications to prevent spam
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fixed top-4 right-4 z-50 bg-white text-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-3 transform translate-x-0 transition-transform duration-300`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)} ${getNotificationIconColor(type)}"></i>
        <span class="flex-1">${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationIconColor(type) {
    const colors = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
    };
    return colors[type] || 'text-blue-500';
}

function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('Welcome to TaskFlow! Start by adding your first task.', 'info', 5000);
    }, 1000);
}

// Additional utility functions for better task management
function getTaskById(taskId) {
    return tasks.find(task => task.id === taskId);
}

function getTasksByCategory(category) {
    return tasks.filter(task => task.category === category);
}

function getTasksByPriority(priority) {
    return tasks.filter(task => task.priority === priority);
}

function getCompletedTasksToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
        if (!task.completed) return false;
        const completedDate = new Date(task.updatedAt);
        return completedDate >= today && completedDate < tomorrow;
    });
}

// Export functions for debugging (optional)
window.TaskFlowDebug = {
    getTasks: () => tasks,
    getStats: getTaskStats,
    clearAllTasks: () => {
        if (confirm('This will delete ALL tasks. Are you sure?')) {
            tasks = [];
            saveData();
            loadTasks();
            updateProgressData();
            showNotification('All tasks cleared!', 'info');
        }
    },
    exportTasks: () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'taskflow_backup.json';
        link.click();
        showNotification('Tasks exported successfully!', 'success');
    }
};