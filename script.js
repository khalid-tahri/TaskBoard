/**
 * Application Kanban - Vanilla JS
 */

class KanbanApp {
    constructor() {
        // --- Configuration & Sélecteurs DOM ---
        this.STORAGE_KEY = 'kanban_tasks';
        this.MODULES_STORAGE_KEY = 'kanban_modules';
        this.tasks = [];
        this.modules = [];

        // Sélecteurs globaux
        this.board = document.querySelector('.kanban-board');
        this.taskModal = document.getElementById('task-modal');
        this.taskForm = document.getElementById('task-form');
        this.modalTitle = document.getElementById('modal-title');
        this.titleInput = document.getElementById('task-title');
        this.descInput = document.getElementById('task-desc');
        this.priorityInput = document.getElementById('task-priority');
        this.moduleInput = document.getElementById('task-module');
        this.editingTaskId = null;

        // Sélecteurs Modale Modules
        this.moduleModal = document.getElementById('module-modal');
        this.moduleForm = document.getElementById('module-form');
        this.moduleNameInput = document.getElementById('module-name');
        this.moduleColorInput = document.getElementById('module-color');
        this.modulesList = document.getElementById('modules-list');

        // Boutons
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.cancelTaskBtn = document.getElementById('cancel-task-btn');
        this.manageModulesBtn = document.getElementById('manage-modules-btn');
        this.closeModuleModalBtn = document.getElementById('close-module-modal-btn');
        
        // Theme
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.moonIcon = document.getElementById('moon-icon');
        this.sunIcon = document.getElementById('sun-icon');

        // État du Drag and Drop
        this.draggedTaskId = null;

        // --- Initialisation ---
        this.init();
        
        // Timer de rafraîchissement (toutes les 10 secondes)
        setInterval(() => this.updateTimers(), 10000);
    }

    init() {
        this.loadTheme();
        this.loadModules();
        this.loadTasks();
        this.bindEvents();
        this.renderAllTasks();
    }

    // --- Gestion du Thème ---
    loadTheme() {
        const theme = localStorage.getItem('kanban_theme');
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            this.moonIcon.classList.add('d-none');
            this.sunIcon.classList.remove('d-none');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('kanban_theme', isLight ? 'light' : 'dark');
        
        if (isLight) {
            this.moonIcon.classList.add('d-none');
            this.sunIcon.classList.remove('d-none');
        } else {
            this.moonIcon.classList.remove('d-none');
            this.sunIcon.classList.add('d-none');
        }
    }

    // --- Gestion du LocalStorage ---
    loadModules() {
        const stored = localStorage.getItem(this.MODULES_STORAGE_KEY);
        if (stored) {
            try {
                this.modules = JSON.parse(stored);
            } catch (e) {
                console.error("Erreur lors du parsing des modules", e);
                this.initDefaultModules();
            }
        } else {
            this.initDefaultModules();
        }
        this.renderModuleSelect();
    }

    initDefaultModules() {
        this.modules = [
            { id: 'm1', name: 'Creativity, innovation and design thinking', color: '#f43f5e' },
            { id: 'm2', name: 'L’ingénierie du prompting', color: '#3b82f6' },
            { id: 'm3', name: 'Culture entrepreuneurale et techniques de communication', color: '#f59e0b' },
            { id: 'm4', name: 'Introduction à la neuroéducation', color: '#a855f7' },
            { id: 'm5', name: 'Introduction aux technologies de l\'éducation', color: '#06b6d4' },
            { id: 'm6', name: 'Méthodologie de recherche', color: '#10b981' },
            { id: 'm7', name: 'Pragmatique de la communication et de l’apprentissage', color: '#4f46e5' },
            { id: 'm8', name: 'Séminaire de recherche', color: '#ef4444' },
            { id: 'm9', name: 'Sémiotique et communication', color: '#eab308' }
        ];
        this.saveModules();
    }

    saveModules() {
        localStorage.setItem(this.MODULES_STORAGE_KEY, JSON.stringify(this.modules));
    }

    loadTasks() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.tasks = JSON.parse(stored);
            } catch (e) {
                console.error("Erreur lors du parsing des tâches", e);
                this.tasks = [];
            }
        } else {
            this.tasks = [];
        }
    }

    saveTasks() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    }

    // --- Événements Globaux ---
    bindEvents() {
        // Gestion de la modale et thème
        this.addTaskBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelTaskBtn.addEventListener('click', () => this.closeModal());
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        
        // Gestion de la modale des modules
        if (this.manageModulesBtn) this.manageModulesBtn.addEventListener('click', () => this.openModuleModal());
        if (this.closeModuleModalBtn) this.closeModuleModalBtn.addEventListener('click', () => this.closeModuleModal());

        // Fermeture des modales au clic en dehors du contenu
        this.taskModal.addEventListener('click', (e) => {
            if (e.target === this.taskModal) this.closeModal();
        });
        if (this.moduleModal) {
            this.moduleModal.addEventListener('click', (e) => {
                if (e.target === this.moduleModal) this.closeModuleModal();
            });
        }

        // Soumission des formulaires
        this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        if (this.moduleForm) this.moduleForm.addEventListener('submit', (e) => this.handleModuleSubmit(e));

        // Configuration Drag and Drop sur chaque liste
        const lists = document.querySelectorAll('.task-list');
        lists.forEach(list => {
            list.addEventListener('dragover', (e) => this.handleDragOver(e));
            list.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            list.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            list.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    // --- Méthodes de la Modale ---
    openModal() {
        this.taskModal.classList.remove('hidden');
        this.titleInput.focus();
    }

    closeModal() {
        this.taskModal.classList.add('hidden');
        this.taskForm.reset();
        this.editingTaskId = null;
        if (this.modalTitle) this.modalTitle.textContent = "Ajouter une tâche";
    }

    openModuleModal() {
        if (!this.moduleModal) return;
        this.moduleModal.classList.remove('hidden');
        this.renderModuleList();
    }

    closeModuleModal() {
        if (!this.moduleModal) return;
        this.moduleModal.classList.add('hidden');
        this.moduleForm.reset();
        this.moduleColorInput.value = '#6366f1';
    }

    renderModuleSelect() {
        if (!this.moduleInput) return;
        this.moduleInput.innerHTML = '<option value="" disabled selected>Choisir un module</option>';
        this.modules.forEach(mod => {
            const option = document.createElement('option');
            option.value = mod.name;
            option.textContent = mod.name;
            this.moduleInput.appendChild(option);
        });
    }

    renderModuleList() {
        if (!this.modulesList) return;
        this.modulesList.innerHTML = '';
        if (this.modules.length === 0) {
            this.modulesList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center;">Aucun module.</p>';
            return;
        }

        this.modules.forEach(mod => {
            const item = document.createElement('div');
            item.className = 'module-list-item';
            
            const info = document.createElement('div');
            info.className = 'module-info';
            
            const colorDot = document.createElement('span');
            colorDot.className = 'module-color-dot';
            colorDot.style.backgroundColor = mod.color;
            
            const name = document.createElement('span');
            name.textContent = mod.name;
            
            info.appendChild(colorDot);
            info.appendChild(name);
            
            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn delete-module-btn';
            delBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
            delBtn.onclick = () => this.deleteModule(mod.id);
            
            item.appendChild(info);
            item.appendChild(delBtn);
            
            this.modulesList.appendChild(item);
        });
    }

    handleModuleSubmit(e) {
        e.preventDefault();
        const name = this.moduleNameInput.value.trim();
        const color = this.moduleColorInput.value;
        
        if (!name) return;
        
        // Vérifier si le nom existe déjà
        if (this.modules.some(m => m.name.toLowerCase() === name.toLowerCase())) {
            alert('Ce module existe déjà.');
            return;
        }
        
        const newModule = {
            id: 'm_' + Date.now().toString(),
            name,
            color
        };
        
        this.modules.push(newModule);
        this.saveModules();
        this.renderModuleSelect();
        this.renderModuleList();
        
        // Mettre à jour l'affichage des tâches existantes au cas où un module de même nom existerait
        this.renderAllTasks(); 
        
        this.moduleForm.reset();
        this.moduleColorInput.value = '#6366f1';
    }

    deleteModule(id) {
        const moduleToDelete = this.modules.find(m => m.id === id);
        if (!moduleToDelete) return;
        
        // Vérifier s'il est utilisé
        const isUsed = this.tasks.some(t => t.module === moduleToDelete.name);
        if (isUsed) {
            const confirmDelete = confirm(`Ce module est utilisé par des tâches. Si vous le supprimez, les tâches perdront cette association. Continuer ?`);
            if (!confirmDelete) return;
            
            // Retirer le module des tâches
            this.tasks.forEach(t => {
                if (t.module === moduleToDelete.name) {
                    t.module = "";
                }
            });
            this.saveTasks();
        }
        
        this.modules = this.modules.filter(m => m.id !== id);
        this.saveModules();
        this.renderModuleSelect();
        this.renderModuleList();
        this.renderAllTasks();
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingTaskId = id;
        this.titleInput.value = task.title;
        this.descInput.value = task.desc || '';
        if (task.priority) this.priorityInput.value = task.priority;
        if (task.module) this.moduleInput.value = task.module; else this.moduleInput.value = "";
        
        if (this.modalTitle) this.modalTitle.textContent = "Modifier la tâche";
        this.openModal();
    }

    // --- Logique Métier (CRUD Tâches) ---
    handleTaskSubmit(e) {
        e.preventDefault();
        
        const title = this.titleInput.value.trim();
        const desc = this.descInput.value.trim();
        const priority = this.priorityInput.value;
        const module = this.moduleInput.value;

        if (!title || !module) return;

        if (this.editingTaskId) {
            // Modification
            const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex].title = title;
                this.tasks[taskIndex].desc = desc;
                this.tasks[taskIndex].priority = priority;
                this.tasks[taskIndex].module = module;
                this.saveTasks();
                this.renderAllTasks();
            }
        } else {
            // Création
            const newTask = {
                id: Date.now().toString(), // Génération d'un ID unique simple
                title,
                desc,
                priority,
                module,
                status: 'todo', // Statut par défaut à la création
                timeSpent: 0,
                lastStartedTime: null
            };
            this.tasks.push(newTask);
            this.saveTasks();
            this.renderTask(newTask);
        }
        this.updateCounts();
        this.closeModal();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        
        const card = document.getElementById(`task-${id}`);
        if (card) {
            // Petite animation avant suppression du DOM
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                this.updateCounts();
            }, 200);
        }
    }

    // --- Rendu DOM ---
    renderAllTasks() {
        // Vider toutes les listes avant le rendu
        document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');
        
        this.tasks.forEach(task => this.renderTask(task));
        this.updateCounts();
    }

    renderTask(task) {
        const list = document.getElementById(`list-${task.status}`);
        if (!list) return;

        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.id = `task-${task.id}`;
        card.dataset.id = task.id;

        // Configuration du badge de priorité
        const priorityLabels = { 'low': 'Basse', 'medium': 'Moyenne', 'high': 'Haute' };
        const pLabel = priorityLabels[task.priority] || 'Moyenne';
        const pClass = task.priority ? `priority-${task.priority}` : 'priority-medium';

        // Configuration de la couleur du module
        const mod = this.modules.find(m => m.name === task.module);
        const moduleColor = mod ? mod.color : "var(--glass-border)";
        card.style.setProperty('--module-color', moduleColor);

        const timeInMinutes = this.getTaskTimeInMinutes(task);
        const showTimer = timeInMinutes > 0 || task.status === 'in-progress';

        // Injection sécurisée (échappement HTML)
        card.innerHTML = `
            <button class="delete-btn" aria-label="Supprimer la tâche">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <div class="task-badges">
                <span class="task-priority-badge ${pClass}">${pLabel}</span>
                <span class="task-timer-badge ${showTimer ? '' : 'd-none'}" id="timer-${task.id}">
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span class="timer-value">${this.formatTime(timeInMinutes)}</span>
                </span>
            </div>
            <div class="task-header">
                <h3 class="task-title">${this.escapeHTML(task.title)}</h3>
            </div>
            ${task.module ? `<div class="task-module"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> ${this.escapeHTML(task.module)}</div>` : ''}
            ${task.desc ? `<p class="task-desc">${this.escapeHTML(task.desc)}</p>` : ''}
        `;

        // Événement de suppression lié au bouton de la carte
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Évite tout conflit avec le drag
            this.deleteTask(task.id);
        });

        // Événement de double clic pour modifier
        card.addEventListener('dblclick', () => this.editTask(task.id));

        // Événements liés au Drag and Drop
        card.addEventListener('dragstart', (e) => this.handleDragStart(e, task.id));
        card.addEventListener('dragend', (e) => this.handleDragEnd(e));

        list.appendChild(card);
    }

    updateCounts() {
        const counts = { 'todo': 0, 'in-progress': 0, 'done': 0 };
        this.tasks.forEach(t => {
            if (counts[t.status] !== undefined) counts[t.status]++;
        });

        for (const [status, count] of Object.entries(counts)) {
            const el = document.getElementById(`count-${status}`);
            if (el) el.textContent = count;
        }
    }

    // --- Logique Drag and Drop Native ---
    handleDragStart(e, id) {
        this.draggedTaskId = id;
        e.dataTransfer.effectAllowed = 'move';
        // Obligatoire pour la compatibilité avec Firefox
        e.dataTransfer.setData('text/plain', id); 
        
        // Timeout pour permettre au navigateur de cloner visuellement l'élément avant de le rendre transparent
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.task-list').forEach(list => list.classList.remove('drag-over'));
        this.draggedTaskId = null;
    }

    handleDragOver(e) {
        e.preventDefault(); // Requis pour autoriser le drop dans cette zone
        e.dataTransfer.dropEffect = 'move';
        
        const list = e.target.closest('.task-list');
        if (!list) return;

        // Récupérer l'élément juste en dessous du curseur pour l'insertion
        const afterElement = this.getDragAfterElement(list, e.clientY);
        const draggedCard = document.querySelector('.task-card.dragging');
        
        if (draggedCard) {
            if (afterElement == null) {
                list.appendChild(draggedCard);
            } else {
                list.insertBefore(draggedCard, afterElement);
            }
        }
    }

    getDragAfterElement(container, y) {
        // Obtenir toutes les cartes de la colonne sauf celle qu'on est en train de déplacer
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            // L'offset est la distance entre le centre de la carte et le curseur
            const offset = y - box.top - box.height / 2;
            
            // On cherche l'élément avec un offset négatif le plus proche de 0
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    handleDragEnter(e) {
        e.preventDefault();
        const list = e.target.closest('.task-list');
        if (list) list.classList.add('drag-over');
    }

    handleDragLeave(e) {
        const list = e.target.closest('.task-list');
        // Vérifie qu'on quitte bien la zone cible et pas l'un de ses enfants
        if (list && !list.contains(e.relatedTarget)) {
            list.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const list = e.target.closest('.task-list');
        if (!list) return;

        list.classList.remove('drag-over');
        
        // Le DOM a déjà été mis à jour visuellement par handleDragOver
        // Il suffit maintenant de synchroniser notre tableau `this.tasks` avec le DOM
        this.syncTasksWithDOM();
        this.updateCounts();
        this.updateTimers();
    }

    syncTasksWithDOM() {
        const newTasks = [];
        
        // Parcourir chaque colonne pour reconstituer l'ordre
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(column => {
            const status = column.dataset.status;
            const cards = column.querySelectorAll('.task-card');
            
            cards.forEach(card => {
                const taskId = card.dataset.id;
                const originalTask = this.tasks.find(t => t.id === taskId);
                if (originalTask) {
                    // Logique de tracking du temps
                    if (status === 'in-progress' && originalTask.status !== 'in-progress') {
                        originalTask.lastStartedTime = Date.now();
                    } else if (status !== 'in-progress' && originalTask.status === 'in-progress') {
                        if (originalTask.lastStartedTime) {
                            originalTask.timeSpent = (originalTask.timeSpent || 0) + (Date.now() - originalTask.lastStartedTime);
                            originalTask.lastStartedTime = null;
                        }
                    }

                    originalTask.status = status; // Mettre à jour le statut
                    newTasks.push(originalTask);  // Ajouter dans le nouvel ordre
                }
            });
        });
        
        this.tasks = newTasks;
        this.saveTasks();
    }

    // --- Utilitaires ---
    
    getTaskTimeInMinutes(task) {
        let totalMs = task.timeSpent || 0;
        if (task.status === 'in-progress' && task.lastStartedTime) {
            totalMs += (Date.now() - task.lastStartedTime);
        }
        return Math.floor(totalMs / 60000); // en minutes
    }

    formatTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    updateTimers() {
        this.tasks.forEach(task => {
            const timeInMinutes = this.getTaskTimeInMinutes(task);
            const el = document.getElementById(`timer-${task.id}`);
            if (el) {
                const showTimer = timeInMinutes > 0 || task.status === 'in-progress';
                if (showTimer) {
                    el.classList.remove('d-none');
                    const valEl = el.querySelector('.timer-value');
                    if (valEl) valEl.textContent = this.formatTime(timeInMinutes);
                } else {
                    el.classList.add('d-none');
                }
            }
        });
    }

    // Évite les failles XSS basiques lors de l'affichage des saisies utilisateur
    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

// Lancement de l'application une fois le DOM chargé
document.addEventListener('DOMContentLoaded', () => {
    new KanbanApp();
});
