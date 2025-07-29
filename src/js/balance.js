// balance.js - Manejo del modal y operaciones

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const newOpBtn = document.getElementById('newOpBtn');
    const opModal = document.getElementById('opModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const opForm = document.getElementById('opForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    
    // Referencias a elementos de filtros
    const typeFilter = document.getElementById('typeFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortBy = document.getElementById('sortBy');
    const filterToggle = document.getElementById('filterToggle');
    const filtersForm = document.getElementById('filtersForm');
    
    // Referencias a elementos de balance
    const earningsElement = document.getElementById('earnings');
    const expensesElement = document.getElementById('expenses');
    const totalElement = document.getElementById('total');
    
    // Referencias a tabla y estado vacío
    const emptyState = document.getElementById('emptyState');
    const tableWrap = document.getElementById('tableWrap');
    const opsTable = document.getElementById('opsTable');
    
    // Variable para edición
    let editingOperationId = null;
    let isFiltersVisible = true;

    // Inicializar la aplicación
    init();

    function init() {
        loadCategories();
        loadOperations();
        updateBalance();
        setupEventListeners();
        setDefaultDate();
    }

    function setupEventListeners() {
        // Modal eventos
        newOpBtn.addEventListener('click', openModal);
        closeModal.addEventListener('click', closeModalHandler);
        cancelBtn.addEventListener('click', closeModalHandler);
        opForm.addEventListener('submit', handleFormSubmit);
        
        // Filtros eventos
        typeFilter.addEventListener('change', filterOperations);
        categoryFilter.addEventListener('change', filterOperations);
        dateFilter.addEventListener('change', filterOperations);
        sortBy.addEventListener('change', filterOperations);
        filterToggle.addEventListener('click', toggleFilters);
        
        // Cerrar modal al hacer click fuera
        opModal.addEventListener('click', function(e) {
            if (e.target === opModal) {
                closeModalHandler();
            }
        });

        // Cerrar modal con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && opModal.open) {
                closeModalHandler();
            }
        });
    }

    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('opDate').value = today;
    }

    function openModal(operationId = null) {
        editingOperationId = operationId;
        
        if (operationId) {
            // Modo edición
            const operation = getOperationById(operationId);
            if (operation) {
                fillFormWithOperation(operation);
                modalTitle.textContent = 'Editar operación';
                submitBtn.textContent = 'Actualizar';
            }
        } else {
            // Modo creación
            opForm.reset();
            setDefaultDate();
            modalTitle.textContent = 'Nueva operación';
            submitBtn.textContent = 'Agregar';
        }
        
        opModal.showModal();
    }

    function closeModalHandler() {
        opModal.close();
        opForm.reset();
        editingOperationId = null;
    }

    function fillFormWithOperation(operation) {
        document.getElementById('opDesc').value = operation.description;
        document.getElementById('opAmount').value = operation.amount;
        document.getElementById('opType').value = operation.type;
        document.getElementById('opCategory').value = operation.category;
        document.getElementById('opDate').value = operation.date;
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(opForm);
        const operationData = {
            description: formData.get('description').trim(),
            amount: parseFloat(formData.get('amount')),
            type: formData.get('type'),
            category: formData.get('category'),
            date: formData.get('date')
        };

        // Validaciones
        if (!validateOperation(operationData)) {
            return;
        }

        if (editingOperationId) {
            updateOperation(editingOperationId, operationData);
        } else {
            addOperation(operationData);
        }

        closeModalHandler();
        loadOperations();
        updateBalance();
    }

    function validateOperation(operation) {
        if (!operation.description) {
            alert('La descripción es requerida');
            return false;
        }
        
        if (!operation.amount || operation.amount <= 0) {
            alert('El monto debe ser mayor a 0');
            return false;
        }
        
        if (!operation.type || !operation.category || !operation.date) {
            alert('Todos los campos son requeridos');
            return false;
        }
        
        return true;
    }

    function loadCategories() {
        const categories = getCategories();
        const categorySelects = [
            document.getElementById('opCategory'),
            document.getElementById('categoryFilter')
        ];

        categorySelects.forEach(select => {
            // Limpiar opciones existentes (excepto la primera)
            const firstOption = select.querySelector('option');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }

            // Agregar categorías
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    }

    function loadOperations() {
        const operations = getFilteredAndSortedOperations();
        
        if (operations.length === 0) {
            showEmptyState();
        } else {
            showOperationsTable(operations);
        }
    }

    function showEmptyState() {
        emptyState.style.display = 'block';
        tableWrap.style.display = 'none';
    }

    function showOperationsTable(operations) {
        emptyState.style.display = 'none';
        tableWrap.style.display = 'block';
        
        opsTable.innerHTML = '';
        
        operations.forEach(operation => {
            const row = createOperationRow(operation);
            opsTable.appendChild(row);
        });
    }

    function createOperationRow(operation) {
        const row = document.createElement('tr');
        const category = getCategoryById(operation.category);
        const categoryName = category ? category.name : 'Sin categoría';
        
        const amountClass = operation.type === 'income' ? 'positive' : 'negative';
        const amountSymbol = operation.type === 'income' ? '+' : '-';
        
        row.innerHTML = `
            <td>${operation.description}</td>
            <td>
                <span class="category-tag">${categoryName}</span>
            </td>
            <td>${formatDate(operation.date)}</td>
            <td>
                <span class="amount ${amountClass}">
                    ${amountSymbol}$${operation.amount.toFixed(2)}
                </span>
            </td>
            <td>
                <div class="actions">
                    <button class="btn-action btn-edit" onclick="editOperation('${operation.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteOperation('${operation.id}')" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }

    function getFilteredAndSortedOperations() {
        let operations = getAllOperations();
        
        // Aplicar filtros
        const typeFilterValue = typeFilter.value;
        const categoryFilterValue = categoryFilter.value;
        const dateFilterValue = dateFilter.value;
        
        if (typeFilterValue) {
            operations = operations.filter(op => op.type === typeFilterValue);
        }
        
        if (categoryFilterValue) {
            operations = operations.filter(op => op.category === categoryFilterValue);
        }
        
        if (dateFilterValue) {
            operations = operations.filter(op => op.date >= dateFilterValue);
        }
        
        // Aplicar ordenamiento
        const sortValue = sortBy.value;
        operations = sortOperations(operations, sortValue);
        
        return operations;
    }

    function sortOperations(operations, sortBy) {
        const sortedOps = [...operations];
        
        switch (sortBy) {
            case 'date-desc':
                return sortedOps.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'date-asc':
                return sortedOps.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'amount-desc':
                return sortedOps.sort((a, b) => b.amount - a.amount);
            case 'amount-asc':
                return sortedOps.sort((a, b) => a.amount - b.amount);
            case 'desc-asc':
                return sortedOps.sort((a, b) => a.description.localeCompare(b.description));
            case 'desc-desc':
                return sortedOps.sort((a, b) => b.description.localeCompare(a.description));
            default:
                return sortedOps;
        }
    }

    function filterOperations() {
        loadOperations();
    }

    function updateBalance() {
        const operations = getAllOperations();
        
        let totalEarnings = 0;
        let totalExpenses = 0;
        
        operations.forEach(operation => {
            if (operation.type === 'income') {
                totalEarnings += operation.amount;
            } else {
                totalExpenses += operation.amount;
            }
        });
        
        const balance = totalEarnings - totalExpenses;
        
        earningsElement.textContent = `+$${totalEarnings.toFixed(2)}`;
        expensesElement.textContent = `-$${totalExpenses.toFixed(2)}`;
        totalElement.textContent = `$${balance.toFixed(2)}`;
        
        // Cambiar color del total según el balance
        totalElement.className = 'amount';
        if (balance > 0) {
            totalElement.classList.add('positive');
        } else if (balance < 0) {
            totalElement.classList.add('negative');
        } else {
            totalElement.classList.add('neutral');
        }
    }

    function toggleFilters() {
        isFiltersVisible = !isFiltersVisible;
        const filtersForm = document.getElementById('filtersForm');
        
        if (isFiltersVisible) {
            filtersForm.style.display = 'block';
            filterToggle.textContent = 'Ocultar filtros';
        } else {
            filtersForm.style.display = 'none';
            filterToggle.textContent = 'Mostrar filtros';
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Funciones globales para los botones de acción
    window.editOperation = function(operationId) {
        openModal(operationId);
    };

    window.deleteOperation = function(operationId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta operación?')) {
            removeOperation(operationId);
            loadOperations();
            updateBalance();
        }
    };
});