class SauceLab {
    constructor() {
        this.recipes = this.loadRecipes();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.populatePepperFilter();
        this.displayRecipes();
        this.updateUI();
    }

    // Event Listeners
    bindEvents() {
        // Form submission
        document.getElementById('recipeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel edit
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', () => {
            this.displayRecipes();
        });

        document.getElementById('pepperFilter').addEventListener('change', () => {
            this.displayRecipes();
        });

        document.getElementById('heatFilter').addEventListener('change', () => {
            this.displayRecipes();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.displayRecipes();
        });

        document.getElementById('sortBy').addEventListener('change', () => {
            this.displayRecipes();
        });
    }

    // Form Handling
    handleFormSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        if (this.currentEditId) {
            this.updateRecipe(this.currentEditId, formData);
        } else {
            this.addRecipe(formData);
        }

        this.resetForm();
        this.displayRecipes();
        this.saveRecipes();
    }

    getFormData() {
        return {
            name: document.getElementById('recipeName').value.trim(),
            pepperType: document.getElementById('pepperType').value,
            heatRating: parseInt(document.getElementById('heatRating').value),
            status: document.getElementById('recipeStatus').value,
            ingredients: document.getElementById('ingredients').value.trim(),
            instructions: document.getElementById('instructions').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            dateAdded: new Date().toISOString(),
            id: this.currentEditId || Date.now().toString()
        };
    }

    validateForm(data) {
        if (!data.name) {
            alert('Please enter a recipe name.');
            return false;
        }
        if (!data.heatRating || data.heatRating < 1 || data.heatRating > 10) {
            alert('Please enter a heat rating between 1 and 10.');
            return false;
        }
        if (!data.ingredients) {
            alert('Please enter the ingredients.');
            return false;
        }
        return true;
    }

    addRecipe(data) {
        this.recipes.push(data);
        this.showNotification('Recipe added successfully!', 'success');
    }

    async updateRecipe(id, data) {
        const index = this.recipes.findIndex(recipe => recipe.id === id);
        if (index !== -1) {
            const existingRecipe = this.recipes[index];

            // Keep original date added
            data.dateAdded = existingRecipe.dateAdded;
            data.dateModified = new Date().toISOString();

            this.recipes[index] = data;
            this.showNotification('Recipe updated successfully!', 'success');
        }
    }

    deleteRecipe(id) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            this.recipes = this.recipes.filter(recipe => recipe.id !== id);
            this.displayRecipes();
            this.saveRecipes();
            this.showNotification('Recipe deleted successfully!', 'success');
        }
    }

    editRecipe(id) {
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) return;

        this.currentEditId = id;
        
        // Populate form
        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('pepperType').value = recipe.pepperType || '';
        document.getElementById('heatRating').value = recipe.heatRating;
        document.getElementById('recipeStatus').value = recipe.status;
        document.getElementById('ingredients').value = recipe.ingredients;
        document.getElementById('instructions').value = recipe.instructions || '';
        document.getElementById('notes').value = recipe.notes || '';

        // Update form UI
        document.getElementById('submitBtn').textContent = 'Update Recipe';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        // Scroll to form
        document.querySelector('.recipe-form-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    cancelEdit() {
        this.currentEditId = null;
        this.resetForm();
    }

    resetForm() {
        document.getElementById('recipeForm').reset();
        document.getElementById('submitBtn').textContent = 'Add Recipe';
        document.getElementById('cancelBtn').style.display = 'none';
        this.currentEditId = null;
    }

    // Display and Filtering
    displayRecipes() {
        const filteredRecipes = this.getFilteredRecipes();
        const sortedRecipes = this.sortRecipes(filteredRecipes);
        
        const container = document.getElementById('recipesList');
        const noRecipes = document.getElementById('noRecipes');

        if (sortedRecipes.length === 0) {
            container.style.display = 'none';
            noRecipes.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        noRecipes.style.display = 'none';
        
        container.innerHTML = sortedRecipes.map(recipe => this.createRecipeCard(recipe)).join('');
    }

    getFilteredRecipes() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const pepperFilter = document.getElementById('pepperFilter').value;
        const heatFilter = document.getElementById('heatFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        return this.recipes.filter(recipe => {
            // Search filter
            if (search && !recipe.name.toLowerCase().includes(search) && 
                !recipe.ingredients.toLowerCase().includes(search) &&
                !recipe.notes.toLowerCase().includes(search)) {
                return false;
            }

            // Pepper type filter
            if (pepperFilter && recipe.pepperType !== pepperFilter) {
                return false;
            }

            // Heat level filter
            if (heatFilter) {
                const [min, max] = heatFilter.split('-').map(Number);
                if (recipe.heatRating < min || recipe.heatRating > max) {
                    return false;
                }
            }

            // Status filter
            if (statusFilter && recipe.status !== statusFilter) {
                return false;
            }

            return true;
        });
    }

    sortRecipes(recipes) {
        const sortBy = document.getElementById('sortBy').value;
        
        return [...recipes].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'heat-asc':
                    return a.heatRating - b.heatRating;
                case 'heat-desc':
                    return b.heatRating - a.heatRating;
                case 'date-asc':
                    return new Date(a.dateAdded) - new Date(b.dateAdded);
                case 'date-desc':
                default:
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });
    }

    createRecipeCard(recipe) {
        const dateAdded = new Date(recipe.dateAdded).toLocaleDateString();
        const heatMeter = this.createHeatMeter(recipe.heatRating);
        
        return `
            <div class="recipe-card new-recipe" data-heat="${recipe.heatRating}">
                <div class="recipe-header">
                    <h3 class="recipe-name">${this.escapeHtml(recipe.name)}</h3>
                    <span class="recipe-status status-${recipe.status}">
                        ${recipe.status === 'perfected' ? 'Perfected' : 'Work in Progress'}
                    </span>
                </div>
                
                <div class="recipe-details">
                    ${recipe.pepperType ? `<span class="pepper-type">${this.escapeHtml(recipe.pepperType)}</span>` : ''}
                    ${heatMeter}
                    
                    <div class="recipe-meta">
                        <strong>Ingredients:</strong> ${this.truncateText(recipe.ingredients, 100)}
                    </div>
                    
                    ${recipe.instructions ? `
                        <div class="recipe-meta">
                            <strong>Instructions:</strong> ${this.truncateText(recipe.instructions, 100)}
                        </div>
                    ` : ''}
                    
                    ${recipe.notes ? `
                        <div class="recipe-meta">
                            <strong>Notes:</strong> ${this.truncateText(recipe.notes, 100)}
                        </div>
                    ` : ''}
                </div>
                
                <div class="date-added">Added: ${dateAdded}</div>
                
                <div class="recipe-actions">
                    <button class="btn-edit" onclick="sauceLab.editRecipe('${recipe.id}')">
                        <i class="edit"></i> View / Edit
                    </button>
                    <button class="btn-delete" onclick="sauceLab.deleteRecipe('${recipe.id}')">
                        <i class="trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    createHeatMeter(rating) {
        const dots = Array.from({ length: 10 }, (_, i) => {
            const filled = i < rating ? 'filled' : '';
            return `<div class="heat-dot ${filled}"></div>`;
        }).join('');

        return `
            <div class="heat-meter">
                <span class="heat-meter-label">Heat:</span>
                <div class="heat-meter-bar">${dots}</div>
                <span class="heat-rating">${rating}/10</span>
            </div>
        `;
    }

    // UI Updates
    populatePepperFilter() {
        const pepperFilter = document.getElementById('pepperFilter');
        const pepperTypes = new Set();
        
        this.recipes.forEach(recipe => {
            if (recipe.pepperType) {
                pepperTypes.add(recipe.pepperType);
            }
        });

        // Clear existing options except the first one
        while (pepperFilter.children.length > 1) {
            pepperFilter.removeChild(pepperFilter.lastChild);
        }

        // Add pepper types from recipes
        Array.from(pepperTypes).sort().forEach(pepper => {
            const option = document.createElement('option');
            option.value = pepper;
            option.textContent = pepper.charAt(0).toUpperCase() + pepper.slice(1);
            pepperFilter.appendChild(option);
        });
    }

        escapeHtml(text) { return text; }
        truncateText(text, maxLength) {
            if (!text) return "";
            return text.length > maxLength
                ? text.substring(0, maxLength) + "..."
                : text;
        }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#28a745' : '#007bff'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    updateUI() {
        this.populatePepperFilter();
        
        // Update recipe count
        const totalRecipes = this.recipes.length;
        if (totalRecipes > 0) {
            document.title = `SauceLab (${totalRecipes} recipes)`;
        }
    }

    // Storage Functions
    saveRecipes() {
        try {
            localStorage.setItem('sauceLab_recipes', JSON.stringify(this.recipes));
        } catch (error) {
            console.error('Error saving recipes:', error);
            this.showNotification('Error saving recipes', 'error');
        }
    }

    loadRecipes() {
        try {
            const saved = localStorage.getItem('sauceLab_recipes');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading recipes:', error);
            return [];
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sauceLab = new SauceLab();
});