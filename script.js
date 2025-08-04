// ===== GLOBAL VARIABLES =====
let currentUser = null;
let skills = [];

// ===== UTILITY FUNCTIONS =====
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="alert-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles for alert
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// ===== THEME MANAGEMENT =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===== AUTHENTICATION =====
function checkAuth() {
    const loggedIn = localStorage.getItem('loggedIn');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (loggedIn === 'true' && user) {
        currentUser = user;
        return true;
    }
    
    // Only redirect to login if we're not already on login/register pages
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'login.html' && currentPage !== 'register.html' && currentPage !== '') {
        window.location.href = 'login.html';
    }
    return false;
}

function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user');
    currentUser = null;
    showAlert('Logged out successfully!', 'success');
    window.location.href = 'login.html';
}

// ===== SKILLS MANAGEMENT =====
function loadSkills() {
    const savedSkills = localStorage.getItem('skills');
    skills = savedSkills ? JSON.parse(savedSkills) : [];
    return skills;
}

function saveSkills() {
    localStorage.setItem('skills', JSON.stringify(skills));
}

function addSkill(skillData) {
    const newSkill = {
        id: Date.now(),
        name: skillData.name,
        category: skillData.category,
        level: skillData.level,
        description: skillData.description,
        goals: skillData.goals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    skills.unshift(newSkill); // Add to beginning
    saveSkills();
    return newSkill;
}

function updateSkill(id, updates) {
    const skillIndex = skills.findIndex(skill => skill.id === id);
    if (skillIndex !== -1) {
        skills[skillIndex] = { ...skills[skillIndex], ...updates, updatedAt: new Date().toISOString() };
        saveSkills();
        return skills[skillIndex];
    }
    return null;
}

function deleteSkill(id) {
    const skillIndex = skills.findIndex(skill => skill.id === id);
    if (skillIndex !== -1) {
        skills.splice(skillIndex, 1);
        saveSkills();
        return true;
    }
    return false;
}

function filterSkills(searchTerm, category, status) {
    return skills.filter(skill => {
        const matchesSearch = !searchTerm || 
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !category || skill.category === category;
        const matchesStatus = !status || skill.level === status;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
}

// ===== UI RENDERING =====
function renderSkills(skillsToRender = skills) {
    const skillsList = document.getElementById('skillsList');
    const skillsCount = document.getElementById('skills-count');
    const emptyState = document.getElementById('empty-state');
    
    if (!skillsList) return;
    
    skillsCount.textContent = `${skillsToRender.length} skill${skillsToRender.length !== 1 ? 's' : ''} found`;
    
    if (skillsToRender.length === 0) {
        skillsList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    skillsList.style.display = 'grid';
    
    skillsList.innerHTML = skillsToRender.map(skill => `
        <div class="skill-card" data-id="${skill.id}">
            <div class="skill-header">
                <div>
                    <h3 class="skill-title">${skill.name}</h3>
                    <span class="skill-category">${skill.category}</span>
                </div>
                <div class="skill-actions">
                    <button class="btn-icon" onclick="editSkill(${skill.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteSkillConfirm(${skill.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${skill.description ? `<p class="skill-description">${skill.description}</p>` : ''}
            <div class="skill-footer">
                <span class="skill-level">
                    <span class="level-badge level-${skill.level.toLowerCase()}">${skill.level}</span>
                </span>
                <small style="color: var(--text-secondary);">
                    ${new Date(skill.createdAt).toLocaleDateString()}
                </small>
            </div>
        </div>
    `).join('');
}

function renderDashboard() {
    const username = document.getElementById('username');
    const totalSkills = document.getElementById('total-skills');
    const completedSkills = document.getElementById('completed-skills');
    const learningSkills = document.getElementById('learning-skills');
    const recentSkillsList = document.getElementById('recent-skills-list');
    
    if (username && currentUser) {
        username.textContent = currentUser.name || currentUser.firstName || 'User';
    }
    
    if (totalSkills) {
        totalSkills.textContent = skills.length;
    }
    
    if (completedSkills) {
        const completed = skills.filter(skill => skill.level === 'Completed').length;
        completedSkills.textContent = completed;
    }
    
    if (learningSkills) {
        const learning = skills.filter(skill => skill.level === 'Learning').length;
        learningSkills.textContent = learning;
    }
    
    if (recentSkillsList) {
        const recentSkills = skills.slice(0, 6); // Show last 6 skills
        if (recentSkills.length === 0) {
            recentSkillsList.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">
                    <i class="fas fa-plus-circle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No skills added yet</h3>
                    <p>Start tracking your skills to see them here</p>
                    <a href="add.html" class="btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i>
                        Add Your First Skill
                    </a>
                </div>
            `;
        } else {
            recentSkillsList.innerHTML = recentSkills.map(skill => `
                <div class="skill-card" data-id="${skill.id}">
                    <div class="skill-header">
                        <div>
                            <h3 class="skill-title">${skill.name}</h3>
                            <span class="skill-category">${skill.category}</span>
                        </div>
                    </div>
                    ${skill.description ? `<p class="skill-description">${skill.description}</p>` : ''}
                    <div class="skill-footer">
                        <span class="skill-level">
                            <span class="level-badge level-${skill.level.toLowerCase()}">${skill.level}</span>
                        </span>
                    </div>
                </div>
            `).join('');
        }
    }
}

// ===== SEARCH & FILTERS =====
function initSearch() {
    const searchInput = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleSearch);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleSearch);
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('searchBar')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    const filteredSkills = filterSkills(searchTerm, category, status);
    renderSkills(filteredSkills);
}

function clearFilters() {
    const searchInput = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    
    renderSkills();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== FORM HANDLERS =====
function initForms() {
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Add skill form
    const addSkillForm = document.getElementById('add-skill-form');
    if (addSkillForm) {
        addSkillForm.addEventListener('submit', handleAddSkill);
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showAlert('Please agree to the terms and conditions!', 'error');
        return;
    }
    
    const user = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        password
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    showAlert('Registration successful! Redirecting to login...', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.email === email && user.password === password) {
        localStorage.setItem('loggedIn', 'true');
        currentUser = user;
        showAlert('Login successful! Redirecting to dashboard...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showAlert('Invalid email or password! Please check your credentials.', 'error');
    }
}

function handleAddSkill(e) {
    e.preventDefault();
    
    const name = document.getElementById('skill-name').value;
    const category = document.getElementById('skill-category').value;
    const level = document.getElementById('skill-level').value;
    const description = document.getElementById('skill-description').value;
    const goals = document.getElementById('skill-goals').value;
    
    if (!name || !category || !level) {
        showAlert('Please fill in all required fields!', 'error');
        return;
    }
    
    const newSkill = addSkill({
        name,
        category,
        level,
        description,
        goals
    });
    
    showAlert('Skill added successfully!', 'success');
    e.target.reset();
    
    // Redirect to skills page after a short delay
    setTimeout(() => {
        window.location.href = 'skills.html';
    }, 1500);
}

// ===== PASSWORD TOGGLE =====
function togglePassword() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const toggleButtons = document.querySelectorAll('.password-toggle i');
    
    passwordInputs.forEach((input, index) => {
        if (input.type === 'password') {
            input.type = 'text';
            toggleButtons[index].className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            toggleButtons[index].className = 'fas fa-eye';
        }
    });
}

// ===== SKILL ACTIONS =====
function editSkill(id) {
    const skill = skills.find(s => s.id === id);
    if (skill) {
        // For now, just show an alert. In a real app, you'd open an edit modal
        showAlert(`Edit functionality for "${skill.name}" would open here!`, 'info');
    }
}

function deleteSkillConfirm(id) {
    const skill = skills.find(s => s.id === id);
    if (skill && confirm(`Are you sure you want to delete "${skill.name}"?`)) {
        if (deleteSkill(id)) {
            showAlert('Skill deleted successfully!', 'success');
            renderSkills();
            renderDashboard();
        } else {
            showAlert('Failed to delete skill!', 'error');
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function showCategories() {
    showAlert('Categories feature coming soon!', 'info');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize forms first (for login/register pages)
    initForms();
    
    // Check authentication
    if (checkAuth()) {
        // Load skills
        loadSkills();
        
        // Initialize search and filters
        initSearch();
        
        // Render appropriate content based on page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        switch (currentPage) {
            case 'index.html':
            case '':
                renderDashboard();
                break;
            case 'skills.html':
                renderSkills();
                break;
            case 'add.html':
                // Form is already initialized
                break;
            case 'profile.html':
                // Profile page has its own initialization
                break;
        }
    }
});

// ===== CSS ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    }
    
    .alert-success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .alert-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .alert-info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
    
    .alert-close {
        background: none;
        border: none;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.7;
        transition: opacity 0.15s ease;
    }
    
    .alert-close:hover {
        opacity: 1;
    }
    
    .skill-actions {
        display: flex;
        gap: 0.25rem;
    }
    
    .btn-icon {
        background: none;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 0.25rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.15s ease;
    }
    
    .btn-icon:hover {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);

  